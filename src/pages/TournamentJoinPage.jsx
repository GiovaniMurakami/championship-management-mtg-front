import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ingressarComToken } from "../services/backendApi";
import { useMyDecks } from "../hooks/useMyDecks";
import { Spinner } from "../components/ui/Spinner";

const inputClass =
    "border border-[rgba(217,180,255,0.2)] rounded-[0.7rem] bg-white/[0.03] text-[#f5edff] px-[0.7rem] py-[0.65rem] w-full transition-[border-color,background-color,box-shadow] duration-200 hover:border-[rgba(199,149,255,0.5)] focus:outline-none focus:border-[rgba(199,149,255,0.92)] focus:shadow-[0_0_0_3px_rgba(167,79,255,0.22)] focus:bg-white/[0.05]";

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
            <div className="w-full max-w-[480px] bg-[linear-gradient(155deg,rgba(34,19,69,0.7),rgba(15,10,29,0.9))] border border-[rgba(217,180,255,0.2)] rounded-2xl p-8 shadow-[0_24px_64px_rgba(0,0,0,0.5)] animate-[fade-in_400ms_ease-out]">

                {!authInitialized && (
                    <div className="flex justify-center py-6">
                        <Spinner size={36} text="Verificando sessão..." />
                    </div>
                )}

                {authInitialized && !isAuthenticated && (
                    <div>
                        <div className="text-center mb-5">
                            <div className="flex justify-center mb-4">
                                <span className="text-[2.5rem]" role="img" aria-label="Torneio">⚔️</span>
                            </div>
                            <h2 className="text-white font-semibold text-[1.3rem] mb-1">Ingressar no torneio</h2>
                            <p className="text-[#beafd7] text-[0.85rem]">Faça login ou crie uma conta para continuar.</p>
                        </div>

                        {/* Tabs */}
                        <div className="grid grid-cols-2 border border-[rgba(217,180,255,0.2)] rounded-[0.7rem] overflow-hidden mb-5">
                            <button
                                type="button"
                                className={`border-none py-[0.7rem] cursor-pointer transition-all duration-200 text-[0.9rem] font-semibold ${authTab === "login" ? "bg-[rgba(167,79,255,0.2)] text-white" : "bg-transparent text-[#beafd7] hover:bg-[rgba(167,79,255,0.08)] hover:text-white/70"}`}
                                onClick={() => setAuthTab("login")}
                            >
                                Entrar
                            </button>
                            <button
                                type="button"
                                className={`border-none py-[0.7rem] cursor-pointer transition-all duration-200 text-[0.9rem] font-semibold ${authTab === "register" ? "bg-[rgba(167,79,255,0.2)] text-white" : "bg-transparent text-[#beafd7] hover:bg-[rgba(167,79,255,0.08)] hover:text-white/70"}`}
                                onClick={() => setAuthTab("register")}
                            >
                                Criar conta
                            </button>
                        </div>

                        {authTab === "login" && (
                            <form onSubmit={handleLogin} className="flex flex-col gap-3">
                                <input
                                    type="email"
                                    placeholder="E-mail"
                                    autoComplete="email"
                                    required
                                    className={inputClass}
                                    value={loginForm.email}
                                    onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))}
                                />
                                <input
                                    type="password"
                                    placeholder="Senha"
                                    autoComplete="current-password"
                                    required
                                    className={inputClass}
                                    value={loginForm.senha}
                                    onChange={(e) => setLoginForm((f) => ({ ...f, senha: e.target.value }))}
                                />
                                {authMessage && (
                                    <p className={`text-[0.82rem] text-center ${authMessage.includes("sucesso") ? "text-[#5eead4]" : "text-[#f87171]"}`}>{authMessage}</p>
                                )}
                                <button
                                    type="submit"
                                    disabled={authLoading || loginLockout}
                                    className="mt-1 border border-[rgba(199,149,255,0.6)] rounded-xl px-4 py-[0.6rem] cursor-pointer font-bold bg-gradient-to-br from-[#8e39ed] to-[#5f23b3] text-white shadow-[0_4px_12px_rgba(167,79,255,0.25)] transition-all duration-[220ms] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(167,79,255,0.4)] disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {authLoading ? "Entrando..." : "Entrar"}
                                </button>
                            </form>
                        )}

                        {authTab === "register" && (
                            <form onSubmit={handleRegister} className="flex flex-col gap-3">
                                <input
                                    type="text"
                                    placeholder="Nome completo"
                                    autoComplete="name"
                                    required
                                    className={inputClass}
                                    value={registerForm.nome}
                                    onChange={(e) => setRegisterForm((f) => ({ ...f, nome: e.target.value }))}
                                />
                                <input
                                    type="email"
                                    placeholder="E-mail"
                                    autoComplete="email"
                                    required
                                    className={inputClass}
                                    value={registerForm.email}
                                    onChange={(e) => setRegisterForm((f) => ({ ...f, email: e.target.value }))}
                                />
                                <input
                                    type="password"
                                    placeholder="Senha"
                                    autoComplete="new-password"
                                    required
                                    className={inputClass}
                                    value={registerForm.senha}
                                    onChange={(e) => setRegisterForm((f) => ({ ...f, senha: e.target.value }))}
                                />
                                {authMessage && (
                                    <p className={`text-[0.82rem] text-center ${authMessage.includes("sucesso") ? "text-[#5eead4]" : "text-[#f87171]"}`}>{authMessage}</p>
                                )}
                                <button
                                    type="submit"
                                    disabled={authLoading}
                                    className="mt-1 border border-[rgba(199,149,255,0.6)] rounded-xl px-4 py-[0.6rem] cursor-pointer font-bold bg-gradient-to-br from-[#8e39ed] to-[#5f23b3] text-white shadow-[0_4px_12px_rgba(167,79,255,0.25)] transition-all duration-[220ms] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(167,79,255,0.4)] disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {authLoading ? "Criando conta..." : "Criar conta e ingressar"}
                                </button>
                            </form>
                        )}
                    </div>
                )}

                {authInitialized && isAuthenticated && (
                    <>
                        {status === "select-deck" && (
                            <div>
                                <div className="text-center mb-5">
                                    <div className="flex justify-center mb-4">
                                        <span className="text-[2.5rem]" role="img" aria-label="Deck">🃏</span>
                                    </div>
                                    <h2 className="text-white font-semibold text-[1.3rem] mb-1">Escolha seu deck para ingressar</h2>
                                    <p className="text-[#beafd7] text-[0.85rem]">Selecione o deck que deseja usar neste torneio.</p>
                                </div>

                                {decks.length === 0 ? (
                                    <div className="text-center">
                                        <p className="text-[0.82rem] text-[#beafd7] mb-4">
                                            Você não tem decks cadastrados.{" "}
                                            <a href="/decks/criar" className="text-[#c795ff] underline">Criar deck</a>
                                        </p>
                                        <button
                                            type="button"
                                            className="inline-flex items-center justify-center px-5 py-[0.65rem] border border-[rgba(217,180,255,0.3)] rounded-[0.7rem] text-[0.9rem] font-semibold cursor-pointer transition-all duration-200 text-[#beafd7] bg-transparent hover:bg-white/[0.06] hover:text-white"
                                            onClick={() => navigate("/")}
                                        >
                                            Voltar para torneios
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex flex-col gap-[0.35rem] max-h-[260px] overflow-y-auto pr-1 mb-4">
                                            {decks.map((deck) => (
                                                <button
                                                    key={deck.id}
                                                    type="button"
                                                    className={`flex justify-between items-center gap-2 px-[0.85rem] py-[0.6rem] border rounded-[0.65rem] text-[#f5edff] text-[0.88rem] cursor-pointer text-left transition-[border-color,background] duration-150 w-full ${selectedDeckId === deck.id ? "bg-[rgba(199,149,255,0.12)] border-[rgba(199,149,255,0.7)]" : "bg-[rgba(255,255,255,0.03)] border-[rgba(217,180,255,0.2)] hover:bg-[rgba(199,149,255,0.07)] hover:border-[rgba(199,149,255,0.4)]"}`}
                                                    onClick={() => setSelectedDeckId(deck.id)}
                                                >
                                                    <span className="font-semibold overflow-hidden text-ellipsis whitespace-nowrap">{deck.nome}</span>
                                                    <span className="flex items-center gap-2 flex-shrink-0">
                                                        {deck.formato && (
                                                            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.04em] px-[0.45rem] py-[0.15rem] rounded-[0.4rem] bg-[rgba(199,149,255,0.15)] text-[#c795ff]">{deck.formato}</span>
                                                        )}
                                                        <span className="text-[0.78rem] text-[#beafd7] whitespace-nowrap">{calcTotal(deck)} cartas</span>
                                                    </span>
                                                </button>
                                            ))}
                                        </div>

                                        <button
                                            type="button"
                                            disabled={!selectedDeckId}
                                            className="inline-flex items-center justify-center w-full px-5 py-[0.65rem] border-none rounded-[0.7rem] text-[0.95rem] font-semibold cursor-pointer transition-all duration-200 text-white bg-[linear-gradient(145deg,#8e39ed,#5f23b3)] shadow-[0_4px_12px_rgba(167,79,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed hover:not-disabled:-translate-y-px hover:not-disabled:shadow-[0_6px_20px_rgba(167,79,255,0.4)]"
                                            onClick={handleJoin}
                                        >
                                            {selectedDeck ? `Ingressar com "${selectedDeck.nome}"` : "Selecione um deck"}
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
                                <p className="text-[#beafd7] text-[0.95rem] m-0">Ingressando no torneio…</p>
                            </div>
                        )}

                        {status === "error" && (
                            <div className="text-center">
                                <div className="flex justify-center mb-4">
                                    <span className="text-[2.5rem]" role="img" aria-label="Erro">❌</span>
                                </div>
                                <h2 className="text-white font-semibold text-[1.3rem] mb-2">Não foi possível ingressar</h2>
                                <p className="text-[#fca5a5] text-[0.9rem] mb-5">{errorMsg}</p>
                                <button
                                    type="button"
                                    className="inline-flex items-center justify-center px-5 py-[0.65rem] border border-[rgba(217,180,255,0.3)] rounded-[0.7rem] text-[0.9rem] font-semibold cursor-pointer transition-all duration-200 text-[#beafd7] bg-transparent hover:bg-white/[0.06] hover:text-white"
                                    onClick={() => navigate("/")}
                                >
                                    Ver torneios
                                </button>
                            </div>
                        )}

                        {status === "success" && (
                            <>
                                <div className="text-center mb-5">
                                    <div className="flex justify-center mb-4">
                                        <span className="text-[2.5rem]" role="img" aria-label="Sucesso">✅</span>
                                    </div>
                                    <h2 className="text-white font-semibold text-[1.3rem] mb-1">Você ingressou no torneio!</h2>
                                </div>

                                {matchData && (
                                    <div className="mb-5 p-4 rounded-[0.85rem] border border-[rgba(217,180,255,0.2)] bg-[rgba(255,255,255,0.03)] text-center">
                                        {isBye ? (
                                            <>
                                                <p className="text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[#beafd7] mb-2">Sua partida desta rodada</p>
                                                <p className="text-[1.4rem] font-bold text-[#f87171] mb-1">BYE</p>
                                                <div className="flex items-center justify-center gap-2 mb-1">
                                                    <span className="text-[0.9rem] font-semibold text-[#f5edff]">Você</span>
                                                    <span className="text-[1rem] font-bold text-[#fbbf24] px-1">0 – 2</span>
                                                    <span className="text-[0.9rem] font-semibold text-[#f5edff]">BYE</span>
                                                </div>
                                                <p className="text-[0.75rem] text-[#888] mt-1">Penalidade aplicada por ingresso tardio.</p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[#beafd7] mb-3">Sua partida desta rodada</p>
                                                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                                                    <div className="text-center">
                                                        <span className="text-[0.9rem] font-semibold text-[#f5edff] break-words">
                                                            {matchData.jogador1Nome || matchData.jogador1?.nome || "Jogador 1"}
                                                        </span>
                                                    </div>
                                                    <span className="text-[1rem] font-bold text-[#fbbf24] px-1">
                                                        {matchData.vitoriasJogador1 ?? 0} – {matchData.vitoriasJogador2 ?? 2}
                                                    </span>
                                                    <div className="text-center">
                                                        <span className="text-[0.9rem] font-semibold text-[#f5edff] break-words">
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
                                    className="inline-flex items-center justify-center w-full px-5 py-[0.65rem] border-none rounded-[0.7rem] text-[0.95rem] font-semibold cursor-pointer transition-all duration-200 text-white bg-[linear-gradient(145deg,#8e39ed,#5f23b3)] shadow-[0_4px_12px_rgba(167,79,255,0.3)] hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(167,79,255,0.4)]"
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
