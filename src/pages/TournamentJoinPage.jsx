import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ingressarComToken } from "../services/backendApi";

export function TournamentJoinPage() {
    const { token: joinToken } = useParams();
    const { token: authToken } = useAuth();
    const navigate = useNavigate();

    const [status, setStatus] = useState("loading"); // loading | success | error
    const [matchData, setMatchData] = useState(null);
    const [torneioId, setTorneioId] = useState(null);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if (!joinToken || !authToken) return;

        let cancelled = false;

        (async () => {
            try {
                const data = await ingressarComToken(joinToken, authToken);
                if (cancelled) return;
                setMatchData(data?.partida || data?.match || data || null);
                setTorneioId(data?.torneioId || data?.partida?.torneioId || null);
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

    const isBye = matchData && (!matchData.jogador2Id && !matchData.jogador2);

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-[#0d0b1a]">
            <div className="w-full max-w-[440px] bg-[linear-gradient(155deg,rgba(34,19,69,0.7),rgba(15,10,29,0.9))] border border-[rgba(217,180,255,0.2)] rounded-2xl p-8 shadow-[0_24px_64px_rgba(0,0,0,0.5)] text-center animate-[fade-in_400ms_ease-out]">

                {status === "loading" && (
                    <>
                        <div className="flex justify-center mb-5">
                            <div className="w-10 h-10 rounded-full border-2 border-[rgba(199,149,255,0.3)] border-t-[#c795ff] animate-spin" />
                        </div>
                        <p className="text-[#beafd7] text-[0.95rem] m-0">Ingressando no torneio…</p>
                    </>
                )}

                {status === "error" && (
                    <>
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
                    </>
                )}

                {status === "success" && (
                    <>
                        <div className="flex justify-center mb-4">
                            <span className="text-[2.5rem]" role="img" aria-label="Sucesso">✅</span>
                        </div>
                        <h2 className="text-white font-semibold text-[1.3rem] mb-1">Você ingressou no torneio!</h2>

                        {matchData && (
                            <div className="mt-4 mb-5 p-4 rounded-[0.85rem] border border-[rgba(217,180,255,0.2)] bg-[rgba(255,255,255,0.03)]">
                                {isBye ? (
                                    <>
                                        <p className="text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[#beafd7] mb-2">Sua partida desta rodada</p>
                                        <p className="text-[1.4rem] font-bold text-[#c795ff] mb-1">BYE</p>
                                        <p className="text-[0.85rem] text-[#beafd7]">Você recebeu BYE nesta rodada.</p>
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
            </div>
        </div>
    );
}
