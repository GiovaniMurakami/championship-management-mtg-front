import { useState } from "react";
import { isEliminationPhase } from "../../utils/tournamentFlow";

export function MatchPanel({ myMatch, usuario, onReportResult, onContestResult, actionLoading, torneio, isOwner }) {
    const [winsPlayer1, setWinsPlayer1] = useState(0);
    const [winsPlayer2, setWinsPlayer2] = useState(0);

    const eliminationPhase = isEliminationPhase(torneio);
    const isTie = winsPlayer1 === winsPlayer2;
    const totalWins = winsPlayer1 + winsPlayer2;
    const isInvalidScore = totalWins > 3;

    if (!myMatch) {
        return (
            <section className="border border-[rgba(217,180,255,0.2)] rounded-2xl p-5 bg-[linear-gradient(160deg,rgba(34,19,69,0.6),rgba(15,10,29,0.85))] shadow-[0_4px_20px_rgba(3,2,8,0.3)] animate-[slide-up_400ms_ease-out] relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-[linear-gradient(90deg,#2ccfb4,#8e39ed,#c795ff,#8e39ed,#2ccfb4)] before:bg-[length:200%_100%] before:animate-[shimmer-bar_3s_linear_infinite]">
                <h2 className="m-0 mb-4 font-['Bebas_Neue',sans-serif] text-[1.5rem] tracking-[0.04em] text-[#f5edff]">Partida Atual</h2>
                <p className="text-[#beafd7] text-[0.9rem] m-0">Nenhuma partida na rodada atual.</p>
            </section>
        );
    }

    const player1Name =
        myMatch.jogador1Nome ||
        myMatch.jogador1?.nome ||
        myMatch.jogador1?.username ||
        "Jogador 1";
    const player2Name =
        myMatch.jogador2Nome ||
        myMatch.jogador2?.nome ||
        myMatch.jogador2?.username ||
        "Jogador 2";

    const player1Nick = myMatch.jogador1NickMTGO || myMatch.jogador1?.nickMTGO || null;
    const player2Nick = myMatch.jogador2NickMTGO || myMatch.jogador2?.nickMTGO || null;

    const isBye = !myMatch.jogador2Id && !myMatch.jogador2;
    const isContested = Boolean(myMatch.contestado);
    const isReported = myMatch.status === "finalizada" || myMatch.resultado || myMatch.reportado;
    const hasLaterRound = Number(torneio?.rodadaAtual || 0) > Number(myMatch?.rodada || 0);

    const isPlayer1 =
        myMatch.jogador1Id === usuario?.id || myMatch.jogador1?.id === usuario?.id;
    const isPlayer2 =
        myMatch.jogador2Id === usuario?.id || myMatch.jogador2?.id === usuario?.id;
    const canContest =
        torneio?.status === "em_andamento"
        && isReported
        && !isBye
        && !hasLaterRound
        && (isPlayer1 || isPlayer2 || isOwner);

    const myName = isPlayer1 ? player1Name : player2Name;
    const myNick = isPlayer1 ? player1Nick : player2Nick;
    const opponentName = isPlayer1
        ? isBye
            ? "BYE"
            : player2Name
        : player1Name;
    const opponentNick = isPlayer1 ? player2Nick : player1Nick;

    const handleSubmit = () => {
        const resultado = {
            vitoriasJogador1: isPlayer1 ? winsPlayer1 : winsPlayer2,
            vitoriasJogador2: isPlayer1 ? winsPlayer2 : winsPlayer1,
        };
        onReportResult(myMatch.id, resultado);
    };

    const mesaNum = myMatch?.mesa ?? myMatch?.mesaNumero ?? myMatch?.numeroMesa;

    return (
        <section className="border border-[rgba(217,180,255,0.2)] rounded-2xl p-5 bg-[linear-gradient(160deg,rgba(34,19,69,0.6),rgba(15,10,29,0.85))] shadow-[0_4px_20px_rgba(3,2,8,0.3)] animate-[slide-up_400ms_ease-out] relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-[linear-gradient(90deg,#2ccfb4,#8e39ed,#c795ff,#8e39ed,#2ccfb4)] before:bg-[length:200%_100%] before:animate-[shimmer-bar_3s_linear_infinite]">
            <div className="flex items-center gap-3 flex-wrap m-0 mb-5">
                <h2 className="m-0 font-['Bebas_Neue',sans-serif] text-[1.5rem] tracking-[0.04em] text-[#f5edff]">Partida Atual</h2>
                {mesaNum != null && (
                    <span className="text-[0.73rem] font-bold text-[#7dd3fc] bg-[rgba(56,189,248,0.1)] border border-[rgba(56,189,248,0.28)] rounded-full px-[0.75rem] py-[0.2rem] tracking-[0.05em] uppercase">
                        Mesa {mesaNum}
                    </span>
                )}
            </div>

            {isBye ? (
                <div className="text-center">
                    <div className="flex flex-col items-center gap-[0.35rem] p-4 px-2 border border-[rgba(142,57,237,0.4)] rounded-[0.85rem] bg-[rgba(142,57,237,0.08)]">
                        <span className="text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[#beafd7]">Você</span>
                        <span className="text-[1.1rem] font-bold text-white text-center break-words">{myName}</span>
                        {myNick && (
                            <span className="text-[0.72rem] text-[#c795ff] font-mono tracking-wide">{myNick}</span>
                        )}
                    </div>
                    <div className="font-['Bebas_Neue',sans-serif] text-[1.8rem] text-[#c795ff] [text-shadow:0_0_12px_rgba(199,149,255,0.4)]">BYE</div>
                    <p className="text-[#beafd7] mt-3">Você recebeu bye nesta rodada.</p>
                    {myMatch.tipoBye && (
                        <span className={`inline-block mt-2 text-[0.75rem] font-bold uppercase tracking-[0.06em] px-[0.6rem] py-[0.15rem] rounded-full border ${myMatch.tipoBye === "penalidade" ? "bg-[rgba(239,68,68,0.12)] border-[rgba(239,68,68,0.35)] text-[#fca5a5]" : "bg-[rgba(34,197,94,0.12)] border-[rgba(34,197,94,0.35)] text-[#86efac]"}`}>
                            {myMatch.tipoBye === "penalidade" ? "Bye por penalidade" : "Bye normal"}
                        </span>
                    )}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 mb-5 max-[900px]:grid-cols-1 max-[900px]:gap-2 max-[900px]:text-center">
                        <div className="flex flex-col items-center gap-[0.35rem] p-4 px-2 border border-[rgba(142,57,237,0.4)] rounded-[0.85rem] bg-[rgba(142,57,237,0.08)]">
                            <span className="text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[#beafd7]">Você</span>
                            <span className="text-[1.1rem] font-bold text-white text-center break-words">{myName}</span>
                            {myNick && (
                                <span className="text-[0.72rem] text-[#c795ff] font-mono tracking-wide">{myNick}</span>
                            )}
                        </div>
                        <div className={isReported && !isContested ? "font-['Bebas_Neue',sans-serif] text-[2.1rem] text-white [text-shadow:0_0_14px_rgba(199,149,255,0.45)] max-[900px]:text-[1.4rem]" : "font-['Bebas_Neue',sans-serif] text-[1.8rem] text-[#c795ff] [text-shadow:0_0_12px_rgba(199,149,255,0.4)] max-[900px]:text-[1.4rem]"}>
                            {isReported && !isContested
                                ? `${myMatch.vitoriasJogador1 ?? "?"} - ${myMatch.vitoriasJogador2 ?? "?"}`
                                : "VS"}
                        </div>
                        <div className="flex flex-col items-center gap-[0.35rem] p-4 px-2 border border-[rgba(239,68,68,0.3)] rounded-[0.85rem] bg-[rgba(239,68,68,0.05)]">
                            <span className="text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[#beafd7]">Oponente</span>
                            <span className="text-[1.1rem] font-bold text-white text-center break-words">{opponentName}</span>
                            {opponentNick && (
                                <span className="text-[0.72rem] text-[#c795ff] font-mono tracking-wide">{opponentNick}</span>
                            )}
                        </div>
                    </div>

                    {isContested ? (
                        <div className="mt-[-0.2rem] mb-[0.8rem] flex flex-col items-center gap-3">
                            <div className="flex items-center gap-2 px-4 py-3 rounded-[0.7rem] border border-[rgba(251,191,36,0.4)] bg-[rgba(251,191,36,0.08)]">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2.5" aria-hidden="true" className="shrink-0">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                <p className="m-0 text-[0.85rem] font-semibold text-[#fde68a]">
                                    Resultado contestado — aguardando revisão do administrador
                                </p>
                            </div>
                        </div>
                    ) : isReported ? (
                        <div className="mt-[-0.2rem] mb-[0.8rem] flex flex-col items-center gap-3">
                            <p className="m-0 text-center text-[0.82rem] font-bold uppercase tracking-[0.06em] text-[#86efac]">
                                Resultado registrado
                            </p>
                            {canContest && (
                                <button
                                    type="button"
                                    className="inline-flex min-h-11 items-center justify-center px-4 py-2 border border-[rgba(251,191,36,0.45)] rounded-[0.7rem] text-[0.9rem] font-semibold cursor-pointer transition-all duration-[220ms] whitespace-nowrap text-[#fde68a] bg-[rgba(251,191,36,0.08)] hover:bg-[rgba(251,191,36,0.16)] hover:border-[rgba(251,191,36,0.7)] disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={() => onContestResult(myMatch.id)}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? "Contestando..." : "Contestar resultado"}
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="text-center">
                            <h3 className="m-0 mb-4 text-[0.95rem] font-semibold text-[#beafd7]">Registrar Resultado</h3>
                            <div className="flex items-center justify-center gap-4 mb-4 max-[900px]:flex-col max-[900px]:gap-3">
                                <div className="flex flex-col items-center gap-2">
                                    <label className="text-[0.78rem] font-semibold text-[#beafd7] max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap">{myName}</label>
                                    <div className="flex items-center gap-[0.25rem]">
                                        <button
                                            type="button"
                                            className="w-9 h-9 border border-[rgba(217,180,255,0.2)] rounded-lg bg-[rgba(255,255,255,0.05)] text-[#f5edff] text-[1.2rem] cursor-pointer flex items-center justify-center transition-all duration-[180ms] hover:bg-[rgba(167,79,255,0.2)] hover:border-[rgba(199,149,255,0.5)]"
                                            onClick={() => setWinsPlayer1(Math.max(0, winsPlayer1 - 1))}
                                        >
                                            −
                                        </button>
                                        <span className="font-['Bebas_Neue',sans-serif] text-[2rem] text-white min-w-[2.5rem] text-center">{winsPlayer1}</span>
                                        <button
                                            type="button"
                                            className="w-9 h-9 border border-[rgba(217,180,255,0.2)] rounded-lg bg-[rgba(255,255,255,0.05)] text-[#f5edff] text-[1.2rem] cursor-pointer flex items-center justify-center transition-all duration-[180ms] hover:bg-[rgba(167,79,255,0.2)] hover:border-[rgba(199,149,255,0.5)]"
                                            onClick={() => setWinsPlayer1(Math.min(2, winsPlayer1 + 1))}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <span className="font-['Bebas_Neue',sans-serif] text-[1.4rem] text-[#beafd7] mt-5 max-[900px]:mt-0">×</span>

                                <div className="flex flex-col items-center gap-2">
                                    <label className="text-[0.78rem] font-semibold text-[#beafd7] max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap">{opponentName}</label>
                                    <div className="flex items-center gap-[0.25rem]">
                                        <button
                                            type="button"
                                            className="w-9 h-9 border border-[rgba(217,180,255,0.2)] rounded-lg bg-[rgba(255,255,255,0.05)] text-[#f5edff] text-[1.2rem] cursor-pointer flex items-center justify-center transition-all duration-[180ms] hover:bg-[rgba(167,79,255,0.2)] hover:border-[rgba(199,149,255,0.5)]"
                                            onClick={() => setWinsPlayer2(Math.max(0, winsPlayer2 - 1))}
                                        >
                                            −
                                        </button>
                                        <span className="font-['Bebas_Neue',sans-serif] text-[2rem] text-white min-w-[2.5rem] text-center">{winsPlayer2}</span>
                                        <button
                                            type="button"
                                            className="w-9 h-9 border border-[rgba(217,180,255,0.2)] rounded-lg bg-[rgba(255,255,255,0.05)] text-[#f5edff] text-[1.2rem] cursor-pointer flex items-center justify-center transition-all duration-[180ms] hover:bg-[rgba(167,79,255,0.2)] hover:border-[rgba(199,149,255,0.5)]"
                                            onClick={() => setWinsPlayer2(Math.min(2, winsPlayer2 + 1))}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                className="inline-flex items-center justify-center w-full py-3 px-4 border border-[rgba(199,149,255,0.5)] rounded-[0.7rem] text-[0.95rem] font-semibold cursor-pointer transition-all duration-[220ms] whitespace-nowrap text-white bg-[linear-gradient(145deg,#8e39ed,#5f23b3)] shadow-[0_4px_12px_rgba(167,79,255,0.25)] disabled:opacity-50 disabled:cursor-not-allowed hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[0_6px_20px_rgba(167,79,255,0.4)]"
                                disabled={actionLoading || (winsPlayer1 === 0 && winsPlayer2 === 0) || (eliminationPhase && isTie) || isInvalidScore}
                                onClick={handleSubmit}
                            >
                                {actionLoading ? "Enviando..." : "Enviar Resultado"}
                            </button>
                            {isInvalidScore && (
                                <p className="mt-2 text-[0.82rem] text-[#fca5a5] text-center">
                                    A soma das vitórias não pode ultrapassar 3.
                                </p>
                            )}
                            {eliminationPhase && isTie && (winsPlayer1 > 0 || winsPlayer2 > 0) && (
                                <p className="mt-2 text-[0.82rem] text-[#fca5a5] text-center">
                                    Empates não são permitidos na fase eliminatória. Um jogador deve vencer a partida.
                                </p>
                            )}
                        </div>
                    )}
                </>
            )}
        </section>
    );
}
