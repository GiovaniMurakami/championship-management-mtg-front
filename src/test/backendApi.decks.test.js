import { beforeEach, describe, expect, it, vi } from "vitest";

const { getMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
}));

vi.mock("../services/httpClient", () => ({
  default: {
    get: getMock,
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

import { listarDecks } from "../services/backendApi";

describe("backendApi — decks", () => {
  beforeEach(() => {
    getMock.mockReset();
    getMock.mockResolvedValue({ decks: [], total: 0, limite: 20, offset: 0 });
  });

  it("envia os filtros de nome do deck e do jogador", async () => {
    await listarDecks(null, { nome: "Burn", jogador: "Maria", limite: 20, offset: 0 });

    expect(getMock).toHaveBeenCalledWith("/deck/listar", {
      params: { nome: "Burn", jogador: "Maria", limite: 20, offset: 0 },
    });
  });
});
