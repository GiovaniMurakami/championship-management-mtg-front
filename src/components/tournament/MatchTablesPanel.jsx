import { useMemo, useState } from "react";

const normalizeId = (v) => (v === undefined || v === null ? "" : String(v));

function getPlayerName(partida, playerNumber, usuarioId) {
    const isMe =
        playerNumber === 1
            ? normalizeId(partida.jogador1Id || partida.jogador1?.id) === normalizeId(usuarioId)
            : normalizeId(partida.jogador2Id || partida.jogador2?.id) === normalizeId(usuarioId);

    if (playerNumber === 2 && !partida.jogador2Id && !partida.jogador2) return "BYE";

    const nome =
        playerNumber === 1
            ? partida.jogador1Nome || partida.jogador1?.nome || partida.jogador1?.username || "Jogador 1"
            : partida.jogador2Nome || partida.jogador2?.nome || partida.jogador2?.username || "Jogador 2";

    return { nome, isMe };
}

function getMesa(partida, index) {
    return partida.mesa ?? partida.mesaNumero ?? partida.numeroMesa ?? index + 1;
}

function isUserMatch(partida, usuarioId) {
    if (!usuarioId) return false;
    const uid = normalizeId(usuarioId);
    return (
        normalizeId(partida.jogador1Id || partida.jogador1?.id) === uid ||
        normalizeId(partida.jogador2Id || partida.jogador2?.id) === uid
    );
}

function canContestMatch(partida, torneio, usuarioId, isOwner) {
    if (!partida || partida.status !== "finalizada") return false;
    if (torneio?.status !== "em_andamento") return false;
    if (!partida.jogador2Id && !partida.jogador2) return false;
    if (Number(torneio?.rodadaAtual || 0) > Number(partida?.rodada || 0)) return false;
    return isOwner || isUserMatch(partida, usuarioId);
}

function MatchCard({ partida, index, usuarioId, torneio, isOwner, onContestResult, actionLoading }) {
    const isFinalizada = partida.status === "finalizada";
    const isBye = !partida.jogador2Id && !partida.jogador2;
    const isMe = isUserMatch(partida, usuarioId);
    const showContestButton = canContestMatch(partida, torneio, usuarioId, isOwner);

    const p1 = getPlayerName(partida, 1, usuarioId);
    const p2 = isBye ? { nome: "BYE", isMe: false } : getPlayerName(partida, 2, usuarioId);

    const score = isFinalizada
        ? `${partida.vitoriasJogador1 ?? 0} – ${partida.vitoriasJogador2 ?? 0}`
        : "VS";

    return (
        <article className={`rounded-[10px] px-[0.85rem] pt-[0.7rem] pb-[0.8rem] transition-[border-color,background] duration-200 ${isMe ? "border border-[rgba(167,79,255,0.5)] bg-[rgba(167,79,255,0.07)] hover:border-[rgba(167,79,255,0.7)] hover:bg-[rgba(167,79,255,0.1)]" : "border border-[rgba(56,189,248,0.15)] bg-[rgba(255,255,255,0.03)] hover:border-[rgba(56,189,248,0.3)] hover:bg-[rgba(56,189,248,0.04)]"} ${isFinalizada ? "opacity-[0.82]" : ""}`}>
            <div className="flex items-center justify-between mb-[0.55rem]">
                <span className="text-[0.72rem] font-bold text-[#7dd3fc] tracking-[0.04em] uppercase">Mesa {getMesa(partida, index)}</span>
                <span className={`text-[0.68rem] font-bold tracking-[0.05em] uppercase px-2 py-[0.15rem] rounded-full ${isFinalizada ? "bg-[rgba(34,197,94,0.12)] border border-[rgba(34,197,94,0.35)] text-[#86efac]" : "bg-[rgba(250,204,21,0.12)] border border-[rgba(250,204,21,0.35)] text-[#fde047]"}`}>
                    {isFinalizada ? "Finalizada" : "Pendente"}
                </span>
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-[0.4rem]">
                <div className={`flex flex-col gap-[0.15rem] min-w-0 items-start ${p1.isMe ? "[&_.mtp-player-name]:text-[#c4b5fd]" : ""}`}>
                    <span className={`text-[0.86rem] font-semibold overflow-hidden text-ellipsis whitespace-nowrap max-w-full ${p1.isMe ? "text-[#c4b5fd]" : "text-[#e2e8f0]"}`}>{p1.nome}</span>
                    {p1.isMe && <span className="text-[0.65rem] font-bold text-[#a78bfa] bg-[rgba(167,79,255,0.15)] border border-[rgba(167,79,255,0.3)] rounded-full px-[0.4rem] py-[0.05rem] tracking-[0.03em] uppercase">Você</span>}
                </div>

                <span className={`text-[0.88rem] font-extrabold tracking-[0.04em] text-center px-2 py-[0.2rem] rounded-[6px] flex-shrink-0 ${isFinalizada ? "text-white bg-[rgba(56,189,248,0.15)] border border-[rgba(56,189,248,0.3)]" : "text-[rgba(199,149,255,0.7)] bg-[rgba(167,79,255,0.1)] border border-[rgba(167,79,255,0.2)]"}`}>
                    {score}
                </span>

                <div className={`flex flex-col gap-[0.15rem] min-w-0 items-end text-right ${p2.isMe ? "" : ""} ${isBye ? "" : ""}`}>
                    {p2.isMe && <span className="text-[0.65rem] font-bold text-[#a78bfa] bg-[rgba(167,79,255,0.15)] border border-[rgba(167,79,255,0.3)] rounded-full px-[0.4rem] py-[0.05rem] tracking-[0.03em] uppercase">Você</span>}
                    <span className={`text-[0.86rem] font-semibold overflow-hidden text-ellipsis whitespace-nowrap max-w-full ${p2.isMe ? "text-[#c4b5fd]" : isBye ? "text-[rgba(226,232,240,0.4)] italic" : "text-[#e2e8f0]"}`}>{p2.nome}</span>
                </div>
            </div>

            {showContestButton && (
                <button
                    type="button"
                    className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-[0.7rem] border border-[rgba(251,191,36,0.4)] bg-[rgba(251,191,36,0.08)] px-4 py-2 text-[0.88rem] font-semibold text-[#fde68a] cursor-pointer transition-all duration-150 hover:bg-[rgba(251,191,36,0.16)] hover:border-[rgba(251,191,36,0.7)] disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => onContestResult(partida.id)}
                    disabled={actionLoading}
                >
                    {actionLoading ? "Contestando..." : "Contestar resultado"}
                </button>
            )}
        </article>
    );
}

export function MatchTablesPanel({ torneio, partidas, usuarioId, isOwner, onContestResult, actionLoading }) {
    const isOngoing = torneio?.status === "em_andamento";
    const isFinished = torneio?.status === "finalizado";

    const rodadaAtual = Number(torneio?.rodadaAtual || 0);

    const roundNumbers = useMemo(() => {
        const rounds = (partidas || [])
            .map((p) => Number(p?.rodada))
            .filter((r) => Number.isFinite(r) && r > 0);
        return Array.from(new Set(rounds)).sort((a, b) => a - b);
    }, [partidas]);

    const defaultRound = isFinished
        ? roundNumbers[roundNumbers.length - 1] ?? 1
        : rodadaAtual || 1;

    const [selectedRoundOverride, setSelectedRoundOverride] = useState(null);

    const selectedRound = useMemo(() => {
        const normalizedOverride = Number(selectedRoundOverride);
        if (Number.isFinite(normalizedOverride) && roundNumbers.includes(normalizedOverride)) {
            return normalizedOverride;
        }
        return defaultRound;
    }, [defaultRound, roundNumbers, selectedRoundOverride]);

    const partidasRodada = useMemo(() =>
        (partidas || []).filter((p) => {
            if (!p) return false;
            if (!selectedRound || p.rodada == null) return true;
            return Number(p.rodada) === Number(selectedRound);
        }),
        [partidas, selectedRound]
    );

    const finalizadas = partidasRodada.filter((p) => p.status === "finalizada").length;
    const total = partidasRodada.length;
    const progressPct = total > 0 ? Math.round((finalizadas / total) * 100) : 0;
    const allDone = total > 0 && finalizadas === total;

    const showRoundPicker = roundNumbers.length > 1;

    if (!isOngoing && !isFinished) return null;

    return (
        <section className="border border-[rgba(56,189,248,0.3)] rounded-2xl p-5 bg-[linear-gradient(160deg,rgba(7,37,49,0.6),rgba(8,20,34,0.9))] shadow-[0_4px_20px_rgba(3,2,8,0.3)] animate-[slide-up_400ms_ease-out] max-[480px]:p-4 max-[480px]:rounded-xl">

            <div className="flex items-center justify-between gap-3 flex-wrap mb-[0.9rem] max-[480px]:flex-col max-[480px]:items-start">
                <div className="flex items-center gap-[0.65rem] flex-wrap">
                    <h2 className="m-0 font-['Bebas_Neue',sans-serif] text-[1.5rem] tracking-[0.04em] text-[#f5edff]">Mesas</h2>
                    {isOngoing && (
                        <span className="text-[0.75rem] font-semibold text-[#7dd3fc] bg-[rgba(56,189,248,0.1)] border border-[rgba(56,189,248,0.25)] rounded-full px-[0.65rem] py-[0.2rem]">
                            Rodada {torneio?.rodadaAtual} / {torneio?.totalRodadas}
                        </span>
                    )}
                </div>

                {showRoundPicker && (
                    <div className="flex items-center gap-[0.3rem] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex-shrink-0" role="tablist" aria-label="Selecionar rodada">
                        {roundNumbers.map((r) => (
                            <button
                                key={r}
                                type="button"
                                role="tab"
                                aria-selected={Number(selectedRound) === r}
                                className={`border rounded-full px-[0.6rem] py-[0.25rem] min-w-[2.2rem] text-[0.75rem] font-bold cursor-pointer transition-all duration-150 flex-shrink-0 ${Number(selectedRound) === r ? "bg-[rgba(56,189,248,0.22)] border-[rgba(56,189,248,0.7)] text-white" : "border-[rgba(125,211,252,0.3)] bg-[rgba(125,211,252,0.06)] text-[#93c5fd] hover:bg-[rgba(125,211,252,0.16)] hover:border-[rgba(125,211,252,0.5)] hover:text-[#bae6fd]"}`}
                                onClick={() => setSelectedRoundOverride(r)}
                            >
                                R{r}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {total > 0 && (
                <div className="flex items-center gap-[0.65rem] mb-4">
                    <div className="flex-1 h-1 bg-[rgba(255,255,255,0.08)] rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-[width] duration-[0.4s] ease-in-out ${allDone ? "bg-[#4ade80]" : "bg-[#38bdf8]"}`}
                            style={{ width: `${progressPct}%` }}
                        />
                    </div>
                    <span className="text-[0.75rem] font-semibold text-[rgba(186,230,253,0.7)] whitespace-nowrap flex-shrink-0">
                        {finalizadas}/{total} finalizada{finalizadas !== 1 ? "s" : ""}
                    </span>
                </div>
            )}

            {total === 0 ? (
                <p className="text-[#beafd7] text-[0.9rem] m-0">
                    {isFinished
                        ? "Nenhuma mesa para a rodada selecionada."
                        : "Ainda não há mesas para a rodada atual."}
                </p>
            ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-[0.65rem] max-[900px]:grid-cols-1">
                    {partidasRodada.map((partida, index) => (
                        <MatchCard
                            key={partida.id || `${partida.rodada}-${index}`}
                            partida={partida}
                            index={index}
                            usuarioId={usuarioId}
                            torneio={torneio}
                            isOwner={isOwner}
                            onContestResult={onContestResult}
                            actionLoading={actionLoading}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
