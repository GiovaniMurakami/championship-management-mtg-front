import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { EliminationBracket } from "../components/tournament/EliminationBracket";

const swissMatches = Array.from({ length: 72 }, (_, i) => ({
  id: `m${i}`,
  rodada: 6,
  mesa: i + 1,
  status: "pendente",
  jogador1Id: `a${i}`,
  jogador2Id: `b${i}`,
  jogador1: { nome: `P${i}a` },
  jogador2: { nome: `P${i}b` },
}));

describe("EliminationBracket", () => {
  it("nao mostra chave de top 8 durante o Swiss", () => {
    render(<MemoryRouter>
      <EliminationBracket
        torneio={{ corteTop: 8, emCorte: false, rodadaAtual: 6, totalRodadas: 8 }}
        partidas={swissMatches}
      />
    </MemoryRouter>);

    expect(screen.queryByText(/Chaveamento eliminatório/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Corte Top 8/i)).not.toBeInTheDocument();
  });

  it("mostra a chave depois que o corte começa", () => {
    render(<MemoryRouter>
      <EliminationBracket
        torneio={{ corteTop: 8, emCorte: true, rodadaAtual: 9, totalRodadas: 11 }}
        partidas={[
          {
            id: "q1",
            rodada: 9,
            mesa: 1,
            status: "pendente",
            jogador1Id: "a",
            jogador2Id: "b",
            jogador1: { nome: "Alice" },
            jogador2: { nome: "Bob" },
          },
        ]}
      />
    </MemoryRouter>);

    expect(screen.getByText(/Chaveamento eliminatório/i)).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });
});
