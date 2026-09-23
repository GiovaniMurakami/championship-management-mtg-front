import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Switch } from "../components/ui/Switch";

describe("Switch", () => {
  it("expõe a semantica e informa o novo estado", () => {
    const onCheckedChange = vi.fn();
    render(<Switch checked={false} onCheckedChange={onCheckedChange} label="Inativo" aria-label="Status do anuncio" />);

    const control = screen.getByRole("switch", { name: "Status do anuncio" });
    expect(control).toHaveAttribute("aria-checked", "false");

    fireEvent.click(control);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });
});
