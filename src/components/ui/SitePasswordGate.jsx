import { useId, useMemo, useState } from "react";
import { BaseModal } from "./BaseModal";

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
          <h2 className="m-0 font-display text-4xl leading-none text-text-main">
            Area protegida
          </h2>
          <p className="m-0 text-sm text-text-soft">
            Este projeto ainda nao esta publico. Digite a senha para continuar.
          </p>
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2 text-sm text-text-soft" htmlFor={inputId}>
            Senha
            <input
              id={inputId}
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (error) setError("");
              }}
              placeholder="Digite a senha"
              autoComplete="current-password"
              autoFocus
            />
          </label>

          {error ? (
            <p className="m-0 rounded-xl border border-[rgba(248,113,113,0.3)] bg-[rgba(127,29,29,0.25)] px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            className="w-full cursor-pointer rounded-xl border border-[rgba(44,207,180,0.35)] bg-[linear-gradient(135deg,rgba(44,207,180,0.96),rgba(29,78,216,0.92))] px-4 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-[rgba(44,207,180,0.45)]"
          >
            Entrar no projeto
          </button>
        </form>
      </div>
    </BaseModal>
  );
}
