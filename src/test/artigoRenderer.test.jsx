import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ArtigoRenderer } from "../components/blog/ArtigoRenderer";

vi.mock("../services/scryfallApi", () => ({
  buscarCartasPorNome: vi.fn().mockResolvedValue([]),
}));

vi.mock("../services/backendApi", () => ({
  buscarDeck: vi.fn(),
}));

describe("ArtigoRenderer tags novas", () => {
  it("mostra badge centralizada, link e card do YouTube", () => {
    render(
      <MemoryRouter>
        <ArtigoRenderer
          conteudo={"[h1 center roxo]{Mono Blue}\n[h2]{Aggro}\n[h3 center]{Detalhe}\nVeja [o guia](https://exemplo.com/guia).\n[youtube](abcdefghijk){Gameplay}"}
        />
      </MemoryRouter>,
    );

    const titulo = screen.getByRole("heading", { name: "Mono Blue" });
    expect(titulo.style.color).toBe("rgb(192, 132, 252)");
    expect(titulo.className).toContain("rounded-full");
    expect(titulo.parentElement.className).toContain("justify-center");

    const subtitulo = screen.getByRole("heading", { name: "Aggro" });
    expect(subtitulo.className).toContain("rounded-lg");
    expect(subtitulo.parentElement.className).toContain("justify-start");

    const detalhe = screen.getByRole("heading", { name: "Detalhe" });
    expect(detalhe.className).toContain("uppercase");
    expect(detalhe.parentElement.className).toContain("justify-center");

    const guia = screen.getByRole("link", { name: "o guia" });
    expect(guia).toHaveAttribute("href", "https://exemplo.com/guia");
    expect(guia).toHaveAttribute("target", "_blank");

    const video = screen.getByRole("link", { name: "Gameplay" });
    expect(video).toHaveAttribute("href", "https://www.youtube.com/watch?v=abcdefghijk");
    expect(video.querySelector("img")).toHaveAttribute(
      "src",
      "https://i.ytimg.com/vi/abcdefghijk/maxresdefault.jpg",
    );
  });
});
