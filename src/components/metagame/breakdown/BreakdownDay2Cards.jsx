import { formatCardName } from "../../../utils/cardName";
import { formatPctConversao } from "../../../utils/metagameBreakdown";

export function BreakdownDay2Cards({ cartas = [], totalDecks = 0 }) {
  if (!cartas.length) return null;

  return (
    <ul className="m-0 p-0 list-none divide-y divide-line/60">
      {cartas.map((carta, index) => (
        <li
          key={carta.nome}
          className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm"
        >
          <span className="min-w-0 font-medium text-text-main">
            <span className="mr-2 tabular-nums text-text-muted">{index + 1}.</span>
            {formatCardName(carta.nome)}
          </span>
          <span className="shrink-0 tabular-nums text-text-soft">
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
