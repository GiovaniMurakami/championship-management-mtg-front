import { describe, expect, it } from "vitest";
import { buildCopyTournamentInitialValues } from "../pages/TournamentCreatePage";

describe("buildCopyTournamentInitialValues", () => {
  it("repassa banner, story, link, som, secreto e exibirNome separados", () => {
    const values = buildCopyTournamentInitialValues({
      nome: "FNM",
      horario: "2026-08-10T22:00:00.000Z",
      formato: "pauper",
      descricao: "Desc",
      regras: "Regras",
      maxJogadores: 32,
      maxRodadas: 5,
      corteTop: 8,
      bannerUrl: "https://bucket.s3.us-east-1.amazonaws.com/banner.jpg",
      linkBanner: "https://parceiro.example",
      somRodada: "https://cdn.example/som.mp3",
      linkLive: "https://youtube.com/watch?v=abc",
      storyFundoUrl: "https://bucket.s3.us-east-1.amazonaws.com/story.jpg",
      secreto: true,
      exibirNomeJogador: "nickMOL",
    });

    expect(values.bannerUrl).toBe("https://bucket.s3.us-east-1.amazonaws.com/banner.jpg");
    expect(values.linkBanner).toBe("https://parceiro.example");
    expect(values.storyFundoUrl).toBe("https://bucket.s3.us-east-1.amazonaws.com/story.jpg");
    expect(values.somRodada).toBe("https://cdn.example/som.mp3");
    expect(values.linkLive).toBe("https://youtube.com/watch?v=abc");
    expect(values.secreto).toBe(true);
    expect(values.exibirNomeJogador).toBe("nickMOL");
    expect(values.regras).toBe("Regras");
    expect(values.maxJogadores).toBe("32");
    expect(values.corteTop).toBe("8");
    expect(values.horario).toMatch(/T/);
  });

  it("nao coloca bannerUrl no campo linkBanner", () => {
    const values = buildCopyTournamentInitialValues({
      nome: "X",
      bannerUrl: "https://bucket.s3.us-east-1.amazonaws.com/banner.jpg",
    });
    expect(values.linkBanner).toBe("");
    expect(values.bannerUrl).toContain("banner.jpg");
  });
});
