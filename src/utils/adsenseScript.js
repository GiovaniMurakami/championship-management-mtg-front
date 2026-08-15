import { ADSENSE_CLIENT } from "../constants/adsense";

let loadPromise = null;

function adsenseScriptEl() {
  return document.querySelector('script[src*="adsbygoogle.js"]');
}

/** AdSense NPA: 1 = anúncio não personalizado. Precisa existir antes do script e do push. */
export function applyAdSensePersonalization(personalized) {
  if (typeof window === "undefined") return;
  const queue = window.adsbygoogle || [];
  queue.requestNonPersonalizedAds = personalized ? 0 : 1;
  window.adsbygoogle = queue;
}

export function loadAdSenseScript() {
  if (typeof window === "undefined") return Promise.resolve(false);

  const existing = adsenseScriptEl();
  if (existing?.dataset.loaded === "true") {
    return Promise.resolve(true);
  }

  // Fila `adsbygoogle` pode existir só pelo NPA — isso não significa que o script carregou.
  if (!existing) loadPromise = null;
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve) => {
    const scriptInDom = adsenseScriptEl();
    if (scriptInDom) {
      if (scriptInDom.dataset.loaded === "true") {
        resolve(true);
        return;
      }
      scriptInDom.addEventListener("load", () => {
        scriptInDom.dataset.loaded = "true";
        resolve(true);
      }, { once: true });
      scriptInDom.addEventListener("error", () => resolve(false), { once: true });
      return;
    }

    window.adsbygoogle = window.adsbygoogle || [];

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
