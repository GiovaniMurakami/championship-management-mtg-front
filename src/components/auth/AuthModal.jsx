import { useNavigate } from "react-router-dom";
import { BaseModal } from "../ui/BaseModal";
import { AuthFeedback } from "./AuthFeedback";
import { AuthFormField } from "./AuthFormField";
import { TermsAcceptanceField } from "./TermsAcceptanceField";
import { AUTH_TABS_CLASS, BTN_PRIMARY, BTN_GHOST, authTabClass } from "../../styles/uiClasses";

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
}) {
  const navigate = useNavigate();
  const isLogin = activeTab === "login";

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <div className="mb-5 text-center">
        <p className="mb-1 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[#c795ff]">
          Tiago Fuguete · Torneios MTG
        </p>
        <h2 className="font-['Bebas_Neue',sans-serif] text-[1.85rem] tracking-[0.04em] text-[#f5edff]">
          {isLogin ? "Entrar na plataforma" : "Criar conta"}
        </h2>
        <p className="mt-1 text-[0.88rem] text-[#9f91bd]">
          {isLogin
            ? "Use seu e-mail e senha para acessar decks e torneios."
            : "Preencha os dados abaixo para participar dos eventos."}
        </p>
      </div>

      <div role="tablist" aria-label="Autenticação" className={`${AUTH_TABS_CLASS} mb-5`}>
        <button
          type="button"
          role="tab"
          id="auth-tab-login"
          aria-selected={isLogin}
          aria-controls="auth-panel-login"
          className={authTabClass(isLogin)}
          onClick={() => onTabChange("login")}
        >
          Login
        </button>
        <button
          type="button"
          role="tab"
          id="auth-tab-register"
          aria-selected={!isLogin}
          aria-controls="auth-panel-register"
          className={authTabClass(!isLogin)}
          onClick={() => onTabChange("register")}
        >
          Cadastro
        </button>
      </div>

      {isLogin ? (
        <form id="auth-panel-login" role="tabpanel" aria-labelledby="auth-tab-login" className="grid gap-4" onSubmit={onLoginSubmit}>
          <AuthFormField
            id="auth-login-email"
            label="E-mail"
            type="email"
            autoComplete="email"
            value={loginForm.email}
            onChange={(event) =>
              onLoginFormChange((current) => ({ ...current, email: event.target.value }))
            }
            required
          />
          <AuthFormField
            id="auth-login-senha"
            label="Senha"
            type="password"
            autoComplete="current-password"
            value={loginForm.senha}
            onChange={(event) =>
              onLoginFormChange((current) => ({ ...current, senha: event.target.value }))
            }
            required
          />
          {message ? <AuthFeedback message={message} /> : null}
          <button className={`w-full ${BTN_PRIMARY}`} disabled={isLoading || loginLockout} type="submit">
            {loginLockout ? "Conta bloqueada temporariamente" : isLoading ? "Entrando..." : "Entrar"}
          </button>
          <button
            type="button"
            className={`w-full ${BTN_GHOST} text-[0.85rem] underline underline-offset-2`}
            onClick={() => {
              navigate("/esqueci-senha");
              onClose();
            }}
          >
            Esqueci minha senha
          </button>
        </form>
      ) : (
        <form id="auth-panel-register" role="tabpanel" aria-labelledby="auth-tab-register" className="grid gap-4" onSubmit={onRegisterSubmit}>
          <AuthFormField
            id="auth-register-nome"
            label="Nome"
            autoComplete="name"
            value={registerForm.nome}
            onChange={(event) =>
              onRegisterFormChange((current) => ({ ...current, nome: event.target.value }))
            }
            required
          />
          <AuthFormField
            id="auth-register-email"
            label="E-mail"
            type="email"
            autoComplete="email"
            value={registerForm.email}
            onChange={(event) =>
              onRegisterFormChange((current) => ({ ...current, email: event.target.value }))
            }
            required
          />
          <AuthFormField
            id="auth-register-senha"
            label="Senha"
            type="password"
            autoComplete="new-password"
            minLength={8}
            hint="Mínimo de 8 caracteres."
            value={registerForm.senha}
            onChange={(event) =>
              onRegisterFormChange((current) => ({ ...current, senha: event.target.value }))
            }
            required
          />
          <TermsAcceptanceField
            checked={Boolean(registerForm.aceiteTermos)}
            onChange={(aceiteTermos) =>
              onRegisterFormChange((current) => ({ ...current, aceiteTermos }))
            }
          />
          {message ? <AuthFeedback message={message} /> : null}
          <button
            className={`w-full ${BTN_PRIMARY}`}
            disabled={isLoading || !registerForm.aceiteTermos}
            type="submit"
          >
            {isLoading ? "Criando conta..." : "Criar conta"}
          </button>
          {!registerForm.aceiteTermos ? (
            <p className="m-0 text-center text-[0.78rem] text-[#8f82ad]">
              Marque o aceite dos termos para habilitar o cadastro.
            </p>
          ) : null}
        </form>
      )}
    </BaseModal>
  );
}
