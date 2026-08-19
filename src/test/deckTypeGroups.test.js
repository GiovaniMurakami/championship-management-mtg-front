import { describe, expect, it } from "vitest";
import { enrichCardsByName, groupCardsByType } from "../utils/deckTypeGroups";

describe("groupCardsByType", () => {
  it("separa criaturas, instants e terrenos na ordem do drawer", () => {
    const grupos = groupCardsByType([
      { nome: "island", quantidade: 18, typeLine: "Basic Land — Island" },
      { nome: "tolarian terror", quantidade: 4, typeLine: "Creature — Serpent" },
      { nome: "counterspell", quantidade: 4, typeLine: "Instant" },
    ]);

    expect(grupos.map((g) => g.type)).toEqual(["Creature", "Instant", "Land"]);
    expect(grupos[0].total).toBe(4);
    expect(grupos[2].total).toBe(18);
  });

  it("conta terreno artefato como terreno", () => {
    const grupos = groupCardsByType([
      { nome: "darksteel citadel", quantidade: 4, typeLine: "Artifact Land" },
    ]);
    expect(grupos).toEqual([
      {
        type: "Land",
        total: 4,
        cards: [{ nome: "darksteel citadel", quantidade: 4, typeLine: "Artifact Land" }],
      },
    ]);
  });
});

describe("enrichCardsByName", () => {
  it("copia typeLine, colors e imagem do scryfall pelo nome", () => {
    const porNome = new Map([
      ["tolarian terror", {
        nome: "Tolarian Terror",
        typeLine: "Creature — Serpent",
        colors: ["U"],
        imagem: "https://img/terror.jpg",
        cmc: 7,
      }],
    ]);

    expect(enrichCardsByName([{ nome: "tolarian terror", quantidade: 4 }], porNome)).toEqual([
      {
        nome: "Tolarian Terror",
        quantidade: 4,
        typeLine: "Creature — Serpent",
        colors: ["U"],
        imagem: "https://img/terror.jpg",
        cmc: 7,
        manaCost: "",
        isBasicLand: false,
      },
    ]);
  });

  it("mantem a entrada quando o scryfall nao acha a carta", () => {
    expect(enrichCardsByName([{ nome: "carta fake", quantidade: 2 }], new Map())).toEqual([
      {
        nome: "carta fake",
        quantidade: 2,
        typeLine: "",
        colors: [],
        imagem: "",
        cmc: 0,
        manaCost: "",
        isBasicLand: false,
      },
    ]);
  });
});
