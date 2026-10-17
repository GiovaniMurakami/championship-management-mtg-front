import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadMarketingAnalytics } from "../utils/analytics";

describe("loadMarketingAnalytics", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
    document.body.innerHTML = "";
    delete window.dataLayer;
    delete window.gtag;
    vi.stubEnv("VITE_GTM_ID", "GTM-TEST");
    vi.stubEnv("VITE_GA_MEASUREMENT_ID", "G-TEST");
    vi.stubEnv("VITE_GOOGLE_TAG_ID", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("injeta GTM e gtag uma vez", () => {
    loadMarketingAnalytics();
    loadMarketingAnalytics();

    expect(document.querySelectorAll('script[data-tf-gtm]')).toHaveLength(1);
    expect(document.querySelectorAll('script[data-tf-gtag]')).toHaveLength(1);
    expect(document.getElementById("tf-gtm-noscript")).toBeTruthy();
    expect(typeof window.gtag).toBe("function");
    expect(Array.isArray(window.dataLayer)).toBe(true);
  });
});
