import { describe, expect, it } from "vitest";
import { pickTorneioFieldsFromStandings } from "../hooks/useTournamentQueries";

describe("pickTorneioFieldsFromStandings", () => {
  it("inclui totalRodadas junto com rodadaAtual", () => {
    expect(
      pickTorneioFieldsFromStandings({
        rodadaAtual: 2,
        totalRodadas: 5,
        status: "em_andamento",
        totalInscritos: 16,
        standings: [{ posicao: 1 }],
      }),
    ).toEqual({
      rodadaAtual: 2,
      totalRodadas: 5,
      status: "em_andamento",
      totalInscritos: 16,
    });
  });

  it("nao espalha o payload inteiro dos standings", () => {
    const patch = pickTorneioFieldsFromStandings({
      nome: "GP",
      standings: [{ posicao: 1 }],
      partidas: [{ id: "p1" }],
      rodadaAtual: 1,
      totalRodadas: 3,
    });
    expect(patch.standings).toBeUndefined();
    expect(patch.partidas).toBeUndefined();
    expect(patch).toEqual({
      nome: "GP",
      rodadaAtual: 1,
      totalRodadas: 3,
    });
  });
});
