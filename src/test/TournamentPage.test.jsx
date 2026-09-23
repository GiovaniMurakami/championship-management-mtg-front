import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TournamentPage } from "../pages/TournamentPage";
import { listarTorneios, inscreverTorneio } from "../services/backendApi";
import { subscribeToTournament } from "../services/ablyService";

vi.mock("../hooks/useAuth", () => ({ useAuth: () => ({ usuario: { id: "u1", nickMTGO: "giovani" }, token: "token" }) }));
const { addToast } = vi.hoisted(() => ({ addToast: vi.fn() }));
vi.mock("../context/ToastContext", () => ({ useToast: () => ({ addToast }) }));
vi.mock("../services/backendApi", () => ({ listarTorneios: vi.fn(), inscreverTorneio: vi.fn() }));
vi.mock("../services/ablyService", () => ({ subscribeToTournament: vi.fn(), unsubscribeFromTournament: vi.fn() }));
vi.mock("../utils/ablyTournamentWindow", () => ({ isTournamentAblyWindowOpen: () => true, earliestMsUntilAblyWindow: () => null }));
vi.mock("../hooks/useSiteEstatisticas", () => ({ useSiteEstatisticas: () => ({ stats: {}, loading: false }), formatSiteStatValue: () => "0" }));
vi.mock("../components", () => ({ SkeletonCollection: () => null, SponsorSection: () => null }));
vi.mock("../components/tournament", () => ({ ExpandableText: () => null }));

let inscrito;
const renderPage = () => render(<MemoryRouter><TournamentPage /></MemoryRouter>);

describe("TournamentPage inscrições", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    inscrito = false;
    subscribeToTournament.mockReturnValue({});
    inscreverTorneio.mockImplementation(async () => { inscrito = true; });
    listarTorneios.mockImplementation(async (_token, { status }) => ({
      torneios: status === "inscricoes_abertas" ? [{ id: "t1", nome: "Fuguete Champ", horario: "2026-09-12T20:00:00Z", formato: "pauper", status, inscrito }] : [],
      total: status === "inscricoes_abertas" ? 1 : 0,
    }));
  });

  it("remove Inscrito após cancelamento e permite nova inscrição", async () => {
    renderPage();
    fireEvent.click(await screen.findByRole("button", { name: "Inscrever-se" }));
    await screen.findByRole("button", { name: "✓ Inscrito" });
    inscrito = false;
    await act(async () => subscribeToTournament.mock.calls[0][1].onJogadorDropou({ data: { jogadorId: "u1", inscricaoRemovida: true } }));
    expect(await screen.findByRole("button", { name: "Inscrever-se" })).toBeEnabled();
    inscrito = true;
    await act(async () => subscribeToTournament.mock.calls[0][1].onJogadorVoltou({ data: { jogadorId: "u1" } }));
    expect(await screen.findByRole("button", { name: "✓ Inscrito" })).toBeDisabled();
  });

  it("reconsulta a inscrição ao voltar à janela após cancelamento em outra aba", async () => {
    inscrito = true;
    renderPage();
    await screen.findByRole("button", { name: "✓ Inscrito" });
    inscrito = false;
    fireEvent.focus(window);
    await waitFor(() => expect(screen.getByRole("button", { name: "Inscrever-se" })).toBeEnabled());
  });
});
