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
const archetype = { nome: "Burn", slug: "burn", cartaRepresentativa: "Lightning Bolt", cartasChave: ["Lava Spike"], cartasCores: ["Mountain", "Lava Spike"], metaPct: 20, copias: 1, winrate: 50 };
let enterViewport;
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback) { enterViewport = callback; }
    observe() {}
    disconnect() {}
  });
  buscarMetagame.mockResolvedValue({ arquetipos: [archetype], recentes: [] });
  buscarCartaPorNome.mockImplementation(async nome => ({ nome, imagem: `https://example.test/${nome}.jpg`, artCrop: `https://example.test/${nome}-art.jpg` }));
});
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

describe("carregamento sob demanda no metagame", () => {
  it("busca apenas a representativa ao entrar na tela e a outra carta somente no hover", async () => {
    render(<MemoryRouter initialEntries={["/metagame?formato=pauper&dias=30"]}><MetagamePage /></MemoryRouter>);
    await screen.findByText("Burn");
    expect(buscarCartaPorNome).not.toHaveBeenCalled();
    expect(buscarCartasPorNome).not.toHaveBeenCalled();
    await waitFor(() => expect(enterViewport).toBeTypeOf("function"));
    act(() => enterViewport([{ isIntersecting: true }]));
    await waitFor(() => expect(buscarCartaPorNome).toHaveBeenCalledWith("Lightning Bolt"));
    expect(buscarCartaPorNome).toHaveBeenCalledTimes(1);
    const carta = screen.getByText("Lava Spike");
    fireEvent.mouseEnter(carta);
    expect(await screen.findByAltText("Lava Spike")).toHaveAttribute("src", "https://example.test/Lava Spike.jpg");
    fireEvent.mouseLeave(carta);
    expect(screen.queryByAltText("Lava Spike")).not.toBeInTheDocument();
    expect(buscarCartasPorNome).not.toHaveBeenCalled();
  });

  it("carrega a representativa quando IntersectionObserver não está disponível", async () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    render(<MemoryRouter><MetagamePage /></MemoryRouter>);
    await waitFor(() => expect(buscarCartaPorNome).toHaveBeenCalledWith("Lightning Bolt"));
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
