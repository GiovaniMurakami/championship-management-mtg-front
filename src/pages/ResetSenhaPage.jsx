import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { confirmarResetSenha } from "../services/backendApi";
import { usePageTitle } from "../hooks/usePageTitle";
import { PAGE_TITLES } from "../constants/pageTitles";
import { FormFeedback, FormField, FormPageCard } from "../components/ui";
import { BTN_PRIMARY, FORM_PAGE_SUBTITLE_CLASS, FORM_PAGE_TITLE_CLASS } from "../styles/uiClasses";

const TOKEN_ERROR_HINTS = /token|link|expirad|inválid|invalid/i;

export function ResetSenhaPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  usePageTitle(PAGE_TITLES.resetSenha);

  const [form, setForm] = useState({ novaSenha: "", confirmarSenha: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [tokenInvalido, setTokenInvalido] = useState(false);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/esqueci-senha", { replace: true });
    }
  }, [token, navigate]);

  const validateForm = () => {
    if (form.novaSenha.length < 8) {
      setValidationError("A senha deve ter no mínimo 8 caracteres.");
      return false;
    }
    if (form.novaSenha !== form.confirmarSenha) {
      setValidationError("As senhas não coincidem.");
      return false;
    }
    setValidationError("");
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setMessage("");
    setIsError(false);
    setTokenInvalido(false);

    try {
      await confirmarResetSenha(token, form.novaSenha);
      navigate("/?resetSenha=sucesso", { replace: true });
    } catch (error) {
      if (error?.validationErrors?.length) {
        setValidationError(error.validationErrors.join(" "));
        setIsError(true);
        return;
      }

      const status = error?.status ?? error?.response?.status;
      const errorMessage = error.message || "";
      if (status === 400 && TOKEN_ERROR_HINTS.test(errorMessage)) {
        setTokenInvalido(true);
        setMessage("Este link de redefinição é inválido ou já expirou. Solicite um novo link.");
      } else if (status === 400) {
        setValidationError(errorMessage || "Dados inválidos. Verifique a senha informada.");
        setIsError(true);
      } else {
        setMessage(errorMessage || "Não foi possível redefinir a senha. Tente novamente.");
        setIsError(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) return null;

  return (
    <FormPageCard>
      <p className="mb-1 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[#c795ff]">
        Tiago Fuguete · Torneios MTG
      </p>
      <h1 className={FORM_PAGE_TITLE_CLASS}>Redefinir senha</h1>
      <p className={`${FORM_PAGE_SUBTITLE_CLASS} !mb-5 !text-left`}>
        Escolha uma nova senha para a sua conta.
      </p>

      {!tokenInvalido ? (
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <FormField
            id="reset-nova-senha"
            label="Nova senha"
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            minLength={8}
            hint="Mínimo de 8 caracteres."
            value={form.novaSenha}
            onChange={(event) => setForm((current) => ({ ...current, novaSenha: event.target.value }))}
            required
          />
          <FormField
            id="reset-confirmar-senha"
            label="Confirmar nova senha"
            type="password"
            autoComplete="new-password"
            placeholder="Repita a nova senha"
            value={form.confirmarSenha}
            onChange={(event) => setForm((current) => ({ ...current, confirmarSenha: event.target.value }))}
            required
          />
          {validationError ? <FormFeedback message={validationError} variant="error" /> : null}
          <button className={`w-full ${BTN_PRIMARY}`} type="submit" disabled={isLoading}>
            {isLoading ? "Salvando..." : "Redefinir senha"}
          </button>
        </form>
      ) : null}

      {message ? (
        <FormFeedback message={message} variant={isError ? "error" : "success"} className="mt-4" />
      ) : null}

      {tokenInvalido ? (
        <button type="button" className={`mt-4 w-full ${BTN_PRIMARY}`} onClick={() => navigate("/esqueci-senha")}>
          Solicitar novo link
        </button>
      ) : null}
    </FormPageCard>
  );
}
