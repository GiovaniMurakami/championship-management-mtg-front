import { describe, expect, it } from "vitest";
import {
  calculateTopCutProbabilities,
  integerizePlayerCounts,
  recommendedSwissRounds,
  swissRecordDistribution,
  swissRecordDistributionWithByes,
} from "../utils/swissTopCutCalculator";

describe("swissTopCutCalculator", () => {
  it("recomenda rodadas pela tabela de potência de 2", () => {
    expect(recommendedSwissRounds(16)).toBe(4);
    expect(recommendedSwissRounds(17)).toBe(5);
    expect(recommendedSwissRounds(8)).toBe(3);
  });

  it("bate o exemplo clássico 16 jogadores / 4 rodadas (Cards Realm)", () => {
    const dist = swissRecordDistribution(16, 4);
    expect(dist.map((r) => r.players)).toEqual([1, 4, 6, 4, 1]);

    const result = calculateTopCutProbabilities({
      players: 16,
      rounds: 4,
      topCut: 8,
    });

    expect(result.guaranteedRecord).toBe("3-1-0");
    expect(result.rows.find((r) => r.recordLabel === "2-2-0")?.probability).toBe(50);
    expect(result.rows.find((r) => r.recordLabel === "4-0-0")?.probability).toBe(100);
    expect(result.rows.find((r) => r.recordLabel === "1-3-0")?.probability).toBe(0);
  });

  it("exibe apenas inteiros e preserva o total de jogadores", () => {
    const result = calculateTopCutProbabilities({
      players: 24,
      rounds: 4,
      topCut: 8,
    });

    const counts = result.rows.map((r) => r.players);
    expect(counts.every((n) => Number.isInteger(n))).toBe(true);
    expect(counts.reduce((sum, n) => sum + n, 0)).toBe(24);
  });

  it("integerizePlayerCounts usa maior resto e preserva a soma", () => {
    const rows = integerizePlayerCounts(
      [
        { wins: 3, losses: 0, players: 2.4 },
        { wins: 2, losses: 1, players: 3.3 },
        { wins: 1, losses: 2, players: 4.3 },
      ],
      10,
    );

    expect(rows.map((r) => r.players)).toEqual([3, 3, 4]);
    expect(rows.reduce((sum, r) => sum + r.players, 0)).toBe(10);
  });

  it("distribui records com byes sem perder jogadores", () => {
    const dist = swissRecordDistributionWithByes(16, 4, 2, 1);
    const total = dist.reduce((sum, r) => sum + r.players, 0);
    expect(total).toBeCloseTo(16, 5);
  });
});
