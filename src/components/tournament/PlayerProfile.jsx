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

    const isDeckConfirmed =
        currentPlayer?.deckConfirmado || currentPlayer?.deckNome || currentPlayer?.deck?.nome || false;

    const getDeckName = (player) => {
        if (!player) return "—";
        if (player.deckNome) return player.deckNome;
        if (player.deck?.nome) return player.deck.nome;
        return null;
    };

    const calcTotal = (deck) =>
        deck.maindeck?.reduce((sum, c) => sum + (c.quantidade || 1), 0) || 0;

    const selectedDeck = decks.find((d) => d.id === selectedDeckId);

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
                    <label className="td-label">Deck</label>

                    {isDeckConfirmed && (
                        <p className="td-hint td-hint-success">
                            ✓ Deck confirmado: <strong>{getDeckName(currentPlayer) || "—"}</strong>
                        </p>
                    )}

                    {decks.length === 0 ? (
                        <p className="td-hint">Você não tem decks cadastrados. <a href="/decks" className="td-link">Criar deck</a></p>
                    ) : (
                        <>
                            <div className="td-deck-list">
                                {decks.map((deck) => (
                                    <button
                                        key={deck.id}
                                        type="button"
                                        className={`td-deck-option ${selectedDeckId === deck.id ? "td-deck-option--selected" : ""}`}
                                        onClick={() => onDeckChange(deck.id)}
                                    >
                                        <span className="td-deck-option-name">{deck.nome}</span>
                                        <span className="td-deck-option-meta">
                                            <span className="td-format-badge">{deck.formato}</span>
                                            <span className="td-deck-option-count">{calcTotal(deck)} cartas</span>
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <button
                                className="td-btn td-btn-secondary td-deck-confirm-btn"
                                disabled={!selectedDeckId || actionLoading}
                                onClick={onChooseDeck}
                            >
                                {actionLoading
                                    ? "Salvando..."
                                    : selectedDeck
                                        ? `Confirmar "${selectedDeck.nome}"`
                                        : "Selecione um deck"}
                            </button>
                        </>
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
