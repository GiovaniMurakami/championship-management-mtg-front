import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buscarCartasPorNome } from "../services/scryfallApi";

describe("buscarCartasPorNome", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          {
            id: "1",
            name: "Archaeomancer",
            set_name: "Ultimate Masters",
            image_uris: { large: "https://cards.example/archaeomancer.jpg" },
            type_line: "Creature — Human Wizard",
            legalities: { pauper: "legal" },
            colors: ["U"],
            cmc: 4,
            mana_cost: "{2}{U}{U}",
          },
        ],
      }),
    });
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("faz o match das cartas ignorando diferencas de capitalizacao", async () => {
    const cards = await buscarCartasPorNome(["archaeomancer"]);

    expect(cards).toHaveLength(1);
    expect(cards[0]).toMatchObject({
      nome: "Archaeomancer",
      imagem: "https://cards.example/archaeomancer.jpg",
    });
  });
});
