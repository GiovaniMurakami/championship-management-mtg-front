export function toDeckPayload(cards) {
  return cards.map((card) => ({
    nome: card.nome,
    quantidade: Number(card.quantidade),
  }));
}
