import { describe, expect, it } from "vitest";
import { agruparResultadosPorTorneio, chaveMetagameLista, ordenarListasPorRecencia } from "../utils/metagameListas";

describe("ordenarListasPorRecencia", () => {
  it("coloca a lista do torneio mais recente primeiro", () => {
    const listas = [
      { deckId: "d1", torneioId: "t-antigo" },
      { deckId: "d2", torneioId: "t-recente" },
    ];
    const resultados = [
      { deckId: "d1", torneioId: "t-antigo", horario: "2026-01-01T12:00:00.000Z" },
      { deckId: "d2", torneioId: "t-recente", horario: "2026-08-01T12:00:00.000Z" },
    ];

    expect(ordenarListasPorRecencia(listas, resultados).map(chaveMetagameLista)).toEqual([
      "d2:t-recente",
      "d1:t-antigo",
    ]);
  });

  it("usa horario da propria lista quando existir", () => {
    const listas = [
      { deckId: "a", torneioId: "t1", horario: "2026-02-01T00:00:00.000Z" },
      { deckId: "b", torneioId: "t2", horario: "2026-03-01T00:00:00.000Z" },
    ];

    expect(ordenarListasPorRecencia(listas).map((l) => l.deckId)).toEqual(["b", "a"]);
  });
});

describe("agruparResultadosPorTorneio", () => {
  it("agrupa copias do mesmo evento e ordena por colocacao", () => {
    const grupos = agruparResultadosPorTorneio([
      { torneioId: "t1", torneioNome: "Pauper Semanal", horario: "2026-08-01T12:00:00.000Z", colocacao: 4, usuario: { nome: "bob" } },
      { torneioId: "t2", torneioNome: "Outro", horario: "2026-07-01T12:00:00.000Z", colocacao: 1, usuario: { nome: "carol" } },
      { torneioId: "t1", torneioNome: "Pauper Semanal", horario: "2026-08-01T12:00:00.000Z", colocacao: 1, usuario: { nome: "alice" } },
    ]);

    expect(grupos.map((g) => g.torneioId)).toEqual(["t1", "t2"]);
    expect(grupos[0].resultados.map((r) => r.usuario.nome)).toEqual(["alice", "bob"]);
  });
});
