import { describe, expect, it } from "vitest";
import { TOP8_BACKGROUND_URL } from "../constants/top8";
import { formatTop8StoryDate, formatTop8StoryHeadline, formatTop8StoryRecord, resolveTop8BackgroundUrl, top8StoryNameDeckLayout, TOP8_STORY_DECK_ASCENT, TOP8_STORY_NAME_DESCENT } from "../utils/top8Story";

describe("top8Story helpers", () => {
  it("usa fundo padrão quando custom está vazio", () => {
    expect(resolveTop8BackgroundUrl("")).toBe(TOP8_BACKGROUND_URL);
    expect(resolveTop8BackgroundUrl(null)).toBe(TOP8_BACKGROUND_URL);
    expect(resolveTop8BackgroundUrl("   ")).toBe(TOP8_BACKGROUND_URL);
  });

  it("prioriza URL customizada", () => {
    expect(resolveTop8BackgroundUrl("https://cdn.example/story.jpg")).toBe(
      "https://cdn.example/story.jpg",
    );
  });

  it("formata só a data do story em pt-BR (sem hora)", () => {
    const label = formatTop8StoryDate("2026-08-10T22:00:00.000Z");
    expect(label).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    expect(label).not.toMatch(/\d{2}:\d{2}/);
    expect(formatTop8StoryDate("")).toBe("");
  });

  it("monta o titulo do story com data e jogadores na mesma linha", () => {
    expect(formatTop8StoryHeadline("2026-08-10T22:00:00.000Z", 32)).toMatch(
      /^\d{2}\/\d{2}\/\d{4} · 32 jogadores$/,
    );
    expect(formatTop8StoryHeadline("2026-08-10T22:00:00.000Z", 1)).toMatch(/ · 1 jogador$/);
    expect(formatTop8StoryHeadline("", 8)).toBe("8 jogadores");
  });

  it("formata o recorde do jogador como vitorias-derrotas", () => {
    expect(formatTop8StoryRecord({ vitoriasPartida: 4, derrotasPartida: 0 })).toBe("4-0");
    expect(formatTop8StoryRecord({ vitorias: 3, derrotas: 1 })).toBe("3-1");
    expect(formatTop8StoryRecord({})).toBe("0-0");
  });

  it("separa nome e deck o bastante para descendentes", () => {
    const cardH = 150;
    const nameFs = 62;
    const deckFs = 44;
    const { nameY, deckY } = top8StoryNameDeckLayout(cardH, nameFs, deckFs);
    const nameBottom = nameY + nameFs * TOP8_STORY_NAME_DESCENT;
    const deckTop = deckY - deckFs * TOP8_STORY_DECK_ASCENT;
    expect(deckTop - nameBottom).toBeGreaterThanOrEqual(8);
    expect(deckY).toBeLessThanOrEqual(cardH * 0.9);
    expect(nameY).toBeGreaterThan(0);
  });
});
