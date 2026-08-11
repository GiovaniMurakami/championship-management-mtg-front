import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Tooltip } from "../components/ui/Tooltip";

describe("Tooltip", () => {
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
});
