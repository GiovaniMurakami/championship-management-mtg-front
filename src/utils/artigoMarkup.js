/**
 * Parser do markup de artigo.
 * Tokens: texto, h1, h2, h3, card, cardinfo, cardside, deck, youtube, link
 */

import { extrairVideoYoutube } from "./youtube";

const CORES_BADGE = {
  brand: "#c4b5fd",
  roxo: "#c084fc",
  violeta: "#a78bfa",
  dourado: "#fcd34d",
  amarelo: "#fde047",
  verde: "#34d399",
  vermelho: "#f87171",
  azul: "#60a5fa",
  ciano: "#22d3ee",
  branco: "#f8fafc",
  laranja: "#fb923c",
  rosa: "#f472b6",
};

const PATTERN = new RegExp(
  [
    String.raw`\[youtube\]\((?<yturl>[^)]*)\)(?:\{(?<yttitle>[^}]*)\})?`,
    String.raw`\[(?<heading>h1|h2|h3)(?<mods>(?:\s+[^\s\]]+)*)\]\{(?<htitle>[^}]*)\}`,
    String.raw`\[cardinfo\]\{(?<cardinfo>[^}]*)\}`,
    String.raw`\[cardside\]\((?<cardside>[^)]*)\)`,
    String.raw`\[deck(?:\s+(?<deckfmt>[^\]]+))?\]\((?<deckref>[^)]*)\)(?:\{(?<deckfmt2>[^}]*)\})?`,
    String.raw`\[\[(?<card>[^\]]+)\]\]`,
    String.raw`\[(?<linklabel>[^\]\n]{1,180})\]\((?<linkurl>https?:\/\/[^)\s]+)\)`,
  ].join("|"),
  "g",
);

function expandirHex(hex) {
  const h = String(hex || "").replace("#", "");
  if (!/^[0-9a-f]{3}$/i.test(h) && !/^[0-9a-f]{6}$/i.test(h)) return null;
  const cheio = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return `#${cheio.toLowerCase()}`;
}

export function resolverEstiloBadge(mods = "") {
  let align = "left";
  let cor = null;
  for (const parte of String(mods).trim().split(/\s+/).filter(Boolean)) {
    const lower = parte.toLowerCase();
    if (lower === "center" || lower === "centro" || lower === "centralizado") align = "center";
    else if (lower === "left" || lower === "esquerda" || lower === "start") align = "left";
    else {
      const hex = /^#/.test(parte) ? expandirHex(parte) : null;
      if (hex) cor = hex;
      else if (CORES_BADGE[lower]) cor = CORES_BADGE[lower];
    }
  }
  return { align, cor };
}

export function normalizarFormatoDeck(...valores) {
  for (const valor of valores) {
    const v = String(valor || "").trim().toLowerCase().replace(/\s+/g, "");
    if (!v) continue;
    if (v === "9:16" || v === "9x16" || v === "9/16" || v === "vertical") return "9x16";
    if (v === "16:9" || v === "16x9" || v === "16/9" || v === "horizontal") return "16x9";
    if (v === "lista" || v === "list" || v === "texto") return "lista";
  }
  return "lista";
}

function urlHttpSegura(valor) {
  try {
    const url = new URL(String(valor || "").trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.href;
  } catch {
    return null;
  }
}

function tokenizarMatch(groups) {
  if (groups.yturl != null) {
    const video = extrairVideoYoutube(groups.yturl);
    return {
      type: "youtube",
      value: String(groups.yturl || "").trim(),
      videoId: video?.id || "",
      url: video?.url || "",
      title: String(groups.yttitle || "").trim(),
    };
  }

  if (groups.heading) {
    const value = String(groups.htitle || "").trim();
    if (!value) return null;
    return { type: groups.heading, value, ...resolverEstiloBadge(groups.mods) };
  }

  if (groups.cardinfo != null) return { type: "cardinfo", value: groups.cardinfo.trim() };

  if (groups.cardside != null) {
    return {
      type: "cardside",
      cards: groups.cardside
        .split("||")
        .map((parte) => {
          const limpo = parte.trim();
          const qtd = limpo.match(/^(\d+)\s+(.+)$/);
          return qtd
            ? { quantidade: Number(qtd[1]), nome: qtd[2].trim() }
            : { quantidade: 1, nome: limpo };
        })
        .filter((c) => c.nome),
    };
  }

  if (groups.deckref != null) {
    return {
      type: "deck",
      value: groups.deckref.trim(),
      formato: normalizarFormatoDeck(groups.deckfmt2, groups.deckfmt),
    };
  }

  if (groups.card != null) return { type: "card", value: groups.card.trim() };

  if (groups.linklabel != null) {
    const url = urlHttpSegura(groups.linkurl);
    const label = groups.linklabel.trim();
    if (!url || !label) return null;
    return { type: "link", label, url };
  }

  return null;
}

export function parseArtigoMarkup(conteudo) {
  const texto = String(conteudo || "");
  const tokens = [];
  const pattern = new RegExp(PATTERN.source, "g");

  let last = 0;
  let match;
  while ((match = pattern.exec(texto)) !== null) {
    if (match.index > last) {
      tokens.push({ type: "text", value: texto.slice(last, match.index) });
    }
    const token = tokenizarMatch(match.groups || {});
    if (token) tokens.push(token);
    else tokens.push({ type: "text", value: match[0] });
    last = match.index + match[0].length;
  }
  if (last < texto.length) tokens.push({ type: "text", value: texto.slice(last) });
  return tokens;
}

export function extrairNomesCartas(tokens) {
  const nomes = new Set();
  for (const token of tokens) {
    if (token.type === "card" || token.type === "cardinfo") nomes.add(token.value);
    if (token.type === "cardside") token.cards.forEach((c) => nomes.add(c.nome));
  }
  return [...nomes];
}
