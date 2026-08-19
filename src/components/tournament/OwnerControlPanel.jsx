import { useEffect, useRef, useState } from "react";
import { ReviewRoundModal } from "./ReviewRoundModal";
import { BaseModal } from "../ui/BaseModal";
import { getNextRoundActionLabels, shouldRequestNextRoundCheckin } from "../../utils/tournamentFlow";
import { normalizeId } from "../../utils/normalizeId";
import { getMatchConfirmationSummary, hasPlayerConfirmedResult } from "../../utils/matchConfirmations";
import { ConfirmationIcon, ConfirmationSummaryIcon } from "./ConfirmationIcon";
import {
  buildTournamentExternalUrl,
  buildTournamentJoinExternalUrl,
} from "../../utils/externalNavigation";
const hasConfirmedDeck = (player) => Boolean(player?.deckConfirmado || player?.deckNome || player?.deck?.nome || player?.deckId);
const hasInitialCheckin = (player) => (player?.checkinRodada ?? -1) >= 0;

function ScoreStepper({ value, onChange }) {
  return (
    <div className="flex items-center gap-[0.3rem]">
      <button
        type="button"
        className="w-8 h-8 border border-[rgba(217,180,255,0.25)] rounded-[0.45rem] bg-[rgba(255,255,255,0.05)] text-[#f5edff] text-[1.15rem] leading-none cursor-pointer flex items-center justify-center transition-all duration-[180ms] hover:bg-[rgba(167,79,255,0.22)] hover:border-[rgba(199,149,255,0.55)] active:scale-95"
        onClick={() => onChange(Math.max(0, value - 1))}
        aria-label="Diminuir"
      >−</button>
      <span className="font-['Bebas_Neue',sans-serif] text-[1.8rem] text-white min-w-[1.6rem] text-center leading-none tabular-nums">{value}</span>
      <button
        type="button"
        className="w-8 h-8 border border-[rgba(217,180,255,0.25)] rounded-[0.45rem] bg-[rgba(255,255,255,0.05)] text-[#f5edff] text-[1.15rem] leading-none cursor-pointer flex items-center justify-center transition-all duration-[180ms] hover:bg-[rgba(167,79,255,0.22)] hover:border-[rgba(199,149,255,0.55)] active:scale-95"
        onClick={() => onChange(Math.min(2, value + 1))}
        aria-label="Aumentar"
      >+</button>
    </div>
  );
}

function getMesaSortValue(partida) {
  const mesa = Number(partida?.mesa ?? partida?.mesaNumero ?? partida?.numeroMesa);
  return Number.isFinite(mesa) ? mesa : Number.MAX_SAFE_INTEGER;
}

function sortByMesa(a, b) {
  const mesaDiff = getMesaSortValue(a) - getMesaSortValue(b);
  if (mesaDiff !== 0) return mesaDiff;
  return Number(a?.rodada ?? 0) - Number(b?.rodada ?? 0);
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
  const confirmation = getMatchConfirmationSummary(partida);
  const player1Confirmed = hasPlayerConfirmedResult(partida, 1);
  const player2Confirmed = hasPlayerConfirmedResult(partida, 2);

  if (editing && !isBye) {
    return (
      <div className="border border-[rgba(199,149,255,0.4)] bg-[rgba(167,79,255,0.06)] rounded-[0.65rem] px-4 py-3 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[0.75rem] font-bold text-[#c795ff]">Mesa {mesa}</span>
          <button
            type="button"
            className="text-[#beafd7] text-[1rem] leading-none cursor-pointer bg-transparent border-none hover:text-[#f5edff] transition-colors"
            onClick={() => { setV1(partida.vitoriasJogador1 ?? 0); setV2(partida.vitoriasJogador2 ?? 0); setEditing(false); }}
            aria-label="Cancelar edição"
          >✕</button>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 max-md:grid-cols-1 max-md:gap-2">
          <div className="flex flex-col items-center gap-1">
            <span className="text-[0.72rem] font-semibold text-[#beafd7] uppercase tracking-[0.04em] text-center truncate w-full">{nome1}</span>
            <ScoreStepper value={v1} onChange={setV1} />
          </div>
          <span className="text-[#beafd7] font-bold text-[1.1rem] pb-1">–</span>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[0.72rem] font-semibold text-[#beafd7] uppercase tracking-[0.04em] text-center truncate w-full">{nome2}</span>
            <ScoreStepper value={v2} onChange={setV2} />
          </div>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center w-full py-[0.45rem] text-[0.85rem] border border-[rgba(199,149,255,0.5)] rounded-[0.7rem] font-semibold cursor-pointer transition-all duration-[220ms] text-white bg-[linear-gradient(145deg,#8e39ed,#5f23b3)] shadow-[0_4px_12px_rgba(167,79,255,0.25)] disabled:opacity-50 disabled:cursor-not-allowed hover:not-disabled:shadow-[0_6px_18px_rgba(167,79,255,0.4)]"
          onClick={async () => {
            await onSave(partida.id, { vitoriasJogador1: v1, vitoriasJogador2: v2 });
            setEditing(false);
          }}
          disabled={saving}
        >
          {saving ? "Salvando..." : "Confirmar resultado"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-[0.6rem] border rounded-[0.65rem] px-[0.65rem] py-2 flex-wrap max-md:flex-col max-md:items-stretch min-w-0 max-w-full overflow-hidden border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)]">
      <span className="text-[0.75rem] font-bold text-[#c795ff] whitespace-nowrap shrink-0">Mesa {mesa}</span>

      <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap max-md:w-full max-md:flex-col max-md:items-center max-md:gap-2">
        <span className="text-[0.85rem] text-[#f5edff] min-w-0 max-w-[140px] truncate max-md:max-w-full max-md:w-full max-md:text-center max-md:whitespace-normal max-md:break-words">{nome1}</span>
        {isFinalizada && !isBye && (
          <ConfirmationIcon confirmed={player1Confirmed} label={`${nome1}: ${player1Confirmed ? "confirmou" : "falta confirmar"}`} />
        )}
        <span className={`inline-flex items-center justify-center min-w-[56px] px-[0.45rem] py-[0.12rem] rounded-full font-bold text-[0.78rem] tracking-[0.04em] ${isFinalizada ? "text-white border border-[rgba(199,149,255,0.5)] bg-[rgba(199,149,255,0.22)]" : "text-[#c4b5fd] border border-[rgba(199,149,255,0.35)] bg-[rgba(167,79,255,0.12)]"}`}>
          {isFinalizada
            ? `${partida.vitoriasJogador1 ?? 0} – ${partida.vitoriasJogador2 ?? 0}`
            : "VS"}
        </span>
        <span className="text-[0.85rem] text-[#f5edff] min-w-0 max-w-[140px] truncate max-md:max-w-full max-md:w-full max-md:text-center max-md:whitespace-normal max-md:break-words">{nome2}</span>
        {isFinalizada && !isBye && (
          <ConfirmationIcon confirmed={player2Confirmed} label={`${nome2}: ${player2Confirmed ? "confirmou" : "falta confirmar"}`} />
        )}
        {isFinalizada && !isBye && (
          <ConfirmationSummaryIcon confirmation={confirmation} />
        )}
      </div>

      {!isBye && (
        <button
          type="button"
          className="inline-flex items-center justify-center px-[0.65rem] py-[0.3rem] text-[0.78rem] border border-[rgba(217,180,255,0.2)] rounded-[0.7rem] font-semibold cursor-pointer transition-all duration-[220ms] whitespace-nowrap text-[#f5edff] bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] hover:border-[rgba(199,149,255,0.5)] ml-auto max-md:ml-0 max-md:w-full"
          onClick={() => setEditing(true)}
        >
          Editar
        </button>
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
  onRefazerRodada,
  onEncerrarTorneio,
  onDropPlayersWithoutDeck,
  onDropPlayersWithoutCheckin,
  onDropPlayer,
  onUndropPlayer,
  onEditResult,
  onAdjustResult,
  onGerarLinkIngresso,
  actionLoading,
  adminActionKey,
  droppingPlayerId,
  partidas,
}) {
  const isRegistrationOpen = torneio?.status === "inscricoes_abertas";
  const isOngoing = torneio?.status === "em_andamento";
  const [activeTab, setActiveTab] = useState(isOngoing ? "mesas" : "jogadores");
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [joinLinkModal, setJoinLinkModal] = useState(null);
  const [generatingJoinLink, setGeneratingJoinLink] = useState(false);
  const [joinLinkCopied, setJoinLinkCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [playersListOpen, setPlayersListOpen] = useState(false);
  const [tablesListOpen, setTablesListOpen] = useState(false);
  const [endModalOpen, setEndModalOpen] = useState(false);
  const [redoModalOpen, setRedoModalOpen] = useState(false);
  const joinLinkTimeoutRef = useRef(null);
  const linkCopiedTimeoutRef = useRef(null);

  useEffect(() => {
    setActiveTab(isOngoing ? "mesas" : "jogadores");
  }, [isOngoing]);

  useEffect(() => {
    return () => {
      clearTimeout(joinLinkTimeoutRef.current);
      clearTimeout(linkCopiedTimeoutRef.current);
    };
  }, []);

  const handleCopyTournamentLink = () => {
    const url = buildTournamentExternalUrl(torneio?.id);
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      clearTimeout(linkCopiedTimeoutRef.current);
      linkCopiedTimeoutRef.current = setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  const handleGenerateJoinLink = async () => {
    if (!onGerarLinkIngresso || generatingJoinLink) return;
    setGeneratingJoinLink(true);
    try {
      const result = await onGerarLinkIngresso();
      if (result?.token) {
        setJoinLinkModal(buildTournamentJoinExternalUrl(result.token));
      }
    } finally {
      setGeneratingJoinLink(false);
    }
  };

  const handleCopyJoinLink = () => {
    if (!joinLinkModal) return;
    navigator.clipboard.writeText(joinLinkModal).then(() => {
      setJoinLinkCopied(true);
      clearTimeout(joinLinkTimeoutRef.current);
      joinLinkTimeoutRef.current = setTimeout(() => setJoinLinkCopied(false), 2000);
    });
  };

  if (!canManage || (!isRegistrationOpen && !isOngoing)) return null;

  const jogadoresAtivos = (standings || []).filter((p) => !p?.dropped);
  const jogadoresDropadosMesmaRodada = (standings || []).filter((p) => p?.dropped && Number(p?.droppedRodada) === Number(torneio?.rodadaAtual));
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
  ).sort(sortByMesa);
  const pendentes = partidasRodada.filter((p) => p.status !== "finalizada");
  const finalizadas = partidasRodada.filter((p) => p.status === "finalizada");
  const contestadas = partidasRodada.filter((p) => p.contestado);
  const isBulkDroppingDeck = actionLoading && adminActionKey === "drop-missing-decks";
  const isBulkDroppingCheckin = actionLoading && adminActionKey === "drop-missing-checkin";
  const isStartingTournament = actionLoading && adminActionKey === "start-tournament";
  const isRedoingRound = actionLoading && adminActionKey === "redo-round";
  const isEndingTournament = actionLoading && adminActionKey === "end-tournament";
  const canRedoRound = isOngoing && Number(torneio?.rodadaAtual || 0) > 1;

  const handleRedoRound = () => {
    if (!onRefazerRodada || !canRedoRound || actionLoading) return;
    setRedoModalOpen(true);
  };

  const handleConfirmRedoRound = () => {
    setRedoModalOpen(false);
    onRefazerRodada?.();
  };

  const handleEndTournament = () => {
    if (!onEncerrarTorneio || !isOngoing || actionLoading) return;
    setEndModalOpen(true);
  };

  const handleConfirmEndTournament = () => {
    setEndModalOpen(false);
    onEncerrarTorneio?.();
  };

  return (
    <section className="border border-[rgba(251,191,36,0.35)] rounded-2xl p-5 bg-[linear-gradient(155deg,rgba(52,30,5,0.5),rgba(24,14,4,0.85))] shadow-[0_4px_20px_rgba(3,2,8,0.3)] animate-[slide-up_400ms_ease-out] max-md:p-4 max-w-full min-w-0 overflow-x-clip">
      <div className="flex items-start justify-between gap-4 mb-4 flex-wrap max-md:flex-col">
        <div className="min-w-0">
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

        <div className="flex flex-col items-end gap-[0.4rem] flex-shrink-0 max-md:w-full max-md:items-stretch">
          {isOngoing && requiresNextRoundCheckin && pendentesCheckin.length > 0 && (
            <p className="flex items-center gap-[0.3rem] m-0 text-[0.82rem] text-[#fbbf24] max-md:justify-center">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {pendentesCheckin.length} jogador(es) sem check-in
            </p>
          )}
          {isOngoing && nextRoundLabels.status && (
            <p className="m-0 text-[0.82rem] text-[#c6b8a0] text-right max-w-[320px] max-md:max-w-none max-md:text-center">
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
            <div className="flex flex-wrap gap-2 justify-end max-md:w-full">
              <button
                className="inline-flex min-h-11 items-center justify-center px-4 py-[0.55rem] border border-[rgba(239,68,68,0.5)] rounded-[0.7rem] text-[0.88rem] font-semibold cursor-pointer transition-all duration-[220ms] whitespace-nowrap text-[#fca5a5] bg-[rgba(239,68,68,0.12)] disabled:opacity-50 disabled:cursor-not-allowed hover:not-disabled:bg-[rgba(239,68,68,0.24)] max-md:flex-1"
                type="button"
                onClick={handleRedoRound}
                disabled={actionLoading || !canRedoRound}
                title={canRedoRound ? "Remove a rodada atual e volta para a anterior" : "Disponível a partir da rodada 2"}
              >
                {isRedoingRound ? "Refazendo..." : "Refazer rodada"}
              </button>
              <button
                className="inline-flex min-h-11 items-center justify-center px-4 py-[0.55rem] border border-[rgba(34,197,94,0.5)] rounded-[0.7rem] text-[0.88rem] font-semibold cursor-pointer transition-all duration-[220ms] whitespace-nowrap text-[#4ade80] bg-[rgba(34,197,94,0.15)] disabled:opacity-50 disabled:cursor-not-allowed hover:not-disabled:bg-[rgba(34,197,94,0.3)] max-md:flex-1"
                type="button"
                onClick={() => setReviewModalOpen(true)}
                disabled={actionLoading}
              >
                Revisar Rodada
              </button>
              <button
                className="inline-flex min-h-11 items-center justify-center px-4 py-[0.55rem] border border-[rgba(239,68,68,0.55)] rounded-[0.7rem] text-[0.88rem] font-semibold cursor-pointer transition-all duration-[220ms] whitespace-nowrap text-[#fda4af] bg-[rgba(239,68,68,0.14)] disabled:opacity-50 disabled:cursor-not-allowed hover:not-disabled:bg-[rgba(239,68,68,0.28)] max-md:flex-1"
                type="button"
                onClick={handleEndTournament}
                disabled={actionLoading}
              >
                {isEndingTournament ? "Encerrando..." : "Encerrar torneio"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Secret tournament warning + links */}
      <div className="flex flex-wrap gap-2 mb-4">
        {torneio?.secreto && (
          <div className="flex items-center gap-[0.5rem] px-3 py-[0.5rem] rounded-[0.7rem] border border-[rgba(167,79,255,0.35)] bg-[rgba(167,79,255,0.1)] text-[#c795ff] text-[0.82rem] font-medium flex-1 min-w-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="flex-shrink-0">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Torneio secreto — não aparece em listagens públicas</span>
          </div>
        )}
        <button
          type="button"
          className="inline-flex items-center gap-[0.45rem] px-3 py-[0.5rem] border border-[rgba(217,180,255,0.25)] rounded-[0.7rem] text-[0.82rem] font-semibold cursor-pointer transition-all duration-[220ms] whitespace-nowrap text-[#beafd7] bg-transparent hover:bg-[rgba(255,255,255,0.06)] hover:text-[#f5edff]"
          onClick={handleCopyTournamentLink}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          {linkCopied ? "Link copiado!" : "Copiar link do torneio"}
        </button>
        {isOngoing && (
          <button
            type="button"
            className="inline-flex items-center gap-[0.45rem] px-3 py-[0.5rem] border border-[rgba(34,197,94,0.4)] rounded-[0.7rem] text-[0.82rem] font-semibold cursor-pointer transition-all duration-[220ms] whitespace-nowrap text-[#4ade80] bg-[rgba(34,197,94,0.08)] disabled:opacity-50 disabled:cursor-not-allowed hover:not-disabled:bg-[rgba(34,197,94,0.18)]"
            onClick={handleGenerateJoinLink}
            disabled={generatingJoinLink}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            {generatingJoinLink ? "Gerando..." : "Gerar link de ingresso"}
          </button>
        )}
      </div>

      {/* Join link modal */}
      {joinLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setJoinLinkModal(null); }}>
          <div className="bg-[#110a22] border border-[rgba(217,180,255,0.2)] rounded-2xl w-full max-w-[480px] p-6 shadow-[0_24px_64px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-[1.1rem] m-0">Link de Ingresso</h3>
              <button type="button" className="text-[#beafd7] hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/[0.08]" onClick={() => setJoinLinkModal(null)} aria-label="Fechar">✕</button>
            </div>
            <p className="text-[#beafd7] text-[0.85rem] mb-3">Compartilhe este link para permitir que um jogador ingresse no torneio em andamento:</p>
            <div className="flex items-stretch gap-2 max-md:flex-col">
              <input
                readOnly
                value={joinLinkModal}
                className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-white/[0.05] border border-[rgba(217,180,255,0.2)] text-[#f5edff] text-[0.82rem] font-mono select-all max-md:text-[0.75rem]"
                onFocus={(e) => e.target.select()}
              />
              <button
                type="button"
                className="flex-shrink-0 inline-flex items-center justify-center gap-[0.35rem] px-4 py-2 border border-[rgba(199,149,255,0.5)] rounded-lg text-[0.85rem] font-semibold cursor-pointer transition-all duration-150 text-white bg-[linear-gradient(145deg,#8e39ed,#5f23b3)] max-md:w-full"
                onClick={handleCopyJoinLink}
              >
                {joinLinkCopied ? "Copiado!" : "Copiar"}
              </button>
            </div>
            <p className="text-[#888] text-[0.75rem] mt-3">O link expirará após uso único ou ao ser substituído por um novo.</p>
          </div>
        </div>
      )}

      <div className="grid gap-3 mb-4 min-[720px]:grid-cols-2">
        {isRegistrationOpen && (
          <div className="rounded-[0.9rem] border border-[rgba(239,68,68,0.24)] bg-[rgba(239,68,68,0.08)] p-4">
            <p className="m-0 text-[0.78rem] tracking-[0.08em] text-[#fca5a5] font-semibold">PENDÊNCIA DE DECK</p>
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
            <p className="m-0 text-[0.78rem] tracking-[0.08em] text-[#fde68a] font-semibold">PENDÊNCIA DE CHECK-IN</p>
            <p className="mt-2 mb-3 text-[0.88rem] text-[#f6ebc4]">
              {isRegistrationOpen
                ? `${jogadoresSemCheckin.length} jogador(es) inscrito(s) ainda não fizeram check-in inicial.`
                : `${jogadoresSemCheckin.length} jogador(es) ainda não confirmaram presença nesta rodada.`}
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

      <div className="flex gap-[0.3rem] mb-[0.85rem] border-b border-[rgba(217,180,255,0.2)] pb-0 flex-wrap min-w-0 max-w-full px-1">
        {isOngoing && (
          <button
            type="button"
            className={`inline-flex flex-shrink-0 items-center gap-[0.4rem] px-[0.9rem] py-[0.45rem] border-none border-b-2 bg-transparent text-[0.85rem] font-semibold font-['inherit'] cursor-pointer transition-[color,border-color] duration-[180ms] mb-[-1px] ${activeTab === "mesas" ? "text-[#fbbf24] border-b-[#fbbf24]" : "text-[#beafd7] border-b-transparent hover:text-[#f5edff]"}`}
            onClick={() => setActiveTab("mesas")}
          >
            Mesas
            {pendentes.length > 0 && (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-[5px] rounded-full text-[0.7rem] font-bold bg-[rgba(167,79,255,0.25)] text-[#c4b5fd]">{pendentes.length}</span>
            )}
          </button>
        )}
        {isOngoing && contestadas.length > 0 && (
          <button
            type="button"
            className={`inline-flex flex-shrink-0 items-center gap-[0.4rem] px-[0.9rem] py-[0.45rem] border-none border-b-2 bg-transparent text-[0.85rem] font-semibold font-['inherit'] cursor-pointer transition-[color,border-color] duration-[180ms] mb-[-1px] ${activeTab === "contestadas" ? "text-[#f87171] border-b-[#f87171]" : "text-[#beafd7] border-b-transparent hover:text-[#f5edff]"}`}
            onClick={() => setActiveTab("contestadas")}
          >
            Contestadas
            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-[5px] rounded-full text-[0.7rem] font-bold bg-[rgba(239,68,68,0.25)] text-[#f87171]">{contestadas.length}</span>
          </button>
        )}
        <button
          type="button"
          className={`inline-flex flex-shrink-0 items-center gap-[0.4rem] px-[0.9rem] py-[0.45rem] border-none border-b-2 bg-transparent text-[0.85rem] font-semibold font-['inherit'] cursor-pointer transition-[color,border-color] duration-[180ms] mb-[-1px] ${activeTab === "jogadores" ? "text-[#fbbf24] border-b-[#fbbf24]" : "text-[#beafd7] border-b-transparent hover:text-[#f5edff]"}`}
          onClick={() => setActiveTab("jogadores")}
        >
          Jogadores
          {pendentesCheckin.length > 0 && (
            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-[5px] rounded-full text-[0.7rem] font-bold bg-[rgba(251,191,36,0.25)] text-[#fbbf24]">{pendentesCheckin.length}</span>
          )}
        </button>
      </div>

      {activeTab === "mesas" && (
        <div className="rounded-[0.9rem] border border-[rgba(251,191,36,0.18)] bg-[rgba(255,255,255,0.025)] overflow-hidden">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-3 border-none bg-transparent px-4 py-3 text-left cursor-pointer text-[#f5edff] transition-colors duration-180 hover:bg-[rgba(251,191,36,0.06)]"
            onClick={() => setTablesListOpen((value) => !value)}
            aria-expanded={tablesListOpen}
          >
            <span className="flex items-center gap-2 min-w-0">
              <span className="font-semibold text-[0.9rem] truncate">Lista de mesas</span>
              <span className="inline-flex items-center justify-center min-w-[22px] h-[20px] px-[0.45rem] rounded-full text-[0.72rem] font-bold bg-[rgba(251,191,36,0.14)] text-[#fde68a] border border-[rgba(251,191,36,0.28)]">
                {partidasRodada.length}
              </span>
              {partidasRodada.length > 0 && (
                <span className="hidden sm:inline text-[0.75rem] text-[#c6b8a0]">
                  {finalizadas.length} finalizada{finalizadas.length !== 1 ? "s" : ""}, {pendentes.length} pendente{pendentes.length !== 1 ? "s" : ""}
                </span>
              )}
            </span>
            <span className="inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-[#fbbf24]">
              {tablesListOpen ? "Ocultar" : "Mostrar"}
              <span
                className={`inline-block h-2 w-2 border-r-2 border-b-2 border-current transition-transform duration-200 ${tablesListOpen ? "-rotate-135 translate-y-[2px]" : "rotate-45 -translate-y-[2px]"}`}
                aria-hidden="true"
              />
            </span>
          </button>

          {tablesListOpen && (
            <div className="border-t border-[rgba(251,191,36,0.12)] p-3">
              {partidasRodada.length === 0 ? (
                <p className="text-[#beafd7] text-[0.9rem] m-0">Nenhuma mesa na rodada atual.</p>
              ) : (
                <>
                  <div className="flex gap-2 mb-[0.65rem] flex-wrap">
                    <span className="px-[0.6rem] py-[0.2rem] rounded-full text-[0.75rem] font-semibold border text-[#6ee7b7] bg-[rgba(16,185,129,0.12)] border-[rgba(16,185,129,0.3)]">
                      {finalizadas.length} finalizada{finalizadas.length !== 1 ? "s" : ""}
                    </span>
                    <span className="px-[0.6rem] py-[0.2rem] rounded-full text-[0.75rem] font-semibold border text-[#fbbf24] bg-[rgba(251,191,36,0.1)] border-[rgba(251,191,36,0.3)]">
                      {pendentes.length} pendente{pendentes.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="grid gap-2 max-h-[480px] overflow-y-auto overflow-x-hidden">
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
        </div>
      )}

      {activeTab === "jogadores" && (
        <div className="rounded-[0.9rem] border border-[rgba(251,191,36,0.18)] bg-[rgba(255,255,255,0.025)] overflow-hidden">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-3 border-none bg-transparent px-4 py-3 text-left cursor-pointer text-[#f5edff] transition-colors duration-180 hover:bg-[rgba(251,191,36,0.06)]"
            onClick={() => setPlayersListOpen((value) => !value)}
            aria-expanded={playersListOpen}
          >
            <span className="flex items-center gap-2 min-w-0">
              <span className="font-semibold text-[0.9rem] truncate">Lista de jogadores</span>
              <span className="inline-flex items-center justify-center min-w-[22px] h-[20px] px-[0.45rem] rounded-full text-[0.72rem] font-bold bg-[rgba(251,191,36,0.14)] text-[#fde68a] border border-[rgba(251,191,36,0.28)]">
                {jogadoresAtivos.length}
              </span>
            </span>
            <span className="inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-[#fbbf24]">
              {playersListOpen ? "Ocultar" : "Mostrar"}
              <span
                className={`inline-block h-2 w-2 border-r-2 border-b-2 border-current transition-transform duration-200 ${playersListOpen ? "-rotate-135 translate-y-[2px]" : "rotate-45 -translate-y-[2px]"}`}
                aria-hidden="true"
              />
            </span>
          </button>

          {playersListOpen && (
            <div className="grid gap-1.5 border-t border-[rgba(251,191,36,0.12)] p-3">
          {jogadoresDropadosMesmaRodada.length > 0 && (
            <div className="grid gap-1.5 rounded-[0.65rem] border border-[rgba(34,197,94,0.22)] bg-[rgba(34,197,94,0.055)] p-2">
              <p className="m-0 text-[0.74rem] font-bold uppercase tracking-[0.06em] text-[#86efac]">Dropados nesta rodada</p>
              {jogadoresDropadosMesmaRodada.map((player) => {
                const playerId = getPlayerId(player);
                const normalizedId = normalizeId(playerId);
                const isMe = normalizeId(playerId) === normalizeId(usuarioId);
                return (
                  <div key={`dropado-${normalizedId || getPlayerName(player)}`} className="flex justify-between items-center gap-[0.65rem] rounded-[0.55rem] border border-[rgba(34,197,94,0.18)] bg-[rgba(34,197,94,0.05)] px-[0.6rem] py-[0.38rem]">
                    <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-[0.88rem] font-semibold text-white">
                      {getPlayerName(player)}{isMe ? " (Você)" : ""}
                    </span>
                    <button
                      className="inline-flex items-center justify-center px-[0.55rem] py-[0.22rem] text-[0.74rem] border border-[rgba(34,197,94,0.45)] rounded-[0.55rem] font-semibold cursor-pointer transition-all duration-[220ms] whitespace-nowrap text-[#86efac] bg-[rgba(34,197,94,0.1)] disabled:opacity-50 disabled:cursor-not-allowed hover:not-disabled:bg-[rgba(34,197,94,0.22)] hover:not-disabled:border-[rgba(34,197,94,0.75)]"
                      type="button"
                      onClick={() => onUndropPlayer?.(playerId)}
                      disabled={actionLoading || !playerId}
                    >
                      {droppingPlayerId && normalizeId(droppingPlayerId) === normalizedId && adminActionKey === "undrop-player" ? "Voltando..." : "Voltar"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          {jogadoresAtivos.length === 0 ? (
            <p className="text-[#beafd7] text-[0.9rem] m-0">Nenhum jogador ativo.</p>
          ) : (
            jogadoresAtivos.map((player) => {
              const playerId = getPlayerId(player);
              const normalizedId = normalizeId(playerId);
              const isMe = normalizeId(playerId) === normalizeId(usuarioId);
              const checkinOk =
                Number(player?.checkinRodada ?? -1) >= Number(torneio?.rodadaAtual ?? 0);

              return (
                <div
                  key={normalizedId || getPlayerName(player)}
                  className="flex justify-between items-center gap-[0.65rem] border border-[rgba(251,191,36,0.16)] rounded-[0.55rem] px-[0.6rem] py-[0.38rem] bg-[rgba(251,191,36,0.035)]"
                >
                  <div className="grid gap-[0.15rem] min-w-0">
                    <span className="text-white text-[0.88rem] font-semibold overflow-hidden text-ellipsis whitespace-nowrap leading-tight">
                      {getPlayerName(player)}{isMe ? " (Você)" : ""}
                    </span>
                    {isRegistrationOpen ? (
                      <div className="flex items-center gap-[0.45rem] text-[#c6b8a0] text-[0.74rem] flex-wrap leading-tight">
                        <span className={`font-semibold ${hasConfirmedDeck(player) ? "text-[#6ee7b7]" : "text-[#fca5a5]"}`}>
                          {hasConfirmedDeck(player) ? "✓ deck enviado" : "sem deck"}
                        </span>
                        <span className={`font-semibold ${hasInitialCheckin(player) ? "text-[#6ee7b7]" : "text-[#fbbf24]"}`}>
                          {hasInitialCheckin(player) ? "✓ check-in" : "sem check-in"}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-[0.45rem] text-[#c6b8a0] text-[0.74rem] flex-wrap leading-tight">
                        <span>{player?.pontosMesa ?? player?.pontos ?? 0} pts</span>
                        {requiresNextRoundCheckin ? (
                          <span className={`font-semibold ${checkinOk ? "text-[#6ee7b7]" : "text-[#fbbf24]"}`}>
                            {checkinOk ? "✓ presença confirmada" : "⏳ sem presença"}
                          </span>
                        ) : (
                          <span className="font-semibold text-[#93c5fd]">
                            sem novo check-in
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    className="inline-flex items-center justify-center px-[0.55rem] py-[0.22rem] text-[0.74rem] border border-[rgba(239,68,68,0.45)] rounded-[0.55rem] font-semibold cursor-pointer transition-all duration-[220ms] whitespace-nowrap text-[#fda4af] bg-[rgba(239,68,68,0.1)] disabled:opacity-50 disabled:cursor-not-allowed hover:not-disabled:bg-[rgba(239,68,68,0.25)] hover:not-disabled:border-[rgba(239,68,68,0.8)]"
                    type="button"
                    onClick={() => onDropPlayer(playerId)}
                    disabled={actionLoading || !playerId}
                  >
                    {droppingPlayerId && normalizeId(droppingPlayerId) === normalizedId
                      ? (adminActionKey === "undrop-player" ? "Voltando..." : "Dropando...")
                      : "Drop"}
                  </button>
                </div>
              );
            })
          )}
            </div>
          )}
        </div>
      )}

      {activeTab === "contestadas" && (
        <div>
          {contestadas.length === 0 ? (
            <p className="text-[#beafd7] text-[0.9rem] m-0">Nenhuma partida contestada.</p>
          ) : (
            <div className="grid gap-2 max-h-[480px] overflow-y-auto pr-[0.2rem]">
              <p className="text-[#fca5a5] text-[0.8rem] m-0 mb-1">Ajuste o resultado para resolver a contestação.</p>
              {contestadas.map((partida) => (
                <div key={partida.id} className="grid gap-1">
                  {partida.observacaoContestacao ? (
                    <p className="m-0 text-[0.8rem] text-[#fde68a] px-1">
                      Observação: {partida.observacaoContestacao}
                    </p>
                  ) : null}
                  <MatchEditRow
                    partida={partida}
                    onSave={onAdjustResult || onEditResult}
                    saving={actionLoading}
                  />
                </div>
              ))}
            </div>
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

      <BaseModal
        isOpen={redoModalOpen}
        onClose={() => setRedoModalOpen(false)}
        ariaLabelledBy="refazer-rodada-title"
        ariaDescribedBy="refazer-rodada-desc"
      >
        <h2 id="refazer-rodada-title" className="font-['Bebas_Neue',sans-serif] text-[1.7rem] tracking-[0.03em] mt-0 mb-3 text-[#f5edff]">
          Refazer rodada {torneio?.rodadaAtual ?? ""}
        </h2>
        <p id="refazer-rodada-desc" className="m-0 mb-5 text-[0.92rem] leading-relaxed text-[#c6b8a0]">
          As partidas desta rodada serão removidas e o torneio voltará para a rodada anterior.
        </p>
        <div className="flex gap-3 max-md:flex-col">
          <button
            type="button"
            className="flex-1 px-4 py-2.5 border border-[rgba(217,180,255,0.25)] rounded-lg text-[#beafd7] text-[0.9rem] font-semibold bg-transparent hover:text-white hover:border-[rgba(199,149,255,0.4)] transition-colors"
            onClick={() => setRedoModalOpen(false)}
            disabled={isRedoingRound}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="flex-1 px-4 py-2.5 border border-[rgba(239,68,68,0.5)] rounded-lg text-[#fecaca] text-[0.9rem] font-semibold bg-[rgba(239,68,68,0.15)] hover:bg-[rgba(239,68,68,0.25)] transition-colors disabled:opacity-50"
            onClick={handleConfirmRedoRound}
            disabled={isRedoingRound}
          >
            {isRedoingRound ? "Refazendo..." : "Confirmar"}
          </button>
        </div>
      </BaseModal>

      <BaseModal
        isOpen={endModalOpen}
        onClose={() => setEndModalOpen(false)}
        ariaLabelledBy="encerrar-torneio-title"
        ariaDescribedBy="encerrar-torneio-desc"
      >
        <h2 id="encerrar-torneio-title" className="font-['Bebas_Neue',sans-serif] text-[1.7rem] tracking-[0.03em] mt-0 mb-3 text-[#f5edff]">
          Encerrar torneio
        </h2>
        <p id="encerrar-torneio-desc" className="m-0 mb-5 text-[0.92rem] leading-relaxed text-[#c6b8a0]">
          Encerrar o torneio agora? O ranking atual será considerado final e não haverá mais rodadas nem corte.
        </p>
        <div className="flex gap-3 max-md:flex-col">
          <button
            type="button"
            className="flex-1 px-4 py-2.5 border border-[rgba(217,180,255,0.25)] rounded-lg text-[#beafd7] text-[0.9rem] font-semibold bg-transparent hover:text-white hover:border-[rgba(199,149,255,0.4)] transition-colors"
            onClick={() => setEndModalOpen(false)}
            disabled={isEndingTournament}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="flex-1 px-4 py-2.5 border border-[rgba(239,68,68,0.5)] rounded-lg text-[#fecaca] text-[0.9rem] font-semibold bg-[rgba(239,68,68,0.15)] hover:bg-[rgba(239,68,68,0.25)] transition-colors disabled:opacity-50"
            onClick={handleConfirmEndTournament}
            disabled={isEndingTournament}
          >
            {isEndingTournament ? "Encerrando..." : "Confirmar encerramento"}
          </button>
        </div>
      </BaseModal>
    </section>
  );
}
