import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { loadAdSenseScript } from "../utils/adsenseScript";

describe("loadAdSenseScript", () => {
  beforeEach(() => {
    document.querySelectorAll('script[src*="adsbygoogle.js"]').forEach((node) => node.remove());
    delete window.adsbygoogle;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("resolve imediatamente quando adsbygoogle já existe", async () => {
    window.adsbygoogle = [];
    await expect(loadAdSenseScript()).resolves.toBe(true);
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
});
