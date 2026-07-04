import { describe, expect, it } from "vitest";
import {
  blocksToHtml,
  createHeadingBlock,
  createImageBlock,
  createListBlock,
  createParagraphBlock,
  htmlToBlocks,
} from "../utils/blogBlocks";

describe("blogBlocks utils", () => {
  it("converte blocos em tags customizadas do blog", () => {
    const html = blocksToHtml([
      createParagraphBlock("Este é o <strong>Myr Enforcer</strong>"),
      createImageBlock("https://cdn.example.com/carta.jpg", "Myr Enforcer", true),
    ]);

    expect(html).toContain("<paragrafo>Este é o <negrito>Myr Enforcer</negrito></paragrafo>");
    expect(html).toContain('<imagem url="https://cdn.example.com/carta.jpg"');
    expect(html).toContain('alt="Myr Enforcer"');
    expect(html).toContain('carta="true"');
  });

  it("converte markup salvo de volta para blocos", () => {
    const markup =
      '<paragrafo>Texto do post</paragrafo><imagem url="https://cdn.example.com/foto.jpg" alt="Carta" carta="true" />';
    const blocks = htmlToBlocks(markup);

    expect(blocks).toHaveLength(2);
    expect(blocks[0].type).toBe("paragraph");
    expect(blocks[1].type).toBe("image");
    expect(blocks[1].url).toBe("https://cdn.example.com/foto.jpg");
  });

  it("monta markup completo com titulo paragrafo e carta", () => {
    const html = blocksToHtml([
      createHeadingBlock("Minha Carta Favorita"),
      createParagraphBlock("Este é o Myr Enforcer, minha carta favorita."),
      createImageBlock("https://cards.scryfall.io/normal/front/a/b.jpg", "Myr Enforcer", true),
    ]);

    expect(html).toContain("<titulo>Minha Carta Favorita</titulo>");
    expect(html).toContain("<paragrafo>Este é o Myr Enforcer, minha carta favorita.</paragrafo>");
    expect(html).toContain('<imagem url="https://cards.scryfall.io/normal/front/a/b.jpg"');
  });

  it("converte lista para tags customizadas", () => {
    const html = blocksToHtml([
      createListBlock(["Primeiro item", "Segundo <em>item</em>"]),
    ]);

    expect(html).toContain("<lista>");
    expect(html).toContain("<item>Primeiro item</item>");
    expect(html).toContain("<item>Segundo <italico>item</italico></item>");
  });

  it("aceita url do scryfall em bloco de carta", () => {
    const html = blocksToHtml([
      createImageBlock("https://cards.scryfall.io/normal/front/a/b.jpg", "Myr Enforcer", true),
    ]);

    expect(html).toContain("https://cards.scryfall.io/normal/front/a/b.jpg");
    expect(html).toContain('carta="true"');
  });

  it("continua lendo html legado antigo", () => {
    const legacy = '<p>Texto antigo</p><p><img src="https://cdn.example.com/foto.jpg" alt="Carta" class="blog-card-image" /></p>';
    const blocks = htmlToBlocks(legacy);

    expect(blocks).toHaveLength(2);
    expect(blocks[0].type).toBe("paragraph");
    expect(blocks[1].type).toBe("image");
  });
});
