import { useState } from "react";

export function MatchPanel({ myMatch, usuario, onReportResult, actionLoading }) {
    const [winsPlayer1, setWinsPlayer1] = useState(0);
    const [winsPlayer2, setWinsPlayer2] = useState(0);

    if (!myMatch) {
        return (
            <section className="td-card td-match-card">
                <h2 className="td-card-title">Partida Atual</h2>
                <p className="td-empty-text">Nenhuma partida na rodada atual.</p>
            </section>
        );
    }

    const player1Name =
        myMatch.jogador1Nome ||
        myMatch.jogador1?.nome ||
        myMatch.jogador1?.username ||
        "Jogador 1";
    const player2Name =
        myMatch.jogador2Nome ||
        myMatch.jogador2?.nome ||
        myMatch.jogador2?.username ||
        "Jogador 2";

    const isBye = !myMatch.jogador2Id && !myMatch.jogador2;
    const isReported = myMatch.status === "finalizada" || myMatch.resultado || myMatch.reportado;

    const isPlayer1 =
        myMatch.jogador1Id === usuario?.id || myMatch.jogador1?.id === usuario?.id;

    const myName = isPlayer1 ? player1Name : player2Name;
    const opponentName = isPlayer1
        ? isBye
            ? "BYE"
            : player2Name
        : player1Name;

    const handleSubmit = () => {
        const resultado = {
            vitoriasJogador1: isPlayer1 ? winsPlayer1 : winsPlayer2,
            vitoriasJogador2: isPlayer1 ? winsPlayer2 : winsPlayer1,
        };
        onReportResult(myMatch.id, resultado);
    };

    return (
        <section className="td-card td-match-card">
            <h2 className="td-card-title">Partida Atual</h2>

            {isBye ? (
                <div className="td-match-bye">
                    <div className="td-match-player td-match-you">
                        <span className="td-match-player-label">Você</span>
                        <span className="td-match-player-name">{myName}</span>
                    </div>
                    <div className="td-match-vs">BYE</div>
                    <p className="td-match-bye-text">Você recebeu bye nesta rodada.</p>
                </div>
            ) : (
                <>
                    <div className="td-match-versus">
                        <div className="td-match-player td-match-you">
                            <span className="td-match-player-label">Você</span>
                            <span className="td-match-player-name">{myName}</span>
                        </div>
                        <div className={`td-match-vs${isReported ? " td-match-vs-score" : ""}`}>
                            {isReported
                                ? `${myMatch.vitoriasJogador1 ?? "?"} - ${myMatch.vitoriasJogador2 ?? "?"}`
                                : "VS"}
                        </div>
                        <div className="td-match-player td-match-opponent">
                            <span className="td-match-player-label">Oponente</span>
                            <span className="td-match-player-name">{opponentName}</span>
                        </div>
                    </div>

                    {isReported ? (
                        <p className="td-match-reported-inline">
                            Resultado registrado
                        </p>
                    ) : (
                        <div className="td-match-report">
                            <h3 className="td-match-report-title">Registrar Resultado</h3>
                            <div className="td-match-score-input">
                                <div className="td-score-group">
                                    <label className="td-score-label">{myName}</label>
                                    <div className="td-score-controls">
                                        <button
                                            type="button"
                                            className="td-score-btn"
                                            onClick={() => setWinsPlayer1(Math.max(0, winsPlayer1 - 1))}
                                        >
                                            −
                                        </button>
                                        <span className="td-score-value">{winsPlayer1}</span>
                                        <button
                                            type="button"
                                            className="td-score-btn"
                                            onClick={() => setWinsPlayer1(Math.min(2, winsPlayer1 + 1))}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <span className="td-score-x">×</span>

                                <div className="td-score-group">
                                    <label className="td-score-label">{opponentName}</label>
                                    <div className="td-score-controls">
                                        <button
                                            type="button"
                                            className="td-score-btn"
                                            onClick={() => setWinsPlayer2(Math.max(0, winsPlayer2 - 1))}
                                        >
                                            −
                                        </button>
                                        <span className="td-score-value">{winsPlayer2}</span>
                                        <button
                                            type="button"
                                            className="td-score-btn"
                                            onClick={() => setWinsPlayer2(Math.min(2, winsPlayer2 + 1))}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                className="td-btn td-btn-primary td-btn-report"
                                disabled={actionLoading || (winsPlayer1 === 0 && winsPlayer2 === 0)}
                                onClick={handleSubmit}
                            >
                                {actionLoading ? "Enviando..." : "Enviar Resultado"}
                            </button>
                        </div>
                    )}
                </>
            )}
        </section>
    );
}
