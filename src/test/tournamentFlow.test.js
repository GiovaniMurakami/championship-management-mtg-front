import { describe, expect, it } from "vitest";
import { calculateAutomaticSwissRounds, calculateSwissRounds } from "../utils/tournamentFlow";

describe("tournamentFlow", () => {
    it("calcula o total automatico de rodadas suicas por log2 arredondado para cima", () => {
        expect(calculateAutomaticSwissRounds(17)).toBe(5);
    });

    it("aplica maxRodadas como teto, nunca como total fixo", () => {
        expect(calculateSwissRounds(17, 4)).toBe(4);
        expect(calculateSwissRounds(17)).toBe(5);
    });
});