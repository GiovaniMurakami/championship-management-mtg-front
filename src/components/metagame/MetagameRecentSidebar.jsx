import { Link } from "react-router-dom";
import { TOURNAMENT_INPUT_CLASS } from "../../styles/uiClasses";
import { isUsuarioExcluido } from "../ui/UsuarioExcluidoTag";

export function rotuloDeckRecente(deck) {
  const nomeDeck = String(deck?.nome || "").trim();
  if (isUsuarioExcluido(deck?.usuario)) {
    return nomeDeck ? `Usuário excluído — ${nomeDeck}` : "Usuário excluído";
  }
  const nomeJogador = String(deck?.usuario?.nome || "").trim();
  if (nomeJogador && nomeDeck) return `${nomeJogador} — ${nomeDeck}`;
  return nomeJogador || nomeDeck;
}

function formatDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("pt-BR");
  } catch {
    return "";
  }
}

export function MetagameRecentSidebar({
  busca,
  onBusca,
  recentes,
  formato,
  dias,
}) {
  return (
    <aside className="flex flex-col gap-5 lg:sticky lg:top-24">
      <div>
        <label className="flex flex-col gap-1.5">
          <span className="text-[0.75rem] uppercase tracking-wide text-text-muted font-semibold">
            Buscar arquétipo
          </span>
          <input
            type="search"
            value={busca}
            onChange={(e) => onBusca(e.target.value)}
            placeholder="Nome do arquétipo"
            className={`${TOURNAMENT_INPUT_CLASS} py-2 px-3 text-[0.9rem]`}
          />
        </label>
      </div>

      <div className="rounded-xl border border-line-soft bg-white/[0.02] p-3">
        <h2 className="m-0 mb-3 text-text-main text-[1rem] font-bold">Decks recentes</h2>
        {(!recentes || recentes.length === 0) ? (
          <p className="m-0 text-[0.85rem] text-text-muted">Nenhum resultado neste período.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {recentes.map((evento) => (
              <div key={evento.torneioId}>
                <Link
                  to={`/torneios/${evento.torneioId}`}
                  className="block mb-2 text-[0.78rem] text-text-soft no-underline hover:text-[#d9b4ff]"
                >
                  {evento.torneioNome}
                  {evento.horario ? ` · ${formatDate(evento.horario)}` : ""}
                </Link>
                <div className="grid grid-cols-[2.4rem_minmax(0,1fr)] gap-x-2 gap-y-1.5 text-[0.82rem]">
                  <span className="text-[0.65rem] uppercase tracking-wide text-text-muted">Rec</span>
                  <span className="text-[0.65rem] uppercase tracking-wide text-text-muted">Deck</span>
                  {evento.decks.map((deck, idx) => (
                    <div key={`${evento.torneioId}-${deck.slug}-${idx}`} className="contents">
                      <span className="text-text-soft tabular-nums">
                        {deck.vitorias}-{deck.derrotas}
                      </span>
                      <Link
                        className="text-[#d9b4ff] font-semibold no-underline truncate hover:underline"
                        to={`/metagame/${encodeURIComponent(formato)}/${encodeURIComponent(deck.slug)}?dias=${dias}`}
                        title={rotuloDeckRecente(deck)}
                      >
                        {rotuloDeckRecente(deck)}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
