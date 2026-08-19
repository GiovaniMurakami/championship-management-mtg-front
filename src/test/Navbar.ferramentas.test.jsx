import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { Navbar } from "../components/ui/Navbar";

describe("Navbar — dropdown Ferramentas", () => {
  it("abre o dropdown e lista as páginas individuais", () => {
    render(
      <MemoryRouter>
        <Navbar
          usuario={{ nome: "Admin", role: "user" }}
          isAuthenticated
          onOpenAuth={vi.fn()}
          onLogout={vi.fn()}
          onOpenEditProfile={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(screen.queryByRole("link", { name: /^Ferramentas$/i })).not.toBeInTheDocument();

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

  it("sem login, Ferramentas continua pública e lista as páginas", () => {
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
