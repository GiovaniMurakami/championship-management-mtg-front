import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { confirmarResetSenha } from "../services/backendApi";
import { usePageTitle } from "../hooks/usePageTitle";
import { PAGE_TITLES } from "../constants/pageTitles";
import { MODAL_INPUT_CLASS as inputClass } from "../styles/uiClasses";

const TOKEN_ERROR_HINTS = /token|link|expirad|inválid|invalid/i;

const btnPrimary =
    "border border-[rgba(199,149,255,0.6)] rounded-xl px-4 py-[0.6rem] cursor-pointer font-bold bg-gradient-to-br from-[#8e39ed] to-[#5f23b3] text-white shadow-[0_4px_12px_rgba(167,79,255,0.25)] transition-all duration-[220ms] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(167,79,255,0.4),0_0_12px_rgba(199,149,255,0.3)] hover:border-[rgba(199,149,255,0.9)] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed";

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
            const message = error.message || "";
            if (status === 400 && TOKEN_ERROR_HINTS.test(message)) {
                setTokenInvalido(true);
                setMessage("Este link de redefinição é inválido ou já expirou. Solicite um novo link.");
            } else if (status === 400) {
                setValidationError(message || "Dados inválidos. Verifique a senha informada.");
                setIsError(true);
            } else {
                setMessage(message || "Não foi possível redefinir a senha. Tente novamente.");
                setIsError(true);
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) return null;

    return (
        <div className="min-h-screen grid place-items-center px-4 py-12">
            <section className="w-[min(440px,100%)] border border-[rgba(217,180,255,0.2)] rounded-2xl bg-[#160e2d] p-6 relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-[linear-gradient(90deg,transparent,#2ccfb4,#a855f7,#c795ff,transparent)]">
                <h1 className="text-[1.4rem] font-bold text-[#f5edff] mb-1">Redefinir senha</h1>
                <p className="text-[#beafd7] text-[0.9rem] mb-5">
                    Escolha uma nova senha para a sua conta.
                </p>

                {!tokenInvalido && (
                    <form className="grid gap-[0.85rem]" onSubmit={handleSubmit}>
                        <label className="grid gap-[0.45rem] text-[#beafd7] text-[0.95rem]">
                            Nova senha
                            <input
                                type="password"
                                value={form.novaSenha}
                                onChange={(e) => setForm((f) => ({ ...f, novaSenha: e.target.value }))}
                                required
                                autoFocus
                                placeholder="Mínimo 8 caracteres"
                                className={inputClass}
                            />
                        </label>
                        <label className="grid gap-[0.45rem] text-[#beafd7] text-[0.95rem]">
                            Confirmar nova senha
                            <input
                                type="password"
                                value={form.confirmarSenha}
                                onChange={(e) => setForm((f) => ({ ...f, confirmarSenha: e.target.value }))}
                                required
                                placeholder="Repita a nova senha"
                                className={inputClass}
                            />
                        </label>

                        {validationError && (
                            <p className="px-3 py-2 rounded-[0.6rem] bg-[rgba(252,88,119,0.1)] border border-[rgba(252,88,119,0.3)] text-[#ffa8b8] text-[0.88rem]">
                                {validationError}
                            </p>
                        )}

                        <button className={btnPrimary} type="submit" disabled={isLoading}>
                            {isLoading ? "Salvando..." : "Redefinir senha"}
                        </button>
                    </form>
                )}

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

                {tokenInvalido && (
                    <button
                        type="button"
                        className={`mt-4 w-full ${btnPrimary}`}
                        onClick={() => navigate("/esqueci-senha")}
                    >
                        Solicitar novo link
                    </button>
                )}
            </section>
        </div>
    );
}
