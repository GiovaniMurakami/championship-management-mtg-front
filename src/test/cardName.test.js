import { describe, expect, it } from "vitest";
import { formatCardName } from "../utils/cardName";
describe("nome da carta", () => {
  it.each([["lightning bolt", "Lightning Bolt"], ["Lightning Bolt", "Lightning Bolt"], ["  água  ", "Água"], ["1996 world Champion", "1996 World Champion"], ["  água de coco  ", "Água De Coco"], ["faithless looting", "Faithless Looting"], [null, ""]])("formata %s como %s", (input, expected) => {
    expect(formatCardName(input)).toBe(expected);
  });
});
