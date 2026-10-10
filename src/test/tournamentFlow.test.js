import {
    calculateAutomaticSwissRounds,
    calculateSwissRounds,
    formatTournamentRoundLabel,
    getFirstEliminationRound,
    getTournamentNextAction,
    getNextRoundActionLabels,
    isEliminationPhase,
    NEXT_ROUND_ACTION,
} from "../utils/tournamentFlow";

describe("tournamentFlow", () => {
    it("calcula o total automatico de rodadas suicas por log2 arredondado para cima", () => {
        expect(calculateAutomaticSwissRounds(17)).toBe(5);
    });

    it("aplica maxRodadas como total forçado de rodadas Swiss", () => {
        expect(calculateSwissRounds(17, 4)).toBe(4);
        expect(calculateSwissRounds(17, 7)).toBe(7);
        expect(calculateSwissRounds(17)).toBe(5);
    });

    it("identifica corte top como fase eliminatoria pelo estado emCorte", () => {
        expect(isEliminationPhase({
            corteTop: 8,
            emCorte: true,
            rodadaAtual: 9,
            totalRodadas: 11,
        })).toBe(true);
        expect(isEliminationPhase({
            corteTop: 8,
            emCorte: false,
            rodadaAtual: 6,
            totalRodadas: 8,
        })).toBe(false);
    });

    it("nao calcula rodada de corte no Swiss", () => {
        expect(getFirstEliminationRound({
            corteTop: 8,
            emCorte: false,
            rodadaAtual: 6,
            totalRodadas: 8,
        })).toBeNull();
        expect(getFirstEliminationRound({
            corteTop: 8,
            emCorte: true,
            rodadaAtual: 9,
            totalRodadas: 11,
        })).toBe(9);
    });

    it("formata chip de rodada sem mostrar Sem limite quando total ainda não sincronizou", () => {
        expect(formatTournamentRoundLabel({ rodadaAtual: 1, totalRodadas: 3, status: "em_andamento" })).toBe("1 / 3");
        expect(formatTournamentRoundLabel({ rodadaAtual: 1, totalRodadas: 0, status: "em_andamento" })).toBe("1");
        expect(formatTournamentRoundLabel({ rodadaAtual: 0, totalRodadas: 0, status: "inscricoes_abertas" })).toBe("—");
    });

    it("na pausa pós-Day 1 a próxima ação é iniciar o Day 2", () => {
        const pausado = {
            status: "pausado",
            rodadaAtual: 7,
            totalRodadas: 9,
            rodadasDay1: 7,
            vagasDay2: 64,
            day1Encerrado: true,
            rodadaPublicada: true,
        };
        expect(getTournamentNextAction(pausado)).toBe(NEXT_ROUND_ACTION.NEXT_SWISS_ROUND);
        expect(getNextRoundActionLabels(pausado).cta).toBe("Iniciar Day 2");
        expect(getNextRoundActionLabels(pausado).status).toMatch(/pausado/i);
    });
});
