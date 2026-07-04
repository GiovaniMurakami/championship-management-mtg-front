import { describe, expect, it } from "vitest";
import {
  blocksToHtml,
  createHeadingBlock,
  createImageBlock,
  createParagraphBlock,
  insertBlockAfter,
  updateBlock,
} from "../utils/blogBlocks";

describe("blogBlocks save flow", () => {
  it("mantem titulo paragrafo e imagem apos varias atualizacoes", () => {
    let blocks = [createParagraphBlock("")];

    blocks = updateBlock(blocks, blocks[0].id, { html: "Testandoteste testes testet" });
    blocks = [createHeadingBlock("<strong>Título</strong>"), ...blocks];
    blocks = [...blocks, createImageBlock("https://cards.scryfall.io/x.jpg", "Myr Enforcer", true)];

    const markup = blocksToHtml(blocks);

    expect(markup).toContain("<titulo><negrito>Título</negrito></titulo>");
    expect(markup).toContain("<paragrafo>Testandoteste testes testet</paragrafo>");
    expect(markup).toContain('<imagem url="https://cards.scryfall.io/x.jpg"');
    expect(markup).toContain('carta="true"');
  });

  it("insere imagem no final mesmo quando foco muda", () => {
    let blocks = [
      createHeadingBlock("Título"),
      createParagraphBlock("Texto"),
    ];

    const imageBlock = createImageBlock("https://cdn.example.com/carta.jpg", "Carta", true);
    blocks = [...blocks, imageBlock];

    const markup = blocksToHtml(blocks);
    expect(markup.indexOf("<titulo>")).toBeLessThan(markup.indexOf("<paragrafo>"));
    expect(markup.indexOf("<paragrafo>")).toBeLessThan(markup.indexOf("<imagem"));
  });

  it("insere bloco apos bloco focado", () => {
    const paragraph = createParagraphBlock("Um");
    const heading = createHeadingBlock("Dois");
    const blocks = insertBlockAfter([paragraph], paragraph.id, heading);

    expect(blocks).toHaveLength(2);
    expect(blocks[1].type).toBe("heading");
  });
});
