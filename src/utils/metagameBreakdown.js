const CHART_COLORS = [
  "#a78bfa",
  "#34d399",
  "#fbbf24",
  "#f87171",
  "#60a5fa",
  "#fb923c",
  "#e879f9",
  "#38bdf8",
  "#c084fc",
  "#4ade80",
  "#f472b6",
  "#22d3ee",
];

export function corArquetipo(index) {
  return CHART_COLORS[index % CHART_COLORS.length];
}

export function calcularKpisBreakdown(arquetipos = [], totalDecks = 0) {
  const lista = Array.isArray(arquetipos) ? arquetipos : [];
  const decks = Number(totalDecks) || lista.reduce((acc, a) => acc + (a.copias || 0), 0);

  return {
    totalDecks: decks,
    totalArquetipos: lista.length,
  };
}

export function dadosShareChart(arquetipos = [], limite = 8) {
  const lista = [...(arquetipos || [])].sort((a, b) => (b.metaPct || 0) - (a.metaPct || 0));
  const top = lista.slice(0, limite);
  const resto = lista.slice(limite);
  const outrosPct = resto.reduce((acc, a) => acc + (Number(a.metaPct) || 0), 0);
  const outrosCopias = resto.reduce((acc, a) => acc + (a.copias || 0), 0);
  const dados = top.map((a, i) => ({
    nome: a.nome,
    slug: a.slug,
    value: Number(a.metaPct) || 0,
    copias: a.copias || 0,
    fill: corArquetipo(i),
  }));
  if (outrosPct > 0) {
    dados.push({
      nome: "Outros",
      slug: "outros-agregado",
      value: Math.round(outrosPct * 10) / 10,
      copias: outrosCopias,
      fill: "#6b7280",
    });
  }
  return dados;
}

export function dadosWinrateChart(arquetipos = [], minimoPartidas = 1) {
  return [...(arquetipos || [])]
    .map((a) => {
      const vitorias = a.vitorias || 0;
      const derrotas = a.derrotas || 0;
      const empates = a.empates || 0;
      const partidas = vitorias + derrotas + empates;
      return {
        nome: a.nome,
        slug: a.slug,
        winrate: Number(a.winrate) || 0,
        vitorias,
        derrotas,
        empates,
        partidas,
      };
    })
    .filter((a) => a.partidas >= minimoPartidas)
    .sort((a, b) => b.partidas - a.partidas || b.winrate - a.winrate || a.nome.localeCompare(b.nome, "pt-BR"))
    .slice(0, 12);
}

export function dadosCoresChart(arquetipos = []) {
  const contagem = new Map();
  for (const a of arquetipos || []) {
    const cores = Array.isArray(a.cores) && a.cores.length ? a.cores : ["C"];
    const peso = a.copias || 1;
    for (const cor of cores) {
      const chave = String(cor || "C").toUpperCase();
      contagem.set(chave, (contagem.get(chave) || 0) + peso);
    }
  }
  const corHex = {
    W: "#f5f0e1",
    U: "#5dade2",
    B: "#7d6b8a",
    R: "#e74c3c",
    G: "#27ae60",
    C: "#95a5a6",
  };
  return [...contagem.entries()]
    .map(([nome, value]) => ({ nome, value, fill: corHex[nome] || "#a78bfa" }))
    .sort((a, b) => b.value - a.value);
}

const SLUG_OUTROS = "outros-agregado";

export function isSlugArquetipoClicavel(slug) {
  return Boolean(slug) && slug !== SLUG_OUTROS;
}

export function dadosMatchupHeat(arquetipos = [], limite = 8, filtroSlug = null) {
  const lista = Array.isArray(arquetipos) ? arquetipos : [];
  const slugValido = isSlugArquetipoClicavel(filtroSlug) ? filtroSlug : null;
  const selecionado = slugValido
    ? lista.find((a) => a.slug === slugValido) || null
    : null;

  let top;
  if (selecionado) {
    const matchupMap = new Map((selecionado.matchups || []).map((m) => [m.slug, m]));
    const oponentes = lista
      .filter((a) => a.slug !== selecionado.slug)
      .map((a) => ({
        ...a,
        _partidasVs: matchupMap.get(a.slug)?.partidas || 0,
      }))
      .sort(
        (a, b) =>
          b._partidasVs - a._partidasVs
          || (b.copias || 0) - (a.copias || 0)
          || a.nome.localeCompare(b.nome, "pt-BR")
      )
      .slice(0, limite);
    top = [selecionado, ...oponentes];
  } else {
    top = [...lista]
      .sort((a, b) => (b.copias || 0) - (a.copias || 0))
      .slice(0, limite);
  }

  const cells = [];
  for (const row of top) {
    const matchups = new Map((row.matchups || []).map((m) => [m.slug, m]));
    for (const col of top) {
      if (row.slug === col.slug) {
        cells.push({ row: row.slug, col: col.slug, winrate: null, partidas: 0 });
        continue;
      }
      const m = matchups.get(col.slug);
      cells.push({
        row: row.slug,
        col: col.slug,
        winrate: m != null ? Number(m.winrate) : null,
        partidas: m?.partidas || 0,
        nomeRow: row.nome,
        nomeCol: col.nome,
      });
    }
  }

  return {
    labels: top.map((a) => ({ slug: a.slug, nome: a.nome })),
    cells,
    filtroSlug: selecionado?.slug || null,
    filtroNome: selecionado?.nome || null,
  };
}
