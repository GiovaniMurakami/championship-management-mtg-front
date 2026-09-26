import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BlogArticlePage } from "../pages/BlogArticlePage";
import { buscarArtigo } from "../services/backendApi";

const mocks = vi.hoisted(() => ({
  addToast: vi.fn(),
  auth: {
    token: "",
    isAdmin: false,
    authInitialized: false,
    usuario: null,
    podeEditarBlog: false,
    requireAuth: vi.fn(),
  },
}));

vi.mock("../hooks/useAuth", () => ({ useAuth: () => mocks.auth }));
vi.mock("../context/ToastContext", () => ({ useToast: () => ({ addToast: mocks.addToast }) }));
vi.mock("../services/backendApi", () => ({
  buscarArtigo: vi.fn(),
  aprovarArtigo: vi.fn(),
  comentarArtigo: vi.fn(),
  curtirComentarioArtigo: vi.fn(),
  descurtirComentarioArtigo: vi.fn(),
  curtirArtigo: vi.fn(),
  descurtirArtigo: vi.fn(),
  excluirArtigo: vi.fn(),
}));
vi.mock("../components/ui/AdSenseUnit", () => ({ AdSenseInArticle: () => null }));

const artigoPendente = {
  id: "artigo-1",
  titulo: "Rascunho pendente",
  chamada: "Aguardando aprovação",
  status: "pendente",
  tags: [],
  conteudo: "Texto do rascunho.",
  visualizacoes: 0,
  totalCurtidas: 0,
  curtidoPorMim: false,
  comentarios: [],
  autor: { id: "autor-1", nome: "Editor" },
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/artigos/artigo-1"]}>
      <Routes>
        <Route path="/artigos/:id" element={<BlogArticlePage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("BlogArticlePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.token = "";
    mocks.auth.isAdmin = false;
    mocks.auth.authInitialized = false;
    mocks.auth.usuario = null;
    mocks.auth.podeEditarBlog = false;
  });

  it("espera a sessão no F5 antes de buscar um artigo pendente", async () => {
    let rejeitarAnonimo;
    buscarArtigo.mockImplementation((_id, token) => {
      if (!token) {
        return new Promise((_, reject) => {
          rejeitarAnonimo = () => reject(new Error("Artigo não encontrado."));
        });
      }
      return Promise.resolve(artigoPendente);
    });

    const view = renderPage();
    expect(buscarArtigo).not.toHaveBeenCalled();
    expect(screen.queryByRole("heading", { name: "Artigo não encontrado" })).not.toBeInTheDocument();

    mocks.auth.authInitialized = true;
    mocks.auth.token = "";
    view.rerender(
      <MemoryRouter initialEntries={["/artigos/artigo-1"]}>
        <Routes>
          <Route path="/artigos/:id" element={<BlogArticlePage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(buscarArtigo).toHaveBeenCalledWith("artigo-1", ""));

    mocks.auth.token = "token-admin";
    mocks.auth.isAdmin = true;
    mocks.auth.usuario = { id: "admin-1", nome: "Admin", role: "admin" };
    view.rerender(
      <MemoryRouter initialEntries={["/artigos/artigo-1"]}>
        <Routes>
          <Route path="/artigos/:id" element={<BlogArticlePage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { name: "Rascunho pendente" })).toBeInTheDocument();

    rejeitarAnonimo();
    await waitFor(() => expect(buscarArtigo).toHaveBeenCalledWith("artigo-1", "token-admin"));
    expect(screen.getByRole("heading", { name: "Rascunho pendente" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Artigo não encontrado" })).not.toBeInTheDocument();
  });
});
