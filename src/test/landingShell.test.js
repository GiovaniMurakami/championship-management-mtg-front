import { describe, expect, it } from "vitest";
import { isLandingShellRoute } from "../utils/landingShell";

describe("isLandingShellRoute", () => {
  it("mantém home e páginas institucionais na landing", () => {
    expect(isLandingShellRoute("/")).toBe(true);
    expect(isLandingShellRoute("/parceiros")).toBe(true);
    expect(isLandingShellRoute("/hall-da-fama")).toBe(true);
    expect(isLandingShellRoute("/decks-fuguete")).toBe(true);
  });

  it("mantém artigos públicos na landing", () => {
    expect(isLandingShellRoute("/artigos")).toBe(true);
    expect(isLandingShellRoute("/artigos/abc12-guia-pauper")).toBe(true);
  });

  it("mantém editor de artigos no shell de torneios", () => {
    expect(isLandingShellRoute("/artigos/novo")).toBe(false);
    expect(isLandingShellRoute("/artigos/pendentes")).toBe(false);
    expect(isLandingShellRoute("/artigos/abc12-guia/editar")).toBe(false);
  });

  it("não trata torneios como landing", () => {
    expect(isLandingShellRoute("/torneios")).toBe(false);
    expect(isLandingShellRoute("/decks")).toBe(false);
  });
});
