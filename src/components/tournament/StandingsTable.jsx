export function StandingsTable({ standings }) {
    if (!standings || standings.length === 0) {
        return (
            <section className="td-card">
                <h2 className="td-card-title">Standings</h2>
                <p className="td-empty-text">Nenhum dado de standings disponível.</p>
            </section>
        );
    }

    const getPlayerName = (player) =>
        player?.nome || player?.username || player?.userName || player?.jogadorNome || "Jogador";

    const getDeckName = (player) => {
        if (player?.deckConfirmado) return "✓";
        if (player?.deckNome) return player.deckNome;
        if (player?.deck?.nome) return player.deck.nome;
        return null;
    };

    const isCheckedIn = (player) =>
        player?.checkIn || player?.checkin || player?.checkedIn || player?.presenca || false;

    const formatPct = (val) =>
        val != null ? `${(val * 100).toFixed(1)}%` : "—";

    return (
        <section className="td-card">
            <h2 className="td-card-title">Standings</h2>
            <div className="td-table-wrapper">
                <table className="td-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Jogador</th>
                            <th>Pts</th>
                            <th>V</th>
                            <th>D</th>
                            <th>E</th>
                            <th>MWP</th>
                            <th>OMW%</th>
                            <th>GW%</th>
                            <th>OGW%</th>
                            <th>Deck</th>
                            <th>Check-in</th>
                        </tr>
                    </thead>
                    <tbody>
                        {standings.map((player, index) => (
                            <tr
                                key={player.usuarioId || player.id || index}
                                className={player.dropped ? "td-row-dropped" : ""}
                            >
                                <td className="td-rank">{player.posicao ?? index + 1}</td>
                                <td className="td-player-name">
                                    {getPlayerName(player)}
                                    {player.dropped && <span className="td-dropped-badge"> DROP</span>}
                                </td>
                                <td>{player.pontosMesa ?? player.pontos ?? 0}</td>
                                <td>{player.vitoriasPartida ?? player.vitorias ?? 0}</td>
                                <td>{player.derrotasPartida ?? player.derrotas ?? 0}</td>
                                <td>{player.empatesPartida ?? player.empates ?? 0}</td>
                                <td>{formatPct(player.mwp)}</td>
                                <td>{formatPct(player.omwp)}</td>
                                <td>{formatPct(player.gwp)}</td>
                                <td>{formatPct(player.ogwp)}</td>
                                <td className="td-deck-name">
                                    <span className={`td-checkin-dot ${getDeckName(player) ? "td-checked" : ""}`}>
                                        {getDeckName(player) ? "✓" : "—"}
                                    </span>
                                </td>
                                <td>
                                    <span className={`td-checkin-dot ${isCheckedIn(player) ? "td-checked" : ""}`}>
                                        {isCheckedIn(player) ? "✓" : "—"}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
