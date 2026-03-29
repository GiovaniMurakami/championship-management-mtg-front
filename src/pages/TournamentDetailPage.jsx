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
} from "../components/tournament";
import { SkeletonTournamentDetail } from "../components";

export function TournamentDetailPage() {
  const navigate = useNavigate();
  const {
    torneio,
    standings,
    loading,
    actionLoading,
    droppingPlayerId,
    error,
    successMsg,
    isOwner,
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
    usuario,
    token,
  } = useTournamentDetail();

  const isFinished = torneio?.status === "finalizado";

  return (
    <div className="max-w-[1200px] mx-auto px-8 pt-[7.5rem] pb-12 animate-[fade-in_400ms_ease-out] max-[768px]:px-4 max-[768px]:pt-[6.5rem]">
      <button
        className="inline-flex items-center gap-[0.4rem] px-4 py-2 border border-[rgba(217,180,255,0.2)] rounded-xl bg-white/[0.03] text-[#beafd7] text-[0.9rem] font-medium cursor-pointer transition-all duration-200 mb-6 hover:text-white hover:border-[rgba(199,149,255,0.5)] hover:bg-white/[0.06] hover:-translate-x-[2px]"
        onClick={() => navigate("/torneios")}
      >
        ← Voltar para torneios
      </button>

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
          className={`px-4 py-3 rounded-[0.7rem] mb-5 text-[0.9rem] font-medium animate-[slide-up_300ms_ease-out] ${
            error
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
    </div>
  );
}
