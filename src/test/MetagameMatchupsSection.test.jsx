import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { MetagameMatchupsSection } from "../components/metagame/MetagameMatchupsSection";

const matchups = [
  {
    slug: "affinity",
    nome: "Affinity",
    partidas: 4,
    vitorias: 3,
    derrotas: 1,
    empates: 0,
    winrate: 75,
  },
];

describe("MetagameMatchupsSection", () => {
  it("mostra o oponente, o recorde e o winrate", () => {
    render(
      <MemoryRouter>
        <MetagameMatchupsSection matchups={matchups} formato="pauper" dias={30} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Desempenho contra cada arquétipo neste período.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Affinity" })).toHaveAttribute(
      "href",
      "/metagame/pauper/affinity?dias=30",
    );
    expect(screen.getByText("3-1")).toBeInTheDocument();
    expect(screen.getByText("75%")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("jogos")).toBeInTheDocument();
  });
});
