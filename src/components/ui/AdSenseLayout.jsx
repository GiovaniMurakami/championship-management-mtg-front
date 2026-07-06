import { useEffect, useState } from "react";
import { isAdSenseEnabled } from "../../constants/adsense";
import { AdSenseUnit } from "./AdSenseUnit";

const WIDE_LAYOUT_QUERY = "(min-width: 1400px)";

const RAIL_CLASS = "w-[250px] shrink-0 max-xl:hidden";
const RAIL_INNER = "sticky top-28 rounded-xl border border-[rgba(217,180,255,0.1)] bg-[rgba(14,9,28,0.35)] p-1.5 overflow-hidden min-h-[250px]";

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

function AdSenseSideRail() {
  return (
    <aside className={RAIL_CLASS} aria-hidden="true">
      <div className={RAIL_INNER}>
        <AdSenseUnit unit="sideRail" className="my-0 w-full min-h-[250px]" />
      </div>
    </aside>
  );
}

function AdSenseTopBanner() {
  return (
    <div className="flex justify-center w-full my-3 px-2 min-h-[50px]" aria-hidden="true">
      <AdSenseUnit unit="mobileBanner" className="my-0 w-full max-w-[728px] min-h-[50px]" />
    </div>
  );
}

function AdSenseBottomBanner() {
  return (
    <div className="flex justify-center w-full mt-6 mb-3 px-2 min-h-[50px]" aria-hidden="true">
      <AdSenseUnit unit="pageEnd" className="my-0 w-full max-w-[728px] min-h-[50px]" />
    </div>
  );
}

export function AdSenseLayout({ children }) {
  const isWide = useWideLayout();

  if (!isAdSenseEnabled()) return children;

  return (
    <div className="w-full">
      <div className="flex justify-center gap-4 w-full max-w-[1520px] mx-auto px-3">
        {isWide && <AdSenseSideRail />}

        <div className="flex-1 min-w-0 w-full">
          {!isWide && <AdSenseTopBanner />}
          {children}
          {!isWide && <AdSenseBottomBanner />}
        </div>
      </div>
    </div>
  );
}
