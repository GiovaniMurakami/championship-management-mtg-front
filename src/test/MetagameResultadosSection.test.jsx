import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { MetagameResultadosSection } from "../components/metagame/MetagameResultadosSection";

const resultados = [
  {
    torneioId: "t1",
    torneioNome: "Pauper Semanal",
    horario: "2026-08-01T12:00:00.000Z",
    usuario: { id: "u2", nome: "bob", excluido: false },
    colocacao: 4,
    vitorias: 2,
    derrotas: 2,
    empates: 0,
    deckId: "d2",
  },
  {
    torneioId: "t1",
    torneioNome: "Pauper Semanal",
    horario: "2026-08-01T12:00:00.000Z",
    usuario: { id: "u1", nome: "alice_mtgo", excluido: false },
    colocacao: 1,
    vitorias: 4,
    derrotas: 0,
    empates: 0,
    deckId: "d1",
  },
];

describe("MetagameResultadosSection", () => {
  it("agrupa por torneio e destaca colocacao e jogador", () => {
    render(
      <MemoryRouter>
        <MetagameResultadosSection resultados={resultados} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Colocação de cada cópia deste arquétipo nos eventos do período.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Pauper Semanal" })).toHaveAttribute("href", "/torneios/t1");
    expect(screen.getByText("alice_mtgo")).toBeInTheDocument();
    expect(screen.getByText("bob")).toBeInTheDocument();
    expect(screen.getByText("1º")).toBeInTheDocument();
    expect(screen.getByText("4º")).toBeInTheDocument();
    expect(screen.getByText("4-0")).toBeInTheDocument();
    expect(screen.getByText("2-2")).toBeInTheDocument();
    expect(screen.getAllByText("Pauper Semanal")).toHaveLength(1);
  });
});
