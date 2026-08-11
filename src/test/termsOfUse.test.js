import { describe, expect, it } from "vitest";
import { TERMS_SECTIONS, TERMS_VERSION } from "../constants/termsOfUse";

describe("termsOfUse", () => {
  it("expoe versao e secoes do documento", () => {
    expect(TERMS_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(TERMS_SECTIONS.length).toBeGreaterThanOrEqual(10);
    expect(TERMS_SECTIONS[0].title).toBeTruthy();
    expect(TERMS_SECTIONS[0].body).toBeTruthy();
  });
});
