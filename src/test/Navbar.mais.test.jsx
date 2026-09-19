import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { Navbar } from "../components/ui/Navbar";

describe("Navbar — dropdown Mais", () => {
  it("abre o dropdown e lista comunidade, competição e ferramentas", () => {
    render(
      <MemoryRouter>
        <Navbar
          usuario={{ id: "5f01d815-0fe7-4c06-a2e6-e2e321727fe0", nome: "Admin", role: "user" }}
          isAuthenticated
          onOpenAuth={vi.fn()}
          onLogout={vi.fn()}
          onOpenEditProfile={vi.fn()}
        />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Mais/i }));
    expect(screen.getByRole("menuitem", { name: /Posts/i })).toHaveAttribute("href", "/comunidade");
    expect(screen.getByRole("menuitem", { name: /Ligas/i })).toHaveAttribute("href", "/ligas");
    expect(screen.getByRole("menuitem", { name: /Times/i })).toHaveAttribute("href", "/times");
    expect(screen.getByRole("menuitem", { name: /Contador de vida/i })).toHaveAttribute(
      "href",
      "/ferramentas/contador-vida",
    );
    expect(screen.getByRole("menuitem", { name: /Calculadora Swiss/i })).toHaveAttribute(
      "href",
      "/ferramentas/calculadora-swiss",
    );
  });

  it("mantém os itens públicos sem login", () => {
    const onOpenAuth = vi.fn();
    render(
      <MemoryRouter>
        <Navbar
          usuario={null}
          isAuthenticated={false}
          onOpenAuth={onOpenAuth}
          onLogout={vi.fn()}
          onOpenEditProfile={vi.fn()}
        />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Mais/i }));
    expect(onOpenAuth).not.toHaveBeenCalled();
    expect(screen.getByRole("menuitem", { name: /Contador de vida/i })).toHaveAttribute(
      "href",
      "/ferramentas/contador-vida",
    );
  });
});
