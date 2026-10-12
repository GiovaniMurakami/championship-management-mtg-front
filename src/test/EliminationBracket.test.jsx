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

    expect(screen.queryByText(/^Top 8$/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Eliminatória/i)).not.toBeInTheDocument();
  });

  it("mostra a chave depois que o corte começa", () => {
    render(<MemoryRouter>
      <EliminationBracket
        torneio={{ corteTop: 8, emCorte: true, rodadaAtual: 9, totalRodadas: 11 }}
        partidas={cutPartidas.slice(0, 1)}
      />
    </MemoryRouter>);

    expect(screen.getByText(/^Top 8$/i)).toBeInTheDocument();
    expect(screen.getByText(/Eliminatória/i)).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("ordena pelo resultado do mata-mata: campeao, finalista e eliminados", () => {
    const standings = [
      { usuarioId: "a", usuario: { id: "a", nome: "Alice" }, deckNome: "Terror", posicao: 1 },
      { usuarioId: "b", usuario: { id: "b", nome: "Bob" }, deckNome: "Bogles", posicao: 2 },
      { usuarioId: "c", usuario: { id: "c", nome: "Carol" }, deckNome: "Tron", posicao: 3 },
      { usuarioId: "d", usuario: { id: "d", nome: "Dan" }, deckNome: "Affinity", posicao: 4 },
      { usuarioId: "e", usuario: { id: "e", nome: "Eve" }, deckNome: "Burn", posicao: 5 },
      { usuarioId: "f", usuario: { id: "f", nome: "Frank" }, deckNome: "Elves", posicao: 6 },
      { usuarioId: "g", usuario: { id: "g", nome: "Gina" }, deckNome: "Jeskai", posicao: 7 },
      { usuarioId: "h", usuario: { id: "h", nome: "Hank" }, deckNome: "Mardu", posicao: 8 },
    ];
    // Top 8: Dan campeão, Alice finalista; Bob/Carol out na SF; Eve..Hank out nas quartas
    const partidas = [
      { id: "qf1", rodada: 14, mesa: 1, status: "finalizada", jogador1Id: "a", jogador2Id: "h", jogador1: { nome: "Alice" }, jogador2: { nome: "Hank" }, vitoriasJogador1: 2, vitoriasJogador2: 0 },
      { id: "qf2", rodada: 14, mesa: 2, status: "finalizada", jogador1Id: "b", jogador2Id: "g", jogador1: { nome: "Bob" }, jogador2: { nome: "Gina" }, vitoriasJogador1: 2, vitoriasJogador2: 1 },
      { id: "qf3", rodada: 14, mesa: 3, status: "finalizada", jogador1Id: "c", jogador2Id: "f", jogador1: { nome: "Carol" }, jogador2: { nome: "Frank" }, vitoriasJogador1: 2, vitoriasJogador2: 0 },
      { id: "qf4", rodada: 14, mesa: 4, status: "finalizada", jogador1Id: "d", jogador2Id: "e", jogador1: { nome: "Dan" }, jogador2: { nome: "Eve" }, vitoriasJogador1: 2, vitoriasJogador2: 0 },
      { id: "sf1", rodada: 15, mesa: 1, status: "finalizada", jogador1Id: "a", jogador2Id: "b", jogador1: { nome: "Alice" }, jogador2: { nome: "Bob" }, vitoriasJogador1: 2, vitoriasJogador2: 0 },
      { id: "sf2", rodada: 15, mesa: 2, status: "finalizada", jogador1Id: "d", jogador2Id: "c", jogador1: { nome: "Dan" }, jogador2: { nome: "Carol" }, vitoriasJogador1: 2, vitoriasJogador2: 1 },
      { id: "f1", rodada: 16, mesa: 1, status: "finalizada", jogador1Id: "a", jogador2Id: "d", jogador1: { nome: "Alice" }, jogador2: { nome: "Dan" }, vitoriasJogador1: 0, vitoriasJogador2: 2 },
    ];

    const players = buildEliminationTopPlayers(partidas, 14, standings, { totalRodadas: 16 });
    expect(players.map((p) => p.usuario?.nome || p.nome)).toEqual([
      "Dan",   // campeão
      "Alice", // finalista
      "Bob",   // SF (melhor Swiss entre semis)
      "Carol",
      "Eve",   // quartas por Swiss
      "Frank",
      "Gina",
      "Hank",
    ]);
    expect(players.map((p) => p.posicao)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(players[0].deckNome).toBe("Affinity");
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
