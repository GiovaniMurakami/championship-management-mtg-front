import { useState } from "react";
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
    error,
    successMsg,
    isOwner,
    isAdmin,
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
    handleNextRound,
    handleDropPlayer,
    handleEditTorneio,
    handleDeleteTorneio,
    usuario,
    token,
  } = useTournamentDetail();

  const isFinished = torneio?.status === "finalizado";
  const canManage = (isOwner || isAdmin) && torneio?.status === "inscricoes_abertas";

  const handleEditSubmit = async (payload) => {
    await handleEditTorneio(payload);
    setShowEditModal(false);
  };

  const handleDeleteConfirmed = async () => {
    const ok = await handleDeleteTorneio();
    if (ok) navigate("/torneios");
  };

  return (
    <div className="max-w-[1200px] mx-auto px-8 pt-[7.5rem] pb-12 animate-[fade-in_400ms_ease-out] max-[768px]:px-4 max-[768px]:pt-[6.5rem]">
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

      <div className="w-full bg-black border-b-2 border-[rgba(145,71,255,0.4)] overflow-hidden mt-2">
        <iframe
          src={`https://player.twitch.tv/?channel=tiagofuguete&parent=${window.location.hostname}`}
          height="450"
          width="100%"
          allowFullScreen
          title="Twitch - tiagofuguete"
          className="block border-none w-full max-[768px]:h-[220px]"
        />
      </div>

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
        />
      )}

      {!loading && (
        <div className={`grid gap-6 items-start ${isFinished ? "grid-cols-1" : "grid-cols-2 max-[900px]:grid-cols-1"}`}>
          {!isFinished && (
            <div className="grid gap-6">
              <MatchPanel
                myMatch={myMatch}
                usuario={usuario}
                onReportResult={handleReportResult}
                actionLoading={actionLoading}
                torneio={torneio}
              />

              {isOwner && (
                <OwnerControlPanel
                  torneio={torneio}
                  standings={standings}
                  usuarioId={usuario?.id}
                  pendingCheckinPlayers={pendingCheckinPlayers}
                  partidas={partidas}
                  onNextRound={handleNextRound}
                  onDropPlayer={handleDropPlayer}
                  onEditResult={handleReportResult}
                  actionLoading={actionLoading}
                  droppingPlayerId={droppingPlayerId}
                />
              )}

              <PlayerProfile
                torneio={torneio}
                usuarioNome={usuario?.nome}
                currentPlayer={currentPlayer}
                decks={decks}
                selectedDeckId={selectedDeckId}
                onDeckChange={setSelectedDeckId}
                onChooseDeck={handleChooseDeck}
                onCheckin={handleCheckin}
                onInscrever={handleInscrever}
                actionLoading={actionLoading}
              />
            </div>
          )}

          <div className="grid gap-6">
            <MatchTablesPanel
              torneio={torneio}
              partidas={partidas}
              usuarioId={usuario?.id}
            />
            <StandingsTable
              standings={standings}
              isFinished={isFinished}
              token={token}
              isOwner={isOwner}
              torneioNome={torneio?.nome}
            />
          </div>
        </div>
      )}

      {loading && <SkeletonTournamentDetail />}

      <TournamentEditModal
        torneio={torneio}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleEditSubmit}
        loading={actionLoading}
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
    </div>
  );
}
