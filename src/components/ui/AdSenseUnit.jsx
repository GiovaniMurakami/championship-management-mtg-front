import { useEffect, useRef } from "react";
import { ADSENSE_CLIENT, ADSENSE_UNITS, isAdSenseEnabled } from "../../constants/adsense";
import { loadAdSenseScript } from "../../utils/adsenseScript";

const BASE_CLASS = "overflow-hidden";

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
  return { display: "block" };
}

export function AdSenseUnit({ unit = "mobileBanner", className = "" }) {
  const config = ADSENSE_UNITS[unit];
  const containerRef = useRef(null);
  const pushed = useRef(false);
  const enabled = isAdSenseEnabled();

  useEffect(() => {
    if (!config || !enabled) return undefined;

    const container = containerRef.current;
    if (!container) return undefined;

    pushed.current = false;
    let cancelled = false;

    const tryPush = async () => {
      if (pushed.current || cancelled || container.offsetWidth <= 0) return;

      const ins = container.querySelector("ins.adsbygoogle");
      if (ins?.getAttribute("data-adsbygoogle-status")) return;

      const loaded = await loadAdSenseScript();
      if (!loaded || cancelled || pushed.current || container.offsetWidth <= 0) return;

      pushed.current = true;
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        pushed.current = false;
      }
    };

    tryPush();

    if (typeof ResizeObserver === "undefined") return () => { cancelled = true; };

    const observer = new ResizeObserver(() => { tryPush(); });
    observer.observe(container);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [config, enabled, unit]);

  if (!config || !enabled) return null;

  const useResponsive = config.fullWidthResponsive && !config.fixedSize;

  return (
    <div ref={containerRef} className={`${BASE_CLASS} ${className}`.trim()} aria-hidden="true">
      <ins
        className="adsbygoogle"
        style={getUnitStyle(config)}
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
  return <AdSenseUnit unit="mobileBanner" {...props} />;
}

export function AdSenseInArticle(props) {
  return <AdSenseUnit unit="sideRail" {...props} />;
}

export function AdSensePageEnd({ className = "", ...props }) {
  return (
    <AdSenseUnit
      unit="pageEnd"
      className={`border-t border-[rgba(217,180,255,0.08)] pt-6 ${className}`.trim()}
      {...props}
    />
  );
}
