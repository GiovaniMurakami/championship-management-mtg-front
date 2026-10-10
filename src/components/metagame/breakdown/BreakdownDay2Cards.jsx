import { formatCardName } from "../../../utils/cardName";
import { formatPctConversao } from "../../../utils/metagameBreakdown";

export function BreakdownDay2Cards({ cartas = [], totalDecks = 0 }) {
  if (!cartas.length) return null;

  return (
    <ul className="m-0 p-0 list-none divide-y divide-line/60">
      {cartas.map((carta, index) => (
        <li
          key={carta.nome}
          className="flex min-w-0 flex-col gap-0.5 rounded-md px-1 py-2.5 text-sm transition-colors hover:bg-[rgba(167,79,255,0.08)] sm:flex-row sm:items-baseline sm:justify-between sm:gap-3"
        >
          <span className="min-w-0 truncate font-medium text-text-main" title={formatCardName(carta.nome)}>
            <span className="mr-2 tabular-nums text-text-muted">{index + 1}.</span>
            {formatCardName(carta.nome)}
          </span>
          <span className="shrink-0 pl-6 text-xs tabular-nums text-text-soft sm:pl-0 sm:text-sm">
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
