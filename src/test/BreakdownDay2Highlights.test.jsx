import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BreakdownDay2Highlights } from "../components/metagame/breakdown/BreakdownDay2Highlights";

describe("BreakdownDay2Highlights", () => {
  it("nao renderiza sem destaques", () => {
    const { container } = render(<BreakdownDay2Highlights destaques={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("mostra meta, desempenho e caminho do corte", () => {
    render(
      <BreakdownDay2Highlights
        destaques={{
          jogadores: 64,
          arquetipos: 28,
          meta: [{ nome: "Esper Affinity", slug: "esper-affinity", copias: 6, metaPct: 9.4 }],
          melhorDesempenho: [
            {
              usuarioId: "u1",
              nome: "Maccheri",
              deckNome: "Tron Flicker",
              slug: "tron-flicker",
              vitorias: 6,
              derrotas: 0,
              empates: 0,
            },
          ],
          corte: [
            {
              rodada: 14,
              mesa: 1,
              jogador1: "Soler",
              jogador2: "Maccheri",
              placar: "2-0",
              vencedor: "Soler",
              upset: true,
            },
          ],
          resumo: {
            partidas: 178,
            varreduras2a0: 91,
            pctVarreduras: 0.511,
            mediaGames: 2.38,
          },
        }}
        corteTop={8}
        totalRodadas={16}
        rodadasDay1={7}
      />,
    );

    expect(screen.getByText("Meta do Day 2")).toBeInTheDocument();
    expect(screen.getByText("Esper Affinity")).toBeInTheDocument();
    expect(screen.getByText("Melhor Swiss Day 2")).toBeInTheDocument();
    expect(screen.getAllByText(/Maccheri/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("6-0")).toBeInTheDocument();
    expect(screen.getByText("Caminho do corte")).toBeInTheDocument();
    expect(screen.getByText("Upset")).toBeInTheDocument();
    expect(screen.getByText(/Quartas/)).toBeInTheDocument();
  });
});
