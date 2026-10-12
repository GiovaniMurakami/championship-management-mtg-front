import { describe, expect, it } from "vitest";
import { parseArtigoMarkup, extrairNomesCartas } from "../utils/artigoMarkup";
import { extrairVideoYoutube } from "../utils/youtube";

describe("artigoMarkup", () => {
  it("parseia tokens do template Cards Realm", () => {
    const tokens = parseArtigoMarkup(
      "Olá [[Tolarian Terror]]\n[h1]{Mono Blue}\n[cardinfo]{Mental Note}\n[cardside](1 Bolt || 2 Counterspell)\n[deck](abc-123)"
    );
    expect(tokens.map((t) => t.type)).toEqual([
      "text", "card", "text", "h1", "text", "cardinfo", "text", "cardside", "text", "deck",
    ]);
    expect(tokens.find((t) => t.type === "deck")).toMatchObject({ value: "abc-123", formato: "lista" });
    expect(extrairNomesCartas(tokens)).toEqual(
      expect.arrayContaining(["Tolarian Terror", "Mental Note", "Bolt", "Counterspell"])
    );
  });

  it("aceita h1, h2 e h3 com alinhamento e cor da badge", () => {
    const tokens = parseArtigoMarkup(
      "[h1 center #a855f7]{Mono Blue}\n[h2 center dourado]{Aggro}\n[h3]{Detalhe}"
    );
    expect(tokens.filter((t) => t.type !== "text")).toEqual([
      { type: "h1", value: "Mono Blue", align: "center", cor: "#a855f7" },
      { type: "h2", value: "Aggro", align: "center", cor: "#fcd34d" },
      { type: "h3", value: "Detalhe", align: "left", cor: null },
    ]);
  });

  it("aceita link http no meio do texto", () => {
    const tokens = parseArtigoMarkup("Leia [o guia](https://exemplo.com/guia) agora.");
    const link = tokens.find((t) => t.type === "link");
    expect(link).toEqual({ type: "link", label: "o guia", url: "https://exemplo.com/guia" });
  });

  it("aceita vídeo do YouTube com título", () => {
    const tokens = parseArtigoMarkup(
      "[youtube](https://www.youtube.com/watch?v=dQw4w9WgXcQ){Gameplay}"
    );
    expect(tokens.find((t) => t.type === "youtube")).toMatchObject({
      videoId: "dQw4w9WgXcQ",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      title: "Gameplay",
    });
  });

  it("escolhe o formato visual do deck", () => {
    const lista = parseArtigoMarkup("[deck](abc-123){lista}");
    const vertical = parseArtigoMarkup("[deck](abc-123){9:16}");
    const horizontal = parseArtigoMarkup("[deck 16:9](abc-123)");
    expect(lista.find((t) => t.type === "deck").formato).toBe("lista");
    expect(vertical.find((t) => t.type === "deck").formato).toBe("9x16");
    expect(horizontal.find((t) => t.type === "deck").formato).toBe("16x9");
  });
});

describe("extrairVideoYoutube", () => {
  it("lê watch, youtu.be, shorts e id solto", () => {
    expect(extrairVideoYoutube("https://youtu.be/abcdefghijk")?.id).toBe("abcdefghijk");
    expect(extrairVideoYoutube("https://www.youtube.com/shorts/abcdefghijk")?.id).toBe("abcdefghijk");
    expect(extrairVideoYoutube("abcdefghijk")?.url).toBe("https://www.youtube.com/watch?v=abcdefghijk");
    expect(extrairVideoYoutube("https://exemplo.com/video")).toBeNull();
  });
});
