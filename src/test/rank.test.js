import { describe, expect, it } from "vitest";
import {
  buildRankResultMessage,
  extractResumoRank,
  getRankProgress,
  normalizeRankTier,
} from "../utils/rank";

describe("rank utils", () => {
  it("normaliza tiers válidos", () => {
    expect(normalizeRankTier("ouro")).toBe("ouro");
    expect(normalizeRankTier("invalid")).toBeNull();
  });

  it("extrai resumo do usuário", () => {
    const resumo = extractResumoRank({
      pontosRank: 650,
      rank: "prata",
      proximoRank: "ouro",
      pontosParaProximoRank: 800,
    });
    expect(resumo?.rank).toBe("prata");
    expect(resumo?.pontosRank).toBe(650);
  });

  it("calcula progresso até próximo rank", () => {
    const progress = getRankProgress({
      rank: "bronze",
      pontosRank: 400,
      proximoRank: "prata",
      pontosParaProximoRank: 500,
    });
    expect(progress.percent).toBe(80);
    expect(progress.isMax).toBe(false);
  });

  it("marca foguete como rank máximo", () => {
    const progress = getRankProgress({
      rank: "foguete",
      pontosRank: 1200,
      proximoRank: null,
      pontosParaProximoRank: null,
    });
    expect(progress.isMax).toBe(true);
    expect(progress.percent).toBe(100);
  });

  it("monta mensagem de vitória com promoção", () => {
    const msg = buildRankResultMessage({
      vencedorId: "u1",
      perdedorId: "u2",
      deltaVencedor: 25,
      rankVencedorAntes: "bronze",
      rankVencedorDepois: "prata",
    }, "u1");
    expect(msg).toContain("+25 pts");
    expect(msg).toContain("Prata");
  });
});
