import { useEffect, useMemo, useState } from "react";

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

function MatchCard({ partida, index, usuarioId }) {
    const isFinalizada = partida.status === "finalizada";
    const isBye = !partida.jogador2Id && !partida.jogador2;
    const isMe = isUserMatch(partida, usuarioId);

    const p1 = getPlayerName(partida, 1, usuarioId);
    const p2 = isBye ? { nome: "BYE", isMe: false } : getPlayerName(partida, 2, usuarioId);

    const score = isFinalizada
        ? `${partida.vitoriasJogador1 ?? 0} – ${partida.vitoriasJogador2 ?? 0}`
        : "VS";

    return (
        <article className={`mtp-card${isMe ? " mtp-card--mine" : ""}${isFinalizada ? " mtp-card--done" : ""}`}>
            <div className="mtp-card-head">
                <span className="mtp-mesa-label">Mesa {getMesa(partida, index)}</span>
                <span className={`mtp-status-badge ${isFinalizada ? "mtp-status--done" : "mtp-status--pending"}`}>
                    {isFinalizada ? "Finalizada" : "Pendente"}
                </span>
            </div>

            <div className="mtp-matchup">
                <div className={`mtp-player mtp-player--left${p1.isMe ? " mtp-player--me" : ""}`}>
                    <span className="mtp-player-name">{p1.nome}</span>
                    {p1.isMe && <span className="mtp-you-tag">Você</span>}
                </div>

                <span className={`mtp-score ${isFinalizada ? "mtp-score--done" : "mtp-score--vs"}`}>
                    {score}
                </span>

                <div className={`mtp-player mtp-player--right${p2.isMe ? " mtp-player--me" : ""}${isBye ? " mtp-player--bye" : ""}`}>
                    {p2.isMe && <span className="mtp-you-tag">Você</span>}
                    <span className="mtp-player-name">{p2.nome}</span>
                </div>
            </div>
        </article>
    );
}

export function MatchTablesPanel({ torneio, partidas, usuarioId }) {
    const isOngoing = torneio?.status === "em_andamento";
    const isFinished = torneio?.status === "finalizado";

    if (!isOngoing && !isFinished) return null;

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

    const [selectedRound, setSelectedRound] = useState(defaultRound);

    useEffect(() => {
        if (isOngoing) setSelectedRound(rodadaAtual || 1);
        else if (isFinished && roundNumbers.length > 0)
            setSelectedRound(roundNumbers[roundNumbers.length - 1]);
    }, [isOngoing, isFinished, rodadaAtual, roundNumbers]);

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

    return (
        <section className="td-card mtp-panel">

            {/* Header */}
            <div className="mtp-header">
                <div className="mtp-header-left">
                    <h2 className="td-card-title">Mesas</h2>
                    {isOngoing && (
                        <span className="mtp-rodada-badge">
                            Rodada {torneio?.rodadaAtual} / {torneio?.totalRodadas}
                        </span>
                    )}
                </div>

                {showRoundPicker && (
                    <div className="mtp-round-picker" role="tablist" aria-label="Selecionar rodada">
                        {roundNumbers.map((r) => (
                            <button
                                key={r}
                                type="button"
                                role="tab"
                                aria-selected={Number(selectedRound) === r}
                                className={`mtp-round-btn${Number(selectedRound) === r ? " is-active" : ""}`}
                                onClick={() => setSelectedRound(r)}
                            >
                                R{r}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Progress bar */}
            {total > 0 && (
                <div className="mtp-progress-row">
                    <div className="mtp-progress-bar">
                        <div
                            className={`mtp-progress-fill ${allDone ? "mtp-progress-fill--done" : ""}`}
                            style={{ width: `${progressPct}%` }}
                        />
                    </div>
                    <span className="mtp-progress-label">
                        {finalizadas}/{total} finalizada{finalizadas !== 1 ? "s" : ""}
                    </span>
                </div>
            )}

            {/* Cards */}
            {total === 0 ? (
                <p className="td-empty-text">
                    {isFinished
                        ? "Nenhuma mesa para a rodada selecionada."
                        : "Ainda não há mesas para a rodada atual."}
                </p>
            ) : (
                <div className="mtp-grid">
                    {partidasRodada.map((partida, index) => (
                        <MatchCard
                            key={partida.id || `${partida.rodada}-${index}`}
                            partida={partida}
                            index={index}
                            usuarioId={usuarioId}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
