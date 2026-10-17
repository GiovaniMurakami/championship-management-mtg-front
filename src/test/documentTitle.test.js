import { beforeEach, describe, expect, it } from "vitest";
import { applyDocumentTitle } from "../utils/documentTitle";
import { SITE_DESCRIPTION, defaultOgImageUrl } from "../constants/seo";

describe("applyDocumentTitle", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
    document.title = "";
  });

  it("atualiza title sem metas quando seo=false", () => {
    applyDocumentTitle("Parceiros");
    expect(document.title).toBe("Parceiros | Tiago Fuguete");
    expect(document.querySelector('meta[property="og:title"]')).toBeNull();
  });

  it("preenche description, canonical, og e twitter", () => {
    applyDocumentTitle("Sobre mim", {
      seo: true,
      description: "Bio do Fuguete",
      path: "/sobre-mim",
      image: "https://tiagofuguete.com.br/images/seo/og-default.jpg",
    });

    expect(document.title).toBe("Sobre mim | Tiago Fuguete");
    expect(document.querySelector('meta[name="description"]')?.getAttribute("content")).toBe("Bio do Fuguete");
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(
      "https://tiagofuguete.com.br/sobre-mim",
    );
    expect(document.querySelector('meta[property="og:image"]')?.getAttribute("content")).toBe(
      "https://tiagofuguete.com.br/images/seo/og-default.jpg",
    );
    expect(document.querySelector('meta[name="twitter:card"]')?.getAttribute("content")).toBe(
      "summary_large_image",
    );
  });

  it("usa imagem e description padrão da landing", () => {
    applyDocumentTitle("Tiago Fuguete", { seo: true, path: "/" });
    expect(document.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(SITE_DESCRIPTION);
    expect(document.querySelector('meta[property="og:image"]')?.getAttribute("content")).toBe(defaultOgImageUrl());
  });
});
