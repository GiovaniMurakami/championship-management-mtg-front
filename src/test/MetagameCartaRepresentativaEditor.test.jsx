import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MetagameCartaRepresentativaEditor } from "../components/metagame/MetagameCartaRepresentativaEditor";
import { buscarArtesDaCarta, buscarCartasMTG } from "../services/scryfallApi";

vi.mock("../services/scryfallApi", () => ({
  buscarCartasMTG: vi.fn(),
  buscarArtesDaCarta: vi.fn(),
  buscarCartaPorNome: vi.fn().mockResolvedValue(null),
  buscarCartaPorId: vi.fn().mockResolvedValue(null),
}));

describe("MetagameCartaRepresentativaEditor", () => {
  it("mostra a arte atual e dispara limpar", async () => {
    const onSalvar = vi.fn();
    render(
      <MetagameCartaRepresentativaEditor
        valorInicial="Tolarian Terror"
        onSalvar={onSalvar}
      />,
    );

    expect(await screen.findByText("Arte atual: Tolarian Terror")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Limpar" }));
    expect(onSalvar).toHaveBeenCalledWith(null);
  });

  it("desabilita salvar sem carta nova", async () => {
    render(
      <MetagameCartaRepresentativaEditor
        valorInicial="Tolarian Terror"
        onSalvar={vi.fn()}
      />,
    );

    expect(await screen.findByText("Arte atual: Tolarian Terror")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Salvar carta" })).toBeDisabled();
  });

  it("lista artes distintas depois de escolher a carta", async () => {
    const onSalvar = vi.fn();
    buscarCartasMTG.mockResolvedValue([
      {
        id: "search-id",
        nome: "Guttersnipe",
        set: "Return to Ravnica",
        oracleId: "oracle-gutter",
      },
    ]);
    buscarArtesDaCarta.mockResolvedValue([
      {
        id: "11111111-1111-1111-1111-111111111111",
        nome: "Guttersnipe",
        set: "Return to Ravnica",
        artCrop: "https://cards.example/rtr.jpg",
      },
      {
        id: "22222222-2222-2222-2222-222222222222",
        nome: "Guttersnipe",
        set: "Modern Horizons 3",
        artCrop: "https://cards.example/mh3.jpg",
      },
    ]);

    render(
      <MetagameCartaRepresentativaEditor
        valorInicial=""
        onSalvar={onSalvar}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("Buscar carta..."), {
      target: { value: "guttersnipe" },
    });

    fireEvent.click(await screen.findByRole("button", { name: /Guttersnipe/i }));
    fireEvent.click(await screen.findByRole("button", { name: /Modern Horizons 3/i }));
    fireEvent.click(screen.getByRole("button", { name: "Salvar carta" }));

    await waitFor(() => {
      expect(onSalvar).toHaveBeenCalledWith("22222222-2222-2222-2222-222222222222");
    });
  });
});
