import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export function Navbar({
  usuario,
  onOpenAuth,
  onLogout,
  isAuthenticated,
  onOpenEditProfile,
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const closeMenuOnDesktop = () => {
      if (window.innerWidth > 950) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", closeMenuOnDesktop);
    return () => window.removeEventListener("resize", closeMenuOnDesktop);
  }, []);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleOpenAuth = (tab) => {
    closeMobileMenu();
    onOpenAuth(tab);
  };

  const handleLogout = () => {
    closeMobileMenu();
    onLogout();
  };

  const handleOpenEditProfile = () => {
    closeMobileMenu();
    onOpenEditProfile();
  };

  return (
    <header className={`floating-navbar ${isMobileMenuOpen ? "menu-open" : ""}`}>
      <div className="brand">
        <span className="brand-highlight">TIAGO</span> FUGUETE
      </div>

      <button
        className={`hamburger-btn ${isMobileMenuOpen ? "is-open" : ""}`}
        type="button"
        aria-expanded={isMobileMenuOpen}
        aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
        onClick={() => setIsMobileMenuOpen((prev) => !prev)}
      >
        <span className="hamburger-line" />
        <span className="hamburger-line" />
        <span className="hamburger-line" />
      </button>

      <nav className={`navbar-links ${isMobileMenuOpen ? "open" : ""}`}>
        <Link to="/" onClick={closeMobileMenu}>
          Home
        </Link>
        <a href="#torneios" onClick={closeMobileMenu}>
          Torneios
        </a>
        {isAuthenticated ? (
          <Link to="/meus-decks" onClick={closeMobileMenu}>
            Meus Decks
          </Link>
        ) : (
          <button className="btn ghost" type="button" onClick={() => handleOpenAuth("login")}>
            Decks (login)
          </button>
        )}
      </nav>

      <div className={`auth-actions ${isMobileMenuOpen ? "open" : ""}`}>
        {usuario ? (
          <>
            <button
              className="user-chip"
              type="button"
              onClick={handleOpenEditProfile}
              title="Editar perfil"
            >
              {usuario.nome}
            </button>
            <button className="btn secondary logout-btn" type="button" onClick={handleLogout}>
              Sair
            </button>
          </>
        ) : (
          <>
            <button className="btn ghost" type="button" onClick={() => handleOpenAuth("register")}>
              Cadastro
            </button>
            <button className="btn primary" type="button" onClick={() => handleOpenAuth("login")}>
              Login
            </button>
          </>
        )}
      </div>
    </header>
  );
}
