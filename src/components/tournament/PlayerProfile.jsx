import { shouldRequestNextRoundCheckin } from "../../utils/tournamentFlow";

export function PlayerProfile({
    torneio,
    usuario,
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
    const requiresNextRoundCheckin = shouldRequestNextRoundCheckin(torneio);

    const isCheckedIn =
        currentPlayer?.checkIn || currentPlayer?.checkin || currentPlayer?.checkedIn || currentPlayer?.presenca || false;

    const isCheckedInNextRound =
        currentPlayer?.checkInProximaRodada
        || currentPlayer?.checkinProximaRodada
        || currentPlayer?.nextRoundCheckin
        || false;

    const checkinDone = isOngoing && requiresNextRoundCheckin ? isCheckedInNextRound : isCheckedIn;

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

    if (!currentPlayer) {
        const isFull = torneio?.maxJogadores != null && (torneio?.totalInscritos ?? 0) >= torneio.maxJogadores;
        const missingNick = !usuario?.nickMTGO;
        const isOpen = torneio?.status === "inscricoes_abertas";

        return (
            <section className="border border-[rgba(217,180,255,0.2)] rounded-2xl p-5 bg-[linear-gradient(160deg,rgba(34,19,69,0.6),rgba(15,10,29,0.85))] shadow-[0_4px_20px_rgba(3,2,8,0.3)] animate-[slide-up_400ms_ease-out]">
                <h2 className="m-0 mb-4 font-['Bebas_Neue',sans-serif] text-[1.5rem] tracking-[0.04em] text-[#f5edff]">Sua Participação</h2>
                {displayName && <p className="text-[0.8rem] text-[#beafd7] mt-[0.25rem]">Jogador: <strong className="text-[#c795ff]">{displayName}</strong></p>}

                {torneio?.maxJogadores != null && (
                    <p className="text-[0.82rem] text-[#beafd7] mt-[0.3rem] mb-1">
                        Vagas: <strong className={isFull ? "text-[#f87171]" : "text-[#4ade80]"}>{torneio.totalInscritos ?? 0} / {torneio.maxJogadores}</strong>
                        {isFull && <span className="ml-2 text-[#f87171]">— Torneio lotado</span>}
                    </p>
                )}

                <p className="text-[#beafd7] text-[0.9rem] m-0 mt-2">Você ainda não está inscrito neste torneio.</p>

                {missingNick && isOpen && (
                    <div className="mt-3 px-3 py-[0.6rem] rounded-[0.6rem] bg-[rgba(251,191,36,0.1)] border border-[rgba(251,191,36,0.3)] text-[#fbbf24] text-[0.82rem]">
                        ⚠ Configure seu <strong>nick do MTGO</strong> no perfil (menu superior → seu nome) para poder se inscrever.
                    </div>
                )}

                <button
                    className="mt-3 inline-flex items-center justify-center px-4 py-[0.55rem] border border-[rgba(34,197,94,0.5)] rounded-[0.7rem] text-[0.88rem] font-semibold cursor-pointer transition-all duration-[220ms] whitespace-nowrap text-[#4ade80] bg-[rgba(34,197,94,0.15)] disabled:opacity-50 disabled:cursor-not-allowed hover:not-disabled:bg-[rgba(34,197,94,0.3)]"
                    onClick={onInscrever}
                    disabled={actionLoading || missingNick || isFull || !isOpen}
                    title={missingNick ? "Configure seu nick do MTGO no perfil para se inscrever" : isFull ? "Torneio lotado" : undefined}
                >
                    {actionLoading ? "Inscrevendo..." : isFull ? "Torneio lotado" : "Inscrever-se"}
                </button>
            </section>
        );
    }

    return (
        <section className="border border-[rgba(217,180,255,0.2)] rounded-2xl p-5 bg-[linear-gradient(160deg,rgba(34,19,69,0.6),rgba(15,10,29,0.85))] shadow-[0_4px_20px_rgba(3,2,8,0.3)] animate-[slide-up_400ms_ease-out]">
            <h2 className="m-0 mb-4 font-['Bebas_Neue',sans-serif] text-[1.5rem] tracking-[0.04em] text-[#f5edff]">Sua Participação</h2>
            {displayName && <p className="text-[0.8rem] text-[#beafd7] mt-[0.25rem]">Jogador: <strong className="text-[#c795ff]">{displayName}</strong></p>}

            <div className="grid gap-4">
                <div className="grid gap-[0.35rem]">
                    <label className="text-[#beafd7] text-[0.85rem] font-semibold mb-[0.35rem] block">Deck</label>

                    {isDeckConfirmed && (
                        <p className="text-[0.8rem] text-[#7ef2a3] mt-[0.25rem]">
                            ✓ Deck confirmado: <strong className="text-[#7ef2a3]">{getDeckName(currentPlayer) || "—"}</strong>
                        </p>
                    )}

                    {!canEditDeck && (
                        <p className="text-[0.8rem] text-[#beafd7] mt-[0.25rem]">
                            O torneio já começou. Troca de deck está bloqueada.
                        </p>
                    )}

                    {decks.length === 0 ? (
                        <p className="text-[0.8rem] text-[#beafd7] mt-[0.25rem]">Você não tem decks cadastrados. <a href="/decks" className="text-[#c795ff] underline">Criar deck</a></p>
                    ) : (
                        <>
                            <div className="flex flex-col gap-[0.4rem] max-h-[220px] overflow-y-auto pr-1">
                                {decks.map((deck) => (
                                    <button
                                        key={deck.id}
                                        type="button"
                                        className={`flex justify-between items-center gap-2 px-[0.85rem] py-[0.6rem] border rounded-[0.65rem] text-[#f5edff] text-[0.9rem] cursor-pointer text-left transition-[border-color,background] duration-150 w-full ${selectedDeckId === deck.id ? "bg-[rgba(199,149,255,0.12)] border-[rgba(199,149,255,0.7)]" : "bg-[rgba(255,255,255,0.03)] border-[rgba(217,180,255,0.2)] hover:bg-[rgba(199,149,255,0.07)] hover:border-[rgba(199,149,255,0.4)]"}`}
                                        onClick={() => onDeckChange(deck.id)}
                                        disabled={!canEditDeck || actionLoading}
                                    >
                                        <span className="font-semibold overflow-hidden text-ellipsis whitespace-nowrap">{deck.nome}</span>
                                        <span className="flex items-center gap-2 flex-shrink-0">
                                            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.04em] px-[0.45rem] py-[0.15rem] rounded-[0.4rem] bg-[rgba(199,149,255,0.15)] text-[#c795ff]">{deck.formato}</span>
                                            <span className="text-[0.78rem] text-[#beafd7] whitespace-nowrap">{calcTotal(deck)} cartas</span>
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <button
                                className="inline-flex items-center justify-center mt-2 w-full px-4 py-[0.55rem] border border-[rgba(217,180,255,0.2)] rounded-[0.7rem] text-[0.88rem] font-semibold cursor-pointer transition-all duration-[220ms] whitespace-nowrap text-[#f5edff] bg-[rgba(255,255,255,0.05)] disabled:opacity-50 disabled:cursor-not-allowed hover:not-disabled:bg-[rgba(255,255,255,0.1)] hover:not-disabled:border-[rgba(199,149,255,0.5)]"
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

                {(!isOngoing || requiresNextRoundCheckin) && (
                    <div className="grid gap-[0.35rem]">
                        <label className="text-[#beafd7] text-[0.85rem] font-semibold mb-[0.35rem] block">Check-in</label>
                        <div className="flex gap-2 items-center">
                            <button
                                className={`inline-flex items-center justify-center px-4 py-[0.55rem] border rounded-[0.7rem] text-[0.88rem] font-semibold cursor-pointer transition-all duration-[220ms] whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${checkinDone ? "bg-[rgba(34,197,94,0.2)] border-[rgba(34,197,94,0.5)] text-[#86efac]" : "bg-[linear-gradient(145deg,#8e39ed,#5f23b3)] border-[rgba(199,149,255,0.5)] text-white shadow-[0_4px_12px_rgba(167,79,255,0.25)] hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[0_6px_20px_rgba(167,79,255,0.4)]"}`}
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
                )}
            </div>
        </section>
    );
}
