import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  COOKIE_CONSENT_CHANGED_EVENT,
  COOKIE_CONSENT_OPEN_EVENT,
  acceptAllCookies,
  acceptNecessaryCookies,
  hasCookieConsentDecision,
  hasMarketingCookieConsent,
} from "../../utils/cookieConsent";

export function useCookieConsent() {
  const [decided, setDecided] = useState(() => hasCookieConsentDecision());
  const [marketing, setMarketing] = useState(() => hasMarketingCookieConsent());

  useEffect(() => {
    const sync = () => {
      setDecided(hasCookieConsentDecision());
      setMarketing(hasMarketingCookieConsent());
    };
    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, sync);
    return () => window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, sync);
  }, []);

  return { decided, marketing };
}

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(() => !hasCookieConsentDecision());
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    const open = () => {
      setVisible(true);
      setDetailsOpen(true);
    };
    window.addEventListener(COOKIE_CONSENT_OPEN_EVENT, open);
    return () => window.removeEventListener(COOKIE_CONSENT_OPEN_EVENT, open);
  }, []);

  if (!visible) return null;

  const choose = (save) => {
    save();
    setVisible(false);
    setDetailsOpen(false);
  };

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[80] p-3 sm:p-4 pointer-events-none"
      role="dialog"
      aria-modal="false"
      aria-label="Cookies e privacidade (LGPD)"
      aria-describedby="cookie-consent-text"
    >
      <div className="pointer-events-auto mx-auto w-[min(720px,calc(100vw-1.5rem))] rounded-2xl border border-[rgba(217,180,255,0.28)] bg-[rgba(14,9,28,0.96)] backdrop-blur-xl p-4 sm:p-5 shadow-[0_16px_40px_rgba(3,2,8,0.55)]">
        <p
          id="cookie-consent-title"
          className="m-0 mb-2 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-[#c795ff]"
        >
          Cookies e privacidade (LGPD)
        </p>
        <p id="cookie-consent-text" className="m-0 text-[0.88rem] leading-relaxed text-[#e8dfff]">
          Usamos cookies e armazenamento local para login, segurança e funcionamento da plataforma.
          Exibimos anúncios do Google AdSense para manter o serviço. Se você aceitar todos os cookies,
          os anúncios podem ser personalizados. Se escolher somente os necessários, os anúncios
          continuam, porém sem personalização. Não vendemos seus dados.{" "}
          <Link to="/privacidade" className="text-[#c795ff] font-semibold underline underline-offset-2 hover:text-white">
            Política de Privacidade
          </Link>
          {" · "}
          <Link to="/termos-de-uso" className="text-[#c795ff] font-semibold underline underline-offset-2 hover:text-white">
            Termos de Uso
          </Link>
        </p>

        <button
          type="button"
          className="mt-3 text-[0.78rem] font-semibold text-[#beafd7] underline underline-offset-2 bg-transparent border-0 p-0 cursor-pointer hover:text-white"
          onClick={() => setDetailsOpen((open) => !open)}
          aria-expanded={detailsOpen}
        >
          {detailsOpen ? "Ocultar detalhes" : "Ver o que utilizamos"}
        </button>

        {detailsOpen && (
          <ul className="mt-3 mb-0 pl-4 text-[0.82rem] leading-relaxed text-[#d8cff0] grid gap-2">
            <li>
              <strong className="text-[#f5edff]">Necessários</strong> — sessão, autenticação, preferências
              e segurança. Sempre ativos, pois o site não funciona sem eles.
            </li>
            <li>
              <strong className="text-[#f5edff]">Anúncios</strong> — Google AdSense. Com “Aceitar todos”,
              podem ser personalizados. Com “Somente necessários”, mostramos anúncios não personalizados
              (NPA), sem perfil publicitário.
            </li>
          </ul>
        )}

        <div className="mt-4 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
          <button
            type="button"
            className="min-h-11 px-4 rounded-xl border border-[rgba(217,180,255,0.28)] bg-white/[0.04] text-[#e8dfff] text-[0.88rem] font-semibold cursor-pointer hover:bg-white/[0.08]"
            onClick={() => choose(acceptNecessaryCookies)}
          >
            Somente necessários
          </button>
          <button
            type="button"
            className="min-h-11 px-4 rounded-xl border border-[rgba(199,149,255,0.5)] bg-[linear-gradient(145deg,#8e39ed,#5f23b3)] text-white text-[0.88rem] font-semibold cursor-pointer hover:-translate-y-0.5"
            onClick={() => choose(acceptAllCookies)}
          >
            Aceitar todos
          </button>
        </div>
      </div>
    </div>
  );
}
