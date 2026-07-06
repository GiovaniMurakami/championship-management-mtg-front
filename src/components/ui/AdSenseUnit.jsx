import { useEffect, useRef } from "react";
import { ADSENSE_CLIENT, ADSENSE_UNITS, isAdSenseEnabled } from "../../constants/adsense";

const BASE_CLASS = "overflow-hidden";

function getUnitStyle(config) {
  if (config.layout === "in-article") {
    return { display: "block", textAlign: "center" };
  }
  return { display: "block" };
}

function pushAd() {
  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  } catch {
    // AdSense pode falhar em dev ou com bloqueadores de anúncio.
  }
}

export function AdSenseUnit({ unit = "horizontal", className = "" }) {
  const config = ADSENSE_UNITS[unit];
  const pushed = useRef(false);
  const enabled = isAdSenseEnabled();

  useEffect(() => {
    if (!config || !enabled || pushed.current) return;
    pushed.current = true;
    pushAd();
  }, [config, enabled]);

  if (!config || !enabled) return null;

  const style = getUnitStyle(config);

  return (
    <div className={`${BASE_CLASS} ${className}`.trim()} aria-hidden="true">
      <ins
        className="adsbygoogle"
        style={style}
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
