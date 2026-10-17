import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { loadMarketingAnalytics, trackPageView } from "../../utils/analytics";
import { useCookieConsent } from "./CookieConsentBanner";

/** Injeta GTM/GA quando o usuário aceita cookies de marketing. */
export function Analytics() {
  const { marketing } = useCookieConsent();
  const location = useLocation();

  useEffect(() => {
    if (!marketing) return;
    loadMarketingAnalytics();
  }, [marketing]);

  useEffect(() => {
    if (!marketing) return;
    trackPageView(`${location.pathname}${location.search}`);
  }, [marketing, location.pathname, location.search]);

  return null;
}
