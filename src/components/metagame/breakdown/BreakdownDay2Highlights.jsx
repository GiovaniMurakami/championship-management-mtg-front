import { formatPctConversao } from "../../../utils/metagameBreakdown";

function formatRecorde({ vitorias = 0, derrotas = 0, empates = 0 }) {
  if (empates > 0) return `${vitorias}-${derrotas}-${empates}`;
  return `${vitorias}-${derrotas}`;
}

function labelRodadaCorte(rodada, primeiraCorte, totalRodadas) {
  if (!primeiraCorte || !totalRodadas) return `R${rodada}`;
  const idx = Number(rodada) - Number(primeiraCorte);
  const restantes = Number(totalRodadas) - Number(rodada);
  if (restantes === 0) return "Final";
  if (restantes === 1) return "Semifinal";
  if (idx === 0) return "Quartas";
  return `R${rodada}`;
}

/**
 * Painel de destaques do Day 2: meta do campo, hot streak no Swiss Day 2 e caminho do corte.
 */
export function BreakdownDay2Highlights({
  destaques,
  corteTop,
  totalRodadas,
  rodadasDay1,
}) {
  if (!destaques || !destaques.jogadores) return null;

  const primeiraCorte =
    Number(corteTop) >= 2 && Number(totalRodadas) > 0
      ? Number(totalRodadas) - Math.log2(Number(corteTop)) + 1
      : null;
  const primeiraCorteOk = Number.isInteger(primeiraCorte) ? primeiraCorte : null;

  const { meta = [], melhorDesempenho = [], corte = [], resumo = {} } = destaques;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-line bg-surface-soft px-3 py-2.5">
          <p className="m-0 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-text-muted">Campo Day 2</p>
          <p className="m-0 mt-1 text-xl font-bold tabular-nums text-text-main">{destaques.jogadores}</p>
        </div>
        <div className="rounded-xl border border-line bg-surface-soft px-3 py-2.5">
          <p className="m-0 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-text-muted">Arquétipos</p>
          <p className="m-0 mt-1 text-xl font-bold tabular-nums text-text-main">{destaques.arquetipos}</p>
        </div>
        <div className="rounded-xl border border-line bg-surface-soft px-3 py-2.5">
          <p className="m-0 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-text-muted">Varreduras 2-0</p>
          <p className="m-0 mt-1 text-xl font-bold tabular-nums text-text-main">
            {formatPctConversao(resumo.pctVarreduras)}
          </p>
        </div>
        <div className="rounded-xl border border-line bg-surface-soft px-3 py-2.5">
          <p className="m-0 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-text-muted">Games / mesa</p>
          <p className="m-0 mt-1 text-xl font-bold tabular-nums text-text-main">
            {Number.isFinite(resumo.mediaGames) ? resumo.mediaGames : "—"}
          </p>
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-1 items-start gap-5 xl:grid-cols-2">
        {meta.length > 0 && (
          <div className="min-w-0 rounded-2xl border border-line bg-surface-soft/60 p-4">
            <h3 className="m-0 text-sm font-bold text-text-main">Meta do Day 2</h3>
            <p className="m-0 mt-1 text-xs text-text-soft">
              Arquétipos entre os {destaques.jogadores} que passaram do Day 1
              {rodadasDay1 ? ` (após R${rodadasDay1})` : ""}.
            </p>
            <ul className="m-0 mt-3 list-none divide-y divide-line/60 p-0">
              {meta.map((a) => (
                <li
                  key={a.slug}
                  className="flex min-w-0 items-baseline justify-between gap-3 py-2 text-sm"
                >
                  <span className="min-w-0 truncate font-medium text-text-main" title={a.nome}>
                    {a.nome}
                  </span>
                  <span className="shrink-0 tabular-nums text-xs text-text-soft sm:text-sm">
                    {a.copias} · {a.metaPct}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {melhorDesempenho.length > 0 && (
          <div className="min-w-0 rounded-2xl border border-line bg-surface-soft/60 p-4">
            <h3 className="m-0 text-sm font-bold text-text-main">Melhor Swiss Day 2</h3>
            <p className="m-0 mt-1 text-xs text-text-soft">
              Recorde só nas rodadas após o Day 1 (antes do corte).
            </p>
            <ul className="m-0 mt-3 list-none divide-y divide-line/60 p-0">
              {melhorDesempenho.map((j, index) => (
                <li
                  key={j.usuarioId}
                  className="flex min-w-0 flex-col gap-0.5 py-2 text-sm sm:flex-row sm:items-baseline sm:justify-between sm:gap-3"
                >
                  <span className="min-w-0 truncate font-medium text-text-main" title={`${j.nome} · ${j.deckNome}`}>
                    <span className="mr-2 tabular-nums text-text-muted">{index + 1}.</span>
                    {j.nome}
                    <span className="text-text-soft"> · {j.deckNome}</span>
                  </span>
                  <span className="shrink-0 pl-6 tabular-nums text-xs text-text-soft sm:pl-0 sm:text-sm">
                    {formatRecorde(j)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {corte.length > 0 && (
        <div className="min-w-0 rounded-2xl border border-[rgba(250,204,21,0.22)] bg-[rgba(250,204,21,0.06)] p-4">
          <h3 className="m-0 text-sm font-bold text-[#fde68a]">Caminho do corte</h3>
          <p className="m-0 mt-1 text-xs text-text-soft">
            Resultados eliminatórios
            {corteTop ? ` (Top ${corteTop})` : ""}.
          </p>
          <ul className="m-0 mt-3 list-none divide-y divide-[rgba(250,204,21,0.12)] p-0">
            {corte.map((m) => (
              <li
                key={`${m.rodada}-${m.mesa}-${m.jogador1}`}
                className="flex min-w-0 flex-col gap-1 py-2.5 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3"
              >
                <div className="min-w-0">
                  <span className="mr-2 text-xs font-bold uppercase tracking-[0.06em] text-[#fde68a]">
                    {labelRodadaCorte(m.rodada, primeiraCorteOk, totalRodadas)}
                    {m.mesa != null ? ` · M${m.mesa}` : ""}
                  </span>
                  <span className="text-text-main">
                    {m.jogador1}
                    {m.jogador2 ? ` vs ${m.jogador2}` : ""}
                    <span className="text-text-soft"> · {m.placar}</span>
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {m.vencedor && (
                    <span className="text-xs font-semibold text-[#fff7cc]">
                      {m.vencedor}
                    </span>
                  )}
                  {m.upset && (
                    <span className="rounded-full border border-[rgba(251,146,60,0.45)] bg-[rgba(251,146,60,0.12)] px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.06em] text-[#fdba74]">
                      Upset
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
