import { useEffect, useRef } from "react";
import { ADSENSE_CLIENT, ADSENSE_UNITS, isAdSenseEnabled } from "../../constants/adsense";
import { loadAdSenseScript } from "../../utils/adsenseScript";

const BASE_CLASS = "overflow-hidden";

function getUnitStyle(config) {
  if (config.layout === "in-article") {
    return { display: "block", textAlign: "center" };
  }
  return { display: "block" };
}

export function AdSenseUnit({ unit = "horizontal", className = "" }) {
  const config = ADSENSE_UNITS[unit];
  const containerRef = useRef(null);
  const pushed = useRef(false);
  const enabled = isAdSenseEnabled();

  useEffect(() => {
    if (!config || !enabled || pushed.current) return undefined;

    const container = containerRef.current;
    if (!container) return undefined;

    let cancelled = false;

    const tryPush = async () => {
      if (pushed.current || cancelled || container.offsetWidth <= 0) return;

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
  }, [config, enabled]);

  if (!config || !enabled) return null;

  return (
    <div ref={containerRef} className={`${BASE_CLASS} ${className}`.trim()} aria-hidden="true">
      <ins
        className="adsbygoogle"
        style={getUnitStyle(config)}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={config.slot}
        data-ad-format={config.format}
        {...(config.layout ? { "data-ad-layout": config.layout } : {})}
        {...(config.fullWidthResponsive ? { "data-full-width-responsive": "true" } : {})}
      />
    </div>
  );
}

export function AdSenseHorizontal(props) {
  return <AdSenseUnit unit="horizontal" {...props} />;
}

export function AdSenseInArticle(props) {
  return <AdSenseUnit unit="inArticle" {...props} />;
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
