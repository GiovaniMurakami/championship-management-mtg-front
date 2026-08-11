import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { Navbar } from "../components/ui/Navbar";

describe("Navbar — dropdown Dashboard", () => {
  it("abre o dropdown admin com Anúncios e Bloqueios", () => {
    render(
      <MemoryRouter>
        <Navbar
          usuario={{ nome: "Admin", role: "admin" }}
          isAuthenticated
          onOpenAuth={vi.fn()}
          onLogout={vi.fn()}
          onOpenEditProfile={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(screen.queryByRole("link", { name: /^Dashboard$/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Dashboard/i }));

    expect(screen.getByRole("menuitem", { name: /Anúncios/i })).toHaveAttribute("href", "/dashboard");
    expect(screen.getByRole("menuitem", { name: /Bloqueio de usuários/i })).toHaveAttribute(
      "href",
      "/dashboard/bloqueios",
    );
  });

  it("não exibe Dashboard para usuário comum", () => {
    render(
      <MemoryRouter>
        <Navbar
          usuario={{ nome: "User", role: "user" }}
          isAuthenticated
          onOpenAuth={vi.fn()}
          onLogout={vi.fn()}
          onOpenEditProfile={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(screen.queryByRole("button", { name: /Dashboard/i })).not.toBeInTheDocument();
  });
});
