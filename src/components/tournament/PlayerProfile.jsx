export function PlayerProfile({
    currentPlayer,
    decks,
    selectedDeckId,
    onDeckChange,
    onChooseDeck,
    onCheckin,
    onInscrever,
    actionLoading,
}) {
    const isCheckedIn =
        currentPlayer?.checkIn || currentPlayer?.checkin || currentPlayer?.checkedIn || currentPlayer?.presenca || false;

    const getDeckName = (player) => {
        if (!player) return "—";
        if (player.deckNome) return player.deckNome;
        if (player.deck?.nome) return player.deck.nome;
        return "Nenhum";
    };

    // Not registered yet
    if (!currentPlayer) {
        return (
            <section className="td-card td-profile-card">
                <h2 className="td-card-title">Sua Participação</h2>
                <p className="td-empty-text">Você ainda não está inscrito neste torneio.</p>
                <button
                    className="td-btn td-btn-accent"
                    onClick={onInscrever}
                    disabled={actionLoading}
                >
                    {actionLoading ? "Inscrevendo..." : "Inscrever-se"}
                </button>
            </section>
        );
    }

    return (
        <section className="td-card td-profile-card">
            <h2 className="td-card-title">Sua Participação</h2>

            <div className="td-profile-grid">
                {/* Deck selection */}
                <div className="td-profile-field">
                    <label className="td-label" htmlFor="deck-select">Deck</label>
                    <div className="td-inline-row">
                        <select
                            id="deck-select"
                            className="td-select"
                            value={selectedDeckId}
                            onChange={(e) => onDeckChange(e.target.value)}
                        >
                            <option value="">Selecionar deck...</option>
                            {decks.map((deck) => (
                                <option key={deck.id} value={deck.id}>
                                    {deck.nome}
                                </option>
                            ))}
                        </select>
                        <button
                            className="td-btn td-btn-secondary"
                            disabled={!selectedDeckId || actionLoading}
                            onClick={onChooseDeck}
                        >
                            {actionLoading ? "Salvando..." : "Salvar"}
                        </button>
                    </div>
                    {currentPlayer && (
                        <span className="td-hint">
                            Deck atual: <strong>{getDeckName(currentPlayer)}</strong>
                        </span>
                    )}
                </div>

                {/* Check-in */}
                <div className="td-profile-field">
                    <label className="td-label">Check-in</label>
                    <div className="td-inline-row">
                        <button
                            className={`td-btn ${isCheckedIn ? "td-btn-success" : "td-btn-primary"}`}
                            disabled={actionLoading || isCheckedIn}
                            onClick={onCheckin}
                        >
                            {isCheckedIn ? "✓ Check-in feito" : actionLoading ? "Aguarde..." : "Fazer check-in"}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
