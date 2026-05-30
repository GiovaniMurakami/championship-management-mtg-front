import { useState } from "react";
import { getNextRoundActionLabels, shouldRequestNextRoundCheckin } from "../../utils/tournamentFlow";
import { normalizeId } from "../../utils/normalizeId";
import { getMatchConfirmationSummary, hasPlayerConfirmedResult } from "../../utils/matchConfirmations";
import { ConfirmationIcon, ConfirmationSummaryIcon } from "./ConfirmationIcon";

const btnBase =
  "inline-flex items-center justify-center px-4 py-[0.55rem] border border-transparent rounded-[0.7rem] text-[0.88rem] font-semibold cursor-pointer transition-all duration-[220ms] whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed";

const btnPrimary =
  "bg-gradient-to-br from-[#8e39ed] to-[#5f23b3] border-[rgba(199,149,255,0.5)] text-white shadow-[0_4px_12px_rgba(167,79,255,0.25)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(167,79,255,0.4)] disabled:!transform-none";

const btnGhost =
  "bg-transparent border-[rgba(217,180,255,0.2)] text-[#beafd7] hover:bg-white/[0.06] hover:text-[#f5edff]";

const btnDisabled =
  "bg-white/[0.05] border-[rgba(217,180,255,0.2)] text-[#beafd7] opacity-60 cursor-not-allowed";

const btnDanger =
  "border-[rgba(239,68,68,0.5)] text-[#fda4af] bg-[rgba(239,68,68,0.1)] hover:bg-[rgba(239,68,68,0.25)] hover:border-[rgba(239,68,68,0.8)]";

const btnSm = "px-[0.65rem] py-[0.3rem] text-[0.78rem]";

function getMesaSortValue(partida) {
  const mesa = Number(partida?.mesa ?? partida?.mesaNumero ?? partida?.numeroMesa);
  return Number.isFinite(mesa) ? mesa : Number.MAX_SAFE_INTEGER;
}

function sortByMesa(a, b) {
  const mesaDiff = getMesaSortValue(a) - getMesaSortValue(b);
  if (mesaDiff !== 0) return mesaDiff;
  return Number(a?.rodada ?? 0) - Number(b?.rodada ?? 0);
}

function MatchStatusRow({ partida }) {
  const nome1 = partida.jogador1Nome || partida.jogador1?.nome || "Jogador 1";
  const nome2 = !partida.jogador2Id && !partida.jogador2
    ? "BYE"
    : (partida.jogador2Nome || partida.jogador2?.nome || "Jogador 2");
  const mesa = partida.mesa ?? partida.mesaNumero ?? partida.numeroMesa ?? "—";
  const isFinalizada = partida.status === "finalizada";
  const isBye = !partida.jogador2Id && !partida.jogador2;
  const confirmation = getMatchConfirmationSummary(partida);
  const player1Confirmed = hasPlayerConfirmedResult(partida, 1);
  const player2Confirmed = hasPlayerConfirmedResult(partida, 2);

  return (
    <div className={`flex items-center gap-3 px-[0.85rem] py-[0.6rem] rounded-lg border text-[0.85rem] flex-wrap ${isFinalizada
      ? "border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.04)]"
      : "border-[rgba(251,191,36,0.2)] bg-[rgba(251,191,36,0.04)]"
      }`}>
      <span className="text-[0.75rem] text-[rgba(200,180,230,0.55)] min-w-[48px] flex-shrink-0">
        Mesa {mesa}
      </span>
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <span className="flex-1 text-[#e8d5ff] font-medium overflow-hidden text-ellipsis whitespace-nowrap">
          {nome1}
        </span>
        {isFinalizada && !isBye && (
          <ConfirmationIcon confirmed={player1Confirmed} label={`${nome1}: ${player1Confirmed ? "confirmou" : "falta confirmar"}`} />
        )}
        <span className="text-[0.8rem] font-bold text-[#c795ff] flex-shrink-0 min-w-[44px] text-center">
          {isFinalizada
            ? `${partida.vitoriasJogador1 ?? 0} – ${partida.vitoriasJogador2 ?? 0}`
            : "VS"}
        </span>
        {isFinalizada && !isBye && (
          <ConfirmationIcon confirmed={player2Confirmed} label={`${nome2}: ${player2Confirmed ? "confirmou" : "falta confirmar"}`} />
        )}
        <span className="flex-1 text-[#e8d5ff] font-medium overflow-hidden text-ellipsis whitespace-nowrap text-right">
          {nome2}
        </span>
      </div>
      {isFinalizada && !isBye && (
        <ConfirmationSummaryIcon confirmation={confirmation} />
      )}
      <span className={`text-[0.72rem] font-semibold px-2 py-[2px] rounded-full flex-shrink-0 ${isFinalizada
        ? "bg-[rgba(34,197,94,0.12)] text-[#4ade80]"
        : "bg-[rgba(251,191,36,0.1)] text-[#fbbf24]"
        }`}>
        {isFinalizada ? "Finalizada" : "Pendente"}
      </span>
    </div>
  );
}

function PlayerCheckinRow({ player, usuarioId, onDrop, droppingPlayerId, actionLoading, requiresNextRoundCheckin, rodadaAtual }) {
  const getPlayerName = (p) =>
    p?.usuario?.nome || p?.nome || p?.username || p?.userName || "Jogador";
  const getPlayerId = (p) =>
    p?.usuarioId || p?.userId || p?.usuario?.id || p?.id;

  const playerId = getPlayerId(player);
  const normalizedId = normalizeId(playerId);
  const isMe = normalizeId(playerId) === normalizeId(usuarioId);
  const checkinOk = Number(player?.checkinRodada ?? -1) >= Number(rodadaAtual ?? 0);

  return (
    <div className="flex items-center justify-between gap-3 px-[0.85rem] py-[0.65rem] rounded-lg border border-[rgba(145,71,255,0.15)] bg-[rgba(145,71,255,0.05)]">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <span className="text-[#e8d5ff] text-[0.88rem] font-medium overflow-hidden text-ellipsis whitespace-nowrap">
          {getPlayerName(player)}{isMe ? " (Você)" : ""}
        </span>
        {requiresNextRoundCheckin && (
          <span className={`text-[0.72rem] font-semibold px-2 py-[2px] rounded-full flex-shrink-0 border ${checkinOk
            ? "bg-[rgba(34,197,94,0.12)] text-[#4ade80] border-[rgba(34,197,94,0.25)]"
            : "bg-[rgba(251,191,36,0.1)] text-[#fbbf24] border-[rgba(251,191,36,0.2)]"
            }`}>
            {checkinOk ? "✓ presença confirmada" : "⏳ sem presença"}
          </span>
        )}
      </div>
      {!isMe && (
        <button
          type="button"
          className={`${btnBase} ${btnDanger} ${btnSm}`}
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
  ).sort(sortByMesa);
  const finalizadas = partidasRodada.filter((p) => p.status === "finalizada");
  const pendentes = partidasRodada.filter((p) => p.status !== "finalizada");
  const allDone = pendentes.length === 0 && partidasRodada.length > 0;

  const jogadoresAtivos = (standings || []).filter((p) => !p?.dropped);
  const pendentesCheckin = pendingCheckinPlayers || [];
  const requiresNextRoundCheckin = shouldRequestNextRoundCheckin(torneio);
  const canAdvance = true;
  const nextRoundLabels = getNextRoundActionLabels(torneio, pendentesCheckin.length);

  const handleNextRound = async () => {
    await onNextRound();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[1000] grid place-items-center bg-[rgba(5,3,9,0.72)] backdrop-blur-sm animate-[fade-in_250ms_ease-out]"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-gradient-to-br from-[#1a0e2e] to-[#0f0820] border border-[rgba(145,71,255,0.35)] rounded-xl w-[min(640px,95vw)] max-h-[88vh] flex flex-col shadow-[0_24px_60px_rgba(0,0,0,0.7)] max-[480px]:max-h-[95vh] max-[480px]:rounded-t-xl max-[480px]:rounded-b-none max-[480px]:fixed max-[480px]:bottom-0 max-[480px]:left-0 max-[480px]:right-0 max-[480px]:w-full"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-[rgba(145,71,255,0.2)] flex-shrink-0">
          <div className="flex flex-col gap-2">
            <h2 className="text-[1.15rem] font-bold text-[#e8d5ff] m-0">
              {step === "mesas" ? `Revisar Rodada ${torneio?.rodadaAtual ?? ""}` : "Revisar Jogadores"}
            </h2>
            <div className="flex items-center gap-[0.4rem] text-[0.78rem]">
              <span className={`px-2 py-[2px] rounded-full border transition-all duration-200 ${step === "mesas"
                ? "text-[#c795ff] border-[rgba(145,71,255,0.5)] bg-[rgba(145,71,255,0.12)]"
                : "text-[rgba(200,180,230,0.6)] border-transparent"
                }`}>
                1. Mesas
              </span>
              <span className="text-[rgba(200,180,230,0.3)] text-[0.75rem]">→</span>
              <span className={`px-2 py-[2px] rounded-full border transition-all duration-200 ${step === "jogadores"
                ? "text-[#c795ff] border-[rgba(145,71,255,0.5)] bg-[rgba(145,71,255,0.12)]"
                : "text-[rgba(200,180,230,0.45)] border-transparent"
                }`}>
                2. Jogadores
              </span>
            </div>
          </div>
          <button
            type="button"
            className="bg-transparent border-none text-[rgba(200,180,230,0.5)] text-base cursor-pointer px-2 py-1 rounded-[6px] transition-all duration-150 hover:text-[#e8d5ff] hover:bg-[rgba(145,71,255,0.15)]"
            onClick={onClose}
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* Step 1: Mesas */}
          {step === "mesas" && (
            <div className="flex flex-col gap-3">
              <div className="flex gap-2 flex-wrap">
                <span className="text-[0.78rem] font-semibold px-[10px] py-[3px] rounded-full bg-[rgba(34,197,94,0.12)] text-[#4ade80] border border-[rgba(34,197,94,0.3)]">
                  {finalizadas.length} finalizada{finalizadas.length !== 1 ? "s" : ""}
                </span>
                <span className="text-[0.78rem] font-semibold px-[10px] py-[3px] rounded-full bg-[rgba(251,191,36,0.1)] text-[#fbbf24] border border-[rgba(251,191,36,0.25)]">
                  {pendentes.length} pendente{pendentes.length !== 1 ? "s" : ""}
                </span>
              </div>

              {partidasRodada.length === 0 ? (
                <p className="text-[#beafd7] text-[0.9rem] m-0">Nenhuma mesa na rodada atual.</p>
              ) : (
                <div className="flex flex-col gap-[0.4rem]">
                  {partidasRodada.map((partida) => (
                    <MatchStatusRow key={partida.id} partida={partida} />
                  ))}
                </div>
              )}

              {!allDone && (
                <p className="flex items-center gap-2 text-[0.82rem] text-[#fbbf24] bg-[rgba(251,191,36,0.08)] border border-[rgba(251,191,36,0.2)] rounded-lg px-3 py-2 m-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true" className="shrink-0">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {pendentes.length} mesa{pendentes.length !== 1 ? "s" : ""} ainda não finalizada{pendentes.length !== 1 ? "s" : ""}. Resultados pendentes serão computados como derrota (0–2).
                </p>
              )}
            </div>
          )}

          {/* Step 2: Jogadores */}
          {step === "jogadores" && (
            <div className="flex flex-col gap-3">
              {requiresNextRoundCheckin && pendentesCheckin.length > 0 && (
                <p className="flex items-center gap-2 text-[0.82rem] text-[#fbbf24] bg-[rgba(251,191,36,0.08)] border border-[rgba(251,191,36,0.2)] rounded-lg px-3 py-2 m-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {pendentesCheckin.length} jogador(es) ainda não confirmaram presença (somente informativo — não impede o início da rodada).
                </p>
              )}

              {nextRoundLabels.status && (
                <p className="flex items-center gap-2 text-[0.82rem] text-[#7dd3fc] bg-[rgba(56,189,248,0.08)] border border-[rgba(56,189,248,0.2)] rounded-lg px-3 py-2 m-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 7v5" />
                    <path d="M12 16h.01" />
                  </svg>
                  {nextRoundLabels.status}
                </p>
              )}

              <div className="flex flex-col gap-[0.4rem]">
                {jogadoresAtivos.length === 0 ? (
                  <p className="text-[#beafd7] text-[0.9rem] m-0">Nenhum jogador ativo.</p>
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
                        requiresNextRoundCheckin={requiresNextRoundCheckin}
                        rodadaAtual={rodadaAtual}
                      />
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[rgba(145,71,255,0.2)] flex-shrink-0 max-[480px]:flex-col-reverse max-[480px]:items-stretch">
          {step === "mesas" && (
            <>
              <button type="button" className={`${btnBase} ${btnGhost}`} onClick={onClose}>
                Fechar
              </button>
              <button
                type="button"
                className={`${btnBase} ${btnPrimary}`}
                onClick={() => setStep("jogadores")}
              >
                Revisar Jogadores →
              </button>
            </>
          )}

          {step === "jogadores" && (
            <>
              <button type="button" className={`${btnBase} ${btnGhost}`} onClick={() => setStep("mesas")}>
                ← Voltar
              </button>
              <button
                type="button"
                className={`${btnBase} ${canAdvance ? btnPrimary : btnDisabled}`}
                onClick={handleNextRound}
                disabled={actionLoading || !canAdvance}
              >
                {actionLoading
                  ? "Processando..."
                  : !canAdvance
                    ? nextRoundLabels.blockedCta
                    : nextRoundLabels.cta}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
