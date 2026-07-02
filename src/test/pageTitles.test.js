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
});
