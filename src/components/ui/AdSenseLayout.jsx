import { isAdSenseEnabled } from "../../constants/adsense";
import { AdSenseUnit } from "./AdSenseUnit";

/** Mesmas medidas do conteudo principal (Home / PageShell). */
export const ADSENSE_CONTENT_SHELL =
  "w-[min(1100px,calc(100vw-2rem))] max-w-[1200px] mx-auto px-4 sm:px-6";

const NAV_OFFSET = "pt-[7.5rem] max-sm:pt-[6.5rem]";

const BANNER_WRAP =
  "w-full min-h-[50px] rounded-xl border border-[rgba(217,180,255,0.1)] bg-[rgba(14,9,28,0.35)] p-2 overflow-hidden";

function AdSenseTopBanner() {
  return (
    <div className={`${BANNER_WRAP} mb-4`} aria-hidden="true">
      <AdSenseUnit unit="topBanner" className="my-0 w-full min-h-[50px] mx-auto" />
    </div>
  );
}

function AdSenseBottomBanner() {
  return (
    <div className={`${BANNER_WRAP} mt-6 mb-2`} aria-hidden="true">
      <AdSenseUnit unit="bottomBanner" className="my-0 w-full min-h-[50px] mx-auto" />
    </div>
  );
}

/** Anuncios alinhados ao conteudo central, abaixo da navbar fixa. */
export function AdSenseLayout({ children }) {
  const adsEnabled = isAdSenseEnabled();

  return (
    <div className={`w-full min-w-0 overflow-x-clip ${NAV_OFFSET}`}>
      <div className={`${ADSENSE_CONTENT_SHELL} pb-12`}>
        {adsEnabled && <AdSenseTopBanner />}
        {children}
        {adsEnabled && <AdSenseBottomBanner />}
      </div>
    </div>
  );
}
