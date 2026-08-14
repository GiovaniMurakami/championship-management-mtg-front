import { getCardTypeGroup } from "./cardTypeGroup";

export const DECK_TYPE_ORDER = [
  "Creature",
  "Planeswalker",
  "Battle",
  "Instant",
  "Sorcery",
  "Enchantment",
  "Artifact",
  "Land",
  "Other",
];

export const DECK_TYPE_LABELS = {
  Creature: "Criaturas",
  Planeswalker: "Planeswalkers",
  Battle: "Batalhas",
  Instant: "Mágicas Inst.",
  Sorcery: "Feitiços",
  Enchantment: "Encantamentos",
  Artifact: "Artefatos",
  Land: "Terrenos",
  Other: "Outros",
};

export const MANA_COLOR_MAP = { W: "#f0c040", U: "#2563eb", B: "#7c3aed", R: "#dc2626", G: "#16a34a" };
export const MANA_COLOR_LABELS = { W: "Branco", U: "Azul", B: "Preto", R: "Vermelho", G: "Verde" };

export function chaveNomeCarta(nome) {
  return String(nome || "")
    .trim()
    .replace(/\s*\/\/\s*/g, " // ")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function groupCardsByType(cards) {
  const groups = Object.fromEntries(DECK_TYPE_ORDER.map((type) => [type, []]));
  for (const card of cards || []) {
    groups[getCardTypeGroup(card.typeLine)].push(card);
  }
  return DECK_TYPE_ORDER.filter((type) => groups[type].length > 0).map((type) => ({
    type,
    cards: groups[type],
    total: groups[type].reduce((sum, card) => sum + (card.quantidade || 1), 0),
  }));
}

export function enrichCardsByName(entries, porNome) {
  return (entries || []).map((entry) => {
    const carta = porNome.get(chaveNomeCarta(entry.nome));
    return {
      nome: carta?.nome || entry.nome,
      quantidade: entry.quantidade || 1,
      typeLine: carta?.typeLine || entry.typeLine || "",
      colors: carta?.colors || entry.colors || [],
      imagem: carta?.imagem || entry.imagem || "",
      cmc: Number.isFinite(carta?.cmc) ? carta.cmc : Number(carta?.cmc) || 0,
      manaCost: carta?.manaCost || "",
      isBasicLand: Boolean(carta?.isBasicLand),
    };
  });
}

export function coresDasCartas(cards) {
  const set = new Set();
  for (const card of cards || []) {
    for (const cor of card.colors || []) set.add(cor);
  }
  return ["W", "U", "B", "R", "G"].filter((cor) => set.has(cor));
}

export function nomesDasListas(listas) {
  const nomes = [];
  for (const lista of listas || []) {
    for (const campo of ["maindeck", "sideboard", "commander"]) {
      for (const carta of lista[campo] || []) {
        if (carta?.nome) nomes.push(carta.nome);
      }
    }
  }
  return [...new Set(nomes)];
}
