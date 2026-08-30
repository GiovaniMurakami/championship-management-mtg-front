import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Checkbox } from "../components/ui/Checkbox";

describe("Checkbox", () => {
  it("alterna com teclado e preserva o evento usado pelos formularios", () => {
    const onChange = vi.fn();
    render(<Checkbox aria-label="Torneio secreto" name="secreto" checked={false} onChange={onChange} />);

    fireEvent.click(screen.getByRole("checkbox", { name: "Torneio secreto" }));

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
      target: expect.objectContaining({ name: "secreto", type: "checkbox", checked: true }),
    }));
  });

  it("exibe o estado indeterminado", () => {
    render(<Checkbox aria-label="Selecionar todos" checked="indeterminate" />);
    expect(screen.getByRole("checkbox", { name: "Selecionar todos" })).toHaveAttribute("data-state", "indeterminate");
  });
});
