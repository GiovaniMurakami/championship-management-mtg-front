import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buscarArtesDaCarta, buscarCartaPorId, buscarCartaPorNome, buscarCartasPorNome } from "../services/scryfallApi";

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

  it("prefere image_uris.normal quando disponivel", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          {
            id: "1",
            name: "Counterspell",
            set_name: "Masters 25",
            image_uris: {
              normal: "https://cards.example/counterspell-normal.jpg",
              large: "https://cards.example/counterspell-large.jpg",
            },
            type_line: "Instant",
            legalities: { legacy: "legal" },
            colors: ["U"],
            cmc: 2,
            mana_cost: "{U}{U}",
          },
        ],
      }),
    });

    const cards = await buscarCartasPorNome(["Counterspell"]);
    expect(cards[0].imagem).toBe("https://cards.example/counterspell-normal.jpg");
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

  it("nao faz consultas individuais quando o fallback esta desativado", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    });

    const cards = await buscarCartasPorNome(
      ["Carta inexistente exclusiva do teste"],
      { fallbackIndividual: false },
    );

    expect(cards).toEqual([null]);
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(String(globalThis.fetch.mock.calls[0][0])).toBe("https://api.scryfall.com/cards/collection");
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

describe("buscarArtesDaCarta", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("busca ilustracoes unicas da carta", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          {
            id: "art-rtr",
            oracle_id: "oracle-guttersnipe",
            name: "Guttersnipe",
            set_name: "Return to Ravnica",
            image_uris: { art_crop: "https://cards.example/gutter-rtr.jpg" },
            type_line: "Creature — Goblin Shaman",
            legalities: { pauper: "legal" },
            colors: ["R"],
            cmc: 3,
            mana_cost: "{2}{R}",
          },
          {
            id: "art-mh3",
            oracle_id: "oracle-guttersnipe",
            name: "Guttersnipe",
            set_name: "Modern Horizons 3",
            image_uris: { art_crop: "https://cards.example/gutter-mh3.jpg" },
            type_line: "Creature — Goblin Shaman",
            legalities: { pauper: "legal" },
            colors: ["R"],
            cmc: 3,
            mana_cost: "{2}{R}",
          },
        ],
      }),
    });

    const artes = await buscarArtesDaCarta({ nome: "Guttersnipe", oracleId: "oracle-guttersnipe" });
    const calledUrl = String(globalThis.fetch.mock.calls[0][0]);
    expect(calledUrl).toContain("unique=art");
    expect(calledUrl).toContain("oracleid%3Aoracle-guttersnipe");
    expect(artes).toHaveLength(2);
    expect(artes[1].set).toBe("Modern Horizons 3");
  });
});

describe("buscarCartaPorId", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("carrega a impressao pelo uuid", async () => {
    const id = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id,
        name: "Guttersnipe",
        set_name: "Modern Horizons 3",
        image_uris: { art_crop: "https://cards.example/gutter-mh3.jpg" },
        type_line: "Creature — Goblin Shaman",
        legalities: { pauper: "legal" },
        colors: ["R"],
        cmc: 3,
        mana_cost: "{2}{R}",
      }),
    });

    const carta = await buscarCartaPorId(id);
    expect(String(globalThis.fetch.mock.calls[0][0])).toContain(`/cards/${id}`);
    expect(carta).toMatchObject({
      id,
      nome: "Guttersnipe",
      set: "Modern Horizons 3",
    });
  });
});
