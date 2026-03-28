export function CardSearch({
  searchValue,
  onSearchChange,
  suggestions,
  onCardAdd,
  onCardMouseEnter,
  onCardMouseLeave,
  title,
  readOnly = false,
}) {
  return (
    <div className="card-search">
      <h4>{title}</h4>
      <div className="cs-input-wrapper">
        <svg
          className="cs-search-icon"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          className="cs-input"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar carta..."
          disabled={readOnly}
        />
      </div>
      {suggestions.length > 0 ? (
        <ul className="suggestions">
          {suggestions.map((card) => (
            <li key={card.id}>
              <button
                type="button"
                onClick={() => onCardAdd(card)}
                onMouseEnter={() => onCardMouseEnter(card)}
                onMouseLeave={onCardMouseLeave}
              >
                {card.imagem ? (
                  <img src={card.imagem} alt={card.nome} />
                ) : null}
                <span>
                  <strong>{card.nome}</strong>
                  <small>{card.set}</small>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
