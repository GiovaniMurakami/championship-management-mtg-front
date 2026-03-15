export function OwnerControlPanel({
    torneio,
    standings,
    usuarioId,
    pendingCheckinPlayers,
    onNextRound,
    onDropPlayer,
    actionLoading,
    droppingPlayerId,
}) {
    const normalizeId = (value) => (value === undefined || value === null ? "" : String(value));
    const isOwner = normalizeId(torneio?.donoId) === normalizeId(usuarioId);
    const isOngoing = torneio?.status === "em_andamento";

    if (!isOwner || !isOngoing) {
        return null;
    }

    const jogadoresAtivos = (standings || []).filter((player) => !player?.dropped);
    const pendentesCheckin = pendingCheckinPlayers || [];
    const canStartNextRound = pendentesCheckin.length === 0;
    const isLastRound = Number(torneio?.totalRodadas || 0) > 0
        && Number(torneio?.rodadaAtual || 0) >= Number(torneio?.totalRodadas || 0);

    const getPlayerName = (player) =>
        player?.nome || player?.username || player?.userName || player?.jogadorNome || "Jogador";

    const getPlayerId = (player) =>
        player?.usuarioId || player?.userId || player?.usuario?.id || player?.id;

    return (
        <section className="td-card td-owner-panel">
            <h2 className="td-card-title">Painel do Dono</h2>

            <div className="td-owner-actions">
                {!canStartNextRound && (
                    <p className="td-hint td-owner-warning">
                        Faltam {pendentesCheckin.length} jogador(es) para check-in da próxima rodada.
                    </p>
                )}
                <button
                    className="td-btn td-btn-primary"
                    type="button"
                    onClick={onNextRound}
                    disabled={actionLoading || !canStartNextRound}
                >
                    {actionLoading
                        ? "Processando..."
                        : !canStartNextRound
                            ? "Aguardando check-in de todos"
                            : isLastRound
                                ? "Finalizar Torneio"
                                : "Iniciar Próxima Rodada"}
                </button>
            </div>

            <div className="td-owner-drop-list">
                <h3 className="td-owner-subtitle">Dropar Jogadores</h3>

                {jogadoresAtivos.length === 0 ? (
                    <p className="td-empty-text">Nenhum jogador ativo para drop no momento.</p>
                ) : (
                    <div className="td-owner-player-grid">
                        {jogadoresAtivos.map((player) => {
                            const playerId = getPlayerId(player);
                            const normalizedPlayerId = normalizeId(playerId);

                            return (
                                <div key={normalizedPlayerId || getPlayerName(player)} className="td-owner-player-row">
                                    <div className="td-owner-player-info">
                                        <span className="td-owner-player-name">
                                            {getPlayerName(player)}
                                            {normalizeId(playerId) === normalizeId(usuarioId) ? " (Você)" : ""}
                                        </span>
                                        <span className="td-owner-player-meta">
                                            {player?.pontosMesa ?? player?.pontos ?? 0} pts
                                        </span>
                                    </div>

                                    <button
                                        className="td-btn td-btn-secondary td-btn-danger"
                                        type="button"
                                        onClick={() => onDropPlayer(playerId)}
                                        disabled={actionLoading || !playerId}
                                    >
                                        {droppingPlayerId && normalizeId(droppingPlayerId) === normalizedPlayerId
                                            ? "Dropando..."
                                            : "Drop"}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}