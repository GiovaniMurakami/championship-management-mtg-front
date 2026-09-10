import { ToastProvider } from "../context/ToastContext";
import { fireEvent, render as testingRender, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserProfilePage } from "../pages/UserProfilePage";
import { buscarPerfilPublico, registrarPartidaExterna, buscarMetagame } from "../services/backendApi";
const render = (ui) => testingRender(<ToastProvider>{ui}</ToastProvider>);


const handleProfilePhoto = vi.fn();
vi.mock("../hooks/useAuth", () => ({ useAuth: () => ({ usuario: { id: "11111111-1111-4111-8111-111111111111" }, handleProfilePhoto, token: "token-teste" }) }));
vi.mock("../services/backendApi", () => ({ buscarPerfilPublico: vi.fn(), registrarPartidaExterna: vi.fn(), buscarMetagame: vi.fn().mockResolvedValue({ arquetipos: [{ nome: "Affinity" }, { nome: "Burn" }] }) }));
vi.mock("../services/scryfallApi", () => ({ buscarCartasPorNome: vi.fn().mockResolvedValue([{ imagem: "https://cards.example/bolt.jpg" }]) }));

const perfil = {
  usuario: { id: "11111111-1111-4111-8111-111111111111", nome: "Giovani", criadoEm: "2026-03-09T00:00:00.000Z", resultadosExpressivos: 3 },
  estatisticas: { winrate: 50, totalPartidas: 4, vitorias: 2, derrotas: 1, empates: 1 },
  ultimosTorneios: [{ id: "22222222-2222-4222-8222-222222222222", nome: "Pauper 300", formato: "pauper", horario: "2026-08-20T00:00:00.000Z", winrate: 66.7, vitorias: 2, derrotas: 1, empates: 0, totalPartidas: 3 }],
  decks: [{ id: "33333333-3333-4333-8333-333333333333", nome: "Burn", formato: "pauper", cartaFundo: "Lightning Bolt", visualizacoes: 10, criadoEm: "2026-08-01T00:00:00.000Z" }],
};

const renderPage = () => render(<MemoryRouter initialEntries={[`/usuarios/${perfil.usuario.id}`]}><Routes><Route path="/usuarios/:id" element={<UserProfilePage />} /></Routes></MemoryRouter>);

describe("UserProfilePage", () => {
  beforeEach(() => { vi.clearAllMocks(); buscarPerfilPublico.mockResolvedValue(perfil); });

  it("aplica e limpa o intervalo no perfil", async () => {
    renderPage();
    await screen.findByRole("heading", { name: "Giovani" });
    fireEvent.click(screen.getByRole("button", { name: "Filtrar por período" }));
    fireEvent.change(screen.getByLabelText("De"), { target: { value: "2026-08-01" } });
    fireEvent.change(screen.getByLabelText("Até"), { target: { value: "2026-08-31" } });
    expect(buscarPerfilPublico).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Aplicar datas" }));
    await waitFor(() => expect(buscarPerfilPublico).toHaveBeenLastCalledWith(perfil.usuario.id, 1, { dataInicio: "2026-08-01", dataFim: "2026-08-31" }));
    await screen.findByRole("heading", { name: "Giovani" });
    fireEvent.click(screen.getByRole("button", { name: /01\/08\/2026.*31\/08\/2026/ }));
    fireEvent.click(screen.getByRole("button", { name: "Limpar datas" }));
    await waitFor(() => expect(buscarPerfilPublico).toHaveBeenLastCalledWith(perfil.usuario.id, 1, {}));
  });

  it("mostra data, oponente e resultado das partidas externas", async () => {
    buscarPerfilPublico.mockResolvedValue({ ...perfil, partidasExternas: [
      { id: "1", data: "2026-02-01", resultado: "vitoria", oponente: "Ana" },
      { id: "2", data: "2026-01-31", resultado: "derrota" },
      { id: "3", data: "2026-01-30", resultado: "empate", oponente: "Pedro" },
    ] });
    renderPage();
    expect(await screen.findByText("Contra Ana")).toBeInTheDocument();
    expect(screen.getByText("01/02/2026")).toBeInTheDocument();
    expect(screen.getByText("Oponente não informado")).toBeInTheDocument();
    for (const label of ["Vitória", "Derrota", "Empate"]) expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("mostra estado vazio quando não existem partidas externas", async () => {
    renderPage();
    expect(await screen.findByText("Nenhuma partida externa registrada.")).toBeInTheDocument();
  });

  it("mostra skeleton e depois os dados, torneios e decks", async () => {
    let resolveRequest;
    buscarPerfilPublico.mockReturnValue(new Promise((resolve) => { resolveRequest = resolve; }));
    renderPage();
    expect(screen.getByRole("status", { name: /Carregando perfil/i })).toBeInTheDocument();
    resolveRequest(perfil);
    expect(await screen.findByRole("heading", { name: "Giovani" })).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Pauper 300/i })).toHaveAttribute("href", "/torneios/22222-pauper-300");
    expect(screen.getByRole("link", { name: /Burn/i })).toHaveAttribute("href", "/editar-deck/33333-burn?modo=visualizar");
  });

  it("abre a modal, salva a partida externa e recarrega as estatísticas", async () => {
    registrarPartidaExterna.mockResolvedValue({ id: "externa" });
    renderPage();
    fireEvent.click(await screen.findByRole("button", { name: "Adicionar partida externa" }));
    await waitFor(() => expect(buscarMetagame).toHaveBeenCalledWith({ formato: "pauper", dias: 30 }));
    fireEvent.focus(screen.getByLabelText("Meu deck"));
    expect(screen.getAllByRole("option", { name: /Affinity|Burn/ })).toHaveLength(2);
    fireEvent.change(screen.getByLabelText("Campeonato (opcional)"), { target: { value: "Liga local" } });
    fireEvent.change(screen.getByLabelText("Resultado"), { target: { value: "derrota" } });
    fireEvent.change(screen.getByLabelText("Data da partida"), { target: { value: "2026-01-01" } });
    fireEvent.change(screen.getByLabelText("Meu deck"), { target: { value: "Burn" } });
    fireEvent.change(screen.getByLabelText("Deck adversário"), { target: { value: "Affinity" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar resultado" }));
    await waitFor(() => expect(registrarPartidaExterna).toHaveBeenCalledWith({ resultado: "derrota", data: "2026-01-01", campeonato: "Liga local", oponente: "", deckNome: "Burn", deckAdversarioNome: "Affinity" }, "token-teste"));
    await waitFor(() => expect(buscarPerfilPublico).toHaveBeenCalledTimes(2));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("mantém os dados na modal quando a gravação falha", async () => {
    registrarPartidaExterna.mockRejectedValue(new Error("Falha ao salvar"));
    renderPage();
    fireEvent.click(await screen.findByRole("button", { name: "Adicionar partida externa" }));
    fireEvent.change(screen.getByLabelText("Oponente (opcional)"), { target: { value: "Ana" } });
    fireEvent.change(screen.getByLabelText("Meu deck"), { target: { value: "Burn" } });
    fireEvent.change(screen.getByLabelText("Deck adversário"), { target: { value: "Affinity" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar resultado" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Falha ao salvar");
    expect(screen.getByLabelText("Oponente (opcional)")).toHaveValue("Ana");
    expect(buscarPerfilPublico).toHaveBeenCalledTimes(1);
  });

  it("navega pelas páginas do histórico e exibe os decks", async () => {
    buscarPerfilPublico.mockImplementation(async (_id, pagina = 1) => ({ ...perfil,
      partidasExternas: [{ id: String(pagina), data: "2026-01-01", resultado: "vitoria", deckNome: pagina === 1 ? "Meu Burn" : "Meu Control", deckAdversarioNome: "Affinity" }],
      paginacaoPartidasExternas: { pagina, totalPaginas: 2, total: 11, limite: 10 },
    }));
    renderPage();
    expect(await screen.findByText("Meu Burn × Affinity")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Próxima" }));
    expect(await screen.findByText("Meu Control × Affinity")).toBeInTheDocument();
    expect(buscarPerfilPublico).toHaveBeenLastCalledWith(perfil.usuario.id, 2, {});
    expect(screen.getByRole("button", { name: "Próxima" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Anterior" }));
    expect(await screen.findByText("Meu Burn × Affinity")).toBeInTheDocument();
  });

  it("não oferece registro de partidas no perfil de outro jogador", async () => {
    buscarPerfilPublico.mockResolvedValue({ ...perfil, usuario: { ...perfil.usuario, id: "outro" } });
    renderPage();
    await screen.findByRole("heading", { name: "Giovani" });
    expect(screen.queryByRole("button", { name: "Adicionar partida externa" })).not.toBeInTheDocument();
  });

  it("permite trocar a foto no próprio perfil", async () => {
    handleProfilePhoto.mockResolvedValue({ ...perfil.usuario, fotoUrl: "https://example.com/nova.jpg" });
    renderPage();
    await screen.findByRole("heading", { name: "Giovani" });
    const file = new File(["photo"], "avatar.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText("Alterar foto de perfil"), { target: { files: [file] } });
    await waitFor(() => expect(handleProfilePhoto).toHaveBeenCalledWith(file));
    expect(await screen.findByText("Foto atualizada")).toBeInTheDocument();
  });
});
