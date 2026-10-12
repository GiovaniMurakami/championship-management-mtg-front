import { describe, expect, it } from "vitest";
import {
  calcularKpisBreakdown,
  dadosShareChart,
  dadosWinrateChart,
  dadosCoresChart,
  dadosMatchupHeat,
} from "../utils/metagameBreakdown";

const arquetipos = [
  {
    nome: "Terror",
    slug: "terror",
    copias: 10,
    metaPct: 40,
    vitorias: 20,
    derrotas: 10,
    empates: 0,
    winrate: 66.7,
    cores: ["U", "B"],
    matchups: [{ slug: "bogles", nome: "Bogles", winrate: 60, partidas: 5 }],
  },
  {
    nome: "Bogles",
    slug: "bogles",
    copias: 8,
    metaPct: 32,
    vitorias: 12,
    derrotas: 12,
    empates: 0,
    winrate: 50,
    cores: ["G", "W"],
    matchups: [{ slug: "terror", nome: "Terror", winrate: 40, partidas: 5 }],
  },
  {
    nome: "Affinity",
    slug: "affinity",
    copias: 7,
    metaPct: 28,
    vitorias: 8,
    derrotas: 14,
    empates: 0,
    winrate: 36.4,
    cores: [],
    matchups: [],
  },
];

describe("metagameBreakdown utils", () => {
  it("calcula KPIs", () => {
    const kpis = calcularKpisBreakdown(arquetipos, 25);
    expect(kpis.totalDecks).toBe(25);
    expect(kpis.totalArquetipos).toBe(3);
  });

  it("monta share e ordena partidas por volume jogado", () => {
    expect(dadosShareChart(arquetipos)[0].nome).toBe("Terror");
    const porPartidas = dadosWinrateChart(arquetipos);
    expect(porPartidas[0].nome).toBe("Terror");
    expect(porPartidas[0].partidas).toBe(30);
    expect(porPartidas[0].vitorias).toBe(20);
    expect(porPartidas.map((a) => a.partidas)).toEqual([30, 24, 22]);
  });

  it("agrega cores e heat", () => {
    const cores = dadosCoresChart(arquetipos);
    expect(cores.some((c) => c.nome === "U")).toBe(true);
    expect(cores.some((c) => c.nome === "C")).toBe(true);
    const heat = dadosMatchupHeat(arquetipos, 3);
    expect(heat.labels).toHaveLength(3);
    expect(heat.cells.length).toBe(9);
    expect(heat.filtroSlug).toBeNull();
  });

  it("filtra heat por arquétipo selecionado", () => {
    const heat = dadosMatchupHeat(arquetipos, 3, "terror");
    expect(heat.filtroSlug).toBe("terror");
    expect(heat.filtroNome).toBe("Terror");
    expect(heat.labels[0].slug).toBe("terror");
    expect(heat.labels.some((l) => l.slug === "bogles")).toBe(true);
  });
});
