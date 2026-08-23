import { Link } from "react-router-dom";
import { UsuarioNomeExibicao } from "../ui/UsuarioExcluidoTag";
import { agruparResultadosPorTorneio } from "../../utils/metagameListas";
import { ColocacaoBadge, RecordeTexto } from "./MetagameStats";

function formatDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("pt-BR");
  } catch {
    return "";
  }
}

export function MetagameResultadosSection({ resultados = [] }) {
  const grupos = agruparResultadosPorTorneio(resultados);

  return (
    <section>
      <div className="mb-3">
        <h2 className="m-0 text-text-main text-[1.25rem]">Resultados em torneios</h2>
        <p className="m-0 mt-1 text-[0.82rem] text-text-muted">
          Colocação de cada cópia deste arquétipo nos eventos do período.
        </p>
      </div>
      {grupos.length === 0 ? (
        <p className="m-0 text-text-soft">Sem resultados neste período.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {grupos.map((grupo) => (
            <article
              key={grupo.torneioId}
              className="rounded-xl border border-line-soft bg-white/[0.02] overflow-hidden"
            >
              <header className="flex items-baseline justify-between gap-3 px-4 py-2.5 bg-[#21133a] border-b border-line-soft">
                <Link
                  className="text-[#d9b4ff] font-semibold no-underline hover:underline truncate"
                  to={`/torneios/${grupo.torneioId}`}
                >
                  {grupo.torneioNome}
                </Link>
                {grupo.horario ? (
                  <time className="flex-shrink-0 text-[0.75rem] text-text-muted tabular-nums" dateTime={grupo.horario}>
                    {formatDate(grupo.horario)}
                  </time>
                ) : null}
              </header>
              <ul className="m-0 p-0 list-none divide-y divide-[rgba(217,180,255,0.08)]">
                {grupo.resultados.map((r) => (
                  <li
                    key={`${r.torneioId}-${r.usuario?.id}-${r.deckId}`}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-[rgba(167,79,255,0.05)]"
                  >
                    <ColocacaoBadge colocacao={r.colocacao} />
                    <div className="flex-1 min-w-0">
                      <p className="m-0 text-[0.92rem] font-semibold text-text-main truncate">
                        <UsuarioNomeExibicao
                          nome={r.usuario?.nome}
                          excluido={r.usuario}
                          nameClassName="truncate"
                        />
                      </p>
                    </div>
                    <RecordeTexto vitorias={r.vitorias} derrotas={r.derrotas} empates={r.empates} />
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
