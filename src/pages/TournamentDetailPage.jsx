import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTournamentDetail } from "../hooks/useTournamentDetail";
import { usePageTitle } from "../hooks/usePageTitle";
import {
  TournamentHeader,
  PlayerProfile,
  MatchPanel,
  MatchTablesPanel,
  EliminationBracket,
  StandingsTable,
  OwnerControlPanel,
  RoundTimer,
  TournamentEditModal,
  TournamentHostModal,
} from "../components/tournament";
import { SkeletonTournamentDetail } from "../components";
import { PageShell } from "../components/ui/PageShell";
import { InlineAlert } from "../components/ui/InlineAlert";
import { DeleteConfirmModal } from "../components/ui/DeleteConfirmModal";

export function TournamentDetailPage() {
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHostModal, setShowHostModal] = useState(false);
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
    isAnfitriao,
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
    handleRefazerRodada,
    handleBulkDropPlayers,
    handleDropPlayer,
    handleEditTorneio,
    handleDefinirAnfitriao,
    handleDeleteTorneio,
    handleInscreverTarde,
    times,
    selectedTimeId,
    setSelectedTimeId,
    loadPartidas,
    realtimeToast,
    dismissRealtimeToast,
    corteInfo,
    dismissCorteInfo,
    usuario,
    token,
  } = useTournamentDetail();

  const isFinished = torneio?.status === "finalizado";
  const isRegistrationOpen = torneio?.status === "inscricoes_abertas";
  const isOngoing = torneio?.status === "em_andamento";
  const canManage = canManageTournament && isRegistrationOpen;

  const torneioNome = torneio?.nome || torneio?.torneioNome;
  usePageTitle(torneioNome, {
    seo: true,
    image: torneio?.bannerUrl || "",
    loading: loading && !torneio,
    fallback: "Torneio",
  });

  const handleHostSubmit = async (anfitriaoId) => {
    const ok = await handleDefinirAnfitriao(anfitriaoId);
    if (ok) setShowHostModal(false);
  };

  const handleEditSubmit = async (payload) => {
    await handleEditTorneio(payload);
    setShowEditModal(false);
  };

  const handleDeleteConfirmed = async (_confirmName, closeModal) => {
    const ok = await handleDeleteTorneio();
    if (ok) {
      closeModal();
      navigate("/");
    }
  };

  return (
    <PageShell>
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap max-md:flex-col max-md:items-stretch">
        <button
          className="inline-flex items-center gap-[0.4rem] px-4 py-2 border border-[rgba(217,180,255,0.2)] rounded-xl bg-white/[0.03] text-[#beafd7] text-[0.9rem] font-medium cursor-pointer transition-all duration-200 hover:text-white hover:border-[rgba(199,149,255,0.5)] hover:bg-white/[0.06] hover:-translate-x-[2px] max-md:w-full max-md:justify-center"
          onClick={() => navigate("/")}
        >
          ← Voltar para torneios
        </button>
        {canManage && (
          <div className="flex gap-2 max-md:w-full flex-wrap justify-end">
            {isAdmin && (
              <button
                className="px-4 py-2 border border-[rgba(199,149,255,0.45)] rounded-lg bg-[rgba(167,79,255,0.1)] text-[#e9d5ff] text-[0.88rem] font-medium cursor-pointer transition-all duration-200 hover:bg-[rgba(167,79,255,0.22)] hover:text-white max-md:flex-1"
                onClick={() => setShowHostModal(true)}
              >
                {torneio?.anfitriao ? "Alterar anfitrião" : "Definir anfitrião"}
              </button>
            )}
            <button
              className="px-4 py-2 border border-[#4f46e5] rounded-lg bg-[rgba(79,70,229,0.12)] text-[#d9d6ff] text-[0.88rem] font-medium cursor-pointer transition-all duration-200 hover:bg-[#4f46e5] hover:text-white max-md:flex-1"
              onClick={() => setShowEditModal(true)}
            >
              Editar torneio
            </button>
            <button
              className="px-4 py-2 border border-[rgba(239,68,68,0.5)] rounded-lg bg-[rgba(239,68,68,0.08)] text-[#fca5a5] text-[0.88rem] font-medium cursor-pointer transition-all duration-200 hover:bg-[rgba(239,68,68,0.25)] hover:text-white max-md:flex-1"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Excluir torneio
            </button>
          </div>
        )}
      </div>

      {torneio && (() => {
        const url = torneio.linkLive || "https://twitch.tv/tiagofuguete";
        const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/);
        const twitchMatch = url.match(/(?:twitch\.tv\/)([\w]+)/);
        const twitchParent = typeof window !== "undefined" ? window.location.hostname : "localhost";
        if (ytMatch) {
          return (
            <div className="w-full bg-black border-b-2 border-[rgba(145,71,255,0.4)] overflow-hidden mt-2">
              <iframe
                src={`https://www.youtube.com/embed/${ytMatch[1]}`}
                height="450"
                width="100%"
                allowFullScreen
                title="Live"
                className="block border-none w-full max-md:h-[200px] max-sm:h-[180px]"
              />
            </div>
          );
        }
        if (twitchMatch || !torneio.linkLive) {
          const twitchChannel = twitchMatch?.[1] || "tiagofuguete";
          return (
            <div className="w-full bg-black border-b-2 border-[rgba(145,71,255,0.4)] overflow-hidden mt-2">
              <iframe
                src={`https://player.twitch.tv/?channel=${twitchChannel}&parent=${twitchParent}&muted=true`}
                height="450"
                width="100%"
                allowFullScreen
                title="Live"
                className="block border-none w-full max-md:h-[200px] max-sm:h-[180px]"
              />
            </div>
          );
        }
        return null;
      })()}

      {(error || successMsg) && (
        <InlineAlert type={error ? "error" : "success"} className="mb-5">
          {error || successMsg}
        </InlineAlert>
      )}

      <TournamentHeader torneio={torneio} loading={loading} className="mt-6" />

      {loading && !torneio && <SkeletonTournamentDetail />}


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
          onRefazerRodada: handleRefazerRodada,
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

        const shouldShowMatchPanel = Boolean(currentPlayer) && !currentPlayer?.dropped;
        const matchPanelKey = `${myMatch?.id || "none"}:${myMatch?.rodada || ""}:${torneio?.rodadaAtual || ""}`;
        const matchPanel = shouldShowMatchPanel ? (
          <MatchPanel
            key={matchPanelKey}
            myMatch={myMatch}
            usuario={usuario}
            onReportResult={handleReportResult}
            onContestResult={handleContestResult}
            onConfirmResult={handleConfirmResult}
            actionLoading={actionLoading}
            torneio={torneio}
            isOwner={canManageTournament}
            currentPlayer={currentPlayer}
            onCheckin={handleCheckin}
          />
        ) : null;

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
            token={token}
          />
        );

        const standingsTable = (compact) => (
          <StandingsTable
            standings={standings}
            isFinished={isFinished}
            isRegistrationOpen={isRegistrationOpen}
            token={token}
            isOwner={isOwner}
            isAdmin={isAdmin}
            isAnfitriao={isAnfitriao}
            canManageTournament={canManageTournament}
            torneioNome={torneio?.nome}
            rodadaAtual={torneio?.rodadaAtual ?? 0}
            compact={compact}
            totalInscritos={torneio?.totalInscritos}
          />
        );

        const matchTablesPanel = (
          <>
            <EliminationBracket torneio={torneio} partidas={partidas} />
            <MatchTablesPanel
              torneio={torneio}
              partidas={partidas}
              usuarioId={usuario?.id}
              isOwner={canManageTournament}
              token={token}
              onPartidasUpdate={loadPartidas}
            />
          </>
        );

        const shouldShowPlayerProfile = !isOngoing && !isFinished;

        // ── Ongoing: standings compact sidebar on left, everything else on right ──
        if (isOngoing) {
          return (
            <div className="grid gap-6">
              {canManageTournament && <OwnerControlPanel {...ownerControlPanelProps} />}
              {matchPanel}
              {standingsTable(false)}
              {matchTablesPanel}
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
          <div className="grid gap-6">
            {canManageTournament && <OwnerControlPanel {...ownerControlPanelProps} />}
            {shouldShowPlayerProfile && playerProfile}
            {standingsTable(false)}
          </div>
        );
      })()}

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
          className={`fixed bottom-6 right-6 z-[200] max-w-[340px] flex items-start gap-3 px-4 py-3 rounded-[0.8rem] shadow-[0_8px_24px_rgba(0,0,0,0.5)] border animate-[slide-up_300ms_ease-out] max-md:left-4 max-md:right-4 max-md:bottom-4 max-md:max-w-none ${realtimeToast.type === "success"
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
            onClick={dismissRealtimeToast}
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

      <TournamentHostModal
        isOpen={showHostModal}
        onClose={() => setShowHostModal(false)}
        torneio={torneio}
        token={token}
        onSubmit={handleHostSubmit}
        loading={actionLoading}
      />

      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        itemName={torneio?.nome ?? ""}
        onConfirm={handleDeleteConfirmed}
        loading={actionLoading}
        error={error}
        title="Excluir torneio"
        description={
          <>
            Você está prestes a excluir{" "}
            <strong className="text-brand">{torneio?.nome}</strong>. Esta ação não pode ser desfeita.
          </>
        }
      />
    </PageShell>
  );
}
