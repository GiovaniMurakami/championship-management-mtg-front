import { beforeEach, describe, expect, it, vi } from "vitest";

const { getMock, postMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(),
}));

vi.mock("../services/httpClient", () => ({
  default: {
    get: getMock,
    post: postMock,
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

import {
  buscarMeuUsuario,
  descadastrarNewsletter,
  listarAssinantesNewsletter,
} from "../services/backendApi";

describe("backendApi — newsletter", () => {
  beforeEach(() => {
    getMock.mockReset();
    postMock.mockReset();
  });

  it("buscarMeuUsuario chama GET /usuario/me", async () => {
    getMock.mockResolvedValue({ id: "u1", newsletterMetagame: false });
    await buscarMeuUsuario("tok");
    expect(getMock).toHaveBeenCalledWith("/usuario/me", {
      headers: { Authorization: "Bearer tok" },
    });
  });

  it("listarAssinantesNewsletter chama endpoint admin", async () => {
    getMock.mockResolvedValue({ assinantes: [], total: 0 });
    await listarAssinantesNewsletter("tok", { nome: "Ana", limite: 20 });
    expect(getMock).toHaveBeenCalledWith("/usuario/newsletter/assinantes", {
      headers: { Authorization: "Bearer tok" },
      params: { nome: "Ana", limite: 20 },
    });
  });

  it("descadastrarNewsletter deduplica requests paralelos do mesmo token", async () => {
    let resolvePost;
    postMock.mockImplementation(
      () => new Promise((resolve) => {
        resolvePost = resolve;
      }),
    );

    const p1 = descadastrarNewsletter("token-abc");
    const p2 = descadastrarNewsletter("token-abc");
    expect(postMock).toHaveBeenCalledTimes(1);
    expect(postMock).toHaveBeenCalledWith("/usuario/newsletter/descadastrar", {
      token: "token-abc",
    });

    resolvePost({ ok: true, usuarioId: "u1" });
    await expect(Promise.all([p1, p2])).resolves.toEqual([
      { ok: true, usuarioId: "u1" },
      { ok: true, usuarioId: "u1" },
    ]);
  });
});
