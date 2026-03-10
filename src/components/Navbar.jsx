import { Link } from "react-router-dom";

export function Navbar({ usuario, onOpenAuth, onLogout, isAuthenticated }) {
  return (
    <header className="floating-navbar">
      <div className="brand">
        <span className="brand-highlight">MTG</span> Championship
      </div>

      <nav>
        <Link to="/">Home</Link>
        <a href="#torneios">Torneios</a>
        {isAuthenticated ? (
          <Link to="/decks">Cadastrar Deck</Link>
        ) : (
          <button className="btn ghost" type="button" onClick={() => onOpenAuth("login")}>
            Decks (login)
          </button>
        )}
      </nav>

      <div className="auth-actions">
        {usuario ? (
          <>
            <span className="user-chip">{usuario.nome}</span>
            <button className="btn secondary" type="button" onClick={onLogout}>
              Sair
            </button>
          </>
        ) : (
          <>
            <button className="btn ghost" type="button" onClick={() => onOpenAuth("register")}>
              Cadastro
            </button>
            <button className="btn primary" type="button" onClick={() => onOpenAuth("login")}>
              Login
            </button>
          </>
        )}
      </div>
    </header>
  );
}
