import { beforeEach, describe, expect, it, vi } from "vitest";

const { postMock, putMock } = vi.hoisted(() => ({
  postMock: vi.fn(),
  putMock: vi.fn(),
}));

vi.mock("../services/httpClient", () => ({
  default: {
    post: postMock,
    put: putMock,
    get: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

import {
  ajustarTotalRodadas,
  contestarResultado,
  encerrarTorneio,
} from "../services/backendApi";

describe("backendApi — torneio (funcionalidades novas)", () => {
  beforeEach(() => {
    postMock.mockReset();
    putMock.mockReset();
  });

  it("contestarResultado envia observação quando informada", async () => {
    postMock.mockResolvedValue({ data: { contestado: true } });

    await contestarResultado("p-1", "tok", "Marcador invertido");

    expect(postMock).toHaveBeenCalledWith(
      "/torneio/partida/p-1/contestar",
      { observacao: "Marcador invertido" },
      { headers: { Authorization: "Bearer tok" } },
    );
  });

  it("contestarResultado envia body vazio sem observação", async () => {
    postMock.mockResolvedValue({ data: { contestado: true } });

    await contestarResultado("p-1", "tok");

    expect(postMock).toHaveBeenCalledWith(
      "/torneio/partida/p-1/contestar",
      {},
      { headers: { Authorization: "Bearer tok" } },
    );
  });

  it("ajustarTotalRodadas chama PUT total-rodadas", async () => {
    putMock.mockResolvedValue({ data: { totalRodadas: 6 } });

    await ajustarTotalRodadas("t-1", 6, "tok");

    expect(putMock).toHaveBeenCalledWith(
      "/torneio/t-1/total-rodadas",
      { totalRodadas: 6 },
      { headers: { Authorization: "Bearer tok" } },
    );
  });

  it("encerrarTorneio chama POST encerrar", async () => {
    postMock.mockResolvedValue({ data: { finalizado: true } });

    await encerrarTorneio("t-1", "tok");

    expect(postMock).toHaveBeenCalledWith(
      "/torneio/t-1/encerrar",
      {},
      { headers: { Authorization: "Bearer tok" } },
    );
  });
});
