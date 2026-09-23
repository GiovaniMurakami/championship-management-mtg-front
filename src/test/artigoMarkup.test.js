import { describe, expect, it } from "vitest";
import { parseArtigoMarkup, extrairNomesCartas } from "../utils/artigoMarkup";

describe("artigoMarkup", () => {
  it("parseia tokens do template Cards Realm", () => {
    const tokens = parseArtigoMarkup(
      "Olá [[Tolarian Terror]]\n[h1]{Mono Blue}\n[cardinfo]{Mental Note}\n[cardside](1 Bolt || 2 Counterspell)\n[deck](abc-123)"
    );
    expect(tokens.map((t) => t.type)).toEqual([
      "text", "card", "text", "h1", "text", "cardinfo", "text", "cardside", "text", "deck",
    ]);
    expect(extrairNomesCartas(tokens)).toEqual(
      expect.arrayContaining(["Tolarian Terror", "Mental Note", "Bolt", "Counterspell"])
    );
  });
});
