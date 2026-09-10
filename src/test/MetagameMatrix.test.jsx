import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MetagameMatrix } from "../components/metagame/MetagameMatrix";
import { MetagamePage } from "../pages/MetagamePage";
import { buscarArquetipoMetagame, buscarMetagame } from "../services/backendApi";

vi.mock("../services/backendApi", () => ({ buscarArquetipoMetagame: vi.fn(), buscarMetagame: vi.fn() }));
vi.mock("../hooks/usePageTitle", () => ({ usePageTitle: vi.fn() }));
vi.mock("../hooks/useScryfallArt", () => ({ useScryfallArt: () => ({ imagem: null, retry: vi.fn() }) }));

const matchup = { slug: "terror", nome: "Terror", partidas: 4, winrate: 50, vitorias: 2, derrotas: 1, empates: 1 };
const arquetipos = [
  { slug: "burn", nome: "Burn", metaPct: 60, copias: 6, winrate: 50, vitorias: 2, derrotas: 1, empates: 1, matchups: [matchup] },
  { slug: "terror", nome: "Terror", metaPct: 40, copias: 4, winrate: 25, vitorias: 1, derrotas: 2, empates: 1, matchups: [{ ...matchup, slug: "burn", nome: "Burn", winrate: 25, vitorias: 1, derrotas: 2 }] },
];

beforeEach(() => {
  vi.clearAllMocks();
  buscarMetagame.mockResolvedValue({ arquetipos, recentes: [] });
});

describe("matriz de confrontos", () => {
  it("aplica datas em uma busca, preserva o intervalo nos links e permite limpar", async () => {
    render(<MemoryRouter initialEntries={["/metagame?formato=pauper&dias=30&visualizacao=matriz"]}><MetagamePage /></MemoryRouter>);
    await screen.findByRole("table");
    fireEvent.click(screen.getByRole("button", { name: "Filtrar por período" }));
    fireEvent.change(screen.getByLabelText("De"), { target: { value: "2026-08-01" } });
    fireEvent.change(screen.getByLabelText("Até"), { target: { value: "2026-08-31" } });
    expect(buscarMetagame).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Aplicar datas" }));
    await waitFor(() => expect(buscarMetagame).toHaveBeenLastCalledWith({ formato: "pauper", dias: 30, dataInicio: "2026-08-01", dataFim: "2026-08-31" }));
    await screen.findByRole("table");
    expect(screen.getAllByRole("link", { name: "Burn" })[0]).toHaveAttribute("href", "/metagame/pauper/burn?dias=30&dataInicio=2026-08-01&dataFim=2026-08-31");
    fireEvent.click(screen.getByRole("button", { name: /01\/08\/2026.*31\/08\/2026/ }));
    fireEvent.click(screen.getByRole("button", { name: "Limpar datas" }));
    await waitFor(() => expect(buscarMetagame).toHaveBeenLastCalledWith({ formato: "pauper", dias: 30 }));
    expect(buscarArquetipoMetagame).not.toHaveBeenCalled();
  });
  it("preserva a perspectiva de cada linha, os empates e a ausência de partidas", async () => {
    render(<MemoryRouter><MetagameMatrix arquetipos={arquetipos} formato="pauper" dias={30} /></MemoryRouter>);
    expect(await screen.findByRole("cell", { name: "Burn contra Terror: 50% de vitórias em 4 partidas" })).toBeInTheDocument();
    expect(await screen.findByRole("cell", { name: "Terror contra Burn: 25% de vitórias em 4 partidas" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Burn contra Burn: sem partidas" })).toHaveTextContent("—");
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "Burn" } });
    expect(screen.queryByRole("columnheader", { name: "Terror" })).not.toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Burn, geral: 50% de vitórias em 4 partidas" })).toBeInTheDocument();
  });

  it("distingue uma resposta antiga de confrontos sem partidas, sem buscar cada arquétipo", () => {
    render(<MemoryRouter><MetagameMatrix arquetipos={[{ ...arquetipos[0], matchups: undefined }]} formato="pauper" dias={30} /></MemoryRouter>);
    expect(screen.getByRole("alert")).toHaveTextContent("Os dados de confrontos estão indisponíveis");
    expect(screen.queryByRole("cell", { name: "Burn contra Burn: sem partidas" })).not.toBeInTheDocument();
    expect(buscarArquetipoMetagame).not.toHaveBeenCalled();
  });

  it("reutiliza a listagem ao alternar visualizações e faz uma só busca ao trocar o período", async () => {
    render(<MemoryRouter initialEntries={["/metagame?formato=pauper&dias=30"]}><MetagamePage /></MemoryRouter>);
    await screen.findByText("Burn");
    expect(buscarArquetipoMetagame).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Matriz de confrontos" }));
    await screen.findByRole("cell", { name: "Burn contra Terror: 50% de vitórias em 4 partidas" });
    expect(buscarMetagame).toHaveBeenCalledTimes(1);
    expect(buscarArquetipoMetagame).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText("Decks dos últimos"), { target: { value: "7" } });
    await waitFor(() => expect(buscarMetagame).toHaveBeenCalledWith({ formato: "pauper", dias: 7 }));
    await screen.findByRole("cell", { name: "Burn contra Terror: 50% de vitórias em 4 partidas" });
    expect(screen.getByRole("button", { name: "Matriz de confrontos" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Cards" }));
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getByText("Burn")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Matriz de confrontos" }));
    expect(buscarMetagame).toHaveBeenCalledTimes(2);
    expect(buscarArquetipoMetagame).not.toHaveBeenCalled();
  });
});
