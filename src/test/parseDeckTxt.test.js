import { describe, expect, it } from "vitest";
import { parseDeckTxt } from "../utils/parseDeckTxt";

describe("parseDeckTxt", () => {
  it("ignora comentarios // e #", () => {
    const result = parseDeckTxt(`// Meu deck
# formato modern
4 Lightning Bolt
2 Mountain
`);
    expect(result.mainEntries).toEqual([
      { quantidade: 4, nome: "Lightning Bolt" },
      { quantidade: 2, nome: "Mountain" },
    ]);
    expect(result.sideEntries).toEqual([]);
  });

  it("importa prefixos MTGO SB: e CM:", () => {
    const result = parseDeckTxt(`4 Lightning Bolt
2 Mountain

SB: 2 Rest in Peace
CM: 1 Sol Ring
`);
    expect(result.mainEntries).toEqual([
      { quantidade: 4, nome: "Lightning Bolt" },
      { quantidade: 2, nome: "Mountain" },
    ]);
    expect(result.sideEntries).toEqual([{ quantidade: 2, nome: "Rest in Peace" }]);
    expect(result.commanderEntries).toEqual([{ quantidade: 1, nome: "Sol Ring" }]);
  });

  it("respeita headers Sideboard e Commander", () => {
    const result = parseDeckTxt(`Deck
4 Counterspell
Sideboard
2 Surgical Extraction
Commander
1 Atraxa, Praetors' Voice
`);
    expect(result.mainEntries).toEqual([{ quantidade: 4, nome: "Counterspell" }]);
    expect(result.sideEntries).toEqual([{ quantidade: 2, nome: "Surgical Extraction" }]);
    expect(result.commanderEntries).toEqual([{ quantidade: 1, nome: "Atraxa, Praetors' Voice" }]);
  });

  it("separa main e side por linha em branco quando nao ha header", () => {
    const result = parseDeckTxt(`4 Bolt
2 Mountain

1 Grafdigger's Cage
`);
    expect(result.mainEntries).toHaveLength(2);
    expect(result.sideEntries).toEqual([{ quantidade: 1, nome: "Grafdigger's Cage" }]);
  });

  it("importa arquivo .dek XML do MTGO com CatID e Sideboard", () => {
    const result = parseDeckTxt(`<?xml version="1.0" encoding="utf-8"?>
<Deck xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <Cards CatID="139657" Quantity="2" Sideboard="false" Name="Winternight Stories" />
  <Cards CatID="139657" Quantity="1" Sideboard="false" Name="Winternight Stories" />
  <Cards CatID="123" Quantity="3" Sideboard="true" Name="Duress" />
</Deck>`);

    expect(result.mainEntries).toEqual([
      { quantidade: 3, nome: "Winternight Stories", mtgoId: 139657 },
    ]);
    expect(result.sideEntries).toEqual([
      { quantidade: 3, nome: "Duress", mtgoId: 123 },
    ]);
  });
});
