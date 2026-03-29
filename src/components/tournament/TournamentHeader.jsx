export function TournamentHeader({ torneio, loading }) {
    const formatDate = (dateString) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleString("pt-BR", { timeZone: "UTC" });
    };

    const statusLabels = {
        inscricoes_abertas: "Inscrições Abertas",
        em_andamento: "Em Andamento",
        finalizado: "Finalizado",
    };

    const status = torneio?.status || "—";

    const statusBadgeClass = {
        inscricoes_abertas: "bg-[rgba(34,197,94,0.18)] text-[#4ade80] border border-[rgba(34,197,94,0.4)]",
        em_andamento: "bg-[rgba(251,191,36,0.18)] text-[#fbbf24] border border-[rgba(251,191,36,0.4)]",
        finalizado: "bg-[rgba(239,68,68,0.18)] text-[#f87171] border border-[rgba(239,68,68,0.4)]",
    }[status] || "bg-[rgba(255,255,255,0.08)] text-[#beafd7] border border-[rgba(217,180,255,0.2)]";

    return (
        <div className="text-center mb-8 max-[480px]:mb-5">
            <h1 className="font-['Bebas_Neue',sans-serif] text-[clamp(2rem,4vw,3rem)] tracking-[0.04em] m-0 mb-4 text-white [text-shadow:0_2px_12px_rgba(167,79,255,0.2)]">
                {loading ? "Carregando..." : torneio?.nome || torneio?.torneioNome || "Torneio"}
            </h1>
            {!loading && torneio && (
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-[#beafd7] text-[0.9rem] max-[480px]:justify-start max-[480px]:gap-x-0 max-[480px]:gap-y-[0.45rem] max-[480px]:text-[0.82rem]">
                    <span className={`inline-block px-3 py-[0.2rem] rounded-full text-[0.78rem] font-semibold uppercase tracking-[0.5px] ${statusBadgeClass}`}>
                        {statusLabels[status] || status.replace("_", " ")}
                    </span>
                    <span className="max-[480px]:w-full max-[480px]:text-left">
                        <strong className="text-[#f5edff]">Formato:</strong> {torneio.formato || "—"}
                    </span>
                    <span className="max-[480px]:w-full max-[480px]:text-left">
                        <strong className="text-[#f5edff]">Rodada:</strong> {torneio.rodadaAtual ?? 0}/{torneio.totalRodadas ?? 0}
                    </span>
                    {torneio.totalInscritos != null && (
                        <span className="max-[480px]:w-full max-[480px]:text-left">
                            <strong className="text-[#f5edff]">Inscritos:</strong> {torneio.totalInscritos}
                            {torneio.totalCheckin != null && ` (${torneio.totalCheckin} check-in)`}
                        </span>
                    )}
                    {torneio.premio && (
                        <span className="max-[480px]:w-full max-[480px]:text-left">
                            <strong className="text-[#f5edff]">Prêmio:</strong> {torneio.premio}
                        </span>
                    )}
                    <span className="max-[480px]:w-full max-[480px]:text-left">
                        <strong className="text-[#f5edff]">Data:</strong> {formatDate(torneio.horario)}
                    </span>
                </div>
            )}
        </div>
    );
}
