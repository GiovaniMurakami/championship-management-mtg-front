import { describe, expect, it } from "vitest";
import { PRIVACY_SECTIONS, PRIVACY_VERSION } from "../constants/privacyPolicy";

describe("privacyPolicy", () => {
  it("expoe versao e secoes da politica LGPD", () => {
    expect(PRIVACY_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(PRIVACY_SECTIONS.length).toBeGreaterThanOrEqual(10);
    expect(PRIVACY_SECTIONS[0].title).toBeTruthy();
    expect(PRIVACY_SECTIONS[0].body).toBeTruthy();
    expect(PRIVACY_SECTIONS.some((section) => /direitos/i.test(section.title))).toBe(true);
  });
});
