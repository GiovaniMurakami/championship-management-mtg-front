import { useEffect, useRef, useState } from "react";
import { ADSENSE_CLIENT, ADSENSE_UNITS, isAdSenseEnabled } from "../../constants/adsense";
import { applyAdSensePersonalization, loadAdSenseScript } from "../../utils/adsenseScript";
import { useCookieConsent } from "./CookieConsentBanner";

const BASE_CLASS = "overflow-hidden bg-transparent";

function getUnitStyle(config) {
  if (config.fixedSize) {
    return {
      display: "inline-block",
      width: `${config.fixedSize.width}px`,
      height: `${config.fixedSize.height}px`,
    };
  }
  if (config.layout === "in-article") {
    return { display: "block", textAlign: "center" };
  }
  return { display: "block", textAlign: "center", marginInline: "auto" };
}

export function AdSenseUnit({ unit = "topBanner", className = "" }) {
  const config = ADSENSE_UNITS[unit];
  const containerRef = useRef(null);
  const pushed = useRef(false);
  const [adStatus, setAdStatus] = useState("loading");
  const { decided, marketing } = useCookieConsent();
  const enabled = isAdSenseEnabled() && decided;

  useEffect(() => {
    if (!config || !enabled) return undefined;

    const container = containerRef.current;
    if (!container) return undefined;

    const ins = container.querySelector("ins.adsbygoogle");
    const syncAdStatus = () => {
      const status = ins?.getAttribute("data-ad-status");
      if (status === "filled" || status === "unfilled") setAdStatus(status);
    };
    const statusObserver = typeof MutationObserver !== "undefined" && ins
      ? new MutationObserver(syncAdStatus)
      : null;
    statusObserver?.observe(ins, { attributes: true, attributeFilter: ["data-ad-status"] });

    pushed.current = false;
    let cancelled = false;

    const tryPush = async () => {
      if (pushed.current || cancelled || container.offsetWidth <= 0) return;

      applyAdSensePersonalization(marketing);

      if (ins?.getAttribute("data-adsbygoogle-status")) return;

      const loaded = await loadAdSenseScript();
      if (!loaded || cancelled || pushed.current || container.offsetWidth <= 0) return;

      applyAdSensePersonalization(marketing);
      pushed.current = true;
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        pushed.current = false;
      }
    };

    tryPush();

    if (typeof ResizeObserver === "undefined") {
      return () => {
        cancelled = true;
        statusObserver?.disconnect();
      };
    }

    const observer = new ResizeObserver(() => { tryPush(); });
    observer.observe(container);
    return () => {
      cancelled = true;
      observer.disconnect();
      statusObserver?.disconnect();
    };
  }, [config, enabled, marketing, unit]);

  if (!config || !enabled) return null;

  const useResponsive = config.fullWidthResponsive && !config.fixedSize;

  return (
    <div
      ref={containerRef}
      className={`${BASE_CLASS} ${adStatus === "unfilled" ? "hidden" : ""} ${className}`.trim()}
      aria-hidden="true"
      data-ad-state={adStatus}
    >
      <ins
        className={`adsbygoogle bg-transparent transition-opacity duration-200 ${adStatus === "filled" ? "opacity-100" : "opacity-0"}`}
        style={{ ...getUnitStyle(config), backgroundColor: "transparent" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={config.slot}
        data-ad-format={config.format}
        {...(config.layout ? { "data-ad-layout": config.layout } : {})}
        {...(useResponsive ? { "data-full-width-responsive": "true" } : {})}
      />
    </div>
  );
}

export function AdSenseHorizontal(props) {
  return <AdSenseUnit unit="topBanner" {...props} />;
}

export function AdSenseInArticle(props) {
  return <AdSenseUnit unit="inArticle" {...props} />;
}

export function AdSensePageEnd({ className = "", ...props }) {
  return (
    <AdSenseUnit
      unit="bottomBanner"
      className={className}
      {...props}
    />
  );
}
