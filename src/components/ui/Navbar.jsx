import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { BRAND_LOGO_URL } from "../../constants/site";
import { ADMIN_LINKS, NavUserMenu, NavUserMenuMobile } from "./NavUserMenu";

const IconTrophy = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
  </svg>
);

const IconDashboard = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </svg>
);

const IconDeck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
  </svg>
);

const IconMetagame = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
    <path d="M12 3v18" />
    <path d="M5 8h4v13H5z" />
    <path d="M15 12h4v9h-4z" />
  </svg>
);

const IconLiga = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);

const IconTime = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconTools = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

const Chevron = () => (
  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const mobileLinkClass = ({ isActive }) =>
  `flex items-center gap-[0.65rem] px-[0.75rem] py-[0.5rem] rounded-lg no-underline font-semibold text-[0.9rem] transition-all duration-[180ms] ${isActive
    ? "bg-[rgba(167,79,255,0.18)] text-text-main"
    : "text-text-soft hover:bg-[rgba(167,79,255,0.1)] hover:text-text-main"
  }`;

const desktopLinkClass = ({ isActive }) =>
  `no-underline font-semibold text-[0.9rem] cursor-pointer bg-none border-none p-0 transition-colors duration-200 ${isActive
    ? "text-text-main"
    : "text-text-muted hover:text-text-main"
  }`;

const dropdownItemClass =
  "block rounded-lg px-3 py-2.5 text-[0.88rem] font-semibold text-text-soft no-underline hover:bg-[rgba(167,79,255,0.14)] hover:text-text-main";

const dropdownPanelClass =
  "absolute top-[calc(100%+0.7rem)] left-1/2 z-50 min-w-[220px] -translate-x-1/2 rounded-xl border border-[rgba(217,180,255,0.22)] bg-[rgba(18,12,32,0.97)] p-1.5 shadow-[0_12px_28px_rgba(3,2,8,0.55)]";

const sectionLabelClass =
  "mx-2 mb-1 mt-2 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-text-subtle first:mt-1";

export function Navbar({
  usuario,
  onOpenAuth,
  onLogout,
  isAuthenticated,
  onOpenEditProfile,
  loggingOut = false,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [maisOpen, setMaisOpen] = useState(false);
  const navRef = useRef(null);
  const maisRef = useRef(null);
  const isAdmin = usuario?.role === "admin";

  const close = () => {
    setMenuOpen(false);
    setMaisOpen(false);
  };

  useEffect(() => {
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
      if (maisRef.current && !maisRef.current.contains(e.target)) {
        setMaisOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = () => {
      if (window.innerWidth > 950) setMenuOpen(false);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  return (
    <header
      ref={navRef}
      className="fixed top-3 left-1/2 z-40 flex w-[min(1040px,calc(100vw-1.5rem))] -translate-x-1/2 items-center justify-between gap-3 rounded-[1.35rem] border border-line-soft bg-[color-mix(in_srgb,var(--color-surface)_78%,transparent)] px-4 py-[0.65rem] shadow-card backdrop-blur-2xl max-nav:top-2 max-nav:grid max-nav:grid-cols-[minmax(0,1fr)_auto] max-nav:row-gap-[0.6rem]"
    >
      <NavLink
        to="/"
        className="shrink-0 cursor-pointer opacity-80 transition-opacity hover:opacity-100"
        onClick={close}
      >
        <img
          src={BRAND_LOGO_URL}
          alt="Tiago Fuguete"
          className="h-7 object-contain"
          style={{ viewTransitionName: "brand-logo" }}
          onError={(e) => {
            e.currentTarget.style.display = "none";
            e.currentTarget.nextElementSibling.style.display = "inline";
          }}
        />
        <span
          className="hidden font-['Bebas_Neue',sans-serif] text-[1.3rem] tracking-[0.12em] text-brand"
          style={{ viewTransitionName: "brand-logo" }}
        >
          MTG Champion
        </span>
      </NavLink>

      <nav className="flex items-center gap-5 max-nav:hidden" aria-label="Navegação principal">
        <NavLink to="/torneios" className={desktopLinkClass} onClick={close}>
          Torneios
        </NavLink>
        <NavLink to="/decks" className={desktopLinkClass} onClick={close}>
          Decks
        </NavLink>
        <NavLink to="/metagame" className={desktopLinkClass} onClick={close}>
          Metagame
        </NavLink>

        <div className="relative" ref={maisRef}>
          <button
            type="button"
            className={`inline-flex items-center gap-1 border-none bg-transparent p-0 text-[0.9rem] font-semibold cursor-pointer transition-colors duration-200 ${maisOpen ? "text-white" : "text-text-muted hover:text-text-main"}`}
            aria-expanded={maisOpen}
            aria-haspopup="menu"
            onClick={() => setMaisOpen((open) => !open)}
          >
            Mais
            <Chevron />
          </button>
          {maisOpen && (
            <div role="menu" className={dropdownPanelClass}>
              <p className={sectionLabelClass}>Competição</p>
              <NavLink role="menuitem" to="/ligas" className={dropdownItemClass} onClick={close}>
                Ligas
              </NavLink>
              <NavLink role="menuitem" to="/times" className={dropdownItemClass} onClick={close}>
                Times
              </NavLink>
              <p className={sectionLabelClass}>Ferramentas</p>
              <NavLink role="menuitem" to="/ferramentas/contador-vida" className={dropdownItemClass} onClick={close}>
                Contador de vida
              </NavLink>
              <NavLink role="menuitem" to="/ferramentas/calculadora-swiss" className={dropdownItemClass} onClick={close}>
                Calculadora Swiss / Top 8
              </NavLink>
            </div>
          )}
        </div>
      </nav>

      <NavUserMenu
        usuario={usuario}
        onOpenAuth={onOpenAuth}
        onLogout={onLogout}
        onOpenEditProfile={onOpenEditProfile}
        loggingOut={loggingOut}
        onNavigate={close}
      />

      <button
        className="ml-auto hidden h-[2.35rem] w-[2.35rem] cursor-pointer items-center justify-center rounded-xl border border-line bg-[rgba(167,79,255,0.22)] transition-all duration-[180ms] hover:border-[rgba(199,149,255,0.55)] hover:bg-[rgba(167,79,255,0.32)] active:bg-[rgba(167,79,255,0.4)] max-nav:relative max-nav:inline-flex"
        type="button"
        aria-expanded={menuOpen}
        aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
        onClick={() => setMenuOpen((p) => !p)}
      >
        <span
          className="absolute h-[2px] w-[1.1rem] rounded-full bg-[#f5edff] transition-all duration-[220ms]"
          style={{ transform: menuOpen ? "rotate(45deg)" : "translateY(-5px)" }}
        />
        <span
          className="absolute h-[2px] w-[1.1rem] rounded-full bg-[#f5edff] transition-opacity duration-[180ms]"
          style={{ opacity: menuOpen ? 0 : 1 }}
        />
        <span
          className="absolute h-[2px] w-[1.1rem] rounded-full bg-[#f5edff] transition-all duration-[220ms]"
          style={{ transform: menuOpen ? "rotate(-45deg)" : "translateY(5px)" }}
        />
      </button>

      {menuOpen && (
        <div
          className="absolute top-[calc(100%+0.5rem)] right-0 left-0 z-50 flex max-h-[min(78dvh,calc(100dvh-4.75rem))] max-nav:col-span-full flex-col overflow-hidden animate-[mobile-panel-in_220ms_cubic-bezier(0.4,0,0.2,1)] rounded-2xl border border-line bg-[rgba(14,9,28,0.97)] shadow-[0_16px_40px_rgba(3,2,8,0.6)] backdrop-blur-2xl"
          role="dialog"
          aria-label="Menu de navegação"
        >
          <nav className="flex min-h-0 flex-1 flex-col gap-[0.1rem] overflow-y-auto overscroll-contain px-3 pt-3 pb-2 [-webkit-overflow-scrolling:touch]">
            <NavLink to="/torneios" className={mobileLinkClass} onClick={close}>
              <IconTrophy />
              <span>Torneios</span>
            </NavLink>
            <NavLink to="/decks" className={mobileLinkClass} onClick={close}>
              <IconDeck />
              <span>Decks</span>
            </NavLink>
            <NavLink to="/metagame" className={mobileLinkClass} onClick={close}>
              <IconMetagame />
              <span>Metagame</span>
            </NavLink>

            <p className="mb-0.5 mt-2 px-[0.75rem] text-[0.68rem] font-bold uppercase tracking-[0.1em] text-text-subtle">
              Mais
            </p>
            <NavLink to="/ligas" className={mobileLinkClass} onClick={close}>
              <IconLiga />
              <span>Ligas</span>
            </NavLink>
            <NavLink to="/times" className={mobileLinkClass} onClick={close}>
              <IconTime />
              <span>Times</span>
            </NavLink>
            <NavLink to="/ferramentas/contador-vida" className={mobileLinkClass} onClick={close}>
              <IconTools />
              <span>Contador de vida</span>
            </NavLink>
            <NavLink to="/ferramentas/calculadora-swiss" className={mobileLinkClass} onClick={close}>
              <IconTools />
              <span>Calculadora Swiss / Top 8</span>
            </NavLink>

            {isAuthenticated && isAdmin && (
              <div className="mt-2 flex flex-col gap-0.5 rounded-xl border border-line bg-white/[0.02] p-1.5">
                <p className="m-0 flex items-center gap-[0.65rem] px-[0.75rem] py-[0.35rem] text-[0.72rem] font-bold uppercase tracking-[0.08em] text-text-subtle">
                  <IconDashboard />
                  <span>Administração</span>
                </p>
                {ADMIN_LINKS.map((link) => (
                  <NavLink key={link.to} to={link.to} className={mobileLinkClass} onClick={close}>
                    <span className="pl-[1.4rem]">{link.label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </nav>

          <div className="shrink-0 border-t border-[rgba(217,180,255,0.2)] bg-[rgba(14,9,28,0.98)] px-3 py-3">
            <NavUserMenuMobile
              usuario={usuario}
              onOpenAuth={onOpenAuth}
              onLogout={onLogout}
              onOpenEditProfile={onOpenEditProfile}
              loggingOut={loggingOut}
              onNavigate={close}
            />
          </div>
        </div>
      )}
    </header>
  );
}
