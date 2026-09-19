import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { BRAND_LOGO_URL, MAIN_SITE_URL } from "../../constants/site";
import { Tooltip } from "./Tooltip";

function NavAvatar({ nome, fotoUrl }) {
  const initial = (nome?.[0] ?? "?").toUpperCase();
  return (
    <span
      className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[rgba(167,79,255,0.35)] border border-[rgba(199,149,255,0.4)] text-[0.78rem] font-bold text-text-main shrink-0 select-none"
      aria-hidden="true"
    >
      {fotoUrl ? <img src={fotoUrl} alt="" className="h-full w-full rounded-full object-cover" /> : initial}
    </span>
  );
}

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

const IconBlog = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const IconCommunity = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const IconEdit = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const IconLogout = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
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
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const navRef = useRef(null);
  const maisRef = useRef(null);
  const dashboardRef = useRef(null);
  const isAdmin = usuario?.role === "admin";

  const close = () => {
    setMenuOpen(false);
    setMaisOpen(false);
    setDashboardOpen(false);
  };

  useEffect(() => {
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
      if (maisRef.current && !maisRef.current.contains(e.target)) {
        setMaisOpen(false);
      }
      if (dashboardRef.current && !dashboardRef.current.contains(e.target)) {
        setDashboardOpen(false);
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
      <a
        href={MAIN_SITE_URL}
        target="_top"
        rel="noopener noreferrer"
        className="shrink-0 cursor-pointer opacity-80 transition-opacity hover:opacity-100"
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
      </a>

      <nav className="flex items-center gap-5 max-nav:hidden" aria-label="Navegação principal">
        <NavLink to="/" className={desktopLinkClass} onClick={close}>
          Torneios
        </NavLink>
        <NavLink to="/decks" className={desktopLinkClass} onClick={close}>
          Decks
        </NavLink>
        <NavLink to="/metagame" className={desktopLinkClass} onClick={close}>
          Metagame
        </NavLink>
        <NavLink to="/blog" className={desktopLinkClass} onClick={close}>
          Blog
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
              <p className={sectionLabelClass}>Comunidade</p>
              <NavLink role="menuitem" to="/comunidade" className={dropdownItemClass} onClick={close}>
                Posts
              </NavLink>
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

      <div className="flex items-center gap-[0.6rem] max-nav:hidden">
        {usuario ? (
          <div className="relative" ref={dashboardRef}>
            <Tooltip content="Menu do usuário" placement="bottom" focusable={false}>
              <button
                className="inline-flex items-center gap-2 border border-line rounded-xl bg-[rgba(167,79,255,0.18)] px-[0.7rem] py-[0.45rem] text-[0.85rem] text-text-main cursor-pointer"
                type="button"
                onClick={() => setDashboardOpen((open) => !open)}
                aria-label="Abrir menu do usuário"
                aria-expanded={dashboardOpen}
                aria-haspopup="menu"
              >
                <NavAvatar nome={usuario.nome} fotoUrl={usuario.fotoUrl} />
                <span className="max-w-[7.5rem] truncate text-[0.84rem] font-semibold text-text-main">{usuario.nome}</span>
                <Chevron />
              </button>
            </Tooltip>
            {dashboardOpen && (
              <div
                role="menu"
                className="absolute right-0 top-[calc(100%+0.7rem)] z-50 min-w-[230px] rounded-xl border border-[rgba(217,180,255,0.22)] bg-[rgba(18,12,32,0.97)] p-1.5 shadow-[0_12px_28px_rgba(3,2,8,0.55)]"
              >
                <NavLink role="menuitem" to={`/usuarios/${usuario.id}`} className={dropdownItemClass} onClick={close}>
                  Meu perfil
                </NavLink>
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2 rounded-lg border-none bg-transparent px-3 py-2.5 text-left text-[0.88rem] font-semibold text-text-soft hover:bg-[rgba(167,79,255,0.14)] hover:text-text-main"
                  onClick={() => { onOpenEditProfile(); close(); }}
                >
                  <IconEdit />
                  Editar perfil
                </button>
                {isAdmin && (
                  <>
                    <p className={`${sectionLabelClass} border-t border-line pt-2`}>Administração</p>
                    <NavLink role="menuitem" to="/dashboard" className={dropdownItemClass} onClick={close}>
                      Anúncios
                    </NavLink>
                    <NavLink role="menuitem" to="/dashboard/anuncio-diario" className={dropdownItemClass} onClick={close}>
                      Anúncio diário
                    </NavLink>
                    <NavLink role="menuitem" to="/dashboard/permissoes" className={dropdownItemClass} onClick={close}>
                      Permissões
                    </NavLink>
                    <NavLink role="menuitem" to="/dashboard/bloqueios" className={dropdownItemClass} onClick={close}>
                      Bloqueio de usuários
                    </NavLink>
                  </>
                )}
                <button
                  type="button"
                  role="menuitem"
                  disabled={loggingOut}
                  className="mt-1 flex w-full items-center gap-2 border-x-0 border-b-0 border-t border-line bg-transparent px-3 py-2.5 text-left text-[0.88rem] font-semibold text-text-soft hover:bg-danger/10 hover:text-red-300 disabled:cursor-wait disabled:opacity-60"
                  onClick={() => { onLogout(); close(); }}
                >
                  <IconLogout />
                  {loggingOut ? "Saindo..." : "Sair"}
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <button
              className="cursor-pointer rounded-xl border border-line bg-transparent px-4 py-[0.6rem] font-bold text-text-soft transition-all duration-200 hover:border-line-strong hover:bg-[rgba(167,79,255,0.08)] hover:text-text-main"
              type="button"
              onClick={() => { onOpenAuth("register"); close(); }}
            >
              Cadastro
            </button>
            <button
              className="cursor-pointer rounded-xl border border-[rgba(199,149,255,0.5)] bg-gradient-to-br from-[#8e39ed] to-[#5f23b3] px-4 py-[0.6rem] font-bold text-white transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_4px_20px_rgba(142,57,237,0.45)] active:translate-y-0"
              type="button"
              onClick={() => { onOpenAuth("login"); close(); }}
            >
              Entrar
            </button>
          </>
        )}
      </div>

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
            <NavLink to="/" className={mobileLinkClass} onClick={close}>
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
            <NavLink to="/blog" className={mobileLinkClass} onClick={close}>
              <IconBlog />
              <span>Blog</span>
            </NavLink>

            <p className="mb-0.5 mt-2 px-[0.75rem] text-[0.68rem] font-bold uppercase tracking-[0.1em] text-text-subtle">
              Mais
            </p>
            <NavLink to="/comunidade" className={mobileLinkClass} onClick={close}>
              <IconCommunity />
              <span>Posts</span>
            </NavLink>
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
                <NavLink to="/dashboard" className={mobileLinkClass} onClick={close}>
                  <span className="pl-[1.4rem]">Anúncios</span>
                </NavLink>
                <NavLink to="/dashboard/anuncio-diario" className={mobileLinkClass} onClick={close}>
                  <span className="pl-[1.4rem]">Anúncio diário</span>
                </NavLink>
                <NavLink to="/dashboard/permissoes" className={mobileLinkClass} onClick={close}>
                  <span className="pl-[1.4rem]">Permissões</span>
                </NavLink>
                <NavLink to="/dashboard/bloqueios" className={mobileLinkClass} onClick={close}>
                  <span className="pl-[1.4rem]">Bloqueio de usuários</span>
                </NavLink>
              </div>
            )}
          </nav>

          <div className="shrink-0 border-t border-[rgba(217,180,255,0.2)] bg-[rgba(14,9,28,0.98)] px-3 py-3">
            {usuario ? (
              <div className="flex flex-col gap-2">
                <button
                  className="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-line bg-[rgba(167,79,255,0.1)] px-[0.75rem] py-[0.55rem] text-left text-text-main transition-all duration-[180ms] hover:bg-[rgba(167,79,255,0.2)]"
                  type="button"
                  onClick={() => { onOpenEditProfile(); close(); }}
                >
                  <NavAvatar nome={usuario.nome} fotoUrl={usuario.fotoUrl} />
                  <div className="flex min-w-0 flex-1 flex-col gap-[0.1rem]">
                    <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[0.9rem] font-semibold text-text-main">{usuario.nome}</span>
                    <span className="text-[0.74rem] text-text-soft">Editar perfil</span>
                  </div>
                  <IconEdit />
                </button>
                <button
                  className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-line bg-[rgba(255,255,255,0.03)] px-4 py-[0.55rem] font-bold text-text-main disabled:cursor-wait disabled:opacity-60"
                  type="button"
                  disabled={loggingOut}
                  onClick={() => { onLogout(); close(); }}
                >
                  <IconLogout />
                  {loggingOut ? "Saindo..." : "Sair"}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  className="min-h-[44px] cursor-pointer rounded-xl border border-line bg-transparent px-4 py-[0.65rem] font-bold text-text-soft transition-all duration-200 hover:border-line-strong hover:bg-[rgba(167,79,255,0.08)] hover:text-text-main"
                  type="button"
                  onClick={() => { onOpenAuth("register"); close(); }}
                >
                  Cadastro
                </button>
                <button
                  className="min-h-[44px] cursor-pointer rounded-xl border border-[rgba(199,149,255,0.5)] bg-gradient-to-br from-[#8e39ed] to-[#5f23b3] px-4 py-[0.65rem] font-bold text-white transition-all duration-200 hover:shadow-[0_4px_16px_rgba(142,57,237,0.4)]"
                  type="button"
                  onClick={() => { onOpenAuth("login"); close(); }}
                >
                  Entrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
