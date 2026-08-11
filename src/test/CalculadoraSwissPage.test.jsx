import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { CalculadoraSwissPage } from "../pages/CalculadoraSwissPage";

describe("CalculadoraSwissPage", () => {
  it("mostra o placar que garante o top no exemplo clássico 16/4/8", () => {
    render(
      <MemoryRouter>
        <CalculadoraSwissPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: /Calculadora de top 8/i })).toBeInTheDocument();
    expect(screen.getByText(/Resultado que garante o top/i)).toBeInTheDocument();
    expect(screen.getByText((_, el) => el?.tagName === "STRONG" && el.textContent === "3-1-0")).toBeInTheDocument();
    expect(screen.getByText("4-0-0")).toBeInTheDocument();
  });
});
