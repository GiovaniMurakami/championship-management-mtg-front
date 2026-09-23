import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useMetagameDeckColors } from "../hooks/useMetagameDeckColors";
import { buscarCartasPorNome } from "../services/scryfallApi";

vi.mock("../services/scryfallApi", () => ({
  buscarCartasPorNome: vi.fn(),
}));

describe("useMetagameDeckColors", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("usa cores da API sem consultar o Scryfall", async () => {
    const { result } = renderHook(() => useMetagameDeckColors([
      { slug: "grixis", cores: ["U", "B", "R"], cartasCores: ["thoughtcast"] },
    ], "pauper"));

    await waitFor(() => {
      expect(result.current.cores.grixis).toEqual(["U", "B", "R"]);
    });
    expect(buscarCartasPorNome).not.toHaveBeenCalled();
  });

  it("consulta só nomes ainda sem identidade e persiste o resultado", async () => {
    buscarCartasPorNome.mockResolvedValue([
      { nome: "Thoughtcast", colorIdentity: ["U"] },
    ]);

    const { result, rerender } = renderHook(() => useMetagameDeckColors([
      { slug: "affinity", cartasCores: ["island", "thoughtcast"] },
    ], "pauper"));

    await waitFor(() => {
      expect(result.current.cores.affinity).toEqual(["U"]);
    });
    expect(buscarCartasPorNome).toHaveBeenCalledWith(["thoughtcast"], { fallbackIndividual: false });

    rerender();
    await waitFor(() => {
      expect(result.current.cores.affinity).toEqual(["U"]);
    });
    expect(buscarCartasPorNome).toHaveBeenCalledTimes(1);
  });
});
