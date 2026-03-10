export function CardSearch({
  searchValue,
  onSearchChange,
  suggestions,
  onCardAdd,
  onCardMouseEnter,
  onCardMouseLeave,
  title,
}) {
  return (
    <div className="card-search">
      <h4>{title}</h4>
      <input
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Buscar carta na Scryfall"
      />
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
                {card.imagem ? <img src={card.imagem} alt={card.nome} /> : null}
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
