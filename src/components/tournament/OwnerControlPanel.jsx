import { useEffect, useState } from "react";
import { ReviewRoundModal } from "./ReviewRoundModal";
import { getNextRoundActionLabels, shouldRequestNextRoundCheckin } from "../../utils/tournamentFlow";

const normalizeId = (v) => (v === undefined || v === null ? "" : String(v));
const hasConfirmedDeck = (player) => Boolean(player?.deckConfirmado || player?.deckNome || player?.deck?.nome || player?.deckId);
const hasInitialCheckin = (player) => Boolean(player?.checkIn || player?.checkin || player?.checkedIn || player?.presenca);

function ScoreSelect({ value, onChange }) {
  return (
    <select
      className="w-12 px-[0.3rem] py-[0.25rem] border border-[rgba(217,180,255,0.2)] rounded-[0.45rem] bg-[rgba(255,255,255,0.06)] text-[#f5edff] text-[0.9rem] font-['inherit'] text-center cursor-pointer"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    >
      {[0, 1, 2].map((n) => (
        <option key={n} value={n}>{n}</option>
      ))}
    </select>
  );
}

function MatchEditRow({ partida, onSave, saving }) {
  const [v1, setV1] = useState(partida.vitoriasJogador1 ?? 0);
  const [v2, setV2] = useState(partida.vitoriasJogador2 ?? 0);
  const [editing, setEditing] = useState(false);

  const nome1 = partida.jogador1Nome || partida.jogador1?.nome || "Jogador 1";
  const nome2 = !partida.jogador2Id && !partida.jogador2
    ? "BYE"
    : (partida.jogador2Nome || partida.jogador2?.nome || "Jogador 2");
  const mesa = partida.mesa ?? partida.mesaNumero ?? partida.numeroMesa ?? "—";
  const isBye = nome2 === "BYE";
  const isFinalizada = partida.status === "finalizada";

  return (
    <div className={`flex items-center gap-[0.6rem] border rounded-[0.65rem] px-[0.65rem] py-2 flex-wrap ${editing ? "border-[rgba(199,149,255,0.4)] bg-[rgba(167,79,255,0.06)]" : "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)]"}`}>
      <span className="text-[0.75rem] font-bold text-[#c795ff] whitespace-nowrap min-w-[52px]">Mesa {mesa}</span>

      <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
        <span className="text-[0.85rem] text-[#f5edff] overflow-hidden text-ellipsis whitespace-nowrap min-w-[60px] max-w-[140px]">{nome1}</span>
        {editing && !isBye ? (
          <div className="flex items-center gap-[0.35rem]">
            <ScoreSelect value={v1} onChange={setV1} />
            <span className="text-[#beafd7] font-bold">–</span>
            <ScoreSelect value={v2} onChange={setV2} />
          </div>
        ) : (
          <span className={`inline-flex items-center justify-center min-w-[56px] px-[0.45rem] py-[0.12rem] rounded-full font-bold text-[0.78rem] tracking-[0.04em] ${isFinalizada ? "text-white border border-[rgba(199,149,255,0.5)] bg-[rgba(199,149,255,0.22)]" : "text-[#c4b5fd] border border-[rgba(199,149,255,0.35)] bg-[rgba(167,79,255,0.12)]"}`}>
            {isFinalizada
              ? `${partida.vitoriasJogador1 ?? 0} – ${partida.vitoriasJogador2 ?? 0}`
              : "VS"}
          </span>
        )}
        <span className="text-[0.85rem] text-[#f5edff] overflow-hidden text-ellipsis whitespace-nowrap min-w-[60px] max-w-[140px]">{nome2}</span>
      </div>

      {!isBye && (
        <div className="flex gap-[0.35rem] ml-auto">
          {editing ? (
            <>
              <button
                type="button"
                className="inline-flex items-center justify-center px-[0.65rem] py-[0.3rem] text-[0.78rem] border border-[rgba(199,149,255,0.5)] rounded-[0.7rem] font-semibold cursor-pointer transition-all duration-[220ms] whitespace-nowrap text-white bg-[linear-gradient(145deg,#8e39ed,#5f23b3)] shadow-[0_4px_12px_rgba(167,79,255,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={async () => {
                  await onSave(partida.id, { vitoriasJogador1: v1, vitoriasJogador2: v2 });
                  setEditing(false);
                }}
                disabled={saving}
              >
                {saving ? "..." : "Salvar"}
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center px-[0.65rem] py-[0.3rem] text-[0.78rem] border border-[rgba(217,180,255,0.2)] rounded-[0.7rem] font-semibold cursor-pointer transition-all duration-[220ms] whitespace-nowrap text-[#beafd7] bg-transparent hover:bg-[rgba(255,255,255,0.06)] hover:text-[#f5edff]"
                onClick={() => { setV1(partida.vitoriasJogador1 ?? 0); setV2(partida.vitoriasJogador2 ?? 0); setEditing(false); }}
              >
                ✕
              </button>
            </>
          ) : (
            <button
              type="button"
              className="inline-flex items-center justify-center px-[0.65rem] py-[0.3rem] text-[0.78rem] border border-[rgba(217,180,255,0.2)] rounded-[0.7rem] font-semibold cursor-pointer transition-all duration-[220ms] whitespace-nowrap text-[#f5edff] bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] hover:border-[rgba(199,149,255,0.5)]"
              onClick={() => setEditing(true)}
            >
              Editar
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function OwnerControlPanel({
  torneio,
  standings,
  usuarioId,
  pendingCheckinPlayers,
  canManage,
  onStartTournament,
  onNextRound,
  onDropPlayersWithoutDeck,
  onDropPlayersWithoutCheckin,
  onDropPlayer,
  onEditResult,
  actionLoading,
  adminActionKey,
  droppingPlayerId,
  partidas,
}) {
  const isRegistrationOpen = torneio?.status === "inscricoes_abertas";
  const isOngoing = torneio?.status === "em_andamento";
  const [activeTab, setActiveTab] = useState(isOngoing ? "mesas" : "jogadores");
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  useEffect(() => {
    setActiveTab(isOngoing ? "mesas" : "jogadores");
  }, [isOngoing]);

  if (!canManage || (!isRegistrationOpen && !isOngoing)) return null;

  const jogadoresAtivos = (standings || []).filter((p) => !p?.dropped);
  const jogadoresSemDeck = jogadoresAtivos.filter((player) => !hasConfirmedDeck(player));
  const jogadoresSemCheckinInicial = jogadoresAtivos.filter((player) => !hasInitialCheckin(player));
  const pendentesCheckin = pendingCheckinPlayers || [];
  const requiresNextRoundCheckin = shouldRequestNextRoundCheckin(torneio);
  const nextRoundLabels = getNextRoundActionLabels(torneio, pendentesCheckin.length);
  const jogadoresSemCheckin = isRegistrationOpen ? jogadoresSemCheckinInicial : pendentesCheckin;
  const canDropByCheckin = isRegistrationOpen || requiresNextRoundCheckin;

  const getPlayerName = (p) =>
    p?.usuario?.nome || p?.nome || p?.username || p?.userName || "Jogador";
  const getPlayerId = (p) =>
    p?.usuarioId || p?.userId || p?.usuario?.id || p?.id;

  const rodadaAtual = Number(torneio?.rodadaAtual || 0);
  const partidasRodada = (partidas || []).filter(
    (p) => !rodadaAtual || Number(p.rodada) === rodadaAtual,
  );
  const pendentes = partidasRodada.filter((p) => p.status !== "finalizada");
  const finalizadas = partidasRodada.filter((p) => p.status === "finalizada");
  const isBulkDroppingDeck = actionLoading && adminActionKey === "drop-missing-decks";
  const isBulkDroppingCheckin = actionLoading && adminActionKey === "drop-missing-checkin";
  const isStartingTournament = actionLoading && adminActionKey === "start-tournament";

  return (
    <section className="border border-[rgba(251,191,36,0.35)] rounded-2xl p-5 bg-[linear-gradient(155deg,rgba(52,30,5,0.5),rgba(24,14,4,0.85))] shadow-[0_4px_20px_rgba(3,2,8,0.3)] animate-[slide-up_400ms_ease-out]">
      <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
        <div>
          <h2 className="m-0 mb-0 font-['Bebas_Neue',sans-serif] text-[1.5rem] tracking-[0.04em] text-[#f5edff]">Painel do Administrador</h2>
          {isOngoing ? (
            <p className="mt-[0.2rem] mb-0 text-[0.8rem] text-[#c6b8a0]">
              Rodada {torneio?.rodadaAtual ?? "—"} de {torneio?.totalRodadas ?? "—"}
            </p>
          ) : (
            <p className="mt-[0.2rem] mb-0 text-[0.8rem] text-[#c6b8a0]">
              Revise presença e decks antes de iniciar o torneio.
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-[0.4rem] flex-shrink-0">
          {isOngoing && requiresNextRoundCheckin && pendentesCheckin.length > 0 && (
            <p className="flex items-center gap-[0.3rem] m-0 text-[0.82rem] text-[#fbbf24]">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {pendentesCheckin.length} jogador(es) sem check-in
            </p>
          )}
          {isOngoing && nextRoundLabels.status && (
            <p className="m-0 text-[0.82rem] text-[#c6b8a0] text-right max-w-[320px]">
              {nextRoundLabels.status}
            </p>
          )}
          {isRegistrationOpen && (
            <button
              className="inline-flex min-h-11 items-center justify-center px-4 py-[0.55rem] border border-[rgba(34,197,94,0.5)] rounded-[0.7rem] text-[0.88rem] font-semibold cursor-pointer transition-all duration-[220ms] whitespace-nowrap text-[#4ade80] bg-[rgba(34,197,94,0.15)] disabled:opacity-50 disabled:cursor-not-allowed hover:not-disabled:bg-[rgba(34,197,94,0.3)]"
              type="button"
              onClick={onStartTournament}
              disabled={actionLoading}
            >
              {isStartingTournament ? "Iniciando..." : "Iniciar Torneio"}
            </button>
          )}
          {isOngoing && (
            <button
              className="inline-flex min-h-11 items-center justify-center px-4 py-[0.55rem] border border-[rgba(34,197,94,0.5)] rounded-[0.7rem] text-[0.88rem] font-semibold cursor-pointer transition-all duration-[220ms] whitespace-nowrap text-[#4ade80] bg-[rgba(34,197,94,0.15)] disabled:opacity-50 disabled:cursor-not-allowed hover:not-disabled:bg-[rgba(34,197,94,0.3)]"
              type="button"
              onClick={() => setReviewModalOpen(true)}
              disabled={actionLoading}
            >
              Revisar Rodada
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-3 mb-4 min-[720px]:grid-cols-2">
        {isRegistrationOpen && (
          <div className="rounded-[0.9rem] border border-[rgba(239,68,68,0.24)] bg-[rgba(239,68,68,0.08)] p-4">
            <p className="m-0 text-[0.78rem] uppercase tracking-[0.08em] text-[#fca5a5] font-semibold">Pendência de deck</p>
            <p className="mt-2 mb-3 text-[0.88rem] text-[#f5d5d8]">
              {jogadoresSemDeck.length} jogador(es) inscrito(s) ainda não enviaram deck.
            </p>
            <button
              type="button"
              className="inline-flex min-h-11 items-center justify-center w-full px-4 py-[0.55rem] border border-[rgba(239,68,68,0.55)] rounded-[0.7rem] text-[0.88rem] font-semibold cursor-pointer transition-all duration-[220ms] whitespace-nowrap text-[#fecaca] bg-[rgba(239,68,68,0.12)] disabled:opacity-50 disabled:cursor-not-allowed hover:not-disabled:bg-[rgba(239,68,68,0.22)]"
              onClick={() => onDropPlayersWithoutDeck(jogadoresSemDeck.map(getPlayerId))}
              disabled={actionLoading || jogadoresSemDeck.length === 0}
            >
              {isBulkDroppingDeck ? "Dropando..." : "Dropar sem deck"}
            </button>
          </div>
        )}

        {canDropByCheckin && (
          <div className="rounded-[0.9rem] border border-[rgba(251,191,36,0.24)] bg-[rgba(251,191,36,0.08)] p-4">
            <p className="m-0 text-[0.78rem] uppercase tracking-[0.08em] text-[#fde68a] font-semibold">Pendência de check-in</p>
            <p className="mt-2 mb-3 text-[0.88rem] text-[#f6ebc4]">
              {isRegistrationOpen
                ? `${jogadoresSemCheckin.length} jogador(es) inscrito(s) ainda não fizeram check-in inicial.`
                : `${jogadoresSemCheckin.length} jogador(es) ainda não fizeram check-in para a próxima rodada.`}
            </p>
            <button
              type="button"
              className="inline-flex min-h-11 items-center justify-center w-full px-4 py-[0.55rem] border border-[rgba(251,191,36,0.5)] rounded-[0.7rem] text-[0.88rem] font-semibold cursor-pointer transition-all duration-[220ms] whitespace-nowrap text-[#fde68a] bg-[rgba(251,191,36,0.12)] disabled:opacity-50 disabled:cursor-not-allowed hover:not-disabled:bg-[rgba(251,191,36,0.22)]"
              onClick={() => onDropPlayersWithoutCheckin(jogadoresSemCheckin.map(getPlayerId))}
              disabled={actionLoading || jogadoresSemCheckin.length === 0}
            >
              {isBulkDroppingCheckin ? "Dropando..." : "Dropar sem check-in"}
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-[0.3rem] mb-[0.85rem] border-b border-[rgba(217,180,255,0.2)] pb-0">
        {isOngoing && (
          <button
            type="button"
            className={`inline-flex items-center gap-[0.4rem] px-[0.9rem] py-[0.45rem] border-none border-b-2 bg-transparent text-[0.85rem] font-semibold font-['inherit'] cursor-pointer transition-[color,border-color] duration-[180ms] mb-[-1px] ${activeTab === "mesas" ? "text-[#fbbf24] border-b-[#fbbf24]" : "text-[#beafd7] border-b-transparent hover:text-[#f5edff]"}`}
            onClick={() => setActiveTab("mesas")}
          >
            Mesas
            {pendentes.length > 0 && (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-[5px] rounded-full text-[0.7rem] font-bold bg-[rgba(167,79,255,0.25)] text-[#c4b5fd]">{pendentes.length}</span>
            )}
          </button>
        )}
        <button
          type="button"
          className={`inline-flex items-center gap-[0.4rem] px-[0.9rem] py-[0.45rem] border-none border-b-2 bg-transparent text-[0.85rem] font-semibold font-['inherit'] cursor-pointer transition-[color,border-color] duration-[180ms] mb-[-1px] ${activeTab === "jogadores" ? "text-[#fbbf24] border-b-[#fbbf24]" : "text-[#beafd7] border-b-transparent hover:text-[#f5edff]"}`}
          onClick={() => setActiveTab("jogadores")}
        >
          Jogadores
          {pendentesCheckin.length > 0 && (
            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-[5px] rounded-full text-[0.7rem] font-bold bg-[rgba(251,191,36,0.25)] text-[#fbbf24]">{pendentesCheckin.length}</span>
          )}
        </button>
      </div>

      {activeTab === "mesas" && (
        <div>
          {partidasRodada.length === 0 ? (
            <p className="text-[#beafd7] text-[0.9rem] m-0">Nenhuma mesa na rodada atual.</p>
          ) : (
            <>
              <div className="flex gap-2 mb-[0.65rem]">
                <span className="px-[0.6rem] py-[0.2rem] rounded-full text-[0.75rem] font-semibold border text-[#6ee7b7] bg-[rgba(16,185,129,0.12)] border-[rgba(16,185,129,0.3)]">
                  {finalizadas.length} finalizada{finalizadas.length !== 1 ? "s" : ""}
                </span>
                <span className="px-[0.6rem] py-[0.2rem] rounded-full text-[0.75rem] font-semibold border text-[#fbbf24] bg-[rgba(251,191,36,0.1)] border-[rgba(251,191,36,0.3)]">
                  {pendentes.length} pendente{pendentes.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="grid gap-2 max-h-[480px] overflow-y-auto pr-[0.2rem]">
                {partidasRodada.map((partida) => (
                  <MatchEditRow
                    key={partida.id}
                    partida={partida}
                    onSave={onEditResult}
                    saving={actionLoading}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === "jogadores" && (
        <div className="grid gap-2 max-h-[480px] overflow-y-auto pr-[0.2rem]">
          {jogadoresAtivos.length === 0 ? (
            <p className="text-[#beafd7] text-[0.9rem] m-0">Nenhum jogador ativo.</p>
          ) : (
            jogadoresAtivos.map((player) => {
              const playerId = getPlayerId(player);
              const normalizedId = normalizeId(playerId);
              const isMe = normalizeId(playerId) === normalizeId(usuarioId);
              const checkinOk =
                player?.checkInProximaRodada || player?.checkinProximaRodada || player?.nextRoundCheckin;

              return (
                <div
                  key={normalizedId || getPlayerName(player)}
                  className="flex justify-between items-center gap-[0.8rem] border border-[rgba(251,191,36,0.2)] rounded-[0.65rem] px-[0.7rem] py-[0.55rem] bg-[rgba(251,191,36,0.04)]"
                >
                  <div className="grid gap-[0.15rem] min-w-0">
                    <span className="text-white font-semibold overflow-hidden text-ellipsis whitespace-nowrap">
                      {getPlayerName(player)}{isMe ? " (Você)" : ""}
                    </span>
                    {isRegistrationOpen ? (
                      <div className="flex items-center gap-[0.6rem] text-[#c6b8a0] text-[0.8rem] flex-wrap">
                        <span className={`text-[0.78rem] font-semibold ${hasConfirmedDeck(player) ? "text-[#6ee7b7]" : "text-[#fca5a5]"}`}>
                          {hasConfirmedDeck(player) ? "✓ deck enviado" : "sem deck"}
                        </span>
                        <span className={`text-[0.78rem] font-semibold ${hasInitialCheckin(player) ? "text-[#6ee7b7]" : "text-[#fbbf24]"}`}>
                          {hasInitialCheckin(player) ? "✓ check-in" : "sem check-in"}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-[0.6rem] text-[#c6b8a0] text-[0.8rem] flex-wrap">
                        <span>{player?.pontosMesa ?? player?.pontos ?? 0} pts</span>
                        {requiresNextRoundCheckin ? (
                          <span className={`text-[0.78rem] font-semibold ${checkinOk ? "text-[#6ee7b7]" : "text-[#fbbf24]"}`}>
                            {checkinOk ? "✓ check-in" : "⏳ aguardando"}
                          </span>
                        ) : (
                          <span className="text-[0.78rem] font-semibold text-[#93c5fd]">
                            sem novo check-in
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    className="inline-flex items-center justify-center px-[0.65rem] py-[0.3rem] text-[0.78rem] border border-[rgba(239,68,68,0.5)] rounded-[0.7rem] font-semibold cursor-pointer transition-all duration-[220ms] whitespace-nowrap text-[#fda4af] bg-[rgba(239,68,68,0.1)] disabled:opacity-50 disabled:cursor-not-allowed hover:not-disabled:bg-[rgba(239,68,68,0.25)] hover:not-disabled:border-[rgba(239,68,68,0.8)]"
                    type="button"
                    onClick={() => onDropPlayer(playerId)}
                    disabled={actionLoading || !playerId}
                  >
                    {droppingPlayerId && normalizeId(droppingPlayerId) === normalizedId
                      ? "Dropando..."
                      : "Drop"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      <ReviewRoundModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        torneio={torneio}
        standings={standings}
        partidas={partidas}
        pendingCheckinPlayers={pendingCheckinPlayers}
        onDropPlayer={onDropPlayer}
        onNextRound={onNextRound}
        actionLoading={actionLoading}
        droppingPlayerId={droppingPlayerId}
        usuarioId={usuarioId}
      />
    </section>
  );
}
