import { useState } from "react";
import { SelectField } from "../ui";

const getTotalMembros = (time) =>
  time.totalMembros ?? time.membroIds?.length ?? time.membros?.length ?? 0;

const fieldClass =
  "w-full border border-[rgba(217,180,255,0.22)] rounded-[0.75rem] bg-white/[0.04] text-[#f5edff] px-3 py-[0.7rem] outline-none transition-[border-color,background-color,box-shadow] duration-200 hover:border-[rgba(199,149,255,0.5)] focus:border-[rgba(199,149,255,0.92)] focus:shadow-[0_0_0_3px_rgba(167,79,255,0.22)] focus:bg-white/[0.06]";

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-[0.75rem] px-4 py-[0.65rem] text-[0.9rem] font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

function StatusPill({ tone = "neutral", children }) {
  const tones = {
    success: "border-[rgba(74,222,128,0.42)] bg-[rgba(34,197,94,0.14)] text-[#86efac]",
    warning: "border-[rgba(251,191,36,0.42)] bg-[rgba(251,191,36,0.12)] text-[#fde68a]",
    danger: "border-[rgba(248,113,113,0.45)] bg-[rgba(239,68,68,0.12)] text-[#fca5a5]",
    neutral: "border-[rgba(217,180,255,0.22)] bg-white/[0.05] text-[#d8c7ff]",
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[0.72rem] font-bold uppercase tracking-[0.08em] ${tones[tone]}`}>
      {children}
    </span>
  );
}

function SectionBlock({ title, aside, children }) {
  return (
    <div className="rounded-[0.9rem] border border-[rgba(217,180,255,0.16)] bg-black/[0.14] p-3.5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="m-0 text-[0.78rem] font-bold uppercase tracking-[0.1em] text-[#beafd7]">{title}</h3>
        {aside}
      </div>
      {children}
    </div>
  );
}

function Notice({ tone = "neutral", children }) {
  const tones = {
    warning: "border-[rgba(251,191,36,0.32)] bg-[rgba(251,191,36,0.1)] text-[#fde68a]",
    danger: "border-[rgba(248,113,113,0.35)] bg-[rgba(239,68,68,0.1)] text-[#fca5a5]",
    neutral: "border-[rgba(96,165,250,0.28)] bg-[rgba(59,130,246,0.08)] text-[#bfdbfe]",
  };

  return <p className={`m-0 rounded-[0.7rem] border px-3 py-2 text-[0.82rem] leading-relaxed ${tones[tone]}`}>{children}</p>;
}

export function PlayerProfile({
  torneio,
  usuario,
  usuarioNome,
  currentPlayer,
  decks = [],
  selectedDeckId,
  onDeckChange,
  onChooseDeck,
  onCheckin,
  onInscrever,
  onInscreverTarde,
  actionLoading,
  times = [],
  selectedTimeId,
  onTimeChange,
}) {
  const [deckSort, setDeckSort] = useState("recente");

  const canEditDeck = torneio?.status === "inscricoes_abertas";
  const isOngoing = torneio?.status === "em_andamento";
  const isFinished = torneio?.status === "finalizado";
  const isFull = torneio?.maxJogadores != null && (torneio?.totalInscritos ?? 0) >= torneio.maxJogadores;
  const missingNick = !usuario?.nickMTGO;
  const canLateJoin = isOngoing && !currentPlayer && !isFull && Boolean(onInscreverTarde);
  const dropped = Boolean(currentPlayer?.dropped);

  const checkinRound = currentPlayer?.checkinRodada ?? currentPlayer?.checkInRodada ?? -1;
  const isCheckedIn = checkinRound >= 0;
  const deckName = currentPlayer?.deckNome || currentPlayer?.deck?.nome || null;
  const isDeckConfirmed = Boolean(currentPlayer?.deckConfirmado || deckName || currentPlayer?.deckId || currentPlayer?.deck?.id);
  const displayName =
    currentPlayer?.nome ||
    currentPlayer?.username ||
    currentPlayer?.userName ||
    usuarioNome ||
    usuario?.nome ||
    "";

  const calcTotal = (deck) =>
    deck.maindeck?.reduce((sum, card) => sum + (card.quantidade || 1), 0) || 0;

  const deckOptions = [...decks]
    .filter((deck) => !torneio?.formato || !deck.formato || deck.formato.toLowerCase() === torneio.formato.toLowerCase())
    .sort((a, b) => {
      if (deckSort === "recente") {
        return new Date(b.updatedAt || b.criadoEm || b.dataCriacao || 0) - new Date(a.updatedAt || a.criadoEm || a.dataCriacao || 0);
      }
      return (a.nome || "").localeCompare(b.nome || "", "pt-BR");
    })
    .map((deck) => ({
      ...deck,
      totalCartas: calcTotal(deck),
    }));

  const selectedDeck = deckOptions.find((deck) => String(deck.id) === String(selectedDeckId));

  const selectedTeam = times.find((time) => String(time.id) === String(currentPlayer?.timeId));
  const statusTone = dropped ? "danger" : currentPlayer ? "success" : canLateJoin ? "warning" : "neutral";
  const statusLabel = dropped ? "Dropado" : currentPlayer ? "Inscrito" : canLateJoin ? "Entrada tardia" : "Nao inscrito";

  return (
    <section className="rounded-2xl border border-[rgba(217,180,255,0.2)] bg-[linear-gradient(160deg,rgba(31,18,59,0.86),rgba(11,8,22,0.94))] p-5 shadow-[0_16px_38px_rgba(3,2,8,0.32)] animate-[slide-up_400ms_ease-out]">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="m-0 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-[#a78bfa]">Minha participacao</p>
          <h2 className="m-0 mt-1 truncate font-['Bebas_Neue',sans-serif] text-[1.75rem] tracking-[0.04em] text-[#f5edff]">
            {displayName || "Jogador"}
          </h2>
        </div>
        <StatusPill tone={statusTone}>{statusLabel}</StatusPill>
      </div>

      {!currentPlayer ? (
        <div className="grid gap-3">
          {torneio?.maxJogadores != null && (
            <SectionBlock title="Vagas" aside={<StatusPill tone={isFull ? "danger" : "success"}>{torneio.totalInscritos ?? 0}/{torneio.maxJogadores}</StatusPill>}>
              {isFull ? (
                <Notice tone="danger">O torneio esta lotado no momento.</Notice>
              ) : (
                <Notice>Voce ainda pode participar deste torneio.</Notice>
              )}
            </SectionBlock>
          )}

          {missingNick && (canEditDeck || canLateJoin) && (
            <Notice tone="warning">Configure seu nick do MTGO no perfil antes de se inscrever.</Notice>
          )}

          {canEditDeck && (
            <button
              className={`${buttonBase} border border-[rgba(34,197,94,0.5)] bg-[rgba(34,197,94,0.15)] text-[#86efac] hover:not-disabled:bg-[rgba(34,197,94,0.26)]`}
              onClick={onInscrever}
              disabled={actionLoading || missingNick || isFull}
              title={missingNick ? "Configure seu nick do MTGO no perfil" : isFull ? "Torneio lotado" : undefined}
            >
              {actionLoading ? "Inscrevendo..." : isFull ? "Torneio lotado" : "Inscrever-se"}
            </button>
          )}

          {canLateJoin && (
            <SectionBlock title="Inscricao tardia">
              <div className="grid gap-3">
                <Notice tone="warning">Ao entrar agora, voce recebe uma derrota de punicao na rodada atual.</Notice>
                <button
                  className={`${buttonBase} border border-[rgba(251,191,36,0.5)] bg-[rgba(251,191,36,0.12)] text-[#fde68a] hover:not-disabled:bg-[rgba(251,191,36,0.22)]`}
                  onClick={onInscreverTarde}
                  disabled={actionLoading || missingNick}
                  title={missingNick ? "Configure seu nick do MTGO no perfil" : undefined}
                >
                  {actionLoading ? "Inscrevendo..." : "Entrar nesta rodada"}
                </button>
              </div>
            </SectionBlock>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <SectionBlock title="Deck" aside={<StatusPill tone={isDeckConfirmed ? "success" : "warning"}>{isDeckConfirmed ? "Confirmado" : "Pendente"}</StatusPill>}>
              {isDeckConfirmed ? (
                <p className="m-0 truncate text-[0.95rem] font-bold text-[#f5edff]">{deckName || "Deck enviado"}</p>
              ) : (
                <Notice tone="warning">Escolha um deck antes do inicio do torneio.</Notice>
              )}
            </SectionBlock>

            <SectionBlock title="Check-in" aside={<StatusPill tone={isCheckedIn ? "success" : "warning"}>{isCheckedIn ? "Feito" : "Pendente"}</StatusPill>}>
              {isOngoing ? (
                <p className="m-0 text-[0.86rem] text-[#beafd7]">Rodada atual: <strong className="text-[#f5edff]">{torneio?.rodadaAtual ?? "-"}</strong></p>
              ) : (
                <button
                  className={`${buttonBase} w-full border ${isCheckedIn ? "border-[rgba(34,197,94,0.5)] bg-[rgba(34,197,94,0.16)] text-[#86efac]" : "border-[rgba(199,149,255,0.55)] bg-[linear-gradient(145deg,#8e39ed,#5f23b3)] text-white shadow-[0_4px_12px_rgba(167,79,255,0.25)] hover:not-disabled:-translate-y-0.5"}`}
                  disabled={actionLoading || isCheckedIn || isFinished || dropped}
                  onClick={onCheckin}
                >
                  {isFinished ? "Torneio finalizado" : isCheckedIn ? "Check-in feito" : actionLoading ? "Aguarde..." : "Fazer check-in"}
                </button>
              )}
            </SectionBlock>
          </div>

          {times.length > 0 && (
            <SectionBlock title="Time" aside={selectedTeam ? <StatusPill tone="success">Selecionado</StatusPill> : <StatusPill tone="neutral">Opcional</StatusPill>}>
              {selectedTeam ? (
                <p className="m-0 text-[0.92rem] font-bold text-[#f5edff]">{selectedTeam.nome}</p>
              ) : (
                <div className="grid max-h-[160px] gap-2 overflow-y-auto pr-1">
                  {times.map((time) => (
                    <button
                      key={time.id}
                      type="button"
                      className={`flex w-full items-center justify-between gap-2 rounded-[0.7rem] border px-3 py-2 text-left text-[0.88rem] transition-colors duration-150 ${selectedTimeId === time.id ? "border-[rgba(199,149,255,0.72)] bg-[rgba(199,149,255,0.14)] text-[#f5edff]" : "border-[rgba(217,180,255,0.18)] bg-white/[0.03] text-[#e9ddff] hover:border-[rgba(199,149,255,0.45)] hover:bg-white/[0.06]"}`}
                      onClick={() => onTimeChange?.(time.id)}
                      disabled={actionLoading || dropped}
                    >
                      <span className="min-w-0 truncate font-bold">{time.nome}</span>
                      <span className="shrink-0 text-[0.72rem] text-[#beafd7]">{getTotalMembros(time)} membros</span>
                    </button>
                  ))}
                </div>
              )}
            </SectionBlock>
          )}

          {canEditDeck && !dropped && (
            <SectionBlock title="Escolher deck">
              {decks.length === 0 ? (
                <p className="m-0 text-[0.85rem] text-[#beafd7]">
                  Voce nao tem decks cadastrados. <a href="/decks/criar" className="font-bold text-[#c795ff] underline">Criar deck</a>
                </p>
              ) : deckOptions.length === 0 ? (
                <Notice tone="warning">Voce nao tem decks compativeis com o formato deste torneio.</Notice>
              ) : (
                <div className="grid gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[0.78rem] text-[#beafd7]">Ordenar decks</span>
                    <SelectField value={deckSort} size="compact" onChange={(event) => setDeckSort(event.target.value)}>
                      <option value="recente">Mais recentes</option>
                      <option value="nome">Nome (A-Z)</option>
                    </SelectField>
                  </div>

                  <SelectField
                    className={fieldClass}
                    value={selectedDeckId || ""}
                    onChange={(event) => onDeckChange?.(event.target.value)}
                    disabled={actionLoading}
                    aria-label="Selecionar deck"
                    placeholder="Selecione um deck"
                  >
                    {deckOptions.map((deck) => (
                      <option key={deck.id} value={deck.id}>
                        {deck.nome}
                        {deck.formato ? ` - ${deck.formato}` : ""}
                        {` - ${deck.totalCartas} cartas`}
                      </option>
                    ))}
                  </SelectField>

                  {selectedDeck && (
                    <div className="flex flex-wrap gap-2 text-[0.78rem]">
                      {selectedDeck.formato && <StatusPill>{selectedDeck.formato}</StatusPill>}
                      <StatusPill>{calcTotal(selectedDeck)} cartas</StatusPill>
                    </div>
                  )}

                  <button
                    className={`${buttonBase} w-full border border-[rgba(217,180,255,0.22)] bg-white/[0.06] text-[#f5edff] hover:not-disabled:border-[rgba(199,149,255,0.5)] hover:not-disabled:bg-white/[0.1]`}
                    disabled={!selectedDeckId || actionLoading}
                    onClick={onChooseDeck}
                  >
                    {actionLoading ? "Salvando..." : selectedDeck ? `Confirmar "${selectedDeck.nome}"` : "Selecione um deck"}
                  </button>
                </div>
              )}
            </SectionBlock>
          )}

          {!canEditDeck && (
            <Notice>{isOngoing ? "O torneio ja comecou, entao a troca de deck esta bloqueada." : "A participacao deste torneio nao pode mais ser alterada."}</Notice>
          )}
        </div>
      )}
    </section>
  );
}
