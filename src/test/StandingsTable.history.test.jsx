import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { StandingsTable } from "../components/tournament/StandingsTable";

const standings = [
  { usuario: { id: "user-1", nome: "Ana" }, deckNome: "Affinity", posicao: 1 },
  { usuario: { id: "user-2", nome: "Beto" }, deckNome: "Burn", posicao: 2 },
];

const partidas = [{
  id: "match-1",
  rodada: 1,
  jogador1Id: "user-1",
  jogador1Nome: "Ana",
  jogador2Id: "user-2",
  jogador2Nome: "Beto",
  vitoriasJogador1: 2,
  vitoriasJogador2: 1,
  status: "finalizada",
}];

function renderTable(isFinished, matches = partidas) {
  return render(
    <MemoryRouter>
      <StandingsTable standings={standings} partidas={matches} isFinished={isFinished} />
    </MemoryRouter>
  );
}

describe("historico de partidas no standings", () => {
  it("mostra o deck do oponente depois que o torneio termina", async () => {
    renderTable(true);
    fireEvent.mouseEnter(screen.getAllByText("Ana")[0].closest("[tabindex]"));
    expect(await screen.findByText("Deck: Burn")).toBeInTheDocument();
  });

  it("mantem o deck do oponente oculto durante o torneio", async () => {
    renderTable(false);
    fireEvent.mouseEnter(screen.getAllByText("Ana")[0].closest("[tabindex]"));
    await screen.findByText("vs Beto");
    expect(screen.queryByText("Deck: Burn")).toBeNull();
  });

  it("compacta historicos longos e permite mostrar todas as partidas", async () => {
    const longHistory = Array.from({ length: 8 }, (_, index) => ({
      ...partidas[0],
      id: `match-${index + 1}`,
      rodada: index + 1,
    }));
    renderTable(true, longHistory);
    fireEvent.mouseEnter(screen.getAllByText("Ana")[0].closest("[tabindex]"));

    const expand = await screen.findByRole("button", { name: "Ver todas (8)" });
    expect(screen.queryByText("R1")).toBeNull();
    fireEvent.click(expand);
    expect(screen.getByText("R1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mostrar menos" })).toBeInTheDocument();
  });
});
