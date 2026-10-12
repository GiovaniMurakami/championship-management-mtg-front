import { formatCardName } from "../../utils/cardName";
import { DECK_TYPE_LABELS, groupCardsByType } from "../../utils/deckTypeGroups";

const COLOR_MAP = {
  W: "#f0c040",
  U: "#2563eb",
  B: "#7c3aed",
  R: "#dc2626",
  G: "#16a34a",
};

const SECTION_LABELS = {
  ...DECK_TYPE_LABELS,
  Instant: "Mágicas instantâneas",
};

function CardRow({ card, onCardRemove, onCardQuantityChange, onCardMouseEnter, onCardMouseLeave, readOnly }) {
  return (
    <li
      className="flex items-center gap-2 px-[0.35rem] py-[0.22rem] rounded-md hover:bg-white/[0.04] group"
      onMouseEnter={() => onCardMouseEnter?.(card)}
      onMouseLeave={onCardMouseLeave}
    >
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
          {formatCardName(card.nome)}
        </span>
      </div>

      <div className="flex items-center gap-[0.2rem] shrink-0">
        {!readOnly && (
          <button
            type="button"
            className="w-[1.4rem] h-[1.4rem] rounded-[4px] border border-line bg-white/[0.04] text-text-soft text-[0.9rem] leading-none cursor-pointer flex items-center justify-center hover:bg-[rgba(167,79,255,0.18)] hover:text-text-main transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={() => onCardQuantityChange(card.nome, String(Math.max(1, card.quantidade - 1)))}
            aria-label="Diminuir quantidade"
          >
            −
          </button>
        )}
        <span className="min-w-[1.2rem] text-center text-[0.88rem] font-bold text-text-main">
          {card.quantidade}
        </span>
        {!readOnly && (
          <button
            type="button"
            className="w-[1.4rem] h-[1.4rem] rounded-[4px] border border-line bg-white/[0.04] text-text-soft text-[0.9rem] leading-none cursor-pointer flex items-center justify-center hover:bg-[rgba(167,79,255,0.18)] hover:text-text-main transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={() => onCardQuantityChange(card.nome, String(card.quantidade + 1))}
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
  );
}

export function DeckList({
  cards,
  onCardRemove,
  onCardQuantityChange,
  onCardMouseEnter,
  onCardMouseLeave,
  readOnly = false,
}) {
  const agrupar = (cards || []).some((card) => card.typeLine);
  const grupos = groupCardsByType(cards).map((grupo) => ({
    ...grupo,
    cards: [...grupo.cards].sort((a, b) => String(a.nome).localeCompare(String(b.nome), "pt")),
  }));

  const linhas = (lista) => lista.map((card) => (
    <CardRow
      key={card.nome}
      card={card}
      onCardRemove={onCardRemove}
      onCardQuantityChange={onCardQuantityChange}
      onCardMouseEnter={onCardMouseEnter}
      onCardMouseLeave={onCardMouseLeave}
      readOnly={readOnly}
    />
  ));

  if (!agrupar) {
    return (
      <ul className="m-0 p-0 list-none flex flex-col gap-0 flex-1 min-h-0 overflow-y-auto">
        {linhas(cards || [])}
      </ul>
    );
  }

  return (
    <div className="flex flex-col gap-3 flex-1 min-h-0 overflow-y-auto">
      {grupos.map((grupo) => (
        <section key={grupo.type}>
          <h3 className="m-0 mb-1 flex items-baseline justify-between gap-2 px-[0.35rem] text-[0.72rem] font-bold uppercase tracking-[0.08em] text-text-muted">
            <span>{SECTION_LABELS[grupo.type] || grupo.type}</span>
            <span className="tabular-nums">{grupo.total}</span>
          </h3>
          <ul className="m-0 p-0 list-none flex flex-col gap-0">
            {linhas(grupo.cards)}
          </ul>
        </section>
      ))}
    </div>
  );
}
