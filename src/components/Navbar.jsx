import { Link } from "react-router-dom";

export function Navbar({
  usuario,
  onOpenAuth,
  onLogout,
  isAuthenticated,
  onOpenEditProfile,
}) {
  return (
    <header className="floating-navbar">
      <div className="brand">
        <span className="brand-highlight">TIAGO</span> FUGUETE
      </div>

      <nav>
        <Link to="/">Home</Link>
        <a href="#torneios">Torneios</a>
        {isAuthenticated ? (
          <Link to="/meus-decks">Meus Decks</Link>
        ) : (
          <button className="btn ghost" type="button" onClick={() => onOpenAuth("login")}>
            Decks (login)
          </button>
        )}
      </nav>

      <div className="auth-actions">
        {usuario ? (
          <>
            <button
              className="user-chip"
              type="button"
              onClick={onOpenEditProfile}
              title="Editar perfil"
              style={{ 
                background: "none", 
                border: "none", 
                cursor: "pointer",
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                transition: "background-color 0.2s",
                color: "var(--text-color)",
                fontSize: "1rem",
                fontWeight: "500"
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)"}
              onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
            >
              {usuario.nome}
            </button>
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
