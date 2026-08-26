import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { Navbar } from "../components/ui/Navbar";

describe("Navbar — dropdown do usuário", () => {
  it("agrupa perfil, administração e sair para o admin", () => {
    const onLogout = vi.fn();
    render(
      <MemoryRouter>
        <Navbar
          usuario={{ id: "5f01d815-0fe7-4c06-a2e6-e2e321727fe0", nome: "Admin", role: "admin" }}
          isAuthenticated
          onOpenAuth={vi.fn()}
          onLogout={onLogout}
          onOpenEditProfile={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(screen.queryByRole("button", { name: /Dashboard/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Abrir menu do usuário/i }));

    expect(screen.getByRole("menuitem", { name: /Editar perfil/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /Anúncios/i })).toHaveAttribute("href", "/dashboard");
    expect(screen.getByRole("menuitem", { name: /Bloqueio de usuários/i })).toHaveAttribute(
      "href",
      "/dashboard/bloqueios",
    );
    fireEvent.click(screen.getByRole("menuitem", { name: /Sair/i }));
    expect(onLogout).toHaveBeenCalledOnce();
  });

  it("não exibe Dashboard para usuário comum", () => {
    render(
      <MemoryRouter>
        <Navbar
          usuario={{ id: "5f01d815-0fe7-4c06-a2e6-e2e321727fe0", nome: "User", role: "user" }}
          isAuthenticated
          onOpenAuth={vi.fn()}
          onLogout={vi.fn()}
          onOpenEditProfile={vi.fn()}
        />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Abrir menu do usuário/i }));

    expect(screen.queryByRole("menuitem", { name: /Anúncios/i })).not.toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /Sair/i })).toBeInTheDocument();
  });
});
