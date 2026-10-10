import { formatCardName } from "../../../utils/cardName";
import { formatPctConversao } from "../../../utils/metagameBreakdown";

export function BreakdownDay2Cards({ cartas = [], totalDecks = 0 }) {
  if (!cartas.length) return null;

  return (
    <ul className="m-0 p-0 list-none divide-y divide-line/60">
      {cartas.map((carta, index) => (
        <li
          key={carta.nome}
          className="-mx-1.5 flex flex-col gap-0.5 rounded-md px-1.5 py-2.5 text-sm transition-colors hover:bg-[rgba(167,79,255,0.08)] sm:flex-row sm:items-baseline sm:justify-between sm:gap-3"
        >
          <span className="min-w-0 font-medium text-text-main">
            <span className="mr-2 tabular-nums text-text-muted">{index + 1}.</span>
            {formatCardName(carta.nome)}
          </span>
          <span className="pl-6 text-xs tabular-nums text-text-soft sm:pl-0 sm:shrink-0 sm:text-sm">
            {carta.decks}/{totalDecks || carta.decks}
            {" · "}
            {formatPctConversao(carta.pct)}
            <span className="text-text-muted"> · {carta.copias} cóp.</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
