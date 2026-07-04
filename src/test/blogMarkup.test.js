import { describe, expect, it } from "vitest";
import {
  blogMarkupToDisplayHtml,
  blocksToBlogMarkup,
  editorInlineHtmlToBlogMarkup,
  isBlogMarkup,
} from "../utils/blogMarkup";
import { createHeadingBlock, createImageBlock, createParagraphBlock } from "../utils/blogBlocks";

describe("blogMarkup utils", () => {
  it("detecta conteudo com tags customizadas", () => {
    expect(isBlogMarkup("<titulo>Olá</titulo>")).toBe(true);
    expect(isBlogMarkup("<p>Html antigo</p>")).toBe(false);
  });

  it("converte negrito e italico do editor para tags customizadas", () => {
    expect(editorInlineHtmlToBlogMarkup("Texto <strong>negrito</strong> e <em>italico</em>")).toBe(
      "Texto <negrito>negrito</negrito> e <italico>italico</italico>",
    );
  });

  it("converte link do editor para tag customizada", () => {
    expect(
      editorInlineHtmlToBlogMarkup('Veja <a href="https://example.com">aqui</a>'),
    ).toContain('<link href="https://example.com">aqui</link>');
  });

  it("renderiza tags customizadas como html visual", () => {
    const markup = blocksToBlogMarkup([
      createHeadingBlock("Minha Carta Favorita"),
      createParagraphBlock("Texto com <strong>negrito</strong>"),
      createImageBlock("https://cards.scryfall.io/x.jpg", "Carta", true),
    ]);

    const display = blogMarkupToDisplayHtml(markup);

    expect(display).toContain("<h2>Minha Carta Favorita</h2>");
    expect(display).toContain("<p>Texto com <strong>negrito</strong></p>");
    expect(display).toContain('<img src="https://cards.scryfall.io/x.jpg"');
    expect(display).toContain('class="blog-card-image"');
  });
});
