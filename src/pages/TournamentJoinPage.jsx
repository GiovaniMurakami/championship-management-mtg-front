import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ingressarComToken, escolherDeckTorneio } from "../services/backendApi";
import { useMyDecks } from "../hooks/useMyDecks";

export function TournamentJoinPage() {
    const { token: joinToken } = useParams();
    const { token: authToken, usuario } = useAuth();
    const navigate = useNavigate();

    const [status, setStatus] = useState("loading"); // loading | success | error
    const [matchData, setMatchData] = useState(null);
    const [torneioId, setTorneioId] = useState(null);
    const [torneioFormato, setTorneioFormato] = useState(null);
    const [errorMsg, setErrorMsg] = useState("");

    const [selectedDeckId, setSelectedDeckId] = useState("");
    const [deckSaved, setDeckSaved] = useState(false);
    const [deckLoading, setDeckLoading] = useState(false);
    const [deckError, setDeckError] = useState("");

    const { decks } = useMyDecks(authToken, usuario?.id);

    useEffect(() => {
        if (!joinToken || !authToken) return;

        // Basic token format validation (UUID v4)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(joinToken)) {
            setErrorMsg("Link de ingresso inválido. Verifique o link e tente novamente.");
            setStatus("error");
            return;
        }

        let cancelled = false;

        (async () => {
            try {
                const data = await ingressarComToken(joinToken, authToken);
                if (cancelled) return;

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
                setTorneioFormato(data?.formato || data?.torneioFormato || null);
                setStatus("success");
            } catch (err) {
                if (cancelled) return;
                setErrorMsg(err.message || "Não foi possível ingressar no torneio. O link pode ter expirado.");
                setStatus("error");
            }
        })();

        return () => { cancelled = true; };
    }, [joinToken, authToken]);

    const handleGoToTournament = () => {
        if (torneioId) {
            navigate(`/torneios/${torneioId}`);
        } else {
            navigate("/torneios");
        }
    };

    const handleConfirmDeck = async () => {
        if (!selectedDeckId || !torneioId) return;
        setDeckLoading(true);
        setDeckError("");
        try {
            await escolherDeckTorneio(torneioId, selectedDeckId, authToken);
            setDeckSaved(true);
        } catch (err) {
            setDeckError(err.message || "Erro ao salvar deck. Tente novamente.");
        } finally {
            setDeckLoading(false);
        }
    };

    const isBye = matchData && (!matchData.jogador2Id && !matchData.jogador2);

    const calcTotal = (deck) =>
        deck.maindeck?.reduce((sum, c) => sum + (c.quantidade || 1), 0) || 0;

    const selectedDeck = decks.find((d) => d.id === selectedDeckId);

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-[#0d0b1a]">
            <div className="w-full max-w-[480px] bg-[linear-gradient(155deg,rgba(34,19,69,0.7),rgba(15,10,29,0.9))] border border-[rgba(217,180,255,0.2)] rounded-2xl p-8 shadow-[0_24px_64px_rgba(0,0,0,0.5)] animate-[fade-in_400ms_ease-out]">

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
                            onClick={() => navigate("/torneios")}
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

                        <div className="mb-5">
                            <p className="text-[0.85rem] font-semibold text-[#beafd7] mb-3">Escolha seu deck</p>

                            {decks.length === 0 ? (
                                <p className="text-[0.82rem] text-[#beafd7]">
                                    Você não tem decks cadastrados.{" "}
                                    <a href="/decks" className="text-[#c795ff] underline">Criar deck</a>
                                </p>
                            ) : (
                                <div className="flex flex-col gap-[0.35rem] max-h-[200px] overflow-y-auto pr-1 mb-3">
                                    {decks.map((deck) => {
                                        const isCompatible = !torneioFormato || !deck.formato || deck.formato.toLowerCase() === torneioFormato.toLowerCase();
                                        return (
                                            <button
                                                key={deck.id}
                                                type="button"
                                                disabled={deckSaved || deckLoading}
                                                className={`flex justify-between items-center gap-2 px-[0.85rem] py-[0.6rem] border rounded-[0.65rem] text-[#f5edff] text-[0.88rem] cursor-pointer text-left transition-[border-color,background] duration-150 w-full disabled:opacity-60 disabled:cursor-not-allowed ${selectedDeckId === deck.id ? "bg-[rgba(199,149,255,0.12)] border-[rgba(199,149,255,0.7)]" : isCompatible ? "bg-[rgba(255,255,255,0.03)] border-[rgba(217,180,255,0.2)] hover:bg-[rgba(199,149,255,0.07)] hover:border-[rgba(199,149,255,0.4)]" : "bg-[rgba(239,68,68,0.04)] border-[rgba(239,68,68,0.2)] opacity-60 hover:opacity-80"}`}
                                                onClick={() => setSelectedDeckId(deck.id)}
                                            >
                                                <span className="font-semibold overflow-hidden text-ellipsis whitespace-nowrap">{deck.nome}</span>
                                                <span className="flex items-center gap-2 flex-shrink-0">
                                                    {!isCompatible && (
                                                        <span className="text-[0.65rem] font-bold uppercase tracking-[0.04em] px-[0.4rem] py-[0.12rem] rounded-[0.4rem] bg-[rgba(239,68,68,0.15)] text-[#f87171]">Incompatível</span>
                                                    )}
                                                    <span className="text-[0.7rem] font-semibold uppercase tracking-[0.04em] px-[0.45rem] py-[0.15rem] rounded-[0.4rem] bg-[rgba(199,149,255,0.15)] text-[#c795ff]">{deck.formato}</span>
                                                    <span className="text-[0.78rem] text-[#beafd7] whitespace-nowrap">{calcTotal(deck)} cartas</span>
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {deckError && (
                                <p className="text-[0.82rem] text-[#f87171] mb-2">{deckError}</p>
                            )}

                            {decks.length > 0 && (
                                <button
                                    type="button"
                                    disabled={!selectedDeckId || deckLoading || deckSaved}
                                    className="inline-flex items-center justify-center w-full px-4 py-[0.55rem] border border-[rgba(217,180,255,0.2)] rounded-[0.7rem] text-[0.88rem] font-semibold cursor-pointer transition-all duration-[220ms] text-[#f5edff] bg-[rgba(255,255,255,0.05)] disabled:opacity-50 disabled:cursor-not-allowed hover:not-disabled:bg-[rgba(255,255,255,0.1)] hover:not-disabled:border-[rgba(199,149,255,0.5)]"
                                    onClick={handleConfirmDeck}
                                >
                                    {deckSaved
                                        ? `✓ Deck "${selectedDeck?.nome || ""}" confirmado`
                                        : deckLoading
                                            ? "Salvando..."
                                            : selectedDeck
                                                ? `Confirmar "${selectedDeck.nome}"`
                                                : "Selecione um deck"}
                                </button>
                            )}
                        </div>

                        <button
                            type="button"
                            className="inline-flex items-center justify-center w-full px-5 py-[0.65rem] border-none rounded-[0.7rem] text-[0.95rem] font-semibold cursor-pointer transition-all duration-200 text-white bg-[linear-gradient(145deg,#8e39ed,#5f23b3)] shadow-[0_4px_12px_rgba(167,79,255,0.3)] hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(167,79,255,0.4)]"
                            onClick={handleGoToTournament}
                        >
                            Ir para o torneio
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
