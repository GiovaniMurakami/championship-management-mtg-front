import { ADSENSE_CLIENT } from "../constants/adsense";

let loadPromise = null;

export function loadAdSenseScript() {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.adsbygoogle) return Promise.resolve(true);
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve) => {
    const existing = document.querySelector('script[src*="adsbygoogle.js"]');
    if (existing) {
      if (existing.dataset.loaded === "true" || window.adsbygoogle) {
        resolve(true);
        return;
      }
      existing.addEventListener("load", () => resolve(Boolean(window.adsbygoogle)), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve(true);
    };
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });

  return loadPromise;
}
