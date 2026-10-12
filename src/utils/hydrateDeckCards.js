import { buscarCartasPorNome } from "../services/scryfallApi";

function groupByName(entries) {
  const map = new Map();
  for (const entry of entries) {
    const nome = entry.nome;
    if (map.has(nome)) {
      map.get(nome).quantidade += entry.quantidade || 1;
    } else {
      map.set(nome, { nome, quantidade: entry.quantidade || 1 });
    }
  }
  return Array.from(map.values());
}

function precarregarImagens(cartas) {
  const urls = new Set();
  for (const card of cartas) {
    if (card?.imagem) urls.add(card.imagem);
  }
  for (const url of urls) {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
  }
}

function toCardEntry(entry, card) {
  return {
    nome: card?.nome || entry.nome,
    quantidade: entry.quantidade,
    imagem: card?.imagem || "",
    isBasicLand: card?.isBasicLand || false,
    legalities: card?.legalities || {},
    colors: card?.colors || card?.colorIdentity || [],
    colorIdentity: card?.colorIdentity?.length ? card.colorIdentity : (card?.colors || []),
    cmc: Number.isFinite(card?.cmc) ? card.cmc : Number(card?.cmc) || 0,
    manaCost: card?.manaCost || "",
    typeLine: card?.typeLine || "",
  };
}

/** Returns true when the deck payload already includes card lists from listar. */
export function deckHasCardLists(deck, deckId) {
  return Boolean(
    deck
    && String(deck.id) === String(deckId)
    && Array.isArray(deck.maindeck),
  );
}

/**
 * Applies deck metadata and resolves Scryfall data for main/side/commander.
 * @returns {Promise<boolean>} false when cancelled before completion
 */
export async function hydrateDeckCards(deck, { setOriginalDeck, setDeckForm, setMainDeck, setSideboard, setCommander, isCancelled }) {
  if (isCancelled?.()) return false;

  setOriginalDeck(deck);
  setDeckForm({
    nome: deck.nome,
    formato: deck.formato,
    linkLigaMagic: deck.linkLigaMagic || "",
    oculto: Boolean(deck.oculto),
  });

  const mainEntries = groupByName(deck.maindeck || []);
  const sideEntries = groupByName(deck.sideboard || []);
  const commanderEntries = groupByName(
    Array.isArray(deck.commander)
      ? deck.commander
      : deck.commander
        ? [deck.commander]
        : [],
  );

  const nomes = [
    ...mainEntries.map((entry) => entry.nome),
    ...sideEntries.map((entry) => entry.nome),
    ...commanderEntries.map((entry) => entry.nome),
  ];
  const resolved = await buscarCartasPorNome(nomes);

  if (isCancelled?.()) return false;

  const resolvedMainCards = resolved.slice(0, mainEntries.length);
  const resolvedSideCards = resolved.slice(mainEntries.length, mainEntries.length + sideEntries.length);
  const resolvedCommanderCards = resolved.slice(mainEntries.length + sideEntries.length);
  const main = resolvedMainCards.map((card, index) => toCardEntry(mainEntries[index], card));
  const side = resolvedSideCards.map((card, index) => toCardEntry(sideEntries[index], card));
  const commanders = resolvedCommanderCards.map((card, index) => toCardEntry(commanderEntries[index], card));

  precarregarImagens([...main, ...side, ...commanders]);
  setMainDeck(main);
  setSideboard(side);
  setCommander(commanders);
  return true;
}
