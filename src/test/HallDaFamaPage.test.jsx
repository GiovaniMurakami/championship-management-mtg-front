import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HallDaFamaPage } from "../pages/HallDaFamaPage";
import { atualizarHallDaFama, excluirHallDaFama, listarHallDaFama } from "../services/backendApi";

vi.mock("../services/backendApi", () => ({
  listarHallDaFama: vi.fn(),
  atualizarHallDaFama: vi.fn(),
  excluirHallDaFama: vi.fn(),
}));

vi.mock("../hooks/usePageTitle", () => ({
  usePageTitle: vi.fn(),
}));

vi.mock("../hooks/useAuth", () => ({
  useAuth: vi.fn(() => ({ token: null, isAdmin: false })),
}));

vi.mock("../context/ToastContext", () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));

vi.mock("../components/ui/LandingHeader", () => ({
  LandingHeader: () => <header>LandingHeader</header>,
}));

vi.mock("../components", () => ({
  Footer: () => <footer>Footer</footer>,
  CookieConsentBanner: () => null,
}));

vi.mock("../components/ui/AdSenseUnit", () => ({
  AdSenseUnit: () => null,
}));

import { useAuth } from "../hooks/useAuth";

const item = {
  id: "11111111-1111-4111-8111-111111111111",
  torneioId: "22222222-2222-4222-8222-222222222222",
  torneioNome: "Fuguete League 294",
  imagemUrl: "https://cdn.example/top8.png",
  dataTorneio: "2026-10-07T20:00:00.000-03:00",
  criadoEm: "2026-10-17T12:00:00.000-03:00",
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <HallDaFamaPage />
    </MemoryRouter>,
  );

describe("HallDaFamaPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ token: null, isAdmin: false });
    listarHallDaFama.mockResolvedValue({ itens: [item], total: 1, limite: 24, offset: 0 });
  });

  it("mostra skeleton enquanto carrega e depois os itens", async () => {
    let resolver;
    listarHallDaFama.mockReturnValue(new Promise((resolve) => { resolver = resolve; }));
    renderPage();

    expect(screen.getByLabelText(/Carregando Hall da Fama/i)).toBeInTheDocument();
    resolver({ itens: [item], total: 1, limite: 24, offset: 0 });

    expect(await screen.findByText("Fuguete League 294")).toBeInTheDocument();
    expect(screen.getByAltText("Fuguete League 294")).toHaveAttribute("src", item.imagemUrl);
  });

  it("pagina resultados", async () => {
    listarHallDaFama
      .mockResolvedValueOnce({ itens: [item], total: 25, limite: 24, offset: 0 })
      .mockResolvedValueOnce({
        itens: [{ ...item, id: "33333333-3333-4333-8333-333333333333", torneioNome: "Champ 311" }],
        total: 25,
        limite: 24,
        offset: 24,
      });

    renderPage();
    await screen.findByText("Fuguete League 294");
    fireEvent.click(screen.getByRole("button", { name: /Próxima/i }));

    expect(await screen.findByText("Champ 311")).toBeInTheDocument();
    expect(listarHallDaFama).toHaveBeenLastCalledWith({ limite: 24, offset: 24 }, undefined);
  });

  it("abre lightbox ao clicar no card", async () => {
    renderPage();
    fireEvent.click(await screen.findByText("Fuguete League 294"));

    await waitFor(() => {
      expect(screen.getByRole("dialog", { name: /Preview Top 8/i })).toBeInTheDocument();
    });
    expect(screen.getByRole("link", { name: /Ver torneio/i })).toBeInTheDocument();
  });

  it("não mostra ações de admin para visitante", async () => {
    renderPage();
    await screen.findByText("Fuguete League 294");
    expect(screen.queryByRole("button", { name: /Ocultar Fuguete League 294/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Excluir Fuguete League 294/i })).not.toBeInTheDocument();
  });

  it("admin lista com incluirInativos e pode ocultar sem remover o card", async () => {
    useAuth.mockReturnValue({ token: "tok", isAdmin: true });
    atualizarHallDaFama.mockResolvedValue({});
    renderPage();

    await waitFor(() => {
      expect(listarHallDaFama).toHaveBeenCalledWith(
        { limite: 24, offset: 0, incluirInativos: true },
        "tok",
      );
    });

    fireEvent.click(await screen.findByRole("button", { name: /Ocultar Fuguete League 294/i }));

    await waitFor(() => {
      expect(atualizarHallDaFama).toHaveBeenCalledWith(item.id, { ativo: false }, "tok");
    });
    expect(screen.getByText("Fuguete League 294")).toBeInTheDocument();
    expect(screen.getByText("Oculto")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Desocultar Fuguete League 294/i })).toBeInTheDocument();
  });

  it("admin pode desocultar item", async () => {
    useAuth.mockReturnValue({ token: "tok", isAdmin: true });
    listarHallDaFama.mockResolvedValue({
      itens: [{ ...item, ativo: false }],
      total: 1,
      limite: 24,
      offset: 0,
    });
    atualizarHallDaFama.mockResolvedValue({});
    renderPage();

    fireEvent.click(await screen.findByRole("button", { name: /Desocultar Fuguete League 294/i }));

    await waitFor(() => {
      expect(atualizarHallDaFama).toHaveBeenCalledWith(item.id, { ativo: true }, "tok");
    });
    expect(screen.getByRole("button", { name: /Ocultar Fuguete League 294/i })).toBeInTheDocument();
  });

  it("admin pode excluir item direto na landing", async () => {
    useAuth.mockReturnValue({ token: "tok", isAdmin: true });
    excluirHallDaFama.mockResolvedValue({});
    vi.spyOn(window, "confirm").mockReturnValue(true);
    renderPage();

    fireEvent.click(await screen.findByRole("button", { name: /Excluir Fuguete League 294/i }));

    await waitFor(() => {
      expect(excluirHallDaFama).toHaveBeenCalledWith(item.id, "tok");
    });
    expect(screen.queryByText("Fuguete League 294")).not.toBeInTheDocument();
  });
});
