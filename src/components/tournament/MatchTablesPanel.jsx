import { useEffect, useMemo, useState } from "react";

export function MatchTablesPanel({ torneio, partidas, usuarioId }) {
    const normalizeId = (value) => (value === undefined || value === null ? "" : String(value));
    const isOngoing = torneio?.status === "em_andamento";
    const isFinished = torneio?.status === "finalizado";

    if (!isOngoing && !isFinished) {
        return null;
    }

    const rodadaAtual = Number(torneio?.rodadaAtual || 0);
    const roundNumbers = useMemo(() => {
        const rounds = (partidas || [])
            .map((partida) => Number(partida?.rodada))
            .filter((rodada) => Number.isFinite(rodada) && rodada > 0);

        return Array.from(new Set(rounds)).sort((a, b) => a - b);
    }, [partidas]);

    const [selectedRound, setSelectedRound] = useState(rodadaAtual || 1);

    useEffect(() => {
        if (isOngoing) {
            setSelectedRound(rodadaAtual || 1);
            return;
        }

        if (isFinished && roundNumbers.length > 0) {
            setSelectedRound(roundNumbers[roundNumbers.length - 1]);
        }
    }, [isOngoing, isFinished, rodadaAtual, roundNumbers]);

    const targetRound = isOngoing ? rodadaAtual : selectedRound;

    const partidasRodada = (partidas || []).filter((partida) => {
        if (!partida) return false;
        if (!targetRound || partida.rodada == null) return true;
        return Number(partida.rodada) === Number(targetRound);
    });

    const getPlayerName = (partida, playerNumber) => {
        const isCurrentUser =
            playerNumber === 1
                ? normalizeId(partida.jogador1Id || partida.jogador1?.id) === normalizeId(usuarioId)
                : normalizeId(partida.jogador2Id || partida.jogador2?.id) === normalizeId(usuarioId);

        if (playerNumber === 1) {
            const nome = (
                partida.jogador1Nome
                || partida.jogador1?.nome
                || partida.jogador1?.username
                || "Jogador 1"
            );

            return `${nome}${isCurrentUser ? " (Você)" : ""}`;
        }

        if (!partida.jogador2Id && !partida.jogador2) {
            return "BYE";
        }

        const nome = (
            partida.jogador2Nome
            || partida.jogador2?.nome
            || partida.jogador2?.username
            || "Jogador 2"
        );

        return `${nome}${isCurrentUser ? " (Você)" : ""}`;
    };

    const getMesaNumero = (partida, index) =>
        partida.mesa
        || partida.mesaNumero
        || partida.numeroMesa
        || index + 1;

    const getStatusLabel = (partida) =>
        partida.status === "finalizada" ? "Finalizada" : "Pendente";

    return (
        <section className="td-card td-mesas-card">
            <div className="td-mesas-header">
                <h2 className="td-card-title">Mesas</h2>

                {isFinished && roundNumbers.length > 0 && (
                    <div className="td-mesas-controls">
                        <span className="td-label">Ver rodada</span>
                        <div className="td-mesas-round-list" role="tablist" aria-label="Selecionar rodada">
                            {roundNumbers.map((rodada) => {
                                const isSelected = Number(selectedRound) === Number(rodada);

                                return (
                                    <button
                                        key={rodada}
                                        type="button"
                                        role="tab"
                                        aria-selected={isSelected}
                                        className={`td-mesas-round-btn${isSelected ? " is-active" : ""}`}
                                        onClick={() => setSelectedRound(rodada)}
                                    >
                                        R{rodada}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {partidasRodada.length === 0 ? (
                <p className="td-empty-text">
                    {isFinished
                        ? "Não há mesas para a rodada selecionada."
                        : "Ainda não há mesas disponíveis para a rodada atual."}
                </p>
            ) : (
                <>
                    <div className="td-table-wrapper td-desktop-only">
                        <table className="td-table td-mesas-table">
                            <thead>
                                <tr>
                                    <th>Mesa</th>
                                    <th>Jogador 1</th>
                                    <th>Resultado</th>
                                    <th>Jogador 2</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {partidasRodada.map((partida, index) => {
                                    const isFinalizada = partida.status === "finalizada";
                                    const scoreText = isFinalizada
                                        ? `${partida.vitoriasJogador1 ?? 0} - ${partida.vitoriasJogador2 ?? 0}`
                                        : "VS";

                                    return (
                                        <tr key={partida.id || `${partida.rodada || "r"}-${index}`}>
                                            <td className="td-mesa-number">Mesa {getMesaNumero(partida, index)}</td>
                                            <td>{getPlayerName(partida, 1)}</td>
                                            <td>
                                                <span className={`td-mesa-score ${isFinalizada ? "td-mesa-score--done" : "td-mesa-score--pending"}`}>
                                                    {scoreText}
                                                </span>
                                            </td>
                                            <td>{getPlayerName(partida, 2)}</td>
                                            <td>
                                                <span className={`td-mesa-status ${isFinalizada ? "td-mesa-status--done" : "td-mesa-status--pending"}`}>
                                                    {getStatusLabel(partida)}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="td-mobile-only td-mesas-mobile-list">
                        {partidasRodada.map((partida, index) => {
                            const isFinalizada = partida.status === "finalizada";
                            const scoreText = isFinalizada
                                ? `${partida.vitoriasJogador1 ?? 0} - ${partida.vitoriasJogador2 ?? 0}`
                                : "VS";

                            return (
                                <article key={partida.id || `mobile-${partida.rodada || "r"}-${index}`} className="td-mobile-card">
                                    <div className="td-mobile-card-head">
                                        <span className="td-mesa-number">Mesa {getMesaNumero(partida, index)}</span>
                                        <span className={`td-mesa-status ${isFinalizada ? "td-mesa-status--done" : "td-mesa-status--pending"}`}>
                                            {getStatusLabel(partida)}
                                        </span>
                                    </div>

                                    <div className="td-mobile-versus-row">
                                        <span className="td-mobile-player-name">{getPlayerName(partida, 1)}</span>
                                        <span className={`td-mesa-score ${isFinalizada ? "td-mesa-score--done" : "td-mesa-score--pending"}`}>
                                            {scoreText}
                                        </span>
                                        <span className="td-mobile-player-name">{getPlayerName(partida, 2)}</span>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </>
            )}
        </section>
    );
}