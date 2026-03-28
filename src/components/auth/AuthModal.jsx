export function AuthModal({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  isLoading,
  message,
  loginForm,
  onLoginFormChange,
  registerForm,
  onRegisterFormChange,
  onLoginSubmit,
  onRegisterSubmit,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <section
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-tabs">
          <button
            type="button"
            className={activeTab === "login" ? "active" : ""}
            onClick={() => onTabChange("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={activeTab === "register" ? "active" : ""}
            onClick={() => onTabChange("register")}
          >
            Cadastro
          </button>
        </div>

        {activeTab === "login" ? (
          <form className="auth-form" onSubmit={onLoginSubmit}>
            <label>
              E-mail
              <input
                type="email"
                value={loginForm.email}
                onChange={(event) =>
                  onLoginFormChange((current) => ({ ...current, email: event.target.value }))
                }
                required
              />
            </label>
            <label>
              Senha
              <input
                type="password"
                value={loginForm.senha}
                onChange={(event) =>
                  onLoginFormChange((current) => ({ ...current, senha: event.target.value }))
                }
                required
              />
            </label>
            <button className="btn primary" disabled={isLoading} type="submit">
              {isLoading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={onRegisterSubmit}>
            <label>
              Nome
              <input
                value={registerForm.nome}
                onChange={(event) =>
                  onRegisterFormChange((current) => ({ ...current, nome: event.target.value }))
                }
                required
              />
            </label>
            <label>
              E-mail
              <input
                type="email"
                value={registerForm.email}
                onChange={(event) =>
                  onRegisterFormChange((current) => ({ ...current, email: event.target.value }))
                }
                required
              />
            </label>
            <label>
              Senha
              <input
                type="password"
                value={registerForm.senha}
                onChange={(event) =>
                  onRegisterFormChange((current) => ({ ...current, senha: event.target.value }))
                }
                required
              />
            </label>
            <button className="btn primary" disabled={isLoading} type="submit">
              {isLoading ? "Criando..." : "Criar conta"}
            </button>
          </form>
        )}
        {message ? <p className="feedback">{message}</p> : null}
      </section>
    </div>
  );
}
