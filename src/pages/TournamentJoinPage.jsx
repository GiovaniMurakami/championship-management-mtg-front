import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { AuthFeedback } from "../components/auth/AuthFeedback";
import { JoinFlowSteps } from "../components/auth/JoinFlowSteps";
import { TermsAcceptanceField } from "../components/auth/TermsAcceptanceField";
import { usePageTitle } from "../hooks/usePageTitle";
import { PAGE_TITLES } from "../constants/pageTitles";
import { ingressarComToken } from "../services/backendApi";
import { useMyDecks } from "../hooks/useMyDecks";
import { Spinner } from "../components/ui/Spinner";
import { SelectField } from "../components/ui";
import { FormFeedback } from "../components/ui/FormFeedback";
import { Button } from "../components/ui/Button";
import {
  AUTH_TABS_CLASS,
  BTN_GHOST,
  BTN_PRIMARY,
  BTN_SECONDARY,
  FORM_LABEL_CLASS,
  MODAL_INPUT_CLASS,
  FORM_WIDE_CARD_CLASS,
  authTabClass,
} from "../styles/uiClasses";

export function TournamentJoinPage() {
    const { token: joinToken } = useParams();
    const {
        token: authToken, usuario, isAuthenticated, authInitialized,
        loginForm, setLoginForm, handleLogin, authLoading, authMessage,
        registerForm, setRegisterForm, handleRegister, loginLockout,
    } = useAuth();
    const navigate = useNavigate();

    const [status, setStatus] = useState("select-deck"); // select-deck | loading | success | error
    const [matchData, setMatchData] = useState(null);
    const [torneioId, setTorneioId] = useState(null);
    const [errorMsg, setErrorMsg] = useState("");

    const [selectedDeckId, setSelectedDeckId] = useState("");
    const [authTab, setAuthTab] = useState("login"); // login | register

    const { decks } = useMyDecks(authToken, usuario?.id);

    usePageTitle(PAGE_TITLES.ingressarTorneio);

    const handleJoin = async () => {
        if (!joinToken || !authToken) return;

        // Basic token format validation (UUID v4)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(joinToken)) {
            setErrorMsg("Link de ingresso inválido. Verifique o link e tente novamente.");
            setStatus("error");
            return;
        }

        setStatus("loading");

        try {
            const data = await ingressarComToken(joinToken, authToken, selectedDeckId || undefined);

            // Block if tournament is in top-cut phase
            if (data?.emCorte) {
                setErrorMsg("O torneio está na fase de corte (eliminatórias). Não é possível ingressar neste momento.");
                setStatus("error");
                return;
            }

            const partida = data?.partida || data?.match || data || null;
            setMatchData(partida);
            const tid = data?.torneioId || partida?.torneioId || null;
            setTorneioId(tid);
            setStatus("success");
        } catch (err) {
            setErrorMsg(err.message || "Não foi possível ingressar no torneio. O link pode ter expirado.");
            setStatus("error");
        }
    };

    const handleGoToTournament = () => {
        if (torneioId) {
            navigate(`/torneios/${torneioId}`);
        } else {
            navigate("/");
        }
    };

    const isBye = matchData && (!matchData.jogador2Id && !matchData.jogador2);

    const calcTotal = (deck) =>
        deck.maindeck?.reduce((sum, c) => sum + (c.quantidade || 1), 0) || 0;

    const selectedDeck = decks.find((d) => d.id === selectedDeckId);

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-[#0d0b1a]">
            <div className={`${FORM_WIDE_CARD_CLASS} animate-[fade-in_400ms_ease-out]`}>

                {!authInitialized && (
                    <div className="flex justify-center py-6">
                        <Spinner size={36} text="Verificando sessão..." />
                    </div>
                )}

                {authInitialized && !isAuthenticated && (
                    <div>
                        <JoinFlowSteps currentStep={1} />
                        <div className="text-center mb-5">
                            <h2 className="text-white font-semibold text-[1.25rem] mb-1">Passo 1 · Sua conta</h2>
                            <p className="text-text-subtle text-[0.88rem]">
                                Entre ou crie uma conta para continuar o ingresso.
                            </p>
                        </div>

                        <div role="tablist" aria-label="Autenticação" className={`${AUTH_TABS_CLASS} mb-5`}>
                            <button
                                type="button"
                                role="tab"
                                className={authTabClass(authTab === "login")}
                                onClick={() => setAuthTab("login")}
                            >
                                Entrar
                            </button>
                            <button
                                type="button"
                                role="tab"
                                className={authTabClass(authTab === "register")}
                                onClick={() => setAuthTab("register")}
                            >
                                Criar conta
                            </button>
                        </div>

                        {authTab === "login" && (
                            <form onSubmit={handleLogin} className="grid gap-3">
                                <label className={FORM_LABEL_CLASS}>
                                    E-mail
                                    <input
                                        type="email"
                                        autoComplete="email"
                                        required
                                        className={MODAL_INPUT_CLASS}
                                        value={loginForm.email}
                                        onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))}
                                    />
                                </label>
                                <label className={FORM_LABEL_CLASS}>
                                    Senha
                                    <input
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        className={MODAL_INPUT_CLASS}
                                        value={loginForm.senha}
                                        onChange={(e) => setLoginForm((f) => ({ ...f, senha: e.target.value }))}
                                    />
                                </label>
                                {authMessage ? <AuthFeedback message={authMessage} /> : null}
                                <button
                                    type="submit"
                                    disabled={authLoading || loginLockout}
                                    className={`w-full ${BTN_PRIMARY}`}
                                >
                                    {authLoading ? "Entrando..." : "Entrar e continuar"}
                                </button>
                                <Link to="/esqueci-senha" className={`text-center ${BTN_GHOST} text-[0.85rem] underline underline-offset-2`}>
                                    Esqueci minha senha
                                </Link>
                            </form>
                        )}

                        {authTab === "register" && (
                            <form onSubmit={handleRegister} className="grid gap-3">
                                <label className={FORM_LABEL_CLASS}>
                                    Nome completo
                                    <input
                                        type="text"
                                        autoComplete="name"
                                        required
                                        className={MODAL_INPUT_CLASS}
                                        value={registerForm.nome}
                                        onChange={(e) => setRegisterForm((f) => ({ ...f, nome: e.target.value }))}
                                    />
                                </label>
                                <label className={FORM_LABEL_CLASS}>
                                    E-mail
                                    <input
                                        type="email"
                                        autoComplete="email"
                                        required
                                        className={MODAL_INPUT_CLASS}
                                        value={registerForm.email}
                                        onChange={(e) => setRegisterForm((f) => ({ ...f, email: e.target.value }))}
                                    />
                                </label>
                                <label className={FORM_LABEL_CLASS}>
                                    Senha
                                    <input
                                        type="password"
                                        autoComplete="new-password"
                                        minLength={8}
                                        required
                                        className={MODAL_INPUT_CLASS}
                                        value={registerForm.senha}
                                        onChange={(e) => setRegisterForm((f) => ({ ...f, senha: e.target.value }))}
                                    />
                                </label>
                                <TermsAcceptanceField
                                    id="aceite-termos-ingressar"
                                    checked={Boolean(registerForm.aceiteTermos)}
                                    onChange={(aceiteTermos) =>
                                        setRegisterForm((f) => ({ ...f, aceiteTermos }))
                                    }
                                />
                                {authMessage ? <AuthFeedback message={authMessage} /> : null}
                                <button
                                    type="submit"
                                    disabled={authLoading || !registerForm.aceiteTermos}
                                    className={`w-full ${BTN_PRIMARY}`}
                                >
                                    {authLoading ? "Criando conta..." : "Criar conta e continuar"}
                                </button>
                            </form>
                        )}
                    </div>
                )}

                {authInitialized && isAuthenticated && (
                    <>
                        {status === "select-deck" && (
                            <div>
                                <JoinFlowSteps currentStep={2} />
                                <div className="text-center mb-5">
                                    <h2 className="text-white font-semibold text-[1.25rem] mb-1">Passo 2 · Escolha o deck</h2>
                                    <p className="text-text-subtle text-[0.88rem]">
                                        Selecione o deck que você usará neste torneio.
                                    </p>
                                </div>

                                {decks.length === 0 ? (
                                    <div className="rounded-xl border border-line-soft bg-[rgba(255,255,255,0.02)] p-5 text-center">
                                        <p className="text-[0.88rem] text-text-soft mb-4">
                                            Você ainda não tem decks cadastrados.
                                        </p>
                                        <Link to="/decks/criar" className={`inline-flex ${BTN_PRIMARY}`}>
                                            Criar deck
                                        </Link>
                                        <button
                                            type="button"
                                            className={`mt-3 w-full ${BTN_SECONDARY}`}
                                            onClick={() => navigate("/")}
                                        >
                                            Voltar para torneios
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <label className={`${FORM_LABEL_CLASS} mb-4 block`}>
                                            Deck do torneio
                                            <SelectField
                                                className={MODAL_INPUT_CLASS}
                                                value={selectedDeckId}
                                                onChange={(e) => setSelectedDeckId(e.target.value)}
                                                aria-label="Selecionar deck"
                                                placeholder="Selecione um deck"
                                            >
                                                {decks.map((deck) => (
                                                    <option key={deck.id} value={deck.id}>
                                                        {deck.nome}
                                                        {deck.formato ? ` - ${deck.formato}` : ""}
                                                        {` - ${calcTotal(deck)} cartas`}
                                                    </option>
                                                ))}
                                            </SelectField>
                                        </label>

                                        <button
                                            type="button"
                                            disabled={!selectedDeckId}
                                            className={`w-full ${BTN_PRIMARY}`}
                                            onClick={handleJoin}
                                        >
                                            {selectedDeck ? `Confirmar deck "${selectedDeck.nome}"` : "Selecione um deck para continuar"}
                                        </button>
                                    </>
                                )}
                            </div>
                        )}

                        {status === "loading" && (
                            <div className="text-center">
                                <div className="flex justify-center mb-5">
                                    <div className="w-10 h-10 rounded-full border-2 border-[rgba(199,149,255,0.3)] border-t-[#c795ff] animate-spin" />
                                </div>
                                <p className="text-text-soft text-[0.95rem] m-0">Ingressando no torneio…</p>
                            </div>
                        )}

                        {status === "error" && (
                            <div className="text-center">
                                <div className="flex justify-center mb-4">
                                    <span className="text-[2.5rem]" role="img" aria-label="Erro">❌</span>
                                </div>
                                <h2 className="text-white font-semibold text-[1.3rem] mb-2">Não foi possível ingressar</h2>
                                <FormFeedback message={errorMsg} variant="error" className="mb-5 text-left" />
                                <Button
                                    variant="secondary"
                                    onClick={() => navigate("/")}
                                >
                                    Ver torneios
                                </Button>
                            </div>
                        )}

                        {status === "success" && (
                            <>
                                <JoinFlowSteps currentStep={3} />
                                <div className="text-center mb-5">
                                    <h2 className="text-white font-semibold text-[1.25rem] mb-1">Passo 3 · Ingresso confirmado</h2>
                                    <p className="text-[#5eead4] text-[0.88rem]">Você entrou no torneio com sucesso.</p>
                                </div>

                                {matchData && (
                                    <div className="mb-5 p-4 rounded-lg border border-line bg-[rgba(255,255,255,0.03)] text-center">
                                        {isBye ? (
                                            <>
                                                <p className="text-[0.78rem] font-bold uppercase tracking-[0.08em] text-text-soft mb-2">Sua partida desta rodada</p>
                                                <p className="text-[1.4rem] font-bold text-[#f87171] mb-1">BYE</p>
                                                <div className="flex items-center justify-center gap-2 mb-1">
                                                    <span className="text-[0.9rem] font-semibold text-text-main">Você</span>
                                                    <span className="text-[1rem] font-bold text-[#fbbf24] px-1">0 – 2</span>
                                                    <span className="text-[0.9rem] font-semibold text-text-main">BYE</span>
                                                </div>
                                                <p className="text-[0.75rem] text-[#888] mt-1">Penalidade aplicada por ingresso tardio.</p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-[0.78rem] font-bold uppercase tracking-[0.08em] text-text-soft mb-3">Sua partida desta rodada</p>
                                                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                                                    <div className="text-center">
                                                        <span className="text-[0.9rem] font-semibold text-text-main break-words">
                                                            {matchData.jogador1Nome || matchData.jogador1?.nome || "Jogador 1"}
                                                        </span>
                                                    </div>
                                                    <span className="text-[1rem] font-bold text-[#fbbf24] px-1">
                                                        {matchData.vitoriasJogador1 ?? 0} – {matchData.vitoriasJogador2 ?? 2}
                                                    </span>
                                                    <div className="text-center">
                                                        <span className="text-[0.9rem] font-semibold text-text-main break-words">
                                                            {matchData.jogador2Nome || matchData.jogador2?.nome || "Jogador 2"}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="text-[0.75rem] text-[#888] mt-2">Penalidade aplicada por ingresso tardio.</p>
                                            </>
                                        )}
                                    </div>
                                )}

                                <button
                                    type="button"
                                    className={`w-full ${BTN_PRIMARY}`}
                                    onClick={handleGoToTournament}
                                >
                                    Ir para o torneio
                                </button>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
