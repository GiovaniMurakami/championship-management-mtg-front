import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { ContadorVidaPage } from "../pages/ContadorVidaPage";

function getLifeValues() {
  return screen
    .getAllByText((_, el) => el?.getAttribute?.("aria-live") === "polite")
    .map((el) => el.textContent);
}

describe("ContadorVidaPage", () => {
  it("ajusta vida e permite resetar para o valor inicial", () => {
    render(
      <MemoryRouter>
        <ContadorVidaPage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Jogador 1: aumentar vida/i }));
    fireEvent.click(screen.getByRole("button", { name: /Jogador 2: diminuir vida/i }));

    expect(getLifeValues()).toEqual(expect.arrayContaining(["21", "19"]));

    fireEvent.click(screen.getByRole("button", { name: /Resetar/i }));
    expect(getLifeValues()).toEqual(["20", "20"]);
  });

  it("aplica vida inicial de Commander (40)", () => {
    render(
      <MemoryRouter>
        <ContadorVidaPage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /^40$/i }));
    expect(getLifeValues()).toEqual(["40", "40"]);
  });

  it("inverte o painel do jogador oposto para leitura frente a frente", () => {
    const { container } = render(
      <MemoryRouter>
        <ContadorVidaPage />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText(/Contador frente a frente/i)).toBeInTheDocument();
    expect(container.querySelectorAll(".rotate-180")).toHaveLength(1);
    expect(within(screen.getByLabelText(/Contador frente a frente/i)).getByText("Jogador 2")).toBeInTheDocument();
  });
});
