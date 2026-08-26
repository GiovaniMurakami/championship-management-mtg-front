import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserProfilePage } from "../pages/UserProfilePage";
import { buscarPerfilPublico } from "../services/backendApi";

const handleProfilePhoto = vi.fn();
vi.mock("../context/AuthContext", () => ({ useAuth: () => ({ usuario: { id: "11111111-1111-4111-8111-111111111111" }, handleProfilePhoto }) }));
vi.mock("../services/backendApi", () => ({ buscarPerfilPublico: vi.fn() }));
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

  it("mostra skeleton e depois os dados, torneios e decks", async () => {
    let resolveRequest;
    buscarPerfilPublico.mockReturnValue(new Promise((resolve) => { resolveRequest = resolve; }));
    renderPage();
    expect(screen.getByRole("status", { name: /Carregando perfil/i })).toBeInTheDocument();
    resolveRequest(perfil);
    expect(await screen.findByRole("heading", { name: "Giovani" })).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Pauper 300/i })).toHaveAttribute("href", `/torneios/${perfil.ultimosTorneios[0].id}`);
    expect(screen.getByRole("link", { name: /Burn/i })).toHaveAttribute("href", `/editar-deck/${perfil.decks[0].id}`);
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
