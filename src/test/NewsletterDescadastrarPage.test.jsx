import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NewsletterDescadastrarPage } from "../pages/NewsletterDescadastrarPage";

const marcarNewsletterDescadastrada = vi.fn();

vi.mock("../hooks/useAuth", () => ({
  useAuth: () => ({ marcarNewsletterDescadastrada }),
}));

vi.mock("../hooks/usePageTitle", () => ({
  usePageTitle: vi.fn(),
}));

vi.mock("../services/backendApi", () => ({
  descadastrarNewsletter: vi.fn(),
}));

import { descadastrarNewsletter } from "../services/backendApi";

function renderPage(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/newsletter/descadastrar" element={<NewsletterDescadastrarPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("NewsletterDescadastrarPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("mostra erro quando o token está ausente", async () => {
    renderPage("/newsletter/descadastrar");
    expect(await screen.findByText(/inválido ou incompleto/i)).toBeInTheDocument();
    expect(descadastrarNewsletter).not.toHaveBeenCalled();
  });

  it("descadastra e sincroniza a sessão quando o token é válido", async () => {
    descadastrarNewsletter.mockResolvedValue({
      ok: true,
      emailMascarado: "gi***@gmail.com",
      usuarioId: "user-1",
    });

    renderPage("/newsletter/descadastrar?token=abc.def");

    expect(screen.getByText(/Removendo da lista/i)).toBeInTheDocument();
    expect(await screen.findByText(/Removemos gi\*\*\*@gmail.com/i)).toBeInTheDocument();
    expect(marcarNewsletterDescadastrada).toHaveBeenCalledWith("user-1");
    expect(descadastrarNewsletter).toHaveBeenCalledWith("abc.def");
  });

  it("mostra erro quando a API falha", async () => {
    descadastrarNewsletter.mockRejectedValue(new Error("Erro interno do servidor."));
    renderPage("/newsletter/descadastrar?token=abc.def");
    expect(await screen.findByText(/Erro interno do servidor/i)).toBeInTheDocument();
    await waitFor(() => expect(marcarNewsletterDescadastrada).not.toHaveBeenCalled());
  });
});
