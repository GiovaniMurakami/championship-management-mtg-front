import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { flushSync } from "react-dom";
import { BRAND_LOGO_URL } from "../../constants/site";
import { useAuth } from "../../hooks/useAuth";
import { ADMIN_LINKS, NavUserMenu, NavUserMenuMobile } from "./NavUserMenu";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Torneios", href: "/torneios" },
  { label: "Hall da Fama", href: "/hall-da-fama" },
  { label: "Decks", href: "/decks-fuguete" },
  { label: "Artigos", href: "/artigos" },
  { label: "Sobre mim", href: "/sobre-mim" },
  { label: "Parceiros", href: "/parceiros" },
];

const desktopLinkClass = ({ isActive }) =>
  `no-underline font-semibold text-[0.9rem] cursor-pointer bg-none border-none p-0 transition-colors duration-200 ${isActive
    ? "text-text-main"
    : "text-text-muted hover:text-text-main"
  }`;

const mobileLinkClass = ({ isActive }) =>
  `flex items-center gap-[0.65rem] px-[0.75rem] py-[0.5rem] rounded-lg no-underline font-semibold text-[0.9rem] transition-all duration-[180ms] ${isActive
    ? "bg-[rgba(167,79,255,0.18)] text-text-main"
    : "text-text-soft hover:bg-[rgba(167,79,255,0.1)] hover:text-text-main"
  }`;

/** Header institucional — mesmo chrome e menu de usuário do Navbar de torneios. */
export function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const {
    usuario,
    isAuthenticated,
    openAuth,
    clearAuth,
    openEditProfileModal,
    loggingOut,
  } = useAuth() || {};

  const close = () => setMenuOpen(false);

  const isLinkActive = (href) => (
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`)
  );

  const transitionTo = (href) => (e) => {
    e.preventDefault();
    close();
    if (!document.startViewTransition) {
      navigate(href);
      return;
    }
    document.startViewTransition(() => flushSync(() => navigate(href)));
  };

  useEffect(() => {
    const handler = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  const isAdmin = usuario?.role === "admin";

  return (
    <header
      ref={headerRef}
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
        />
      </NavLink>

      <nav className="flex items-center gap-5 max-nav:hidden" aria-label="Navegação principal">
        {NAV_LINKS.map((l) => (
          <a
            key={l.label}
            href={l.href}
            className={desktopLinkClass({ isActive: isLinkActive(l.href) })}
            onClick={transitionTo(l.href)}
          >
            {l.label}
          </a>
        ))}
      </nav>

      <NavUserMenu
        usuario={isAuthenticated ? usuario : null}
        onOpenAuth={openAuth}
        onLogout={clearAuth}
        onOpenEditProfile={openEditProfileModal}
        loggingOut={loggingOut}
        onNavigate={close}
        desktopClassName="flex items-center gap-[0.6rem] max-nav:hidden"
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

      {menuOpen ? (
        <div
          className="absolute top-[calc(100%+0.5rem)] right-0 left-0 z-50 flex max-h-[min(78dvh,calc(100dvh-4.75rem))] max-nav:col-span-full flex-col overflow-hidden animate-[mobile-panel-in_220ms_cubic-bezier(0.4,0,0.2,1)] rounded-2xl border border-line bg-[rgba(14,9,28,0.97)] shadow-[0_16px_40px_rgba(3,2,8,0.6)] backdrop-blur-2xl"
          role="dialog"
          aria-label="Menu de navegação"
        >
          <nav className="flex min-h-0 flex-1 flex-col gap-[0.1rem] overflow-y-auto overscroll-contain px-3 pt-3 pb-2 [-webkit-overflow-scrolling:touch]">
            {NAV_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className={mobileLinkClass({ isActive: isLinkActive(l.href) })}
                onClick={transitionTo(l.href)}
              >
                {l.label}
              </a>
            ))}
            {isAuthenticated && isAdmin ? (
              <div className="mt-2 flex flex-col gap-0.5 rounded-xl border border-line bg-white/[0.02] p-1.5">
                <p className="m-0 px-[0.75rem] py-[0.35rem] text-[0.72rem] font-bold uppercase tracking-[0.08em] text-text-subtle">
                  Administração
                </p>
                {ADMIN_LINKS.map((link) => (
                  <NavLink key={link.to} to={link.to} className={mobileLinkClass} onClick={close}>
                    <span className="pl-[0.5rem]">{link.label}</span>
                  </NavLink>
                ))}
              </div>
            ) : null}
          </nav>

          <div className="shrink-0 border-t border-[rgba(217,180,255,0.2)] bg-[rgba(14,9,28,0.98)] px-3 py-3">
            <NavUserMenuMobile
              usuario={isAuthenticated ? usuario : null}
              onOpenAuth={openAuth}
              onLogout={clearAuth}
              onOpenEditProfile={openEditProfileModal}
              loggingOut={loggingOut}
              onNavigate={close}
            />
          </div>
        </div>
      ) : null}
    </header>
  );
}
