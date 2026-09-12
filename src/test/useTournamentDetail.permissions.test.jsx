import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { subscribeToTournament } from "../services/ablyService";
import { useTournamentDetail } from "../hooks/useTournamentDetail";
import { buscarTorneio, getStandings, listarPartidasTorneio } from "../services/backendApi";

const session = vi.hoisted(() => ({ current: {} }));
vi.mock("react-router-dom", () => ({ useParams: () => ({ id: "torneio-1" }) }));
vi.mock("../hooks/useAuth", () => ({ useAuth: () => session.current }));
vi.mock("../services/backendApi", async (original) => {
  const api = await original();
  return { ...api, buscarTorneio: vi.fn(), getStandings: vi.fn(), listarPartidasTorneio: vi.fn() };
});
vi.mock("../hooks/useMyDecks", () => ({ useMyDecks: () => ({ decks: [] }) }));
vi.mock("../context/ToastContext", () => ({ useToast: () => ({ addToast: vi.fn() }) }));
vi.mock("../services/ablyService", () => ({ subscribeToTournament: vi.fn(), unsubscribeFromTournament: vi.fn() }));
const tournament = { id: "torneio-1", donoId: "owner", anfitriaoId: "host", status: "em_andamento", rodadaAtual: 1 };
let client;
function mount() {
  return renderHook(() => useTournamentDetail(), { wrapper: ({ children }) => <QueryClientProvider client={client}>{children}</QueryClientProvider> });
}
beforeEach(() => {
  vi.clearAllMocks();
  client = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: false } } });
  session.current = { token: "token", usuario: { id: "host" }, isAdmin: false };
  buscarTorneio.mockResolvedValue(tournament);
  getStandings.mockResolvedValue({ status: "em_andamento", standings: [] });
  listarPartidasTorneio.mockResolvedValue({ partidas: [] });
});
afterEach(() => { cleanup(); client.clear(); });

describe("permissões ao abrir o torneio sem F5", () => {
  it("revalida um torneio em cache quando o usuário passou a ser anfitrião", async () => {
    client.setQueryData(["tournament", "torneio-1", "detail", true], { ...tournament, anfitriaoId: null });
    const { result } = mount();
    await waitFor(() => expect(result.current.canManageTournament).toBe(true));
    expect(buscarTorneio).toHaveBeenCalledTimes(1);
  });

  it("reconhece o novo anfitrião ao receber torneio_atualizado", async () => {
    buscarTorneio.mockResolvedValue({ ...tournament, anfitriaoId: null });
    const { result } = mount();
    await waitFor(() => expect(result.current.torneio?.id).toBe(tournament.id));
    expect(result.current.canManageTournament).toBe(false);

    // O administrador salva em outra sessão e o evento solicita dados atuais.
    buscarTorneio.mockResolvedValue(tournament);
    const callbacks = subscribeToTournament.mock.calls.at(-1)[1];
    expect(callbacks.onTorneioAtualizado).toBeTypeOf("function");
    expect(result.current.canManageTournament).toBe(false);
    expect(buscarTorneio).toHaveBeenCalledTimes(1);

    // Não precisa aguardar outra rodada ou recarregar a página.
    await act(async () => callbacks.onTorneioAtualizado({ data: { torneioId: tournament.id } }));
    await waitFor(() => expect(result.current.canManageTournament).toBe(true));
    expect(buscarTorneio).toHaveBeenCalledTimes(2);
  });

  it("aplica lista vazia quando a consulta de partidas volta sem mesas", async () => {
    const partida = { id: "p1", rodada: 1, status: "pendente" };
    listarPartidasTorneio.mockResolvedValue({ partidas: [partida] });
    const { result } = mount();
    await waitFor(() => expect(result.current.partidas).toEqual([partida]));
    listarPartidasTorneio.mockResolvedValue({ partidas: [] });
    await act(async () => result.current.loadPartidas());
    expect(result.current.partidas).toEqual([]);
  });

  it("remove os controles quando o anfitrião em cache perdeu o acesso", async () => {
    client.setQueryData(["tournament", "torneio-1", "detail", true], tournament);
    buscarTorneio.mockResolvedValue({ ...tournament, anfitriaoId: null });
    const { result } = mount();
    await waitFor(() => expect(result.current.torneio?.anfitriaoId).toBe(null));
    expect(result.current.canManageTournament).toBe(false);
  });

  it("revalida também o status e as partidas em cache para o administrador", async () => {
    session.current = { token: "token", usuario: { id: "admin" }, isAdmin: true };
    client.setQueryData(["tournament", "torneio-1", "detail", true], { ...tournament, status: "inscricoes_abertas" });
    client.setQueryData(["tournament", "torneio-1", "standings", true], { status: "inscricoes_abertas", standings: [] });
    client.setQueryData(["tournament", "torneio-1", "matches", true], { partidas: [] });
    const { result } = mount();
    await waitFor(() => expect(result.current.torneio?.status).toBe("em_andamento"));
    expect(result.current.canManageTournament).toBe(true);
    expect(getStandings).toHaveBeenCalledTimes(1);
    expect(listarPartidasTorneio).toHaveBeenCalledTimes(1);
  });

  it.each(["owner", "host", "admin", "viewer"])("atualiza as permissões de %s quando a sessão chega depois do torneio", async (role) => {
    session.current = { token: "", usuario: null, isAdmin: false };
    const { result, rerender } = mount();
    await waitFor(() => expect(result.current.torneio?.id).toBe(tournament.id));
    expect(result.current.canManageTournament).toBe(false);
    session.current = { token: "token", usuario: { id: role }, isAdmin: role === "admin" };
    rerender();
    await waitFor(() => expect(result.current.canManageTournament).toBe(role !== "viewer"));
    expect(result.current.isAdmin).toBe(role === "admin");
  });

  it("mantém dono e anfitrião quando a classificação chega por último", async () => {
    let finish;
    getStandings.mockReturnValue(new Promise(resolve => { finish = resolve; }));
    const { result } = mount();
    await waitFor(() => expect(result.current.canManageTournament).toBe(true));
    await act(async () => finish({ status: "em_andamento", standings: [], rodadaAtual: 2 }));
    expect(result.current.torneio.donoId).toBe("owner");
    expect(result.current.isAnfitriao).toBe(true);
  });
});
