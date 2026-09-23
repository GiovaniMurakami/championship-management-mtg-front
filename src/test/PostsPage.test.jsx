import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PostsPage } from "../pages/PostsPage";
import { excluirPost, listarPosts } from "../services/backendApi";

const mocks = vi.hoisted(() => ({
  addToast: vi.fn(),
  auth: { token: "token", isAdmin: true, usuario: { id: "user-1", nome: "Giovani", fotoUrl: "https://cdn/avatar.jpg" }, requireAuth: vi.fn() },
}));

vi.mock("../hooks/useAuth", () => ({ useAuth: () => mocks.auth }));
vi.mock("../context/ToastContext", () => ({ useToast: () => ({ addToast: mocks.addToast }) }));
vi.mock("../utils/bannerUpload", () => ({ validateBannerImageFile: vi.fn(() => null), uploadBannerImage: vi.fn() }));
vi.mock("../services/backendApi", () => ({
  listarPosts: vi.fn(), criarPost: vi.fn(), comentarPost: vi.fn(), curtirPost: vi.fn(), descurtirPost: vi.fn(), excluirPost: vi.fn(),
}));

const post = {
  id: "11111111-1111-4111-8111-111111111111", legenda: "Final do campeonato",
  imagens: ["https://cdn/foto.jpg"], totalImagens: 1, criadoEm: "2026-08-28T14:03:00.000Z",
  autor: { id: "user-1", nome: "Giovani", fotoUrl: "https://cdn/avatar.jpg" },
  totalCurtidas: 2, curtidoPorMim: false, comentarios: [],
};

const renderPage = () => render(<MemoryRouter><PostsPage /></MemoryRouter>);

describe("PostsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.scrollTo = vi.fn();
    listarPosts.mockResolvedValue({ posts: [post], total: 1, limite: 20, offset: 0 });
    excluirPost.mockResolvedValue({ excluido: true });
  });

  it("mostra skeleton enquanto carrega e depois renderiza o feed", async () => {
    let resolver;
    listarPosts.mockReturnValue(new Promise((resolve) => { resolver = resolve; }));
    renderPage();
    expect(screen.getByRole("status", { name: /Carregando publicações/i })).toBeInTheDocument();
    resolver({ posts: [post], total: 1, limite: 20, offset: 0 });
    expect(await screen.findByText("Final do campeonato")).toBeInTheDocument();
    expect(screen.getByText("2 curtidas")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Editar" })).toBeInTheDocument();
  });

  it("mostra loader no avatar e revela a foto após carregar", async () => {
    renderPage();
    const imagem = await screen.findByAltText("Foto de Giovani");
    expect(screen.getByRole("status", { name: "Carregando foto de Giovani" })).toBeInTheDocument();
    expect(imagem).toHaveClass("opacity-0");
    fireEvent.load(imagem);
    expect(screen.queryByRole("status", { name: "Carregando foto de Giovani" })).not.toBeInTheDocument();
    expect(imagem).toHaveClass("opacity-100");
  });

  it("pagina de 20 em 20", async () => {
    listarPosts
      .mockResolvedValueOnce({ posts: [post], total: 21, limite: 20, offset: 0 })
      .mockResolvedValueOnce({ posts: [{ ...post, id: "22222222-2222-4222-8222-222222222222", legenda: "Página dois" }], total: 21, limite: 20, offset: 20 });
    renderPage();
    await screen.findByText("Final do campeonato");
    fireEvent.click(screen.getByRole("button", { name: /Próxima/i }));
    expect(await screen.findByText("Página dois")).toBeInTheDocument();
    expect(listarPosts).toHaveBeenLastCalledWith("token", { limite: 20, offset: 20 });
    expect(screen.getByText("Página 2 de 2")).toBeInTheDocument();
  });

  it("navega pelas fotos com swipe horizontal", async () => {
    listarPosts.mockResolvedValue({ posts: [{ ...post, imagens: ["https://cdn/foto-1.jpg", "https://cdn/foto-2.jpg"], totalImagens: 2 }], total: 1, limite: 20, offset: 0 });
    renderPage();
    const carrossel = await screen.findByLabelText("Carrossel de fotos do post");
    expect(screen.getByAltText("Final do campeonato")).toHaveAttribute("src", "https://cdn/foto-1.jpg");
    fireEvent.touchStart(carrossel, { touches: [{ clientX: 220, clientY: 100 }] });
    fireEvent.touchEnd(carrossel, { changedTouches: [{ clientX: 80, clientY: 105 }] });
    expect(screen.getByAltText("Final do campeonato")).toHaveAttribute("src", "https://cdn/foto-2.jpg");
    expect(screen.getByRole("button", { name: "Imagem anterior" })).toHaveClass("max-sm:hidden");
    expect(screen.getByRole("button", { name: "Próxima imagem" })).toHaveClass("max-sm:hidden");
  });

  it("oculta comentários excedentes e revela mais sob demanda", async () => {
    const comentarios = Array.from({ length: 6 }, (_, indice) => ({
      id: `comentario-${indice + 1}`,
      texto: `Comentário ${indice + 1}`,
      criadoEm: "2026-08-28T14:03:00.000Z",
      autor: { id: `autor-${indice + 1}`, nome: `Autor ${indice + 1}` },
    }));
    listarPosts.mockResolvedValue({ posts: [{ ...post, comentarios }], total: 1, limite: 20, offset: 0 });
    renderPage();
    expect(await screen.findByText("Comentário 3")).toBeInTheDocument();
    expect(screen.queryByText("Comentário 4")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Ver mais comentários (3)" }));
    expect(screen.getByText("Comentário 6")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Ver mais comentários/ })).not.toBeInTheDocument();
  });

  it("exclui usando a modal do app", async () => {
    renderPage();
    await screen.findByText("Final do campeonato");
    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
    expect(screen.getByRole("heading", { name: "Excluir publicação" })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Digite: EXCLUIR"), { target: { value: "EXCLUIR" } });
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Excluir" }));
    await waitFor(() => expect(excluirPost).toHaveBeenCalledWith(post.id, "token"));
  });
});
