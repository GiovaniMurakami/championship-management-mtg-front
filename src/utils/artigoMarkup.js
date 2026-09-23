/**
 * Parser do markup de artigo (template Cards Realm).
 * Tokens: texto, h1, card, cardinfo, cardside, deck
 */

export function parseArtigoMarkup(conteudo) {
  const texto = String(conteudo || "");
  const tokens = [];
  const pattern =
    /\[h1\]\{([^}]*)\}|\[cardinfo\]\{([^}]*)\}|\[cardside\]\(([^)]*)\)|\[deck\]\(([^)]*)\)|\[\[([^\]]+)\]\]/g;

  let last = 0;
  let match;
  while ((match = pattern.exec(texto)) !== null) {
    if (match.index > last) {
      tokens.push({ type: "text", value: texto.slice(last, match.index) });
    }
    if (match[1] != null) tokens.push({ type: "h1", value: match[1].trim() });
    else if (match[2] != null) tokens.push({ type: "cardinfo", value: match[2].trim() });
    else if (match[3] != null) {
      tokens.push({
        type: "cardside",
        cards: match[3]
          .split("||")
          .map((parte) => {
            const limpo = parte.trim();
            const qtd = limpo.match(/^(\d+)\s+(.+)$/);
            return qtd
              ? { quantidade: Number(qtd[1]), nome: qtd[2].trim() }
              : { quantidade: 1, nome: limpo };
          })
          .filter((c) => c.nome),
      });
    } else if (match[4] != null) tokens.push({ type: "deck", value: match[4].trim() });
    else if (match[5] != null) tokens.push({ type: "card", value: match[5].trim() });
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
