import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { applyAdSensePersonalization, loadAdSenseScript } from "../utils/adsenseScript";

describe("loadAdSenseScript", () => {
  beforeEach(() => {
    document.querySelectorAll('script[src*="adsbygoogle.js"]').forEach((node) => node.remove());
    delete window.adsbygoogle;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("resolve imediatamente quando o script ja carregou", async () => {
    const script = document.createElement("script");
    script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-x";
    script.dataset.loaded = "true";
    document.head.appendChild(script);
    window.adsbygoogle = [];

    const appendSpy = vi.spyOn(document.head, "appendChild");
    await expect(loadAdSenseScript()).resolves.toBe(true);
    expect(appendSpy).not.toHaveBeenCalled();
  });

  it("injeta o script mesmo se a fila adsbygoogle ja existir (NPA)", async () => {
    applyAdSensePersonalization(false);
    const appendSpy = vi.spyOn(document.head, "appendChild");

    const pending = loadAdSenseScript();
    expect(appendSpy).toHaveBeenCalledTimes(1);

    const script = document.querySelector('script[src*="adsbygoogle.js"]');
    script?.dispatchEvent(new Event("load"));
    await expect(pending).resolves.toBe(true);
    expect(window.adsbygoogle.requestNonPersonalizedAds).toBe(1);
  });

  it("injeta o script uma única vez", async () => {
    const appendSpy = vi.spyOn(document.head, "appendChild");

    const first = loadAdSenseScript();
    const second = loadAdSenseScript();

    expect(first).toBe(second);
    expect(appendSpy).toHaveBeenCalledTimes(1);

    const script = document.querySelector('script[src*="adsbygoogle.js"]');
    expect(script?.src).toContain("ca-pub-7954449480469462");
    script?.dispatchEvent(new Event("load"));
    window.adsbygoogle = [];

    await expect(first).resolves.toBe(true);
  });

  it("marca anuncio nao personalizado quando o usuario recusa cookies de ads", () => {
    applyAdSensePersonalization(false);
    expect(window.adsbygoogle.requestNonPersonalizedAds).toBe(1);
    applyAdSensePersonalization(true);
    expect(window.adsbygoogle.requestNonPersonalizedAds).toBe(0);
  });
});
