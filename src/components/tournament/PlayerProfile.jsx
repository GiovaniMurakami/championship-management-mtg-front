import { useState } from "react";

const getTotalMembros = (time) =>
  time.totalMembros ?? time.membroIds?.length ?? time.membros?.length ?? 0;

const inputClass =
  "w-full border border-[rgba(217,180,255,0.2)] rounded-[0.7rem] bg-white/[0.03] text-[#f5edff] px-[0.8rem] py-[0.7rem] outline-none transition-[border-color,background-color,box-shadow] duration-200 hover:border-[rgba(199,149,255,0.5)] focus:border-[rgba(199,149,255,0.92)] focus:shadow-[0_0_0_3px_rgba(167,79,255,0.22)] focus:bg-white/[0.05]";

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
  onInscreverTarde,
  actionLoading,
  times,
  selectedTimeId,
  onTimeChange,
}) {
  const canEditDeck = torneio?.status === "inscricoes_abertas";
  const isOngoing = torneio?.status === "em_andamento";
  const isFinished = torneio?.status === "finalizado";

  const isCheckedIn = (currentPlayer?.checkinRodada ?? -1) >= 0;
  const isDeckConfirmed =
    currentPlayer?.deckConfirmado || currentPlayer?.deckNome || currentPlayer?.deck?.nome || false;

  const getDeckName = (player) => {
    if (!player) return "-";
    if (player.deckNome) return player.deckNome;
    if (player.deck?.nome) return player.deck.nome;
    return null;
  };

  const calcTotal = (deck) =>
    deck.maindeck?.reduce((sum, c) => sum + (c.quantidade || 1), 0) || 0;

  const [deckSort, setDeckSort] = useState("recente");

  const sortedDecks = [...decks].sort((a, b) => {
    if (deckSort === "recente") {
      const da = new Date(a.updatedAt || a.criadoEm || a.dataCriacao || 0);
      const db = new Date(b.updatedAt || b.criadoEm || b.dataCriacao || 0);
      return db - da;
    }
    return a.nome.localeCompare(b.nome, "pt-BR");
  });

  const deckOptions = sortedDecks.map((deck) => {
    const isCompatible =
      !torneio?.formato || !deck.formato || deck.formato.toLowerCase() === torneio.formato.toLowerCase();

    return {
      ...deck,
      isCompatible,
      totalCartas: calcTotal(deck),
    };
  });

  const selectedDeck = decks.find((d) => String(d.id) === String(selectedDeckId));
  const selectedDeckIsCompatible =
    !selectedDeck ||
    !torneio?.formato ||
    !selectedDeck.formato ||
    selectedDeck.formato.toLowerCase() === torneio.formato.toLowerCase();

  const displayName =
    currentPlayer?.nome ||
    currentPlayer?.username ||
    currentPlayer?.userName ||
    usuarioNome ||
    "";

  if (!currentPlayer) {
    const isFull = torneio?.maxJogadores != null && (torneio?.totalInscritos ?? 0) >= torneio.maxJogadores;
    const missingNick = !usuario?.nickMTGO;
    const isOpen = torneio?.status === "inscricoes_abertas";
    const isOngoingNow = torneio?.status === "em_andamento";
    const canLateJoin = isOngoingNow && !isFull && onInscreverTarde;

    return (
      <section className="border border-[rgba(217,180,255,0.2)] rounded-2xl p-5 bg-[linear-gradient(160deg,rgba(34,19,69,0.6),rgba(15,10,29,0.85))] shadow-[0_4px_20px_rgba(3,2,8,0.3)] animate-[slide-up_400ms_ease-out]">
        <h2 className="m-0 mb-4 font-['Bebas_Neue',sans-serif] text-[1.5rem] tracking-[0.04em] text-[#f5edff]">Sua Participacao</h2>
        {displayName && <p className="text-[0.8rem] text-[#beafd7] mt-[0.25rem]">Jogador: <strong className="text-[#c795ff]">{displayName}</strong></p>}

        {torneio?.maxJogadores != null && (
          <p className="text-[0.82rem] text-[#beafd7] mt-[0.3rem] mb-1">
            Vagas: <strong className={isFull ? "text-[#f87171]" : "text-[#4ade80]"}>{torneio.totalInscritos ?? 0} / {torneio.maxJogadores}</strong>
            {isFull && <span className="ml-2 text-[#f87171]">- Torneio lotado</span>}
          </p>
        )}

        <p className="text-[#beafd7] text-[0.9rem] m-0 mt-2">Voce ainda nao esta inscrito neste torneio.</p>

        {missingNick && (isOpen || canLateJoin) && (
          <div className="mt-3 px-3 py-[0.6rem] rounded-[0.6rem] bg-[rgba(251,191,36,0.1)] border border-[rgba(251,191,36,0.3)] text-[#fbbf24] text-[0.82rem]">
            Configure seu <strong>nick do MTGO</strong> no perfil para poder se inscrever.
          </div>
        )}

        {isOpen && (
          <button
            className="mt-3 inline-flex items-center justify-center px-4 py-[0.55rem] border border-[rgba(34,197,94,0.5)] rounded-[0.7rem] text-[0.88rem] font-semibold cursor-pointer transition-all duration-[220ms] whitespace-nowrap text-[#4ade80] bg-[rgba(34,197,94,0.15)] disabled:opacity-50 disabled:cursor-not-allowed hover:not-disabled:bg-[rgba(34,197,94,0.3)]"
            onClick={onInscrever}
            disabled={actionLoading || missingNick || isFull}
            title={missingNick ? "Configure seu nick do MTGO no perfil para se inscrever" : isFull ? "Torneio lotado" : undefined}
          >
            {actionLoading ? "Inscrevendo..." : isFull ? "Torneio lotado" : "Inscrever-se"}
          </button>
        )}

        {canLateJoin && (
          <div className="mt-3 flex flex-col gap-3">
            <div className="px-3 py-[0.6rem] rounded-[0.6rem] bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#fca5a5] text-[0.82rem]">
              <strong>Inscricao tardia:</strong> voce recebera um <strong>bye de punicao</strong> na rodada atual, pois o torneio ja esta em andamento.
            </div>
            <button
              className="inline-flex items-center justify-center px-4 py-[0.55rem] border border-[rgba(251,191,36,0.5)] rounded-[0.7rem] text-[0.88rem] font-semibold cursor-pointer transition-all duration-[220ms] whitespace-nowrap text-[#fde68a] bg-[rgba(251,191,36,0.1)] disabled:opacity-50 disabled:cursor-not-allowed hover:not-disabled:bg-[rgba(251,191,36,0.2)]"
              onClick={onInscreverTarde}
              disabled={actionLoading || missingNick}
              title={missingNick ? "Configure seu nick do MTGO no perfil para se inscrever" : undefined}
            >
              {actionLoading ? "Inscrevendo..." : "Inscricao Tardia (receber bye)"}
            </button>
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="border border-[rgba(217,180,255,0.2)] rounded-2xl p-5 bg-[linear-gradient(160deg,rgba(34,19,69,0.6),rgba(15,10,29,0.85))] shadow-[0_4px_20px_rgba(3,2,8,0.3)] animate-[slide-up_400ms_ease-out]">
      <h2 className="m-0 mb-4 font-['Bebas_Neue',sans-serif] text-[1.5rem] tracking-[0.04em] text-[#f5edff]">Sua Participacao</h2>
      {displayName && <p className="text-[0.8rem] text-[#beafd7] mt-[0.25rem]">Jogador: <strong className="text-[#c795ff]">{displayName}</strong></p>}

      <div className="grid gap-4">
        {times && times.length > 0 && (
          <div className="grid gap-[0.35rem]">
            <label className="text-[#beafd7] text-[0.85rem] font-semibold mb-[0.35rem] block">Time</label>
            {currentPlayer?.timeId ? (
              <p className="text-[0.8rem] text-[#7ef2a3] mt-[0.25rem]">
                Time: <strong className="text-[#7ef2a3]">
                  {times.find((t) => String(t.id) === String(currentPlayer.timeId))?.nome || "Time selecionado"}
                </strong>
              </p>
            ) : (
              <div className="flex flex-col gap-[0.35rem] max-h-[150px] overflow-y-auto pr-1">
                {times.map((time) => (
                  <button
                    key={time.id}
                    type="button"
                    className={`flex justify-between items-center gap-2 px-[0.85rem] py-[0.6rem] border rounded-[0.65rem] text-[#f5edff] text-[0.9rem] cursor-pointer text-left transition-[border-color,background] duration-150 w-full ${selectedTimeId === time.id ? "bg-[rgba(199,149,255,0.12)] border-[rgba(199,149,255,0.7)]" : "bg-[rgba(255,255,255,0.03)] border-[rgba(217,180,255,0.2)] hover:bg-[rgba(199,149,255,0.07)] hover:border-[rgba(199,149,255,0.4)]"}`}
                    onClick={() => onTimeChange?.(time.id)}
                    disabled={actionLoading}
                  >
                    <span className="font-semibold overflow-hidden text-ellipsis whitespace-nowrap">{time.nome}</span>
                    <span className="text-[0.7rem] text-[#beafd7] flex-shrink-0">
                      {getTotalMembros(time)} membros
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid gap-[0.35rem]">
          <label className="text-[#beafd7] text-[0.85rem] font-semibold mb-[0.35rem] block">Deck</label>

          {isDeckConfirmed && (
            <p className="text-[0.8rem] text-[#7ef2a3] mt-[0.25rem]">
              Deck confirmado: <strong className="text-[#7ef2a3]">{getDeckName(currentPlayer) || "-"}</strong>
            </p>
          )}

          {!canEditDeck && (
            <>
              <p className="text-[0.8rem] text-[#beafd7] mt-[0.25rem]">
                O torneio ja comecou. Troca de deck esta bloqueada.
              </p>
              <p className="text-[0.8rem] text-[#beafd7] mt-0">
                Seus decks ficam ocultos apos o inicio do torneio.
              </p>
            </>
          )}

          {decks.length === 0 ? (
            <p className="text-[0.8rem] text-[#beafd7] mt-[0.25rem]">Voce nao tem decks cadastrados. <a href="/decks/criar" className="text-[#c795ff] underline">Criar deck</a></p>
          ) : canEditDeck ? (
            <>
              <div className="flex items-center gap-2 mb-[0.35rem]">
                <span className="text-[0.72rem] text-[#beafd7]">Ordenar:</span>
                <select
                  className="text-[0.72rem] bg-[rgba(255,255,255,0.05)] border border-[rgba(217,180,255,0.2)] rounded-[0.4rem] text-[#f5edff] px-[0.4rem] py-[0.15rem] outline-none cursor-pointer"
                  value={deckSort}
                  onChange={(e) => setDeckSort(e.target.value)}
                >
                  <option value="recente">Mais recentes</option>
                  <option value="nome">Nome (A-Z)</option>
                </select>
              </div>

              <select
                className={inputClass}
                value={selectedDeckId || ""}
                onChange={(e) => onDeckChange(e.target.value)}
                disabled={actionLoading}
                aria-label="Selecionar deck"
              >
                <option value="">Selecione um deck</option>
                {deckOptions.map((deck) => (
                  <option key={deck.id} value={deck.id}>
                    {deck.nome}
                    {deck.formato ? ` - ${deck.formato}` : ""}
                    {` - ${deck.totalCartas} cartas`}
                    {!deck.isCompatible ? " - incompatível" : ""}
                  </option>
                ))}
              </select>

              {selectedDeck && (
                <p className="text-[0.78rem] text-[#beafd7] mt-[0.15rem] mb-0">
                  {selectedDeck.formato && (
                    <span className="mr-2">
                      Formato: <strong className="text-[#c795ff]">{selectedDeck.formato}</strong>
                    </span>
                  )}
                  <span>
                    Total: <strong className="text-[#f5edff]">{calcTotal(selectedDeck)} cartas</strong>
                  </span>
                </p>
              )}

              {selectedDeck && !selectedDeckIsCompatible && (
                <p className="text-[0.78rem] text-[#f87171] mt-[0.15rem] mb-0">
                  O deck selecionado e incompatível com o formato do torneio.
                </p>
              )}

              <button
                className="inline-flex items-center justify-center mt-2 w-full px-4 py-[0.55rem] border border-[rgba(217,180,255,0.2)] rounded-[0.7rem] text-[0.88rem] font-semibold cursor-pointer transition-all duration-[220ms] whitespace-nowrap text-[#f5edff] bg-[rgba(255,255,255,0.05)] disabled:opacity-50 disabled:cursor-not-allowed hover:not-disabled:bg-[rgba(255,255,255,0.1)] hover:not-disabled:border-[rgba(199,149,255,0.5)]"
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
          ) : null}
        </div>

        {!isOngoing && (
          <div className="grid gap-[0.35rem]">
            <label className="text-[#beafd7] text-[0.85rem] font-semibold mb-[0.35rem] block">Check-in</label>
            <div className="flex flex-col gap-[0.35rem]">
              <button
                className={`inline-flex items-center justify-center px-4 py-[0.55rem] border rounded-[0.7rem] text-[0.88rem] font-semibold cursor-pointer transition-all duration-[220ms] whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${isCheckedIn ? "bg-[rgba(34,197,94,0.2)] border-[rgba(34,197,94,0.5)] text-[#86efac]" : "bg-[linear-gradient(145deg,#8e39ed,#5f23b3)] border-[rgba(199,149,255,0.5)] text-white shadow-[0_4px_12px_rgba(167,79,255,0.25)] hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[0_6px_20px_rgba(167,79,255,0.4)]"}`}
                disabled={actionLoading || isCheckedIn || isFinished}
                onClick={onCheckin}
              >
                {isFinished
                  ? "Torneio finalizado"
                  : isCheckedIn
                    ? "Check-in feito"
                    : actionLoading
                      ? "Aguarde..."
                      : "Fazer check-in"}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
