import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route, Link } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ScrollToTop } from "../components/ui/ScrollToTop";

describe("ScrollToTop", () => {
  beforeEach(() => {
    window.scrollTo = vi.fn();
  });

  it("rola para o topo ao montar e ao mudar de rota", () => {
    render(
      <MemoryRouter initialEntries={["/ligas"]}>
        <ScrollToTop />
        <Link to="/metagame">Metagame</Link>
        <Routes>
          <Route path="/ligas" element={<div>Ligas</div>} />
          <Route path="/metagame" element={<div>Metagame</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(window.scrollTo).toHaveBeenCalled();
    window.scrollTo.mockClear();

    fireEvent.click(screen.getByRole("link", { name: "Metagame" }));

    expect(window.scrollTo).toHaveBeenCalled();
    const [arg, maybeY] = window.scrollTo.mock.calls.at(-1);
    if (typeof arg === "object") {
      expect(arg.top).toBe(0);
    } else {
      expect(arg).toBe(0);
      expect(maybeY).toBe(0);
    }
  });
});
