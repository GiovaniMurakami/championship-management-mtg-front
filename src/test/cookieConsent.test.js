import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  COOKIE_CONSENT_STORAGE_KEY,
  acceptAllCookies,
  acceptNecessaryCookies,
  hasCookieConsentDecision,
  hasMarketingCookieConsent,
  readCookieConsent,
} from "../utils/cookieConsent";

describe("cookieConsent", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("nao considera consentimento antes da escolha", () => {
    expect(readCookieConsent()).toBeNull();
    expect(hasCookieConsentDecision()).toBe(false);
    expect(hasMarketingCookieConsent()).toBe(false);
  });

  it("aceitar todos libera cookies de anuncios", () => {
    const changed = vi.fn();
    window.addEventListener("cookie-consent-changed", changed);

    acceptAllCookies();

    expect(hasCookieConsentDecision()).toBe(true);
    expect(hasMarketingCookieConsent()).toBe(true);
    expect(JSON.parse(window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)).marketing).toBe(true);
    expect(changed).toHaveBeenCalledTimes(1);
  });

  it("somente necessarios nao libera anuncios personalizados", () => {
    acceptNecessaryCookies();
    expect(hasCookieConsentDecision()).toBe(true);
    expect(hasMarketingCookieConsent()).toBe(false);
  });
});
