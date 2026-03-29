import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";

function NavAvatar({ nome }) {
  const initial = (nome?.[0] ?? "?").toUpperCase();
  return (
    <span
      className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[rgba(167,79,255,0.35)] border border-[rgba(199,149,255,0.4)] text-[0.78rem] font-bold text-[#f5edff] shrink-0 select-none"
      aria-hidden="true"
    >
      {initial}
    </span>
  );
}

const IconHome = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

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

const IconDeck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
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

const mobileLinkClass = ({ isActive }) =>
  `flex items-center gap-[0.65rem] px-[0.75rem] py-[0.65rem] rounded-[0.65rem] no-underline font-semibold text-[0.92rem] transition-all duration-[180ms] ${
    isActive
      ? "bg-[rgba(167,79,255,0.18)] text-[#f5edff]"
      : "text-[#beafd7] hover:bg-[rgba(167,79,255,0.1)] hover:text-[#f5edff]"
  }`;

const desktopLinkClass = ({ isActive }) =>
  `no-underline font-semibold text-[0.9rem] cursor-pointer bg-none border-none p-0 transition-colors duration-200 ${
    isActive
      ? "text-white [text-shadow:0_0_18px_rgba(167,79,255,0.6)]"
      : "text-[#beafd7] hover:text-white"
  }`;

export function Navbar({
  usuario,
  onOpenAuth,
  onLogout,
  isAuthenticated,
  onOpenEditProfile,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setMenuOpen(false);
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

  const close = () => setMenuOpen(false);

  return (
    <header
      ref={navRef}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-40 flex w-[min(1100px,calc(100vw-2rem))] items-center justify-between gap-4 rounded-full border border-[rgba(217,180,255,0.2)] bg-[rgba(14,9,28,0.72)] backdrop-blur-2xl px-4 py-[0.7rem] shadow-[0_12px_30px_rgba(3,2,8,0.5)] max-nav:grid max-nav:grid-cols-[minmax(0,1fr)_auto] max-nav:rounded-2xl max-nav:top-[0.7rem] max-nav:row-gap-[0.6rem]"
    >
      {/* Brand */}
      <div className="font-['Bebas_Neue',sans-serif] text-[1.35rem] tracking-[0.05em] whitespace-nowrap">
        <span className="text-[#c795ff]">TIAGO</span> FUGUETE
      </div>

      {/* Desktop nav */}
      <nav
        className="flex items-center gap-4 max-nav:hidden"
        aria-label="Navegação principal"
      >
        <NavLink to="/" end className={desktopLinkClass} onClick={close}>
          Home
        </NavLink>

        {isAuthenticated ? (
          <NavLink to="/torneios" className={desktopLinkClass} onClick={close}>
            Torneios
          </NavLink>
        ) : (
          <a href="#torneios" className="text-[#beafd7] no-underline font-semibold text-[0.9rem] hover:text-white transition-colors duration-200" onClick={close}>
            Torneios
          </a>
        )}

        {isAuthenticated ? (
          <NavLink to="/meus-decks" className={desktopLinkClass} onClick={close}>
            Decks
          </NavLink>
        ) : (
          <button
            className="text-[#beafd7] font-semibold text-[0.9rem] bg-transparent border-none cursor-pointer p-0 hover:text-white transition-colors duration-200"
            type="button"
            onClick={() => { onOpenAuth("login"); close(); }}
          >
            Decks
          </button>
        )}
      </nav>

      {/* Desktop auth */}
      <div className="flex items-center gap-[0.6rem] max-nav:hidden">
        {usuario ? (
          <>
            <button
              className="inline-flex items-center gap-2 border border-[rgba(217,180,255,0.2)] rounded-xl bg-[rgba(167,79,255,0.18)] px-[0.8rem] py-[0.45rem] text-[0.85rem] text-[#f5edff] cursor-pointer"
              type="button"
              onClick={() => { onOpenEditProfile(); close(); }}
              title="Editar perfil"
            >
              <NavAvatar nome={usuario.nome} />
              <span className="text-[0.84rem] font-semibold text-[#f5edff]">{usuario.nome}</span>
            </button>
            <button
              className="inline-flex items-center gap-[0.35rem] px-[0.75rem] py-[0.45rem] border border-[rgba(217,180,255,0.2)] rounded-xl bg-[rgba(255,255,255,0.04)] text-[#beafd7] text-[0.84rem] font-semibold cursor-pointer transition-all duration-[180ms] hover:bg-[rgba(252,88,119,0.12)] hover:border-[rgba(252,88,119,0.35)] hover:text-[#ffa8b8]"
              type="button"
              onClick={() => { onLogout(); close(); }}
              title="Sair"
            >
              <IconLogout />
              <span>Sair</span>
            </button>
          </>
        ) : (
          <>
            <button
              className="border border-[rgba(217,180,255,0.2)] rounded-xl px-4 py-[0.6rem] cursor-pointer font-bold bg-transparent text-[#beafd7]"
              type="button"
              onClick={() => { onOpenAuth("register"); close(); }}
            >
              Cadastro
            </button>
            <button
              className="border border-[rgba(199,149,255,0.6)] rounded-xl px-4 py-[0.6rem] cursor-pointer font-bold bg-gradient-to-br from-[#8e39ed] to-[#5f23b3] text-white"
              type="button"
              onClick={() => { onOpenAuth("login"); close(); }}
            >
              Entrar
            </button>
          </>
        )}
      </div>

      {/* Hamburger */}
      <button
        className="hidden max-nav:inline-flex relative items-center justify-center w-[2.35rem] h-[2.35rem] border border-[rgba(217,180,255,0.2)] rounded-xl bg-[rgba(167,79,255,0.22)] cursor-pointer transition-all duration-[180ms] hover:bg-[rgba(167,79,255,0.32)] hover:border-[rgba(199,149,255,0.55)] active:bg-[rgba(167,79,255,0.4)] ml-auto"
        type="button"
        aria-expanded={menuOpen}
        aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
        onClick={() => setMenuOpen((p) => !p)}
      >
        <span
          className="absolute w-[1.1rem] h-[2px] rounded-full bg-[#f5edff] transition-all duration-[220ms]"
          style={{ transform: menuOpen ? "rotate(45deg)" : "translateY(-5px)" }}
        />
        <span
          className="absolute w-[1.1rem] h-[2px] rounded-full bg-[#f5edff] transition-opacity duration-[180ms]"
          style={{ opacity: menuOpen ? 0 : 1 }}
        />
        <span
          className="absolute w-[1.1rem] h-[2px] rounded-full bg-[#f5edff] transition-all duration-[220ms]"
          style={{ transform: menuOpen ? "rotate(-45deg)" : "translateY(5px)" }}
        />
      </button>

      {/* Mobile panel */}
      {menuOpen && (
        <div
          className="absolute top-[calc(100%+0.5rem)] left-0 right-0 z-50 border border-[rgba(217,180,255,0.2)] rounded-2xl bg-[rgba(14,9,28,0.97)] backdrop-blur-2xl p-4 shadow-[0_16px_40px_rgba(3,2,8,0.6)] animate-[mobile-panel-in_220ms_cubic-bezier(0.4,0,0.2,1)] max-nav:col-span-full"
          role="dialog"
          aria-label="Menu de navegação"
        >
          <nav className="flex flex-col gap-[0.2rem]">
            <NavLink to="/" end className={mobileLinkClass} onClick={close}>
              <IconHome />
              <span>Home</span>
            </NavLink>

            {isAuthenticated ? (
              <NavLink to="/torneios" className={mobileLinkClass} onClick={close}>
                <IconTrophy />
                <span>Torneios</span>
              </NavLink>
            ) : (
              <a
                href="#torneios"
                className="flex items-center gap-[0.65rem] px-[0.75rem] py-[0.65rem] rounded-[0.65rem] text-[#beafd7] no-underline font-semibold text-[0.92rem] hover:bg-[rgba(167,79,255,0.1)] hover:text-[#f5edff] transition-all duration-[180ms]"
                onClick={close}
              >
                <IconTrophy />
                <span>Torneios</span>
              </a>
            )}

            {isAuthenticated ? (
              <NavLink to="/meus-decks" className={mobileLinkClass} onClick={close}>
                <IconDeck />
                <span>Meus Decks</span>
              </NavLink>
            ) : (
              <button
                className="flex items-center gap-[0.65rem] px-[0.75rem] py-[0.65rem] rounded-[0.65rem] text-[#beafd7] font-semibold text-[0.92rem] border-none bg-transparent cursor-pointer w-full text-left hover:bg-[rgba(167,79,255,0.1)] hover:text-[#f5edff] transition-all duration-[180ms]"
                type="button"
                onClick={() => { onOpenAuth("login"); close(); }}
              >
                <IconDeck />
                <span>Decks</span>
              </button>
            )}
          </nav>

          <div className="h-px bg-[rgba(217,180,255,0.2)] my-3" />

          <div className="flex flex-col gap-2">
            {usuario ? (
              <>
                <button
                  className="flex items-center gap-3 px-[0.75rem] py-[0.6rem] rounded-[0.65rem] border border-[rgba(217,180,255,0.2)] bg-[rgba(167,79,255,0.1)] cursor-pointer w-full text-left text-[#f5edff] transition-all duration-[180ms] hover:bg-[rgba(167,79,255,0.2)]"
                  type="button"
                  onClick={() => { onOpenEditProfile(); close(); }}
                >
                  <NavAvatar nome={usuario.nome} />
                  <div className="flex-1 flex flex-col gap-[0.1rem] min-w-0">
                    <span className="text-[0.9rem] font-semibold text-[#f5edff] whitespace-nowrap overflow-hidden text-ellipsis">{usuario.nome}</span>
                    <span className="text-[0.74rem] text-[#beafd7]">Editar perfil</span>
                  </div>
                  <IconEdit />
                </button>
                <button
                  className="flex items-center justify-center gap-2 border border-[rgba(217,180,255,0.2)] rounded-xl px-4 py-[0.6rem] cursor-pointer font-bold bg-[rgba(255,255,255,0.03)] text-[#f5edff]"
                  type="button"
                  onClick={() => { onLogout(); close(); }}
                >
                  <IconLogout />
                  Sair
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  className="border border-[rgba(217,180,255,0.2)] rounded-xl px-4 py-[0.6rem] cursor-pointer font-bold bg-transparent text-[#beafd7]"
                  type="button"
                  onClick={() => { onOpenAuth("register"); close(); }}
                >
                  Cadastro
                </button>
                <button
                  className="border border-[rgba(199,149,255,0.6)] rounded-xl px-4 py-[0.6rem] cursor-pointer font-bold bg-gradient-to-br from-[#8e39ed] to-[#5f23b3] text-white"
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
