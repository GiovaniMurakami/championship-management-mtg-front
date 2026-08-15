import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { MetagameRecentSidebar, rotuloDeckRecente } from "../components/metagame/MetagameRecentSidebar";

const recentes = [
  {
    torneioId: "t1",
    torneioNome: "Tropical Pauper 295",
    horario: "2026-08-15T22:00:00.000Z",
    decks: [
      {
        slug: "mono-blue-terror",
        nome: "Mono Blue Terror",
        vitorias: 4,
        derrotas: 0,
        usuario: { id: "u1", nome: "alice_mtgo", excluido: false },
      },
    ],
  },
];

describe("rotuloDeckRecente", () => {
  it("coloca o nick do jogador na frente do deck", () => {
    expect(rotuloDeckRecente({
      nome: "Mono Blue Terror",
      usuario: { nome: "alice_mtgo", excluido: false },
    })).toBe("alice_mtgo — Mono Blue Terror");
  });

  it("usa o rotulo de usuario excluido", () => {
    expect(rotuloDeckRecente({
      nome: "Burn",
      usuario: { nome: "apagado", excluido: true },
    })).toBe("Usuário excluído — Burn");
  });
});

describe("MetagameRecentSidebar", () => {
  it("mostra o jogador na frente do nome do deck", () => {
    render(
      <MemoryRouter>
        <MetagameRecentSidebar
          busca=""
          onBusca={() => {}}
          recentes={recentes}
          formato="pauper"
          dias={30}
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "alice_mtgo — Mono Blue Terror" })).toBeInTheDocument();
  });
});
