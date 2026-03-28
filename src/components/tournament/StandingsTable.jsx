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
        player?.usuario?.nome || player?.nome || player?.username || player?.userName || player?.jogadorNome || "Jogador";

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
            <div className="td-table-wrapper td-desktop-only">
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
                                key={player.usuario?.id || player.usuarioId || player.id || index}
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

            <div className="td-mobile-only td-standings-mobile-list">
                {standings.map((player, index) => {
                    const posicao = player.posicao ?? index + 1;
                    const pontos = player.pontosMesa ?? player.pontos ?? 0;
                    const vitorias = player.vitoriasPartida ?? player.vitorias ?? 0;
                    const derrotas = player.derrotasPartida ?? player.derrotas ?? 0;
                    const empates = player.empatesPartida ?? player.empates ?? 0;

                    return (
                        <article
                            key={player.usuario?.id || player.usuarioId || player.id || index}
                            className={`td-mobile-card ${player.dropped ? "td-mobile-card-dropped" : ""}`}
                        >
                            <div className="td-mobile-card-head">
                                <span className="td-mobile-rank">#{posicao}</span>
                                <span className="td-mobile-player-name">
                                    {getPlayerName(player)}
                                    {player.dropped && <span className="td-dropped-badge"> DROP</span>}
                                </span>
                                <span className="td-mobile-points">{pontos} pts</span>
                            </div>

                            <div className="td-mobile-grid-2">
                                <span><strong>V-D-E:</strong> {vitorias}-{derrotas}-{empates}</span>
                                <span><strong>Check-in:</strong> {isCheckedIn(player) ? "✓" : "—"}</span>
                                <span><strong>Deck:</strong> {getDeckName(player) ? "✓" : "—"}</span>
                                <span><strong>MWP:</strong> {formatPct(player.mwp)}</span>
                                <span><strong>OMW%:</strong> {formatPct(player.omwp)}</span>
                                <span><strong>GW%:</strong> {formatPct(player.gwp)}</span>
                                <span><strong>OGW%:</strong> {formatPct(player.ogwp)}</span>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
