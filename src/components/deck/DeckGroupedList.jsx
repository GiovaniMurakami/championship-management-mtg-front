import {
  DECK_TYPE_LABELS,
  MANA_COLOR_MAP,
  groupCardsByType,
} from "../../utils/deckTypeGroups";

function CardRow({ card, muted = false, onCardMouseEnter, onCardMouseLeave }) {
  return (
    <li
      className={`flex items-center gap-2 px-2 py-[0.28rem] rounded-md hover:bg-[rgba(167,79,255,0.08)] transition-colors duration-100 cursor-default group ${
        muted ? "hover:bg-[rgba(167,79,255,0.06)]" : ""
      }`}
      onMouseEnter={() => onCardMouseEnter?.(card)}
      onMouseLeave={onCardMouseLeave}
    >
      {card.colors?.length > 0 && (
        <div className="flex gap-[3px] flex-shrink-0">
          {card.colors.slice(0, 4).map((c) => (
            <span
              key={c}
              className="inline-block w-2.5 h-2.5 rounded-full border border-black/30"
              style={{ background: MANA_COLOR_MAP[c] ?? "#64748b" }}
            />
          ))}
        </div>
      )}
      <span
        className={`flex-1 text-[0.83rem] truncate group-hover:text-white transition-colors duration-100 ${
          muted ? "text-text-soft group-hover:text-[#e8d5ff]" : "text-[#e8d5ff]"
        }`}
      >
        {card.nome}
      </span>
      <span
        className={`text-[0.8rem] font-bold flex-shrink-0 tabular-nums ${
          muted ? "text-[rgba(199,149,255,0.55)]" : "text-brand"
        }`}
      >
        {card.quantidade}
      </span>
    </li>
  );
}

function TypeSection({ type, cards, total, onCardMouseEnter, onCardMouseLeave }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[0.67rem] font-bold uppercase tracking-widest text-brand">
          {DECK_TYPE_LABELS[type] || type}
        </span>
        <span className="text-[0.65rem] text-[rgba(190,175,215,0.6)]">{total}</span>
      </div>
      <ul className="m-0 p-0 list-none flex flex-col">
        {cards.map((card, index) => (
          <CardRow
            key={`${card.nome}-${index}`}
            card={card}
            onCardMouseEnter={onCardMouseEnter}
            onCardMouseLeave={onCardMouseLeave}
          />
        ))}
      </ul>
    </div>
  );
}

function ExtraSection({ titulo, cards, onCardMouseEnter, onCardMouseLeave }) {
  if (!cards?.length) return null;
  const total = cards.reduce((sum, card) => sum + (card.quantidade || 1), 0);
  return (
    <div className="pt-1">
      <div className="flex items-center justify-between mb-1.5 pt-3 border-t border-line-soft">
        <span className="text-[0.67rem] font-bold uppercase tracking-widest text-brand">{titulo}</span>
        <span className="text-[0.65rem] text-[rgba(190,175,215,0.6)]">{total}</span>
      </div>
      <ul className="m-0 p-0 list-none flex flex-col">
        {cards.map((card, index) => (
          <CardRow
            key={`${card.nome}-${index}`}
            card={card}
            muted
            onCardMouseEnter={onCardMouseEnter}
            onCardMouseLeave={onCardMouseLeave}
          />
        ))}
      </ul>
    </div>
  );
}

export function DeckTypeBadges({ grouped }) {
  if (!grouped?.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {grouped.map(({ type, cards, total }) => (
        <span
          key={type}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[rgba(167,79,255,0.1)] border border-[rgba(199,149,255,0.22)] text-[0.65rem] text-text-soft leading-none"
        >
          <span className="font-bold text-[#c4b5fd]">{total ?? cards.reduce((s, c) => s + (c.quantidade || 1), 0)}</span>
          {DECK_TYPE_LABELS[type] || type}
        </span>
      ))}
    </div>
  );
}

export function DeckGroupedList({
  maindeck = [],
  sideboard = [],
  commander = [],
  onCardMouseEnter,
  onCardMouseLeave,
}) {
  const grouped = groupCardsByType(maindeck);
  return (
    <div className="flex flex-col gap-4">
      {grouped.map((grupo) => (
        <TypeSection
          key={grupo.type}
          type={grupo.type}
          cards={grupo.cards}
          total={grupo.total}
          onCardMouseEnter={onCardMouseEnter}
          onCardMouseLeave={onCardMouseLeave}
        />
      ))}
      <ExtraSection
        titulo="Commander"
        cards={commander}
        onCardMouseEnter={onCardMouseEnter}
        onCardMouseLeave={onCardMouseLeave}
      />
      <ExtraSection
        titulo="Sideboard"
        cards={sideboard}
        onCardMouseEnter={onCardMouseEnter}
        onCardMouseLeave={onCardMouseLeave}
      />
    </div>
  );
}
