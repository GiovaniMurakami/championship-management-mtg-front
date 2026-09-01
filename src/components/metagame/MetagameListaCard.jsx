import { Link } from "react-router-dom";
import { DeckGroupedList, DeckTypeBadges } from "../deck/DeckGroupedList";
import { UsuarioNomeExibicao } from "../ui/UsuarioExcluidoTag";
import { MetagameNomeConsolidadoEditor } from "./MetagameNomeConsolidadoEditor";
import { deckPath } from "../../utils/deckUrl";
import {
  MANA_COLOR_LABELS,
  MANA_COLOR_MAP,
  coresDasCartas,
  groupCardsByType,
} from "../../utils/deckTypeGroups";

export function MetagameListaCard({
  lista,
  expandida = true,
  onToggle,
  onCardMouseEnter,
  onCardMouseLeave,
  isAdmin = false,
  salvando = false,
  onSalvarNome,
}) {
  const maindeck = lista?.maindeck || [];
  const sideboard = lista?.sideboard || [];
  const commander = lista?.commander || [];
  const grouped = groupCardsByType(maindeck);
  const cores = coresDasCartas(maindeck.length ? maindeck : commander);

  return (
    <article className="rounded-xl border border-line-soft bg-white/[0.02] overflow-hidden">
      <header className="flex items-start gap-3 px-4 pt-4 pb-3 border-b border-line-soft">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 min-w-0">
            <span className="inline-flex max-w-full items-center rounded-full border border-[rgba(199,149,255,0.35)] bg-[rgba(167,79,255,0.18)] px-2.5 py-0.5 text-[0.78rem] font-semibold text-text-main truncate">
              <UsuarioNomeExibicao
                nome={lista?.usuario?.nome}
                usuarioId={lista?.usuario?.id}
                excluido={lista?.usuario}
                nameClassName="truncate"
              />
            </span>
          </div>
          <p className="m-0 text-[1.05rem] font-bold text-text-main leading-snug truncate">
            {lista?.nome || "Deck"}
          </p>
          <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-2">
            {lista?.torneioId && (
              <Link
                className="text-[0.72rem] text-[#bfdbfe] underline hover:text-white"
                to={`/torneios/${lista.torneioId}`}
              >
                {lista.torneioNome}
              </Link>
            )}
            {cores.map((c) => (
              <span key={c} className="inline-flex items-center gap-1 text-[0.68rem] text-text-soft">
                <span
                  className="inline-block w-3 h-3 rounded-full border border-black/30 shadow-sm flex-shrink-0"
                  style={{ background: MANA_COLOR_MAP[c] ?? "#64748b" }}
                />
                {MANA_COLOR_LABELS[c] || c}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {onToggle ? (
            <button
              type="button"
              aria-expanded={expandida}
              onClick={onToggle}
              className="inline-flex items-center gap-1 border-none bg-transparent p-0 text-[0.75rem] text-[#d9b4ff] hover:text-white cursor-pointer"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden="true"
                className={`transition-transform duration-200 ${expandida ? "rotate-180" : ""}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
              {expandida ? "Ocultar lista" : "Mostrar lista"}
            </button>
          ) : null}
          {lista?.deckId ? (
            <Link
              className="text-[0.75rem] text-[#d9b4ff] hover:text-white"
              to={deckPath({ id: lista.deckId, nome: lista.nome }, { view: true })}
            >
              Ver lista
            </Link>
          ) : null}
        </div>
      </header>

      {expandida ? (
        <div className="px-4 py-4 flex flex-col gap-4">
          <DeckTypeBadges grouped={grouped} />
          <DeckGroupedList
            maindeck={maindeck}
            sideboard={sideboard}
            commander={commander}
            onCardMouseEnter={onCardMouseEnter}
            onCardMouseLeave={onCardMouseLeave}
          />
          {isAdmin && onSalvarNome && (
            <MetagameNomeConsolidadoEditor
              key={`${lista.deckId}-${lista.nomeConsolidado || ""}`}
              valorInicial={lista.nomeConsolidado || ""}
              salvando={salvando}
              onSalvar={onSalvarNome}
            />
          )}
        </div>
      ) : null}
    </article>
  );
}
