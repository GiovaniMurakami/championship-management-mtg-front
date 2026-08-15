export const COOKIE_CONSENT_STORAGE_KEY = "tf.cookie-consent";
export const COOKIE_CONSENT_VERSION = 1;
export const COOKIE_CONSENT_CHANGED_EVENT = "cookie-consent-changed";
export const COOKIE_CONSENT_OPEN_EVENT = "cookie-consent-open";

export function readCookieConsent() {
  if (typeof window === "undefined") return null;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY) || "null");
    if (!parsed || parsed.version !== COOKIE_CONSENT_VERSION) return null;
    return {
      version: parsed.version,
      marketing: Boolean(parsed.marketing),
      decidedAt: parsed.decidedAt || null,
    };
  } catch {
    return null;
  }
}

export function hasCookieConsentDecision() {
  return Boolean(readCookieConsent());
}

export function hasMarketingCookieConsent() {
  return readCookieConsent()?.marketing === true;
}

export function saveCookieConsent({ marketing }) {
  const value = {
    version: COOKIE_CONSENT_VERSION,
    marketing: Boolean(marketing),
    decidedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(value));
  } catch {
    // localStorage indisponível — segue só em memória nesta sessão
  }
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_CHANGED_EVENT, { detail: value }));
  return value;
}

export function acceptAllCookies() {
  return saveCookieConsent({ marketing: true });
}

export function acceptNecessaryCookies() {
  return saveCookieConsent({ marketing: false });
}

export function openCookiePreferences() {
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_OPEN_EVENT));
}
