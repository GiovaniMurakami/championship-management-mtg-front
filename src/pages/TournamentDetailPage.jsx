import { useNavigate } from "react-router-dom";
import { useTournamentDetail } from "../hooks/useTournamentDetail";
import {
    TournamentHeader,
    PlayerProfile,
    MatchPanel,
    MatchTablesPanel,
    StandingsTable,
    OwnerControlPanel,
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
    } = useTournamentDetail();

    const isFinished = torneio?.status === "finalizado";

    return (
        <div className="td-page">
            <button className="td-back-btn" onClick={() => navigate("/torneios")}>
                ← Voltar para torneios
            </button>

            {(error || successMsg) && (
                <div className={`td-toast ${error ? "td-toast-error" : "td-toast-success"}`}>
                    {error || successMsg}
                </div>
            )}

            <TournamentHeader torneio={torneio} loading={loading} />

            {!loading && (
                <div className={`td-content${isFinished ? " td-content--finalized" : ""}`}>
                    {!isFinished && (
                        <div className="td-main-col">
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
                                    onNextRound={handleNextRound}
                                    onDropPlayer={handleDropPlayer}
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

                    <div className="td-side-col">
                        <MatchTablesPanel
                            torneio={torneio}
                            partidas={partidas}
                            usuarioId={usuario?.id}
                        />
                        <StandingsTable standings={standings} />
                    </div>
                </div>
            )}

            {loading && <SkeletonTournamentDetail />}
        </div>
    );
}
