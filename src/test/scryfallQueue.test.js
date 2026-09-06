import { afterEach, expect, it, vi } from "vitest";
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
it("o tempo esperando na fila não consome o timeout da requisição", async () => {
  vi.useFakeTimers();
  vi.resetModules();
  const abortedAtStart = [];
  vi.stubGlobal("fetch", vi.fn((_url, { signal }) => {
    abortedAtStart.push(signal.aborted);
    return new Promise(resolve => setTimeout(() => resolve({ ok: true, json: async () => ({ name: "Test", image_uris: { normal: "https://example.test/card.jpg" } }) }), 4500));
  }));
  const { buscarCartaPorNome } = await import("../services/scryfallApi");
  const requests = Promise.all(["Queue A", "Queue B", "Queue C"].map(nome => buscarCartaPorNome(nome)));
  await vi.runAllTimersAsync();
  expect((await requests).every(Boolean)).toBe(true);
  expect(abortedAtStart).toEqual([false, false, false]);
});
