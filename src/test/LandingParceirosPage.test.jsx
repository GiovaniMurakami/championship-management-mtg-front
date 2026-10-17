import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LandingParceirosPage } from "../pages/LandingParceirosPage";
import { buscarParceiros } from "../services/backendApi";

vi.mock("../services/backendApi", () => ({
  buscarParceiros: vi.fn(),
  buscarParceirosAdmin: vi.fn(),
  salvarParceiros: vi.fn(),
}));

vi.mock("../hooks/usePageTitle", () => ({
  usePageTitle: vi.fn(),
}));

vi.mock("../hooks/useAuth", () => ({
  useAuth: () => ({ token: null, isAdmin: false }),
}));

vi.mock("../components/ui/LandingHeader", () => ({
  LandingHeader: () => <header>LandingHeader</header>,
}));

vi.mock("../components/ui/LandingSectionEdit", () => ({
  LandingEditButton: () => null,
  LandingParceirosModal: () => null,
  LandingSectionHeading: ({ as: Tag = "h2", title, subtitle }) => (
    <div>
      <Tag>{title}</Tag>
      {subtitle ? <div>{subtitle}</div> : null}
    </div>
  ),
}));

vi.mock("../components", () => ({
  Footer: () => <footer>Footer</footer>,
  CookieConsentBanner: () => null,
}));

vi.mock("../components/ui/Tooltip", () => ({
  Tooltip: ({ children }) => children,
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <LandingParceirosPage />
    </MemoryRouter>,
  );

describe("LandingParceirosPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("mostra skeleton e depois textos/parceiros vindos da API", async () => {
    let resolver;
    buscarParceiros.mockReturnValue(new Promise((resolve) => { resolver = resolve; }));
    renderPage();

    expect(screen.getByLabelText(/Carregando parceiros/i)).toBeInTheDocument();

    resolver({
      parceiros: [
        {
          id: "11111111-1111-4111-8111-111111111111",
          nome: "Loja Alpha",
          logoUrl: "https://cdn.example/alpha.webp",
          linkUrl: "https://alpha.example",
        },
      ],
      cupomGlobal: "FUGUETE05",
      paginaTitulo: "Temos o orgulho de ser parceiros",
      paginaTexto: "Reconhecimento da comunidade.",
      ctaTitulo: "Ainda não é parceiro?",
      ctaTexto: "Entre em contato.",
      contatoEmail: "contato@tiagofuguete.com.br",
    });

    expect(await screen.findByRole("heading", { name: "Temos o orgulho de ser parceiros" })).toBeInTheDocument();
    expect(screen.getByText("Reconhecimento da comunidade.")).toBeInTheDocument();
    expect(screen.getByText(/FUGUETE05/)).toBeInTheDocument();
    expect(screen.getByAltText("Loja Alpha")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Ainda não é parceiro?" })).toBeInTheDocument();
  });

  it("usa fallback de textos quando a API não envia campos", async () => {
    buscarParceiros.mockResolvedValue({
      parceiros: [],
      cupomGlobal: null,
      paginaTitulo: null,
      paginaTexto: null,
    });

    renderPage();

    await waitFor(() => {
      expect(
        screen.getByRole("heading", {
          name: /Temos o orgulho de ser parceiros das principais lojas/i,
        }),
      ).toBeInTheDocument();
    });
    expect(screen.getByText(/Nenhum parceiro cadastrado/i)).toBeInTheDocument();
  });
});
