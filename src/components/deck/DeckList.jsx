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
    <ul className="m-0 p-0 list-none flex flex-col gap-0">
      {cards.map((card) => (
        <li
          key={card.nome}
          className="flex items-center gap-2 px-[0.35rem] py-[0.22rem] rounded-[0.4rem] hover:bg-white/[0.04] group"
          onMouseEnter={() => onCardMouseEnter?.(card)}
          onMouseLeave={onCardMouseLeave}
        >
          {/* dl-info */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {card.colors?.length > 0 && (
              <div className="flex items-center gap-[0.2rem] shrink-0">
                {card.colors.slice(0, 4).map((c) => (
                  <span
                    key={c}
                    className="inline-block w-[10px] h-[10px] rounded-full border border-black/40"
                    style={{ background: COLOR_MAP[c] ?? "#64748b" }}
                  />
                ))}
              </div>
            )}
            <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[0.85rem] text-[#e8d5ff]">
              {card.nome}
            </span>
          </div>

          {/* dl-stepper */}
          <div className="flex items-center gap-[0.2rem] shrink-0">
            {!readOnly && (
              <button
                type="button"
                className="w-[1.4rem] h-[1.4rem] rounded-[4px] border border-[rgba(217,180,255,0.2)] bg-white/[0.04] text-[#beafd7] text-[0.9rem] leading-none cursor-pointer flex items-center justify-center hover:bg-[rgba(167,79,255,0.18)] hover:text-[#f5edff] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
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
            <span className="min-w-[1.2rem] text-center text-[0.88rem] font-bold text-[#f5edff]">
              {card.quantidade}
            </span>
            {!readOnly && (
              <button
                type="button"
                className="w-[1.4rem] h-[1.4rem] rounded-[4px] border border-[rgba(217,180,255,0.2)] bg-white/[0.04] text-[#beafd7] text-[0.9rem] leading-none cursor-pointer flex items-center justify-center hover:bg-[rgba(167,79,255,0.18)] hover:text-[#f5edff] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
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
              className="w-[1.3rem] h-[1.3rem] rounded-[3px] border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.08)] text-[#f87171] text-[0.7rem] leading-none cursor-pointer flex items-center justify-center hover:bg-[rgba(239,68,68,0.2)] hover:border-[rgba(239,68,68,0.6)] transition-all duration-150"
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
