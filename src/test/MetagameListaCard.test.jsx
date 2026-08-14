import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { MetagameListaCard } from "../components/metagame/MetagameListaCard";

const lista = {
  deckId: "deck-1",
  nome: "Meu Terror",
  torneioId: "torneio-1",
  torneioNome: "Pauper Semanal",
  usuario: { id: "user-1", nome: "alice_mtgo", excluido: false },
  maindeck: [
    { nome: "Tolarian Terror", quantidade: 4, typeLine: "Creature — Serpent", colors: ["U"] },
    { nome: "Counterspell", quantidade: 4, typeLine: "Instant", colors: ["U"] },
    { nome: "Island", quantidade: 18, typeLine: "Basic Land — Island", colors: [] },
  ],
  sideboard: [{ nome: "Hydroblast", quantidade: 3, typeLine: "Instant", colors: ["U"] }],
  commander: [],
};

function renderCard(props = {}) {
  return render(
    <MemoryRouter>
      <MetagameListaCard lista={lista} {...props} />
    </MemoryRouter>,
  );
}

describe("MetagameListaCard", () => {
  it("destaca o jogador e agrupa o maindeck por tipo", () => {
    renderCard();

    expect(screen.getByText("alice_mtgo")).toBeInTheDocument();
    expect(screen.getByText("Meu Terror")).toBeInTheDocument();
    expect(screen.getByText("Pauper Semanal")).toBeInTheDocument();
    expect(screen.getAllByText("Criaturas").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Mágicas Inst.").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Terrenos").length).toBeGreaterThan(0);
    expect(screen.getByText("Sideboard")).toBeInTheDocument();
    expect(screen.getByText("Tolarian Terror")).toBeInTheDocument();
    expect(screen.getByText("Hydroblast")).toBeInTheDocument();
  });

  it("omite as cartas quando a lista esta minimizada", () => {
    renderCard({ expandida: false });

    expect(screen.getByText("alice_mtgo")).toBeInTheDocument();
    expect(screen.getByText("Meu Terror")).toBeInTheDocument();
    expect(screen.queryByText("Tolarian Terror")).not.toBeInTheDocument();
    expect(screen.queryByText("Sideboard")).not.toBeInTheDocument();
  });

  it("dispara onToggle ao clicar no cabecalho minimizado", () => {
    const onToggle = vi.fn();
    renderCard({ expandida: false, onToggle });

    fireEvent.click(screen.getByRole("button", { name: /mostrar lista/i }));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
