import { describe, expect, it } from "vitest";
import {
  buildBlogCardImageHtml,
  decodeBlogHtmlForDisplay,
  getEditorEmptyHtml,
  insertBlogHtmlIntoEditor,
  isBlogContentEmpty,
  normalizeBlogHtml,
  prepareBlogHtmlForSave,
} from "../utils/blogEditor";

describe("blogEditor utils", () => {
  it("getEditorEmptyHtml retorna parágrafo vazio editável", () => {
    expect(getEditorEmptyHtml()).toBe("<p><br></p>");
  });

  it("detecta conteudo vazio", () => {
    expect(isBlogContentEmpty("")).toBe(true);
    expect(isBlogContentEmpty("<p><br></p>")).toBe(true);
    expect(isBlogContentEmpty("<p> </p>")).toBe(true);
  });

  it("aceita texto ou imagem como conteudo valido", () => {
    expect(isBlogContentEmpty("<paragrafo>Texto do artigo</paragrafo>")).toBe(false);
    expect(isBlogContentEmpty('<imagem url="https://example.com/a.png" alt="" />')).toBe(false);
    expect(isBlogContentEmpty("<p>Texto do artigo</p>")).toBe(false);
    expect(isBlogContentEmpty('<p><img src="https://example.com/a.png" alt="" /></p>')).toBe(false);
  });

  it("normaliza html removendo espacos extras", () => {
    expect(normalizeBlogHtml("  <p>Olá</p>  ")).toBe("<p>Olá</p>");
  });

  it("decodifica html escapado para exibicao", () => {
    expect(decodeBlogHtmlForDisplay("&lt;p&gt;&lt;strong&gt;Olá&lt;/strong&gt;&lt;/p&gt;")).toBe(
      "<p><strong>Olá</strong></p>",
    );
  });

  it("prepareBlogHtmlForSave mantem html valido", () => {
    expect(prepareBlogHtmlForSave("<p><strong>Teste</strong></p>")).toBe("<p><strong>Teste</strong></p>");
  });

  it("insertBlogHtmlIntoEditor adiciona imagem no editor", () => {
    const editor = document.createElement("div");
    editor.innerHTML = "<p>Texto</p>";

    const html = insertBlogHtmlIntoEditor(
      editor,
      '<p><img src="https://example.com/foto.jpg" alt="Foto" /></p>',
    );

    expect(html).toContain('<img src="https://example.com/foto.jpg"');
    expect(editor.querySelector("img")).not.toBeNull();
  });

  it("monta html de imagem de carta com alt escapado", () => {
    expect(
      buildBlogCardImageHtml("https://cards.scryfall.io/normal/front/a/b.jpg", "Lightning Bolt"),
    ).toContain('alt="Lightning Bolt"');
    expect(
      buildBlogCardImageHtml("https://example.com/x.jpg", 'Snapcaster "Mage"'),
    ).toContain('alt="Snapcaster &quot;Mage&quot;"');
  });
});
