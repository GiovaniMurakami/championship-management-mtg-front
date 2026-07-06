import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { getConfiguredAdSenseHost, isAdSenseEnabled } from "../constants/adsense";

describe("adsense", () => {
  const originalParent = window.parent;
  const originalHostname = window.location.hostname;

  beforeEach(() => {
    vi.stubEnv("VITE_ADSENSE_ENABLED", "true");
    vi.stubEnv("VITE_APP_URL", "https://app.tiagofuguete.com.br");
    Object.defineProperty(window, "parent", { value: window, configurable: true });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    Object.defineProperty(window, "parent", { value: originalParent, configurable: true });
    Object.defineProperty(window, "location", {
      value: { ...window.location, hostname: originalHostname },
      configurable: true,
    });
  });

  it("resolve o host do AdSense a partir de VITE_APP_URL", () => {
    expect(getConfiguredAdSenseHost()).toBe("app.tiagofuguete.com.br");
  });

  it("retorna false quando VITE_ADSENSE_ENABLED é false", () => {
    vi.stubEnv("VITE_ADSENSE_ENABLED", "false");
    expect(isAdSenseEnabled()).toBe(false);
  });

  it("retorna true em iframe com flag habilitada em dev", () => {
    Object.defineProperty(window, "parent", { value: {}, configurable: true });
    expect(isAdSenseEnabled()).toBe(true);
  });

  it("retorna true com flag habilitada em dev", () => {
    expect(isAdSenseEnabled()).toBe(true);
  });
});
