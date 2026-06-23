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

function toCardEntry(entry, card) {
  return {
    nome: card?.nome || entry.nome,
    quantidade: entry.quantidade,
    imagem: card?.imagem || "",
    isBasicLand: card?.isBasicLand || false,
    legalities: card?.legalities || {},
    colors: card?.colors || card?.colorIdentity || [],
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

  const [resolvedMainCards, resolvedSideCards, resolvedCommanderCards] = await Promise.all([
    buscarCartasPorNome(mainEntries.map((entry) => entry.nome)),
    buscarCartasPorNome(sideEntries.map((entry) => entry.nome)),
    buscarCartasPorNome(commanderEntries.map((entry) => entry.nome)),
  ]);

  if (isCancelled?.()) return false;

  setMainDeck(resolvedMainCards.map((card, index) => toCardEntry(mainEntries[index], card)));
  setSideboard(resolvedSideCards.map((card, index) => toCardEntry(sideEntries[index], card)));
  setCommander(resolvedCommanderCards.map((card, index) => toCardEntry(commanderEntries[index], card)));
  return true;
}
