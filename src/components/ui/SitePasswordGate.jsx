import { useId, useMemo, useState } from "react";
import { BaseModal } from "./BaseModal";
import { FormFeedback } from "./FormFeedback";
import { FormField } from "./FormField";
import { BTN_PRIMARY } from "../../styles/uiClasses";

const ACCESS_STORAGE_KEY = "site-password-gate:granted";
const DEFAULT_SITE_PASSWORD = "campeonato-privado";

export function SitePasswordGate({ children }) {
  const configuredPassword = useMemo(
    () => (import.meta.env.VITE_SITE_PASSWORD || DEFAULT_SITE_PASSWORD).trim(),
    [],
  );
  const inputId = useId();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(ACCESS_STORAGE_KEY) === configuredPassword;
  });

  const handleSubmit = (event) => {
    event.preventDefault();

    if (password === configuredPassword) {
      window.localStorage.setItem(ACCESS_STORAGE_KEY, configuredPassword);
      setIsUnlocked(true);
      setPassword("");
      setError("");
      return;
    }

    setError("Senha incorreta. Tente novamente.");
  };

  if (isUnlocked) {
    return children;
  }

  return (
    <BaseModal isOpen onClose={() => {}}>
      <div className="space-y-4">
        <div className="space-y-2">
          <span className="inline-flex items-center rounded-full border border-[rgba(44,207,180,0.35)] bg-[rgba(44,207,180,0.12)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-teal">
            Acesso privado
          </span>
          <h2 className="m-0 font-display text-4xl leading-none text-text-main">Area protegida</h2>
          <p className="m-0 text-sm text-text-soft">
            Este projeto ainda não está público. Digite a senha para continuar.
          </p>
        </div>

        <form className="grid gap-3" onSubmit={handleSubmit}>
          <FormField
            id={inputId}
            label="Senha"
            type="password"
            placeholder="Digite a senha"
            autoComplete="current-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              if (error) setError("");
            }}
          />

          {error ? <FormFeedback message={error} variant="error" /> : null}

          <button type="submit" className={`w-full ${BTN_PRIMARY}`}>
            Entrar no projeto
          </button>
        </form>
      </div>
    </BaseModal>
  );
}
