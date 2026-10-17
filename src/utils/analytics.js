import { getGaMeasurementId, getGoogleTagId, getGtmId } from "../constants/seo";

const GTM_SCRIPT_ATTR = "data-tf-gtm";
const GTAG_SCRIPT_ATTR = "data-tf-gtag";

function ensureDataLayer() {
  window.dataLayer = window.dataLayer || [];
}

function injectScript({ src, id, attr, async = true, text }) {
  if (attr && document.querySelector(`script[${attr}]`)) return null;
  if (id && document.getElementById(id)) return null;

  const script = document.createElement("script");
  if (attr) script.setAttribute(attr, "true");
  if (id) script.id = id;
  if (src) {
    script.src = src;
    script.async = async;
  } else if (text) {
    script.text = text;
  }
  document.head.appendChild(script);
  return script;
}

/** Carrega GTM + GA4 + Google Tag (mesmos IDs do WordPress). Idempotente. */
export function loadMarketingAnalytics() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const gtmId = getGtmId();
  const gaId = getGaMeasurementId();
  const googleTagId = getGoogleTagId();

  ensureDataLayer();

  if (gtmId) {
    window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    injectScript({
      src: `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`,
      attr: GTM_SCRIPT_ATTR,
      id: "tf-gtm",
    });

    if (!document.getElementById("tf-gtm-noscript")) {
      const noscript = document.createElement("noscript");
      noscript.id = "tf-gtm-noscript";
      noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(gtmId)}" height="0" width="0" style="display:none;visibility:hidden" title="Google Tag Manager"></iframe>`;
      document.body.insertBefore(noscript, document.body.firstChild);
    }
  }

  if (gaId || googleTagId) {
    const primaryId = gaId || googleTagId;
    injectScript({
      src: `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(primaryId)}`,
      attr: GTAG_SCRIPT_ATTR,
      id: "tf-gtag-js",
    });

    if (typeof window.gtag !== "function") {
      window.gtag = function gtag() {
        window.dataLayer.push(arguments);
      };
      window.gtag("js", new Date());
    }

    if (gaId) window.gtag("config", gaId);
    if (googleTagId && googleTagId !== gaId) window.gtag("config", googleTagId);
  }
}

export function trackPageView(path) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  const gaId = getGaMeasurementId();
  if (!gaId) return;
  window.gtag("event", "page_view", {
    page_path: path,
    send_to: gaId,
  });
}
