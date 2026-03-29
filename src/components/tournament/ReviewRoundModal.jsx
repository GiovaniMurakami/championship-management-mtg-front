import { useState } from "react";

const normalizeId = (v) => (v === undefined || v === null ? "" : String(v));

function MatchStatusRow({ partida }) {
  const nome1 = partida.jogador1Nome || partida.jogador1?.nome || "Jogador 1";
  const nome2 = !partida.jogador2Id && !partida.jogador2
    ? "BYE"
    : (partida.jogador2Nome || partida.jogador2?.nome || "Jogador 2");
  const mesa = partida.mesa ?? partida.mesaNumero ?? partida.numeroMesa ?? "—";
  const isFinalizada = partida.status === "finalizada";

  return (
    <div className={`rr-match-row ${isFinalizada ? "rr-match-row--done" : "rr-match-row--pending"}`}>
      <span className="rr-match-mesa">Mesa {mesa}</span>
      <div className="rr-match-players">
        <span className="rr-match-nome">{nome1}</span>
        <span className="rr-match-score">
          {isFinalizada
            ? `${partida.vitoriasJogador1 ?? 0} – ${partida.vitoriasJogador2 ?? 0}`
            : "VS"}
        </span>
        <span className="rr-match-nome">{nome2}</span>
      </div>
      <span className={`rr-match-status ${isFinalizada ? "rr-status--done" : "rr-status--pending"}`}>
        {isFinalizada ? "Finalizada" : "Pendente"}
      </span>
    </div>
  );
}

function PlayerCheckinRow({ player, usuarioId, onDrop, droppingPlayerId, actionLoading }) {
  const getPlayerName = (p) =>
    p?.usuario?.nome || p?.nome || p?.username || p?.userName || "Jogador";
  const getPlayerId = (p) =>
    p?.usuarioId || p?.userId || p?.usuario?.id || p?.id;

  const playerId = getPlayerId(player);
  const normalizedId = normalizeId(playerId);
  const isMe = normalizeId(playerId) === normalizeId(usuarioId);
  const checkinOk =
    player?.checkInProximaRodada ||
    player?.checkinProximaRodada ||
    player?.nextRoundCheckin;

  return (
    <div className="rr-player-row">
      <div className="rr-player-info">
        <span className="rr-player-name">
          {getPlayerName(player)}{isMe ? " (Você)" : ""}
        </span>
        <span className={`rr-checkin-badge ${checkinOk ? "rr-checkin--ok" : "rr-checkin--pending"}`}>
          {checkinOk ? "✓ check-in" : "⏳ aguardando"}
        </span>
      </div>
      {!isMe && (
        <button
          type="button"
          className="td-btn td-btn-secondary td-btn-danger td-btn-sm"
          onClick={() => onDrop(playerId)}
          disabled={actionLoading || !playerId}
        >
          {droppingPlayerId && normalizeId(droppingPlayerId) === normalizedId
            ? "Dropando..."
            : "Drop"}
        </button>
      )}
    </div>
  );
}

export function ReviewRoundModal({
  isOpen,
  onClose,
  torneio,
  standings,
  partidas,
  pendingCheckinPlayers,
  onDropPlayer,
  onNextRound,
  actionLoading,
  droppingPlayerId,
  usuarioId,
}) {
  const [step, setStep] = useState("mesas");

  if (!isOpen) return null;

  const rodadaAtual = Number(torneio?.rodadaAtual || 0);
  const partidasRodada = (partidas || []).filter(
    (p) => !rodadaAtual || Number(p.rodada) === rodadaAtual
  );
  const finalizadas = partidasRodada.filter((p) => p.status === "finalizada");
  const pendentes = partidasRodada.filter((p) => p.status !== "finalizada");
  const allDone = pendentes.length === 0 && partidasRodada.length > 0;

  const jogadoresAtivos = (standings || []).filter((p) => !p?.dropped);
  const pendentesCheckin = pendingCheckinPlayers || [];
  const canAdvance = pendentesCheckin.length === 0;

  const isLastRound =
    Number(torneio?.totalRodadas || 0) > 0 &&
    Number(torneio?.rodadaAtual || 0) >= Number(torneio?.totalRodadas || 0);

  const handleNextRound = async () => {
    await onNextRound();
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-overlay rr-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true">
      <div className="rr-modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="rr-modal-header">
          <div className="rr-modal-title-area">
            <h2 className="rr-modal-title">
              {step === "mesas" ? `Revisar Rodada ${torneio?.rodadaAtual ?? ""}` : "Revisar Jogadores"}
            </h2>
            <div className="rr-steps">
              <span className={`rr-step ${step === "mesas" ? "rr-step--active" : "rr-step--done"}`}>
                1. Mesas
              </span>
              <span className="rr-step-arrow">→</span>
              <span className={`rr-step ${step === "jogadores" ? "rr-step--active" : ""}`}>
                2. Jogadores
              </span>
            </div>
          </div>
          <button type="button" className="rr-close-btn" onClick={onClose} aria-label="Fechar">✕</button>
        </div>

        {/* Body */}
        <div className="rr-modal-body">

          {/* Step 1: Mesas */}
          {step === "mesas" && (
            <div className="rr-step-content">
              <div className="rr-summary">
                <span className="rr-summary-chip rr-summary-chip--done">
                  {finalizadas.length} finalizada{finalizadas.length !== 1 ? "s" : ""}
                </span>
                <span className="rr-summary-chip rr-summary-chip--pending">
                  {pendentes.length} pendente{pendentes.length !== 1 ? "s" : ""}
                </span>
              </div>

              {partidasRodada.length === 0 ? (
                <p className="td-empty-text">Nenhuma mesa na rodada atual.</p>
              ) : (
                <div className="rr-match-list">
                  {partidasRodada.map((partida) => (
                    <MatchStatusRow key={partida.id} partida={partida} />
                  ))}
                </div>
              )}

              {!allDone && (
                <p className="rr-warning">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {pendentes.length} mesa{pendentes.length !== 1 ? "s" : ""} ainda não finalizada{pendentes.length !== 1 ? "s" : ""}. Você pode avançar mesmo assim.
                </p>
              )}
            </div>
          )}

          {/* Step 2: Jogadores */}
          {step === "jogadores" && (
            <div className="rr-step-content">
              {pendentesCheckin.length > 0 && (
                <p className="rr-warning">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {pendentesCheckin.length} jogador(es) sem check-in. Realize o drop ou aguarde o check-in.
                </p>
              )}

              <div className="rr-player-list">
                {jogadoresAtivos.length === 0 ? (
                  <p className="td-empty-text">Nenhum jogador ativo.</p>
                ) : (
                  jogadoresAtivos.map((player) => {
                    const playerId =
                      player?.usuarioId || player?.userId || player?.usuario?.id || player?.id;
                    return (
                      <PlayerCheckinRow
                        key={normalizeId(playerId) || (player?.nome ?? player?.username)}
                        player={player}
                        usuarioId={usuarioId}
                        onDrop={onDropPlayer}
                        droppingPlayerId={droppingPlayerId}
                        actionLoading={actionLoading}
                      />
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="rr-modal-footer">
          {step === "mesas" && (
            <>
              <button type="button" className="td-btn td-btn-ghost" onClick={onClose}>
                Fechar
              </button>
              <button
                type="button"
                className="td-btn td-btn-primary"
                onClick={() => setStep("jogadores")}
              >
                Revisar Jogadores →
              </button>
            </>
          )}

          {step === "jogadores" && (
            <>
              <button type="button" className="td-btn td-btn-ghost" onClick={() => setStep("mesas")}>
                ← Voltar
              </button>
              <button
                type="button"
                className={`td-btn ${canAdvance ? "td-btn-primary" : "td-btn-disabled"}`}
                onClick={handleNextRound}
                disabled={actionLoading || !canAdvance}
              >
                {actionLoading
                  ? "Processando..."
                  : !canAdvance
                    ? "Aguardando check-in"
                    : isLastRound
                      ? "Finalizar Torneio"
                      : "Iniciar Próxima Rodada"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
