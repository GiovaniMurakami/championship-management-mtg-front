import { describe, expect, it } from "vitest";
import {
  blocksToSaveMarkup,
  createHeadingBlock,
  createImageBlock,
  createParagraphBlock,
  mergeTextBlocksFromDom,
} from "../utils/blogBlocks";

describe("mergeTextBlocksFromDom", () => {
  it("preserva titulo paragrafo e imagem ao montar markup de save", () => {
    const heading = createHeadingBlock("teste");
    const paragraph = createParagraphBlock("texto do paragrafo");
    const image = createImageBlock("https://cards.scryfall.io/x.jpg", "Myr Enforcer", true);
    const blocks = [heading, paragraph, image];

    const textRefs = new Map([
      [heading.id, { current: { innerHTML: "teste" } }],
      [paragraph.id, { current: { innerHTML: "texto do paragrafo" } }],
    ]);

    const merged = mergeTextBlocksFromDom(blocks, textRefs);
    const markup = blocksToSaveMarkup(blocks, textRefs);

    expect(merged).toHaveLength(3);
    expect(merged[0].type).toBe("heading");
    expect(merged[2].type).toBe("image");
    expect(markup).toContain("<titulo>teste</titulo>");
    expect(markup).toContain("<paragrafo>texto do paragrafo</paragrafo>");
    expect(markup).toContain('<imagem url="https://cards.scryfall.io/x.jpg"');
    expect(markup).toContain('carta="true"');
  });
});
