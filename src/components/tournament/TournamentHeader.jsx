export function TournamentHeader({ torneio, loading }) {
    const formatDate = (dateString) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleString("pt-BR");
    };

    const statusLabels = {
        inscricoes_abertas: "Inscrições Abertas",
        em_andamento: "Em Andamento",
        finalizado: "Finalizado",
    };

    const status = torneio?.status || "—";

    return (
        <div className="td-header">
            <h1 className="td-title">
                {loading ? "Carregando..." : torneio?.nome || torneio?.torneioNome || "Torneio"}
            </h1>
            {!loading && torneio && (
                <div className="td-meta">
                    <span className={`td-status-badge td-status-${status}`}>
                        {statusLabels[status] || status.replace("_", " ")}
                    </span>
                    <span className="td-meta-item">
                        <strong>Formato:</strong> {torneio.formato || "—"}
                    </span>
                    <span className="td-meta-item">
                        <strong>Rodada:</strong> {torneio.rodadaAtual ?? 0}/{torneio.totalRodadas ?? 0}
                    </span>
                    {torneio.totalInscritos != null && (
                        <span className="td-meta-item">
                            <strong>Inscritos:</strong> {torneio.totalInscritos}
                            {torneio.totalCheckin != null && ` (${torneio.totalCheckin} check-in)`}
                        </span>
                    )}
                    {torneio.premio && (
                        <span className="td-meta-item">
                            <strong>Prêmio:</strong> {torneio.premio}
                        </span>
                    )}
                    <span className="td-meta-item">
                        <strong>Data:</strong> {formatDate(torneio.horario)}
                    </span>
                </div>
            )}
        </div>
    );
}
