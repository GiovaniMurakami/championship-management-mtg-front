import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AxiosError } from "axios";
import { AUTH_STORAGE_KEY } from "../constants/auth";

const token = (id, seconds = 3600) => `header.${btoa(JSON.stringify({ id, exp: Math.floor(Date.now() / 1000) + seconds }))}.signature`;
const save = (accessToken) => localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: accessToken, refreshToken: "refresh-old" }));
const ok = (config, data) => ({ config, data, status: 200, statusText: "OK", headers: {} });
const unauthorized = (config) => Promise.reject(new AxiosError("Unauthorized", "ERR_BAD_REQUEST", config, null, { status: 401, data: { mensagem: "Token inválido ou expirado." }, headers: {} }));

let client;
beforeEach(async () => {
  vi.resetModules();
  const storage = new Map();
  vi.stubGlobal("localStorage", {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key),
  });
  client = (await import("../services/httpClient")).default;
});

afterEach(() => vi.unstubAllGlobals());

const checkin = (accessToken) => client.post("/torneio/test/checkin", {}, { headers: { Authorization: `Bearer ${accessToken}` } });

describe("refresh após 401", () => {
  it("renova token ainda válido localmente e repete check-in com o token novo", async () => {
    const old = token("old");
    const fresh = token("new");
    save(old);
    const calls = [];
    client.defaults.adapter = async (config) => {
      calls.push([config.url, config.headers.Authorization]);
      if (config.url === "/usuario/refresh-token") return ok(config, { token: fresh, refreshToken: "refresh-new" });
      if (config.headers.Authorization === `Bearer ${old}`) return unauthorized(config);
      return ok(config, { sucesso: true });
    };
    await expect(checkin(old)).resolves.toEqual({ sucesso: true });
    expect(calls).toEqual([
      ["/torneio/test/checkin", `Bearer ${old}`],
      ["/usuario/refresh-token", undefined],
      ["/torneio/test/checkin", `Bearer ${fresh}`],
    ]);
    expect(JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY))).toMatchObject({ token: fresh, refreshToken: "refresh-new" });
  });

  it("compartilha a renovação entre check-ins concorrentes", async () => {
    const old = token("old");
    const fresh = token("new");
    save(old);
    const sentTokens = [];
    let completeRefresh;
    const refreshResult = new Promise((resolve) => { completeRefresh = resolve; });
    const adapter = vi.fn(async (config) => {
      sentTokens.push(config.headers.Authorization);
      if (config.url === "/usuario/refresh-token") return ok(config, await refreshResult);
      return config.headers.Authorization === `Bearer ${old}` ? unauthorized(config) : ok(config, { sucesso: true });
    });
    client.defaults.adapter = adapter;
    const requests = Promise.all([checkin(old), checkin(old)]);
    await vi.waitFor(() => expect(adapter.mock.calls.filter(([c]) => c.url === "/usuario/refresh-token")).toHaveLength(1));
    completeRefresh({ token: fresh });
    await requests;
    expect(adapter.mock.calls.filter(([c]) => c.url === "/usuario/refresh-token")).toHaveLength(1);
    expect(sentTokens.filter((value) => value === `Bearer ${fresh}`)).toHaveLength(2);
  });

  it("não entra em loop quando o check-in continua retornando 401", async () => {
    const old = token("old");
    save(old);
    const adapter = vi.fn(async (config) => config.url === "/usuario/refresh-token" ? ok(config, { token: token("new") }) : unauthorized(config));
    client.defaults.adapter = adapter;
    await expect(checkin(old)).rejects.toThrow();
    expect(adapter).toHaveBeenCalledTimes(3);
  });

  it("encerra sessão quando o refresh também retorna 401", async () => {
    const old = token("old");
    save(old);
    const adapter = vi.fn(unauthorized);
    client.defaults.adapter = adapter;
    await expect(checkin(old)).rejects.toThrow("Sessão expirada");
    expect(adapter).toHaveBeenCalledTimes(2);
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });

  it("preserva sessão quando o refresh falha por timeout", async () => {
    const old = token("old");
    save(old);
    client.defaults.adapter = async (config) => {
      if (config.url === "/usuario/refresh-token") throw new AxiosError("timeout", "ECONNABORTED", config);
      return unauthorized(config);
    };
    await expect(checkin(old)).rejects.toThrow("timeout");
    expect(JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY)).token).toBe(old);
  });

  it("reutiliza token já renovado por outra aba após um 401 atrasado", async () => {
    const old = token("old");
    const fresh = token("new");
    save(old);
    const adapter = vi.fn(async (config) => {
      if (config.headers.Authorization === `Bearer ${old}`) {
        save(fresh);
        return unauthorized(config);
      }
      return ok(config, { sucesso: true });
    });
    client.defaults.adapter = adapter;
    await checkin(old);
    expect(adapter).toHaveBeenCalledTimes(2);
    expect(adapter.mock.calls[1][0].headers.Authorization).toBe(`Bearer ${fresh}`);
  });

  it("renova preventivamente um token que expira em menos de cinco minutos", async () => {
    const old = token("old", 120);
    save(old);
    const adapter = vi.fn(async (config) => ok(config, config.url === "/usuario/refresh-token" ? { token: token("new") } : { sucesso: true }));
    client.defaults.adapter = adapter;
    await checkin(old);
    expect(adapter.mock.calls.map(([c]) => c.url)).toEqual(["/usuario/refresh-token", "/torneio/test/checkin"]);
  });
});
