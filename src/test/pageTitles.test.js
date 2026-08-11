import { describe, expect, it } from "vitest";
import { SITE_TITLE, PAGE_TITLES, formatPageTitle } from "../constants/pageTitles";

describe("pageTitles", () => {
  it("formata titulo com sufixo do site", () => {
    expect(formatPageTitle(PAGE_TITLES.torneios)).toBe(`Torneios | ${SITE_TITLE}`);
  });

  it("retorna apenas o site quando titulo vazio ou igual ao site", () => {
    expect(formatPageTitle("")).toBe(SITE_TITLE);
    expect(formatPageTitle(SITE_TITLE)).toBe(SITE_TITLE);
  });

  it("inclui títulos das ferramentas individuais", () => {
    expect(PAGE_TITLES.contadorVida).toBe("Contador de vida");
    expect(PAGE_TITLES.calculadoraSwiss).toMatch(/Calculadora/i);
  });

  it("inclui título do bloqueio de usuários no dashboard", () => {
    expect(PAGE_TITLES.dashboardBloqueios).toMatch(/Bloqueio/i);
  });

  it("inclui título da política de privacidade", () => {
    expect(PAGE_TITLES.privacidade).toMatch(/Privacidade/i);
  });
});
