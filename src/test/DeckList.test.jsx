import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DeckList } from "../components/deck/DeckList";

const cartas = [
  { nome: "Island", quantidade: 18, typeLine: "Basic Land — Island", colors: ["U"] },
  { nome: "Tolarian Terror", quantidade: 4, typeLine: "Creature — Serpent", colors: ["U"] },
  { nome: "Counterspell", quantidade: 4, typeLine: "Instant", colors: ["U"] },
  { nome: "Brainstorm", quantidade: 4, typeLine: "Instant", colors: ["U"] },
];

describe("DeckList", () => {
  it("agrupa criaturas, magicas instantaneas e terrenos na criacao e edicao", async () => {
    const onCardQuantityChange = vi.fn();
    render(
      <DeckList
        cards={cartas}
        onCardRemove={vi.fn()}
        onCardQuantityChange={onCardQuantityChange}
      />,
    );

    expect(screen.getByRole("heading", { name: /Criaturas/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Mágicas instantâneas/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Terrenos/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Criaturas/i }).textContent).toMatch(/4/);
    expect(screen.getByRole("heading", { name: /Mágicas instantâneas/i }).textContent).toMatch(/8/);
    expect(screen.getByRole("heading", { name: /Terrenos/i }).textContent).toMatch(/18/);

    fireEvent.click(screen.getAllByRole("button", { name: "Aumentar quantidade" })[0]);
    expect(onCardQuantityChange).toHaveBeenCalled();
  });

  it("mantem a lista plana quando as cartas ainda nao tem tipo", () => {
    render(<DeckList cards={[{ nome: "Sem tipo", quantidade: 1 }]} readOnly />);
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    expect(screen.getByText("Sem Tipo")).toBeInTheDocument();
  });
});
