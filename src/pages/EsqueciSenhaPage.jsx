import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { solicitarResetSenha } from "../services/backendApi";
import { MODAL_INPUT_CLASS as inputClass } from "../styles/uiClasses";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const btnPrimary =
    "border border-[rgba(199,149,255,0.6)] rounded-xl px-4 py-[0.6rem] cursor-pointer font-bold bg-gradient-to-br from-[#8e39ed] to-[#5f23b3] text-white shadow-[0_4px_12px_rgba(167,79,255,0.25)] transition-all duration-[220ms] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(167,79,255,0.4),0_0_12px_rgba(199,149,255,0.3)] hover:border-[rgba(199,149,255,0.9)] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed";

export function EsqueciSenhaPage() {
    const navigate = useNavigate();
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
            setMessage(response?.mensagem || "Se esse e-mail estiver cadastrado, você receberá um link para redefinir sua senha em breve.");
            setSubmitted(true);
        } catch (error) {
            if (error?.validationErrors?.length) {
                setValidationError(error.validationErrors.join(" "));
                setIsError(true);
            } else if (error?.status === 500 || error?.message?.includes("500") || error?.message?.toLowerCase().includes("servidor")) {
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
        <div className="min-h-screen grid place-items-center px-4 py-12">
            <section className="w-[min(440px,100%)] border border-[rgba(217,180,255,0.2)] rounded-2xl bg-[#160e2d] p-6 relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-[linear-gradient(90deg,transparent,#2ccfb4,#a855f7,#c795ff,transparent)]">
                <button
                    type="button"
                    className="inline-flex items-center gap-[0.4rem] text-[#beafd7] text-[0.85rem] font-medium cursor-pointer bg-transparent border-none p-0 mb-5 hover:text-[#c795ff] transition-colors duration-200"
                    onClick={() => navigate(-1)}
                >
                    ← Voltar
                </button>

                <h1 className="text-[1.4rem] font-bold text-[#f5edff] mb-1">Esqueci minha senha</h1>
                <p className="text-[#beafd7] text-[0.9rem] mb-5">
                    Informe seu e-mail e enviaremos um link para redefinir sua senha.
                </p>

                {!submitted ? (
                    <form className="grid gap-[0.85rem]" onSubmit={handleSubmit}>
                        <label className="grid gap-[0.45rem] text-[#beafd7] text-[0.95rem]">
                            E-mail
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoFocus
                                placeholder="seu@email.com"
                                className={inputClass}
                            />
                        </label>
                        {validationError && (
                            <p className="px-3 py-2 rounded-[0.6rem] bg-[rgba(252,88,119,0.1)] border border-[rgba(252,88,119,0.3)] text-[#ffa8b8] text-[0.88rem]">
                                {validationError}
                            </p>
                        )}
                        <button className={btnPrimary} type="submit" disabled={isLoading}>
                            {isLoading ? "Enviando..." : "Enviar link de redefinição"}
                        </button>
                    </form>
                ) : null}

                {message && (
                    <p
                        className={`mt-4 mb-0 px-3 py-3 rounded-[0.6rem] text-[0.9rem] animate-[slide-up_300ms_ease-out,fade-in_300ms_ease-out] ${isError
                                ? "bg-[rgba(252,88,119,0.1)] border border-[rgba(252,88,119,0.3)] text-[#ffa8b8]"
                                : "bg-[rgba(44,207,180,0.1)] border border-[rgba(44,207,180,0.25)] text-[#5eead4]"
                            }`}
                    >
                        {message}
                    </p>
                )}

                {submitted && !isError && (
                    <button
                        type="button"
                        className="mt-4 w-full border border-[rgba(217,180,255,0.2)] rounded-xl px-4 py-[0.6rem] cursor-pointer bg-white/[0.03] text-[#beafd7] text-[0.9rem] transition-all duration-200 hover:text-white hover:border-[rgba(199,149,255,0.5)] hover:bg-white/[0.06]"
                        onClick={() => navigate("/")}
                    >
                        Voltar para o início
                    </button>
                )}
            </section>
        </div>
    );
}
