import { describe, expect, it } from "vitest";
import { TOP8_BACKGROUND_URL } from "../constants/top8";
import { formatTop8StoryDate, resolveTop8BackgroundUrl } from "../utils/top8Story";

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
});
