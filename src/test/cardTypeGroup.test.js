import { describe, expect, it } from "vitest";
import { getCardTypeGroup, isLandType } from "../utils/cardTypeGroup";

describe("getCardTypeGroup", () => {
  it("conta terreno artefato como terreno", () => {
    expect(getCardTypeGroup("Artifact Land")).toBe("Land");
    expect(getCardTypeGroup("Artifact Land — Sphere")).toBe("Land");
    expect(isLandType("Artifact Land")).toBe(true);
  });

  it("mantem artefato que nao e terreno como artefato", () => {
    expect(getCardTypeGroup("Artifact")).toBe("Artifact");
    expect(getCardTypeGroup("Artifact Creature — Construct")).toBe("Creature");
  });

  it("conta terreno criatura como terreno", () => {
    expect(getCardTypeGroup("Legendary Creature Land — Dryad Forest")).toBe("Land");
  });
});
