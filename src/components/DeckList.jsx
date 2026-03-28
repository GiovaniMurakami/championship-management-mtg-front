const COLOR_MAP = {
  W: "#f0c040",
  U: "#2563eb",
  B: "#7c3aed",
  R: "#dc2626",
  G: "#16a34a",
};

export function DeckList({
  cards,
  onCardRemove,
  onCardQuantityChange,
  onCardMouseEnter,
  onCardMouseLeave,
  readOnly = false,
}) {
  return (
    <ul className="deck-list">
      {cards.map((card) => (
        <li
          key={card.nome}
          onMouseEnter={() => onCardMouseEnter(card)}
          onMouseLeave={onCardMouseLeave}
        >
          <div className="dl-info">
            {card.colors?.length > 0 && (
              <div className="dl-colors">
                {card.colors.slice(0, 4).map((c) => (
                  <span
                    key={c}
                    className="dl-pip"
                    style={{ background: COLOR_MAP[c] ?? "#64748b" }}
                  />
                ))}
              </div>
            )}
            <span className="dl-name">{card.nome}</span>
          </div>

          <div className="dl-stepper">
            {!readOnly && (
              <button
                type="button"
                className="dl-step-btn"
                onClick={() =>
                  onCardQuantityChange(
                    card.nome,
                    String(Math.max(1, card.quantidade - 1))
                  )
                }
                aria-label="Diminuir quantidade"
              >
                −
              </button>
            )}
            <span className="dl-qty">{card.quantidade}</span>
            {!readOnly && (
              <button
                type="button"
                className="dl-step-btn"
                onClick={() =>
                  onCardQuantityChange(card.nome, String(card.quantidade + 1))
                }
                aria-label="Aumentar quantidade"
              >
                +
              </button>
            )}
          </div>

          {!readOnly && (
            <button
              type="button"
              className="dl-remove-btn"
              onClick={() => onCardRemove(card.nome)}
              aria-label="Remover carta"
            >
              ×
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
