import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ExpandableText } from "../components/tournament/ExpandableText";

describe("ExpandableText", () => {
  it("limita descricao a 3 linhas e permite expandir", () => {
    const text = Array.from({ length: 12 }, (_, i) => `Linha ${i + 1} da descricao`).join("\n");
    const { container } = render(<ExpandableText text={text} maxLines={3} />);
    const paragraph = container.querySelector("p");

    expect(paragraph.className).toContain("line-clamp-3");
    expect(screen.getByRole("button", { name: /mostrar tudo/i })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /mostrar tudo/i }));
    expect(paragraph.className).not.toContain("line-clamp-3");
    expect(screen.getByRole("button", { name: /implodir/i })).toBeTruthy();
  });
});
