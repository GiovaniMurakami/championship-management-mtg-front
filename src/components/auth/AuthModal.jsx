const inputClass =
  "border border-[rgba(217,180,255,0.2)] rounded-[0.7rem] bg-white/[0.03] text-[#f5edff] px-[0.7rem] py-[0.65rem] w-full transition-[border-color,background-color,box-shadow] duration-200 hover:border-[rgba(199,149,255,0.5)] hover:bg-white/[0.045] focus:outline-none focus:border-[rgba(199,149,255,0.92)] focus:shadow-[0_0_0_3px_rgba(167,79,255,0.22)] focus:bg-white/[0.05]";

const btnPrimary =
  "border border-[rgba(199,149,255,0.6)] rounded-xl px-4 py-[0.6rem] cursor-pointer font-bold bg-gradient-to-br from-[#8e39ed] to-[#5f23b3] text-white shadow-[0_4px_12px_rgba(167,79,255,0.25)] transition-all duration-[220ms] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(167,79,255,0.4),0_0_12px_rgba(199,149,255,0.3)] hover:border-[rgba(199,149,255,0.9)] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed";

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
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-[rgba(5,3,9,0.72)] backdrop-blur-sm animate-[fade-in_250ms_ease-out]"
      role="presentation"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <section
        className="w-[min(460px,calc(100vw-1.4rem))] border border-[rgba(217,180,255,0.2)] rounded-2xl bg-[#160e2d] p-4 animate-[scale-focus_350ms_cubic-bezier(0.34,1.56,0.64,1)] relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-[linear-gradient(90deg,transparent,#2ccfb4,#a855f7,#c795ff,transparent)]"
        role="dialog"
        aria-modal="true"
      >
        {/* Tabs */}
        <div className="grid grid-cols-2 border border-[rgba(217,180,255,0.2)] rounded-[0.7rem] overflow-hidden mb-4">
          <button
            type="button"
            className={`border-none py-[0.7rem] cursor-pointer transition-all duration-200 ${
              activeTab === "login"
                ? "bg-[rgba(167,79,255,0.2)] text-white"
                : "bg-transparent text-[#beafd7] hover:bg-[rgba(167,79,255,0.08)] hover:text-white/70"
            }`}
            onClick={() => onTabChange("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={`border-none py-[0.7rem] cursor-pointer transition-all duration-200 ${
              activeTab === "register"
                ? "bg-[rgba(167,79,255,0.2)] text-white"
                : "bg-transparent text-[#beafd7] hover:bg-[rgba(167,79,255,0.08)] hover:text-white/70"
            }`}
            onClick={() => onTabChange("register")}
          >
            Cadastro
          </button>
        </div>

        {activeTab === "login" ? (
          <form className="grid gap-[0.85rem]" onSubmit={onLoginSubmit}>
            <label className="grid gap-[0.45rem] text-[#beafd7] text-[0.95rem]">
              E-mail
              <input
                type="email"
                value={loginForm.email}
                onChange={(event) =>
                  onLoginFormChange((current) => ({ ...current, email: event.target.value }))
                }
                required
                className={inputClass}
              />
            </label>
            <label className="grid gap-[0.45rem] text-[#beafd7] text-[0.95rem]">
              Senha
              <input
                type="password"
                value={loginForm.senha}
                onChange={(event) =>
                  onLoginFormChange((current) => ({ ...current, senha: event.target.value }))
                }
                required
                className={inputClass}
              />
            </label>
            <button className={btnPrimary} disabled={isLoading} type="submit">
              {isLoading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        ) : (
          <form className="grid gap-[0.85rem]" onSubmit={onRegisterSubmit}>
            <label className="grid gap-[0.45rem] text-[#beafd7] text-[0.95rem]">
              Nome
              <input
                value={registerForm.nome}
                onChange={(event) =>
                  onRegisterFormChange((current) => ({ ...current, nome: event.target.value }))
                }
                required
                className={inputClass}
              />
            </label>
            <label className="grid gap-[0.45rem] text-[#beafd7] text-[0.95rem]">
              E-mail
              <input
                type="email"
                value={registerForm.email}
                onChange={(event) =>
                  onRegisterFormChange((current) => ({ ...current, email: event.target.value }))
                }
                required
                className={inputClass}
              />
            </label>
            <label className="grid gap-[0.45rem] text-[#beafd7] text-[0.95rem]">
              Senha
              <input
                type="password"
                value={registerForm.senha}
                onChange={(event) =>
                  onRegisterFormChange((current) => ({ ...current, senha: event.target.value }))
                }
                required
                className={inputClass}
              />
            </label>
            <button className={btnPrimary} disabled={isLoading} type="submit">
              {isLoading ? "Criando..." : "Criar conta"}
            </button>
          </form>
        )}

        {message && (
          <p className="mt-[0.7rem] mb-0 px-3 py-3 rounded-[0.6rem] bg-[rgba(44,207,180,0.1)] border border-[rgba(44,207,180,0.25)] text-[#5eead4] text-[0.9rem] animate-[slide-up_300ms_ease-out,fade-in_300ms_ease-out]">
            {message}
          </p>
        )}
      </section>
    </div>
  );
}
