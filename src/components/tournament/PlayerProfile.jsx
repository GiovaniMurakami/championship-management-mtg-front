export function PlayerProfile({
    torneio,
    usuarioNome,
    currentPlayer,
    decks,
    selectedDeckId,
    onDeckChange,
    onChooseDeck,
    onCheckin,
    onInscrever,
    actionLoading,
}) {
    const canEditDeck = torneio?.status === "inscricoes_abertas";
    const isOngoing = torneio?.status === "em_andamento";
    const isFinished = torneio?.status === "finalizado";

    const isCheckedIn =
        currentPlayer?.checkIn || currentPlayer?.checkin || currentPlayer?.checkedIn || currentPlayer?.presenca || false;

    const isCheckedInNextRound =
        currentPlayer?.checkInProximaRodada
        || currentPlayer?.checkinProximaRodada
        || currentPlayer?.nextRoundCheckin
        || false;

    const checkinDone = isOngoing ? isCheckedInNextRound : isCheckedIn;

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
    const displayName =
        currentPlayer?.nome
        || currentPlayer?.username
        || currentPlayer?.userName
        || usuarioNome
        || "";

    // Not registered yet
    if (!currentPlayer) {
        return (
            <section className="td-card td-profile-card">
                <h2 className="td-card-title">Sua Participação</h2>
                {displayName && <p className="td-hint">Jogador: <strong>{displayName}</strong></p>}
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
            {displayName && <p className="td-hint">Jogador: <strong>{displayName}</strong></p>}

            <div className="td-profile-grid">
                {/* Deck selection */}
                <div className="td-profile-field">
                    <label className="td-label">Deck</label>

                    {isDeckConfirmed && (
                        <p className="td-hint td-hint-success">
                            ✓ Deck confirmado: <strong>{getDeckName(currentPlayer) || "—"}</strong>
                        </p>
                    )}

                    {!canEditDeck && (
                        <p className="td-hint">
                            O torneio já começou. Troca de deck está bloqueada.
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
                                        disabled={!canEditDeck || actionLoading}
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
                                disabled={!canEditDeck || !selectedDeckId || actionLoading}
                                onClick={onChooseDeck}
                            >
                                {actionLoading
                                    ? "Salvando..."
                                    : !canEditDeck
                                        ? "Troca de deck bloqueada"
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
                            className={`td-btn ${checkinDone ? "td-btn-success" : "td-btn-primary"}`}
                            disabled={actionLoading || checkinDone || isFinished}
                            onClick={onCheckin}
                        >
                            {isFinished
                                ? "Torneio finalizado"
                                : checkinDone
                                    ? isOngoing
                                        ? "✓ Check-in da próxima rodada feito"
                                        : "✓ Check-in feito"
                                    : actionLoading
                                        ? "Aguarde..."
                                        : isOngoing
                                            ? "Fazer check-in da próxima rodada"
                                            : "Fazer check-in"}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
