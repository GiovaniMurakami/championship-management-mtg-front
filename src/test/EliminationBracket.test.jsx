import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import {
  buildEliminationTopPlayers,
  EliminationBracket,
} from "../components/tournament/EliminationBracket";

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

const cutPartidas = [
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
  {
    id: "q2",
    rodada: 9,
    mesa: 2,
    status: "pendente",
    jogador1Id: "c",
    jogador2Id: "d",
    jogador1: { nome: "Carol" },
    jogador2: { nome: "Dan" },
  },
];

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
        partidas={cutPartidas.slice(0, 1)}
      />
    </MemoryRouter>);

    expect(screen.getByText(/Chaveamento eliminatório/i)).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("monta jogadores do top na ordem das mesas do corte", () => {
    const standings = [
      { usuarioId: "d", usuario: { id: "d", nome: "Dan" }, deckNome: "Affinity" },
      { usuarioId: "a", usuario: { id: "a", nome: "Alice" }, deckNome: "Terror" },
      { usuarioId: "b", usuario: { id: "b", nome: "Bob" }, deckNome: "Bogles" },
      { usuarioId: "c", usuario: { id: "c", nome: "Carol" }, deckNome: "Tron" },
    ];
    const players = buildEliminationTopPlayers(cutPartidas, 9, standings);
    expect(players.map((p) => p.usuario?.nome || p.nome)).toEqual([
      "Alice",
      "Bob",
      "Carol",
      "Dan",
    ]);
    expect(players[0].deckNome).toBe("Terror");
  });

  it("mostra botao de exportar para quem gerencia o torneio", () => {
    render(<MemoryRouter>
      <EliminationBracket
        torneio={{
          nome: "Super Pauper",
          corteTop: 8,
          emCorte: true,
          rodadaAtual: 9,
          totalRodadas: 11,
        }}
        partidas={cutPartidas}
        standings={[
          { usuarioId: "a", usuario: { id: "a", nome: "Alice" }, deckNome: "Terror" },
          { usuarioId: "b", usuario: { id: "b", nome: "Bob" }, deckNome: "Bogles" },
          { usuarioId: "c", usuario: { id: "c", nome: "Carol" }, deckNome: "Tron" },
          { usuarioId: "d", usuario: { id: "d", nome: "Dan" }, deckNome: "Affinity" },
        ]}
        canManageTournament
      />
    </MemoryRouter>);

    const btn = screen.getByRole("button", { name: /Exportar imagem do Top 8/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(screen.getByText(/^Story$/i)).toBeInTheDocument();
  });

  it("nao mostra botao de exportar para visitante", () => {
    render(<MemoryRouter>
      <EliminationBracket
        torneio={{ corteTop: 8, emCorte: true, rodadaAtual: 9, totalRodadas: 11 }}
        partidas={cutPartidas}
        canManageTournament={false}
      />
    </MemoryRouter>);

    expect(screen.queryByRole("button", { name: /Exportar imagem do Top 8/i })).not.toBeInTheDocument();
  });
});
