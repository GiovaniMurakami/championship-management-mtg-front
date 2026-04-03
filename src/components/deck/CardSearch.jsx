import { useEffect } from "react";

export function CardSearch({
  searchValue,
  onSearchChange,
  suggestions,
  onCardAdd,
  onCardMouseEnter,
  onCardMouseLeave,
  onPreviewDismiss,
  title,
  readOnly = false,
}) {
  // Fecha a preview quando a lista some do DOM (mouseleave não dispara nesse caso)
  useEffect(() => {
    if (suggestions.length === 0) {
      onPreviewDismiss?.();
    }
  }, [suggestions, onPreviewDismiss]);

  const handleCardAdd = (card) => {
    onCardAdd(card);
    onPreviewDismiss?.();
    onSearchChange("");
  };

  return (
    <div className="relative w-full">
      <h4>{title}</h4>
      {/* cs-input-wrapper */}
      <div className="relative flex items-center">
        {/* cs-input */}
        <input
          className="w-full py-[0.6rem] pl-[0.75rem] pr-[2.35rem] border border-[rgba(217,180,255,0.2)] rounded-[0.65rem] bg-white/[0.04] text-[#f5edff] text-[0.9rem] focus:outline-none focus:border-[rgba(199,149,255,0.7)] focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(167,79,255,0.18)]"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar carta..."
          disabled={readOnly}
        />
        {/* cs-search-icon */}
        <svg
          className="absolute right-3 z-10 text-[rgba(217,180,255,0.5)] pointer-events-none"
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
      </div>
      {suggestions.length > 0 ? (
        <ul className="absolute top-[calc(100%+0.35rem)] left-0 right-0 z-30 border border-[rgba(199,149,255,0.3)] rounded-[0.7rem] bg-[rgba(14,9,28,0.97)] backdrop-blur-[12px] max-h-[280px] overflow-y-auto shadow-[0_12px_30px_rgba(0,0,0,0.5)] m-0 p-0 list-none">
          {suggestions.map((card) => (
            <li
              key={card.id}
              className="border-b border-[rgba(217,180,255,0.08)] last:border-b-0"
            >
              <button
                type="button"
                className="flex items-center gap-[0.6rem] w-full px-[0.75rem] py-[0.55rem] cursor-pointer text-[0.87rem] text-[#beafd7] hover:bg-[rgba(167,79,255,0.12)] hover:text-[#f5edff] transition-colors duration-100 bg-transparent border-none text-left"
                onClick={() => handleCardAdd(card)}
                onMouseEnter={() => onCardMouseEnter(card)}
                onMouseLeave={onCardMouseLeave}
              >
                {card.imagem ? (
                  <img
                    src={card.imagem}
                    alt={card.nome}
                    className="w-9 h-12 object-cover rounded flex-shrink-0"
                  />
                ) : null}
                <span className="flex flex-col min-w-0">
                  <strong className="truncate">{card.nome}</strong>
                  <small className="text-[rgba(217,180,255,0.6)] truncate">{card.set}</small>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
