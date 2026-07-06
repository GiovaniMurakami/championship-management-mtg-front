import { useEffect, useState } from "react";
import { isAdSenseEnabled } from "../../constants/adsense";
import { AdSenseUnit } from "./AdSenseUnit";

const WIDE_LAYOUT_QUERY = "(min-width: 1536px)";

const RAIL_CLASS = "w-[132px] shrink-0";
const RAIL_INNER = "sticky top-28 rounded-xl border border-[rgba(217,180,255,0.1)] bg-[rgba(14,9,28,0.35)] p-1.5 overflow-hidden";

function useWideLayout() {
  const [isWide, setIsWide] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(WIDE_LAYOUT_QUERY).matches;
  });

  useEffect(() => {
    const media = window.matchMedia(WIDE_LAYOUT_QUERY);
    const onChange = (event) => setIsWide(event.matches);
    media.addEventListener("change", onChange);
    setIsWide(media.matches);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return isWide;
}

function AdSenseRail({ unit, className = "" }) {
  return (
    <aside className={RAIL_CLASS} aria-hidden="true">
      <div className={RAIL_INNER}>
        <AdSenseUnit
          unit={unit}
          className={`my-0 min-h-[280px] ${className}`.trim()}
        />
      </div>
    </aside>
  );
}

function AdSenseMobileStrip() {
  return (
    <div
      className="sticky top-[5.25rem] z-30 mx-3 -mb-2 px-2 py-2 rounded-xl border border-[rgba(217,180,255,0.1)] bg-[rgba(14,9,28,0.72)] backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
      aria-hidden="true"
    >
      <AdSenseUnit
        unit="horizontal"
        className="my-0 min-h-[50px] max-h-[90px] overflow-hidden rounded-lg"
      />
    </div>
  );
}

function AdSenseMobileFooter() {
  return (
    <div
      className="mx-3 mt-6 mb-2 rounded-xl border border-[rgba(217,180,255,0.1)] bg-[rgba(14,9,28,0.35)] p-2 overflow-hidden"
      aria-hidden="true"
    >
      <AdSenseUnit unit="pageEnd" className="my-0 min-h-[60px] max-h-[120px]" />
    </div>
  );
}

/**
 * Layout global de anúncios: laterais fixas no desktop, faixas discretas no mobile.
 */
export function AdSenseLayout({ children }) {
  const isWide = useWideLayout();

  if (!isAdSenseEnabled()) return children;

  return (
    <div className="w-full">
      {!isWide && <AdSenseMobileStrip />}

      <div className="flex justify-center gap-5 w-full max-w-[1520px] mx-auto 2xl:px-3">
        {isWide && <AdSenseRail unit="inArticle" />}

        <div className="flex-1 min-w-0 w-full">
          {children}
        </div>

        {isWide && <AdSenseRail unit="horizontal" />}
      </div>

      {!isWide && <AdSenseMobileFooter />}
    </div>
  );
}
