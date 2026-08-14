import { describe, expect, it } from "vitest";
import { coresDoDeck, nomesCartasParaCores } from "../utils/deckColors";

describe("coresDoDeck", () => {
  it("une terrenos basicos e identidade de cor das cartas", () => {
    expect(coresDoDeck(
      ["forest", "mountain", "lightning bolt", "arbor elf"],
      [
        { nome: "Lightning Bolt", colorIdentity: ["R"], colors: ["R"] },
        { nome: "Arbor Elf", colorIdentity: ["G"], colors: ["G"] },
      ],
    )).toEqual(["R", "G"]);
  });

  it("usa colorIdentity de terrenos nao basicos (grixis affinity)", () => {
    expect(coresDoDeck(
      ["thoughtcast", "galvanic blast", "deadly dispute", "darkslick shores"],
      [
        { nome: "Thoughtcast", colorIdentity: ["U"], colors: ["U"] },
        { nome: "Galvanic Blast", colorIdentity: ["R"], colors: ["R"] },
        { nome: "Deadly Dispute", colorIdentity: ["B"], colors: ["B"] },
        { nome: "Darkslick Shores", colorIdentity: ["U", "B"], colors: [] },
      ],
    )).toEqual(["U", "B", "R"]);
  });

  it("nao usa so a cor da carta representativa", () => {
    expect(coresDoDeck(["utopia sprawl"], [
      { nome: "Utopia Sprawl", colorIdentity: ["G"], colors: ["G"] },
    ])).toEqual(["G"]);
  });
});

describe("nomesCartasParaCores", () => {
  it("prioriza cartasCores da API", () => {
    expect(nomesCartasParaCores({
      cartasCores: ["mountain", "forest"],
      cartaRepresentativa: "utopia sprawl",
      cartasChave: ["utopia sprawl"],
    })).toEqual(["mountain", "forest"]);
  });

  it("no commander usa a lista típica de commander", () => {
    expect(nomesCartasParaCores({
      listaTipica: {
        commander: [{ nome: "edric, spymaster of trest" }],
        maindeck: [{ nome: "sol ring" }],
      },
    }, "commander")).toEqual(["edric, spymaster of trest"]);
  });

  it("cai na carta representativa quando não há lista", () => {
    expect(nomesCartasParaCores({
      cartaRepresentativa: "brainstorm",
      cartasChave: ["tolarian terror"],
    })).toEqual(["brainstorm", "tolarian terror"]);
  });
});
