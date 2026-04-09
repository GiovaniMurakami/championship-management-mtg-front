import { useNavigate } from "react-router-dom";
import { BaseModal } from "../ui/BaseModal";
import { MODAL_INPUT_CLASS } from "../../styles/uiClasses";

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
  loginLockout,
  onForgotPassword,
}) {
  const navigate = useNavigate();

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
        {/* Tabs */}
        <div className="grid grid-cols-2 border border-[rgba(217,180,255,0.2)] rounded-[0.7rem] overflow-hidden mb-4">
          <button
            type="button"
            className={`border-none py-[0.7rem] cursor-pointer transition-all duration-200 ${activeTab === "login"
              ? "bg-[rgba(167,79,255,0.2)] text-white"
              : "bg-transparent text-[#beafd7] hover:bg-[rgba(167,79,255,0.08)] hover:text-white/70"
              }`}
            onClick={() => onTabChange("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={`border-none py-[0.7rem] cursor-pointer transition-all duration-200 ${activeTab === "register"
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
                className={MODAL_INPUT_CLASS}
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
                className={MODAL_INPUT_CLASS}
              />
            </label>
            <button className={btnPrimary} disabled={isLoading || loginLockout} type="submit">
              {loginLockout ? "Conta bloqueada temporariamente" : isLoading ? "Entrando..." : "Entrar"}
            </button>
            <button
              type="button"
              className="text-[#beafd7] text-[0.85rem] text-center underline underline-offset-2 cursor-pointer bg-transparent border-none p-0 hover:text-[#c795ff] transition-colors duration-200"
              onClick={() => { onClose(); if (onForgotPassword) onForgotPassword(); else navigate("/esqueci-senha"); }}
            >
              Esqueci minha senha
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
                className={MODAL_INPUT_CLASS}
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
                className={MODAL_INPUT_CLASS}
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
                className={MODAL_INPUT_CLASS}
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
    </BaseModal>
  );
}
