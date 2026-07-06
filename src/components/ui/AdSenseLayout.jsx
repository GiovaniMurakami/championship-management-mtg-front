import { isAdSenseEnabled } from "../../constants/adsense";
import { AdSenseUnit } from "./AdSenseUnit";

const BANNER_WRAP = "w-full my-3 min-h-[50px] rounded-xl border border-[rgba(217,180,255,0.1)] bg-[rgba(14,9,28,0.35)] p-2 overflow-hidden";

function AdSenseTopBanner() {
  return (
    <div className={BANNER_WRAP} aria-hidden="true">
      <AdSenseUnit unit="topBanner" className="my-0 w-full min-h-[50px]" />
    </div>
  );
}

function AdSenseBottomBanner() {
  return (
    <div className={`${BANNER_WRAP} mt-6 mb-2`} aria-hidden="true">
      <AdSenseUnit unit="bottomBanner" className="my-0 w-full min-h-[50px]" />
    </div>
  );
}

/** Anuncios no fluxo central do conteudo (sem laterais). */
export function AdSenseLayout({ children }) {
  if (!isAdSenseEnabled()) return children;

  return (
    <div className="w-full">
      <AdSenseTopBanner />
      {children}
      <AdSenseBottomBanner />
    </div>
  );
}
