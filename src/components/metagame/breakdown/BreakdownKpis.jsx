export function BreakdownKpis({ kpis }) {
  const cards = [
    { label: "Decks", value: kpis.totalDecks },
    { label: "Arquétipos", value: kpis.totalArquetipos },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 mb-6 sm:max-w-md">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-line bg-surface-soft px-4 py-3"
        >
          <p className="m-0 text-[0.72rem] uppercase tracking-[0.08em] text-text-muted font-semibold">
            {card.label}
          </p>
          <p className="m-0 mt-1 text-2xl font-bold text-text-main tabular-nums">
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
