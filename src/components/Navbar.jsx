import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";

function NavAvatar({ nome }) {
  const initial = (nome?.[0] ?? "?").toUpperCase();
  return (
    <span className="nav-avatar" aria-hidden="true">
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

function navLinkClass({ isActive }) {
  return `nav-link${isActive ? " nav-link--active" : ""}`;
}

export function Navbar({
  usuario,
  onOpenAuth,
  onLogout,
  isAuthenticated,
  onOpenEditProfile,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on desktop resize
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth > 950) setMenuOpen(false);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const close = () => setMenuOpen(false);

  return (
    <header ref={navRef} className={`floating-navbar${menuOpen ? " menu-open" : ""}`}>
      {/* Brand */}
      <div className="brand">
        <span className="brand-highlight">TIAGO</span> FUGUETE
      </div>

      {/* Desktop nav */}
      <nav className="navbar-links" aria-label="Navegação principal">
        <NavLink to="/" end className={navLinkClass} onClick={close}>
          Home
        </NavLink>

        {isAuthenticated ? (
          <NavLink to="/torneios" className={navLinkClass} onClick={close}>
            Torneios
          </NavLink>
        ) : (
          <a href="#torneios" className="nav-link" onClick={close}>
            Torneios
          </a>
        )}

        {isAuthenticated ? (
          <NavLink to="/meus-decks" className={navLinkClass} onClick={close}>
            Decks
          </NavLink>
        ) : (
          <button
            className="nav-link nav-link--btn"
            type="button"
            onClick={() => { onOpenAuth("login"); close(); }}
          >
            Decks
          </button>
        )}
      </nav>

      {/* Desktop auth */}
      <div className="auth-actions">
        {usuario ? (
          <>
            <button
              className="user-chip"
              type="button"
              onClick={() => { onOpenEditProfile(); close(); }}
              title="Editar perfil"
            >
              <NavAvatar nome={usuario.nome} />
              <span className="user-chip-name">{usuario.nome}</span>
            </button>
            <button
              className="btn-nav-logout"
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
              className="btn ghost"
              type="button"
              onClick={() => { onOpenAuth("register"); close(); }}
            >
              Cadastro
            </button>
            <button
              className="btn primary"
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
        className={`hamburger-btn${menuOpen ? " is-open" : ""}`}
        type="button"
        aria-expanded={menuOpen}
        aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
        onClick={() => setMenuOpen((p) => !p)}
      >
        <span className="hamburger-line" />
        <span className="hamburger-line" />
        <span className="hamburger-line" />
      </button>

      {/* Mobile panel */}
      {menuOpen && (
        <div className="navbar-mobile-panel" role="dialog" aria-label="Menu de navegação">
          <nav className="navbar-mobile-links">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `navbar-mobile-link${isActive ? " is-active" : ""}`}
              onClick={close}
            >
              <IconHome />
              <span>Home</span>
            </NavLink>

            {isAuthenticated ? (
              <NavLink
                to="/torneios"
                className={({ isActive }) => `navbar-mobile-link${isActive ? " is-active" : ""}`}
                onClick={close}
              >
                <IconTrophy />
                <span>Torneios</span>
              </NavLink>
            ) : (
              <a href="#torneios" className="navbar-mobile-link" onClick={close}>
                <IconTrophy />
                <span>Torneios</span>
              </a>
            )}

            {isAuthenticated ? (
              <NavLink
                to="/meus-decks"
                className={({ isActive }) => `navbar-mobile-link${isActive ? " is-active" : ""}`}
                onClick={close}
              >
                <IconDeck />
                <span>Meus Decks</span>
              </NavLink>
            ) : (
              <button
                className="navbar-mobile-link"
                type="button"
                onClick={() => { onOpenAuth("login"); close(); }}
              >
                <IconDeck />
                <span>Decks</span>
              </button>
            )}
          </nav>

          <div className="navbar-mobile-divider" />

          <div className="navbar-mobile-auth">
            {usuario ? (
              <>
                <button
                  className="navbar-mobile-user-btn"
                  type="button"
                  onClick={() => { onOpenEditProfile(); close(); }}
                >
                  <NavAvatar nome={usuario.nome} />
                  <div className="navbar-mobile-user-info">
                    <span className="navbar-mobile-user-name">{usuario.nome}</span>
                    <span className="navbar-mobile-user-hint">Editar perfil</span>
                  </div>
                  <IconEdit />
                </button>
                <button
                  className="btn secondary"
                  type="button"
                  onClick={() => { onLogout(); close(); }}
                >
                  <IconLogout />
                  Sair
                </button>
              </>
            ) : (
              <div className="navbar-mobile-auth-btns">
                <button
                  className="btn ghost"
                  type="button"
                  onClick={() => { onOpenAuth("register"); close(); }}
                >
                  Cadastro
                </button>
                <button
                  className="btn primary"
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
