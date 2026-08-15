import { describe, expect, it } from "vitest";
import { isScryfallId } from "../utils/scryfallId";

describe("isScryfallId", () => {
  it("reconhece uuid do scryfall", () => {
    expect(isScryfallId("e5c0c0d0-8c2a-4b1e-9f3a-1b2c3d4e5f60")).toBe(true);
  });

  it("rejeita nome de carta", () => {
    expect(isScryfallId("Guttersnipe")).toBe(false);
    expect(isScryfallId("")).toBe(false);
  });
});
