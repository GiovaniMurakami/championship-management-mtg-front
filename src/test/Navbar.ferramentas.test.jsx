import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { Navbar } from "../components/ui/Navbar";

describe("Navbar — dropdown Ferramentas", () => {
  it("abre o dropdown e lista as páginas", () => {
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

    fireEvent.click(screen.getByRole("button", { name: /Ferramentas/i }));
    expect(screen.getByRole("menuitem", { name: /Contador de vida/i })).toHaveAttribute(
      "href",
      "/ferramentas/contador-vida",
    );
    expect(screen.getByRole("menuitem", { name: /Calculadora Swiss/i })).toHaveAttribute(
      "href",
      "/ferramentas/calculadora-swiss",
    );
  });

  it("mantém as ferramentas públicas sem login", () => {
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

    fireEvent.click(screen.getByRole("button", { name: /Ferramentas/i }));
    expect(onOpenAuth).not.toHaveBeenCalled();
    expect(screen.getByRole("menuitem", { name: /Contador de vida/i })).toHaveAttribute(
      "href",
      "/ferramentas/contador-vida",
    );
  });
});
