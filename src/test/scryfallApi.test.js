import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buscarCartaPorNome, buscarCartasPorNome } from "../services/scryfallApi";

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

  it("resolve carta dupla-face quando a importacao usa apenas uma face", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          {
            id: "delver",
            name: "Delver of Secrets // Insectile Aberration",
            set_name: "Innistrad",
            image_uris: null,
            card_faces: [
              {
                name: "Delver of Secrets",
                image_uris: { large: "https://cards.example/delver.jpg" },
              },
              {
                name: "Insectile Aberration",
                image_uris: { large: "https://cards.example/insect.jpg" },
              },
            ],
            type_line: "Creature — Human Wizard // Creature — Human Insect",
            legalities: { legacy: "legal" },
            colors: ["U"],
            cmc: 1,
            mana_cost: "{U}",
          },
        ],
      }),
    });

    const cards = await buscarCartasPorNome(["Delver of Secrets"]);

    expect(cards).toHaveLength(1);
    expect(cards[0]).toMatchObject({
      nome: "Delver of Secrets // Insectile Aberration",
      imagem: "https://cards.example/delver.jpg",
    });
  });

  it("usa fuzzy como fallback quando exact nao encontra a carta", async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, json: async () => ({}) })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: "sagu",
          name: "Sagu Wildling",
          set_name: "Tarkir: Dragonstorm",
          image_uris: { large: "https://cards.example/sagu.jpg" },
          type_line: "Creature — Human Shaman",
          legalities: { standard: "legal" },
          colors: ["G"],
          cmc: 2,
          mana_cost: "{1}{G}",
        }),
      });

    const card = await buscarCartaPorNome("sagu wildling");

    expect(card).toMatchObject({
      nome: "Sagu Wildling",
      imagem: "https://cards.example/sagu.jpg",
    });
  });
});
