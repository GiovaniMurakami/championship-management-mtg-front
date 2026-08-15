import { calculateAutomaticSwissRounds, calculateSwissRounds, formatTournamentRoundLabel, getFirstEliminationRound, isEliminationPhase } from "../utils/tournamentFlow";

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
});
