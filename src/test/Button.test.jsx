import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "../components/ui/Button";

describe("Button", () => {
  it("usa a variante primária como padrão", () => {
    render(<Button>Criar torneio</Button>);

    const button = screen.getByRole("button", { name: "Criar torneio" });
    expect(button).toHaveClass("bg-brand-strong", "text-white");
    expect(button).not.toBeDisabled();
  });

  it("padroniza ações secundárias", () => {
    render(<Button variant="secondary">Buscar</Button>);

    expect(screen.getByRole("button", { name: "Buscar" })).toHaveClass("border-line", "bg-surface", "text-text-main");
  });

  it("desabilita e sinaliza o estado de carregamento", () => {
    render(<Button loading>Salvando...</Button>);

    const button = screen.getByRole("button", { name: "Salvando..." });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });
});
