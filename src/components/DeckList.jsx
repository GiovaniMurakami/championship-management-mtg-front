export function DeckList({ cards, onCardRemove, onCardQuantityChange, onCardMouseEnter, onCardMouseLeave, readOnly = false }) {
  return (
    <ul className="deck-list">
      {cards.map((card) => (
        <li
          key={card.nome}
          onMouseEnter={() => onCardMouseEnter(card)}
          onMouseLeave={onCardMouseLeave}
        >
          <span>{card.nome}</span>
          <input
            type="number"
            min="1"
            value={card.quantidade}
            onChange={(event) => onCardQuantityChange(card.nome, event.target.value)}
            disabled={readOnly}
          />
          {!readOnly && (
            <button type="button" onClick={() => onCardRemove(card.nome)}>
              Remover
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
