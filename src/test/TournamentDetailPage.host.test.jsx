import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { TournamentDetailPage } from "../pages/TournamentDetailPage";

vi.mock("../hooks/usePageTitle", () => ({ usePageTitle: vi.fn() }));
vi.mock("../hooks/useTournamentDetail", () => ({ useTournamentDetail: () => ({
  torneio: { id: "t1", nome: "Torneio em andamento", status: "em_andamento", anfitriaoId: "host" },
  usuario: { id: "host" }, isOwner: false, isAdmin: false, isAnfitriao: true,
  canManageTournament: true, standings: [], partidas: [], decks: [], times: [], pendingCheckinPlayers: [],
}) }));
vi.mock("../components/tournament", async (original) => {
  const components = await original();
  return Object.fromEntries(Object.keys(components).map(name => [name,
    name === "TournamentEditModal" ? ({ isOpen }) => isOpen ? <div>Edição aberta</div> : null : () => null,
  ]));
});

describe("edição pelo anfitrião durante o torneio", () => {
  it("mostra Editar torneio e abre o modal sem exigir dono ou administrador", () => {
    render(<MemoryRouter><TournamentDetailPage /></MemoryRouter>);
    fireEvent.click(screen.getByRole("button", { name: "Editar torneio" }));
    expect(screen.getByText("Edição aberta")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Excluir torneio" })).not.toBeInTheDocument();
  });
});
