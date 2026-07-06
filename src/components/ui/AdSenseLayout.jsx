import { useEffect, useState } from "react";
import { isAdSenseEnabled } from "../../constants/adsense";
import { AdSenseUnit } from "./AdSenseUnit";

/** Laterais só em telas bem largas; abaixo disso usa banner compacto no fluxo. */
const WIDE_LAYOUT_QUERY = "(min-width: 1400px)";

const RAIL_CLASS = "w-[128px] shrink-0";
const RAIL_INNER = "sticky top-28 rounded-xl border border-[rgba(217,180,255,0.1)] bg-[rgba(14,9,28,0.35)] p-1 overflow-hidden";

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

function AdSenseRail() {
  return (
    <aside className={RAIL_CLASS} aria-hidden="true">
      <div className={RAIL_INNER}>
        <AdSenseUnit unit="skyscraper" className="my-0 flex justify-center" />
      </div>
    </aside>
  );
}

/** Banner compacto no fluxo do conteúdo (sem sticky). */
function AdSenseInlineBanner() {
  return (
    <div
      className="flex justify-center my-3 px-2 overflow-hidden"
      aria-hidden="true"
    >
      <AdSenseUnit unit="mobileBanner" className="my-0 max-w-full" />
    </div>
  );
}

function AdSenseMobileFooter() {
  return (
    <div
      className="flex justify-center mx-3 mt-4 mb-2 overflow-hidden"
      aria-hidden="true"
    >
      <AdSenseUnit unit="pageEnd" className="my-0 w-full max-w-[728px] max-h-[90px]" />
    </div>
  );
}

/**
 * Layout global de anúncios: lateral no desktop largo, banners compactos no fluxo em telas menores.
 */
export function AdSenseLayout({ children }) {
  const isWide = useWideLayout();

  if (!isAdSenseEnabled()) return children;

  return (
    <div className="w-full">
      <div className="flex justify-center gap-4 w-full max-w-[1520px] mx-auto xl:px-3">
        {isWide && <AdSenseRail />}

        <div className="flex-1 min-w-0 w-full">
          {!isWide && <AdSenseInlineBanner />}
          {children}
        </div>
      </div>

      {!isWide && <AdSenseMobileFooter />}
    </div>
  );
}
