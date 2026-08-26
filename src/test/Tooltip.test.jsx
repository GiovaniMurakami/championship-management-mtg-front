import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Tooltip } from "../components/ui/Tooltip";

describe("Tooltip", () => {
  afterEach(() => vi.restoreAllMocks());

  it("renderiza o conteudo no document.body para nao ser cortado por overflow", async () => {
    render(
      <div style={{ overflow: "hidden", width: 40, height: 40 }}>
        <Tooltip content="Confirmar resultado">
          <span>!</span>
        </Tooltip>
      </div>
    );

    expect(screen.queryByRole("tooltip")).toBeNull();

    fireEvent.mouseEnter(screen.getByText("!").parentElement);
    const tip = await screen.findByRole("tooltip");
    expect(tip).toHaveTextContent("Confirmar resultado");
    expect(tip.parentElement).toBe(document.body);
    expect(tip.className).toContain("fixed");
  });

  it("usa o espaco acima quando o mouse esta proximo ao fim da tela", async () => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function () {
      if (this.getAttribute("role") === "tooltip") {
        return { top: 0, bottom: 120, left: 0, right: 240, width: 240, height: 120, x: 0, y: 0, toJSON() {} };
      }
      return { top: 740, bottom: 760, left: 100, right: 180, width: 80, height: 20, x: 100, y: 740, toJSON() {} };
    });

    render(
      <Tooltip content="Historico" placement="auto">
        <span>Jogador</span>
      </Tooltip>
    );

    const trigger = screen.getByText("Jogador").parentElement;
    fireEvent.mouseMove(trigger, { clientY: 750 });
    fireEvent.mouseEnter(trigger);

    const tip = await screen.findByRole("tooltip");
    expect(tip.lastElementChild.className).toContain("top-full");
  });
});
