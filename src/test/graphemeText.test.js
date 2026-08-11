import { describe, expect, it } from "vitest";
import { graphemeLength, truncateGraphemes } from "../utils/graphemeText";

describe("graphemeText", () => {
  it("conta bandeiras como um grafema cada", () => {
    expect(graphemeLength("🇧🇷🇵🇹 FREE")).toBe(7);
  });

  it("nao parte bandeiras ao truncar", () => {
    const { text, truncated } = truncateGraphemes("🇧🇷🇵🇹 Taxa de Inscrição: FREE", 3);
    expect(truncated).toBe(true);
    expect(text.startsWith("🇧🇷🇵🇹")).toBe(true);
    expect(text).not.toMatch(/\uD83C$/); // sem surrogate órfão
  });
});
