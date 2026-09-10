import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CalendarField } from "../components/ui/CalendarField";

describe("CalendarField", () => {
  it("seleciona um dia no calendário e fecha sem depender do seletor nativo", () => {
    const onChange = vi.fn();
    render(<CalendarField label="De" value="2026-08-01" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Abrir calendário: De" }));
    expect(screen.getByRole("dialog", { name: "Data inicial" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "15 de agosto de 2026" }));
    expect(onChange).toHaveBeenCalledWith("2026-08-15");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("respeita limites e navega com teclado entre meses", () => {
    render(<CalendarField label="Até" value="2026-08-31" min="2026-08-10" max="2026-09-15" onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Abrir calendário: Até" }));
    expect(screen.getByRole("button", { name: "9 de agosto de 2026" })).toBeDisabled();
    fireEvent.keyDown(screen.getByRole("button", { name: "31 de agosto de 2026" }), { key: "ArrowRight" });
    expect(screen.getByRole("button", { name: "1 de setembro de 2026" })).toHaveFocus();
    expect(screen.getByRole("button", { name: "16 de setembro de 2026" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Mês anterior" }));
    expect(screen.getByRole("group", { name: "Dias de agosto de 2026" })).toBeInTheDocument();
  });
});
