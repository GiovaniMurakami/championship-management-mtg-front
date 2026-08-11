import { calculateAutomaticSwissRounds, calculateSwissRounds, formatTournamentRoundLabel, isEliminationPhase } from "../utils/tournamentFlow";

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
    });

    it("formata chip de rodada sem mostrar Sem limite quando total ainda não sincronizou", () => {
        expect(formatTournamentRoundLabel({ rodadaAtual: 1, totalRodadas: 3, status: "em_andamento" })).toBe("1 / 3");
        expect(formatTournamentRoundLabel({ rodadaAtual: 1, totalRodadas: 0, status: "em_andamento" })).toBe("1");
        expect(formatTournamentRoundLabel({ rodadaAtual: 0, totalRodadas: 0, status: "inscricoes_abertas" })).toBe("—");
    });
});
