import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTournamentDetail } from "../hooks/useTournamentDetail";
import {
  TournamentHeader,
  PlayerProfile,
  MatchPanel,
  MatchTablesPanel,
  StandingsTable,
  OwnerControlPanel,
  RoundTimer,
  TournamentEditModal,
} from "../components/tournament";
import { SkeletonTournamentDetail } from "../components";
import { PageShell } from "../components/ui/PageShell";

export function TournamentDetailPage() {
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const {
    torneio,
    standings,
    loading,
    actionLoading,
    droppingPlayerId,
    adminActionKey,
    error,
    successMsg,
    isOwner,
    isAdmin,
    canManageTournament,
    pendingCheckinPlayers,
    currentPlayer,
    myMatch,
    partidas,
    decks,
    selectedDeckId,
    setSelectedDeckId,
    handleChooseDeck,
    handleCheckin,
    handleInscrever,
    handleReportResult,
    handleContestResult,
    handleConfirmResult,
    handleAdjustResult,
    handleGerarLinkIngresso,
    handleStartTournament,
    handleNextRound,
    handleBulkDropPlayers,
    handleDropPlayer,
    handleEditTorneio,
    handleDeleteTorneio,
    handleInscreverTarde,
    times,
    selectedTimeId,
    setSelectedTimeId,
    loadPartidas,
    realtimeToast,
    corteInfo,
    dismissCorteInfo,
    usuario,
    token,
  } = useTournamentDetail();

  const isFinished = torneio?.status === "finalizado";
  const isRegistrationOpen = torneio?.status === "inscricoes_abertas";
  const isOngoing = torneio?.status === "em_andamento";
  const canManage = (isOwner || isAdmin) && isRegistrationOpen;

  useEffect(() => {
    if (!torneio) return;
    const title = torneio.nome || torneio.torneioNome || "Tiago Fuguete";
    const image = torneio.bannerUrl || "";

    document.title = title;

    const setMeta = (selector, attr, value) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement("meta");
        const [attrName] = selector.match(/\[([^\]]+)=/)?.[1]?.split("=") ?? [];
        if (attrName) el.setAttribute(attrName, value);
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:image"]', "content", image);
    setMeta('meta[name="twitter:title"]', "content", title);
    setMeta('meta[name="twitter:image"]', "content", image);

    return () => {
      document.title = "Tiago Fuguete";
      setMeta('meta[property="og:title"]', "content", "Tiago Fuguete");
      setMeta('meta[property="og:image"]', "content", "");
      setMeta('meta[name="twitter:title"]', "content", "Tiago Fuguete");
      setMeta('meta[name="twitter:image"]', "content", "");
    };
  }, [torneio]);

  const handleEditSubmit = async (payload) => {
    await handleEditTorneio(payload);
    setShowEditModal(false);
  };

  const handleDeleteConfirmed = async () => {
    const ok = await handleDeleteTorneio();
    if (ok) navigate("/torneios");
  };

  return (
    <PageShell>
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <button
          className="inline-flex items-center gap-[0.4rem] px-4 py-2 border border-[rgba(217,180,255,0.2)] rounded-xl bg-white/[0.03] text-[#beafd7] text-[0.9rem] font-medium cursor-pointer transition-all duration-200 hover:text-white hover:border-[rgba(199,149,255,0.5)] hover:bg-white/[0.06] hover:-translate-x-[2px]"
          onClick={() => navigate("/torneios")}
        >
          ← Voltar para torneios
        </button>
        {canManage && (
          <div className="flex gap-2">
            <button
              className="px-4 py-2 border border-[#4f46e5] rounded-lg bg-[rgba(79,70,229,0.12)] text-[#d9d6ff] text-[0.88rem] font-medium cursor-pointer transition-all duration-200 hover:bg-[#4f46e5] hover:text-white"
              onClick={() => setShowEditModal(true)}
            >
              Editar torneio
            </button>
            <button
              className="px-4 py-2 border border-[rgba(239,68,68,0.5)] rounded-lg bg-[rgba(239,68,68,0.08)] text-[#fca5a5] text-[0.88rem] font-medium cursor-pointer transition-all duration-200 hover:bg-[rgba(239,68,68,0.25)] hover:text-white"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Excluir torneio
            </button>
          </div>
        )}
      </div>

      {torneio?.linkLive && (() => {
        const url = torneio.linkLive;
        const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/);
        const twitchMatch = url.match(/(?:twitch\.tv\/)([\w]+)/);
        if (ytMatch) {
          return (
            <div className="w-full bg-black border-b-2 border-[rgba(145,71,255,0.4)] overflow-hidden mt-2">
              <iframe
                src={`https://www.youtube.com/embed/${ytMatch[1]}`}
                height="450"
                width="100%"
                allowFullScreen
                title="Live"
                className="block border-none w-full max-[768px]:h-[220px]"
              />
            </div>
          );
        }
        if (twitchMatch) {
          return (
            <div className="w-full bg-black border-b-2 border-[rgba(145,71,255,0.4)] overflow-hidden mt-2">
              <iframe
                src={`https://player.twitch.tv/?channel=${twitchMatch[1]}&parent=${window.location.hostname}`}
                height="450"
                width="100%"
                allowFullScreen
                title="Live"
                className="block border-none w-full max-[768px]:h-[220px]"
              />
            </div>
          );
        }
        return null;
      })()}

      {(error || successMsg) && (
        <div
          className={`px-4 py-3 rounded-[0.7rem] mb-5 text-[0.9rem] font-medium animate-[slide-up_300ms_ease-out] ${error
            ? "bg-[rgba(239,68,68,0.15)] border border-[rgba(239,68,68,0.4)] text-[#fca5a5]"
            : "bg-[rgba(34,197,94,0.15)] border border-[rgba(34,197,94,0.4)] text-[#86efac]"
            }`}
        >
          {error || successMsg}
        </div>
      )}

      <TournamentHeader torneio={torneio} loading={loading} className="mt-6" />


      {!loading && torneio && (
        <RoundTimer
          torneioId={torneio.id}
          rodadaAtual={torneio.rodadaAtual}
          status={torneio.status}
          rodadaIniciadaEm={torneio.rodadaIniciadaEm}
        />
      )}

      {!loading && (() => {
        const ownerControlPanelProps = {
          torneio,
          standings,
          usuarioId: usuario?.id,
          pendingCheckinPlayers,
          partidas,
          canManage: canManageTournament,
          onStartTournament: handleStartTournament,
          onNextRound: handleNextRound,
          onDropPlayersWithoutDeck: (playerIds) => handleBulkDropPlayers(playerIds, {
            actionKey: "drop-missing-decks",
            successMessage: "Jogadores sem deck dropados com sucesso!",
            errorMessage: "Erro ao dropar jogadores sem deck.",
          }),
          onDropPlayersWithoutCheckin: (playerIds) => handleBulkDropPlayers(playerIds, {
            actionKey: "drop-missing-checkin",
            successMessage: "Jogadores sem check-in dropados com sucesso!",
            errorMessage: "Erro ao dropar jogadores sem check-in.",
          }),
          onDropPlayer: handleDropPlayer,
          onEditResult: handleReportResult,
          onAdjustResult: handleAdjustResult,
          onGerarLinkIngresso: handleGerarLinkIngresso,
          actionLoading,
          adminActionKey,
          droppingPlayerId,
        };

        const matchPanel = (
          <MatchPanel
            myMatch={myMatch}
            usuario={usuario}
            onReportResult={handleReportResult}
            onContestResult={handleContestResult}
            onConfirmResult={handleConfirmResult}
            actionLoading={actionLoading}
            torneio={torneio}
            isOwner={isOwner}
            currentPlayer={currentPlayer}
            onCheckin={handleCheckin}
          />
        );

        const playerProfile = (
          <PlayerProfile
            torneio={torneio}
            usuario={usuario}
            usuarioNome={usuario?.nome}
            currentPlayer={currentPlayer}
            decks={decks}
            selectedDeckId={selectedDeckId}
            onDeckChange={setSelectedDeckId}
            onChooseDeck={handleChooseDeck}
            onCheckin={handleCheckin}
            onInscrever={handleInscrever}
            onInscreverTarde={handleInscreverTarde}
            actionLoading={actionLoading}
            times={times}
            selectedTimeId={selectedTimeId}
            onTimeChange={setSelectedTimeId}
          />
        );

        const standingsTable = (compact) => (
          <StandingsTable
            standings={standings}
            isFinished={isFinished}
            isRegistrationOpen={isRegistrationOpen}
            token={token}
            isOwner={isOwner}
            torneioNome={torneio?.nome}
            rodadaAtual={torneio?.rodadaAtual ?? 0}
            compact={compact}
          />
        );

        const matchTablesPanel = (
          <MatchTablesPanel
            torneio={torneio}
            partidas={partidas}
            usuarioId={usuario?.id}
            isOwner={isOwner}
            token={token}
            onPartidasUpdate={loadPartidas}
          />
        );

        // ── Ongoing: standings compact sidebar on left, everything else on right ──
        if (isOngoing) {
          return (
            <div className="grid grid-cols-[minmax(260px,300px)_1fr] gap-6 items-start max-[900px]:grid-cols-1">
              {/* Left: sticky compact standings */}
              <div className="sticky top-4 max-[900px]:static max-[900px]:order-last">
                {standingsTable(true)}
              </div>
              {/* Right: player/admin actions + tables */}
              <div className="grid gap-6">
                {matchPanel}
                {canManageTournament && <OwnerControlPanel {...ownerControlPanelProps} />}
                {playerProfile}
                {matchTablesPanel}
              </div>
            </div>
          );
        }

        // ── Finished: single column, full standings + tables ─────────────────────
        if (isFinished) {
          return (
            <div className="grid gap-6">
              {standingsTable(false)}
              {matchTablesPanel}
            </div>
          );
        }

        // ── Registration: admin+player on left, registered players on right ──────
        return (
          <div className="grid grid-cols-2 gap-6 items-start max-[900px]:grid-cols-1">
            <div className="grid gap-6">
              {canManageTournament && <OwnerControlPanel {...ownerControlPanelProps} />}
              {matchPanel}
              {playerProfile}
            </div>
            <div className="grid gap-6">
              {standingsTable(false)}
            </div>
          </div>
        );
      })()}

      {loading && <SkeletonTournamentDetail />}

      {/* Corte modal */}
      {corteInfo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-[fade-in_200ms_ease-out]"
          onClick={(e) => { if (e.target === e.currentTarget) dismissCorteInfo(); }}
        >
          <div className="bg-[#110a22] border border-[rgba(199,149,255,0.4)] rounded-2xl w-full max-w-[440px] p-7 shadow-[0_24px_64px_rgba(0,0,0,0.6)] animate-[slide-up_220ms_ease-out] text-center">
            <div className="text-[2.5rem] mb-3">⚔️</div>
            <h3 className="text-white font-['Bebas_Neue',sans-serif] text-[1.8rem] tracking-[0.06em] m-0 mb-2">
              Top {corteInfo.corteTop} — Fase Eliminatória!
            </h3>
            <p className="text-[#beafd7] text-[0.9rem] m-0 mb-5">
              Os {corteInfo.corteTop} melhores jogadores classificados avançam para a fase eliminatória.
            </p>
            {corteInfo.jogadoresClassificados?.length > 0 && (
              <div className="text-left mb-5 max-h-[180px] overflow-y-auto flex flex-col gap-1">
                {corteInfo.jogadoresClassificados.map((j, i) => (
                  <div key={j.usuarioId || i} className="flex items-center gap-2 px-3 py-[0.35rem] rounded-lg bg-[rgba(199,149,255,0.08)] border border-[rgba(199,149,255,0.18)]">
                    <span className="text-[0.72rem] font-bold text-[#a78bfa] w-5 text-center">{i + 1}.</span>
                    <span className="text-[0.88rem] font-semibold text-[#f5edff]">{j.nome}</span>
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              className="inline-flex items-center justify-center w-full px-5 py-[0.65rem] border-none rounded-[0.7rem] text-[0.95rem] font-semibold cursor-pointer text-white bg-[linear-gradient(145deg,#8e39ed,#5f23b3)] shadow-[0_4px_12px_rgba(167,79,255,0.3)] hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(167,79,255,0.4)] transition-all duration-200"
              onClick={dismissCorteInfo}
            >
              Entendido!
            </button>
          </div>
        </div>
      )}

      {/* Realtime toast */}
      {realtimeToast && (
        <div
          className={`fixed bottom-6 right-6 z-[200] max-w-[340px] flex items-start gap-3 px-4 py-3 rounded-[0.8rem] shadow-[0_8px_24px_rgba(0,0,0,0.5)] border animate-[slide-up_300ms_ease-out] ${realtimeToast.type === "success"
            ? "bg-[rgba(34,197,94,0.15)] border-[rgba(34,197,94,0.45)] text-[#86efac]"
            : realtimeToast.type === "warning"
              ? "bg-[rgba(251,191,36,0.13)] border-[rgba(251,191,36,0.45)] text-[#fde68a]"
              : "bg-[rgba(56,189,248,0.12)] border-[rgba(56,189,248,0.4)] text-[#7dd3fc]"
            }`}
        >
          <span className="text-[0.88rem] font-semibold leading-snug flex-1">{realtimeToast.msg}</span>
          <button
            type="button"
            className="text-inherit opacity-60 hover:opacity-100 cursor-pointer bg-transparent border-none p-0 text-[1rem] leading-none flex-shrink-0"
            onClick={() => { }}
            aria-label="Fechar"
          >✕</button>
        </div>
      )}

      <TournamentEditModal
        torneio={torneio}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleEditSubmit}
        loading={actionLoading}
        token={token}
      />

      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-[fade-in_200ms_ease-out]"
          onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteConfirm(false); }}
        >
          <div className="bg-[#110a22] border border-[rgba(239,68,68,0.3)] rounded-2xl w-full max-w-[420px] p-6 shadow-[0_24px_64px_rgba(0,0,0,0.6)] animate-[slide-up_220ms_ease-out]">
            <h3 className="text-white font-semibold text-[1.1rem] m-0 mb-3">Excluir torneio</h3>
            <p className="text-[#beafd7] text-[0.9rem] m-0 mb-6">
              Tem certeza que deseja excluir <strong className="text-white">{torneio?.nome}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                className="px-5 py-2.5 border border-[rgba(217,180,255,0.2)] rounded-lg text-[#beafd7] bg-transparent cursor-pointer font-medium text-[0.9rem] transition-all duration-200 hover:text-white hover:bg-white/[0.05] disabled:opacity-50"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={actionLoading}
              >
                Cancelar
              </button>
              <button
                className="px-5 py-2.5 bg-[rgba(239,68,68,0.15)] border border-[rgba(239,68,68,0.5)] text-[#fca5a5] rounded-lg font-semibold text-[0.9rem] cursor-pointer transition-all duration-200 hover:bg-[rgba(239,68,68,0.35)] hover:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleDeleteConfirmed}
                disabled={actionLoading}
              >
                {actionLoading ? "Excluindo..." : "Confirmar exclusão"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
