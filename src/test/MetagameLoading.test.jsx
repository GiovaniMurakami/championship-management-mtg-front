import { act, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MetagamePage } from "../pages/MetagamePage";
import { MetagameArquetipoPage } from "../pages/MetagameArquetipoPage";
import { useScryfallArt } from "../hooks/useScryfallArt";
import { buscarMetagame, buscarArquetipoMetagame } from "../services/backendApi";
import { buscarCartaPorNome, buscarCartasPorNome } from "../services/scryfallApi";

vi.mock("../services/backendApi", () => ({ buscarMetagame: vi.fn(), buscarArquetipoMetagame: vi.fn(), atualizarDeck: vi.fn() }));
vi.mock("../services/scryfallApi", () => ({ buscarCartaPorNome: vi.fn(), buscarCartaPorId: vi.fn(), buscarCartasPorNome: vi.fn(), buscarCartasMTG: vi.fn(), buscarArtesDaCarta: vi.fn() }));
vi.mock("../hooks/useAuth", () => ({ useAuth: () => ({ isAdmin: false }) }));
vi.mock("../context/ToastContext", () => ({ useToast: () => ({ addToast: vi.fn() }) }));
vi.mock("../hooks/usePageTitle", () => ({ usePageTitle: vi.fn() }));
const archetype = { nome: "Burn", slug: "burn", cartaRepresentativa: "Lightning Bolt", cartasChave: ["Lava Spike"], cartasCores: ["Mountain", "Lava Spike"], cores: ["R"], metaPct: 20, copias: 1, winrate: 50 };
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("IntersectionObserver", class {
    observe() {}
    disconnect() {}
  });
  buscarMetagame.mockResolvedValue({ arquetipos: [archetype], recentes: [] });
  buscarCartaPorNome.mockImplementation(async nome => ({ nome, imagem: `https://example.test/${nome}.jpg`, artCrop: `https://example.test/${nome}-art.jpg` }));
});
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

describe("carregamento do metagame", () => {
  it("busca as artes numa coleção só, sem consulta por carta", async () => {
    buscarCartasPorNome.mockImplementation(async (nomes) => nomes.map((nome) => ({
      nome,
      imagem: `https://example.test/${nome}.jpg`,
      artCrop: `https://example.test/${nome}-art.jpg`,
    })));
    render(<MemoryRouter initialEntries={["/metagame?formato=pauper&dias=30"]}><MetagamePage /></MemoryRouter>);
    await screen.findByText("Burn");
    await waitFor(() => expect(buscarCartasPorNome).toHaveBeenCalledWith(
      expect.arrayContaining(["Lightning Bolt", "Lava Spike"]),
      { fallbackIndividual: false },
    ));
    expect(buscarCartaPorNome).not.toHaveBeenCalled();
    expect(document.querySelector('img[src="https://example.test/Lightning Bolt-art.jpg"]')).toBeTruthy();
    fireEvent.mouseEnter(screen.getByText("Lava Spike"));
    expect(await screen.findByAltText("Lava Spike")).toHaveAttribute("src", "https://example.test/Lava Spike.jpg");
    expect(buscarCartaPorNome).not.toHaveBeenCalled();
  });

  it("exibe as listas no arquétipo sem buscar imagens de todas as cartas", async () => {
    buscarCartasPorNome.mockResolvedValue([{ nome: "Lava Spike", typeLine: "Sorcery", colors: ["R"], manaCost: "{R}", cmc: 1 }]);
    buscarArquetipoMetagame.mockResolvedValue({ ...archetype, listas: [{ deckId: "11111111-1111-4111-8111-111111111111", nome: "Burn de Ana", usuario: { nome: "Ana" }, maindeck: [{ nome: "Lava Spike", quantidade: 4 }] }], resultados: [], matchups: [] });
    render(<MemoryRouter initialEntries={["/metagame/pauper/burn"]}><Routes><Route path="/metagame/:formato/:slug" element={<MetagameArquetipoPage />} /></Routes></MemoryRouter>);
    await screen.findByText("Burn de Ana");
    expect(buscarArquetipoMetagame).toHaveBeenCalledWith("pauper", "burn", { dias: 30, limiteListas: 10, offsetListas: 0, resumo: false });
    await waitFor(() => expect(buscarCartasPorNome).toHaveBeenCalledWith(["Lava Spike"], { fallbackIndividual: false }));
    expect(await screen.findByText("Vermelho")).toBeInTheDocument();
    expect(screen.getByText("Lava Spike")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver lista" })).toHaveAttribute("href", "/editar-deck/11111-burn-de-ana?modo=visualizar");
  });

  it("tenta novamente após falha temporária na carta representativa", async () => {
    vi.useFakeTimers();
    buscarCartaPorNome.mockResolvedValueOnce(null).mockResolvedValueOnce({ imagem: "https://example.test/card.jpg" });
    const { result } = renderHook(() => useScryfallArt("Retry card"));
    await act(async () => { await vi.advanceTimersByTimeAsync(1100); });
    expect(buscarCartaPorNome).toHaveBeenCalledTimes(2);
    expect(result.current.imagem).toBe("https://example.test/card.jpg");
  });
});
