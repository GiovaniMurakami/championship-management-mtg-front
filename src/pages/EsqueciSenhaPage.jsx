import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { solicitarResetSenha } from "../services/backendApi";
import { usePageTitle } from "../hooks/usePageTitle";
import { PAGE_TITLES } from "../constants/pageTitles";
import { BackButton, FormFeedback, FormField, FormPageCard } from "../components/ui";
import { BTN_GHOST, BTN_PRIMARY, FORM_PAGE_SUBTITLE_CLASS, FORM_PAGE_TITLE_CLASS } from "../styles/uiClasses";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EsqueciSenhaPage() {
  const navigate = useNavigate();

  usePageTitle(PAGE_TITLES.esqueciSenha);

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [validationError, setValidationError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setValidationError("");

    if (!EMAIL_PATTERN.test(email.trim())) {
      setValidationError("Informe um e-mail válido.");
      return;
    }

    setIsLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await solicitarResetSenha(email);
      setMessage(
        response?.mensagem ||
          "Se esse e-mail estiver cadastrado, você receberá um link para redefinir sua senha em breve.",
      );
      setSubmitted(true);
    } catch (error) {
      if (error?.validationErrors?.length) {
        setValidationError(error.validationErrors.join(" "));
        setIsError(true);
      } else if (
        error?.status === 500 ||
        error?.message?.includes("500") ||
        error?.message?.toLowerCase().includes("servidor")
      ) {
        setMessage("Erro interno do servidor. Tente novamente em alguns instantes.");
      } else {
        setMessage(error.message || "Não foi possível processar a solicitação. Tente novamente.");
      }
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormPageCard>
      <BackButton className="mb-5 !px-0 !py-0 !border-none !bg-transparent hover:!bg-transparent" onClick={() => navigate(-1)} />

      <p className="mb-1 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[#c795ff]">
        Tiago Fuguete · Torneios MTG
      </p>
      <h1 className={FORM_PAGE_TITLE_CLASS}>Esqueci minha senha</h1>
      <p className={`${FORM_PAGE_SUBTITLE_CLASS} !mb-5 !text-left`}>
        Informe seu e-mail e enviaremos um link para redefinir sua senha.
      </p>

      {!submitted ? (
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <FormField
            id="esqueci-email"
            label="E-mail"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          {validationError ? <FormFeedback message={validationError} variant="error" /> : null}
          <button className={`w-full ${BTN_PRIMARY}`} type="submit" disabled={isLoading}>
            {isLoading ? "Enviando..." : "Enviar link de redefinição"}
          </button>
        </form>
      ) : null}

      {message ? <FormFeedback message={message} variant={isError ? "error" : "success"} className="mt-4" /> : null}

      {submitted && !isError ? (
        <button type="button" className={`mt-4 w-full ${BTN_GHOST}`} onClick={() => navigate("/")}>
          Voltar para o início
        </button>
      ) : null}
    </FormPageCard>
  );
}
