import { useDateRangeParams } from "../../hooks/useDateRangeParams";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { TOURNAMENT_INPUT_CLASS } from "../../styles/uiClasses";

function rateClass(rate) {
  if (rate > 50) return "bg-success/20 text-text-main";
  if (rate < 50) return "bg-danger/20 text-text-main";
  return "bg-surface-raised text-text-main";
}

function RateCell({ stats, label }) {
  if (!stats || !(stats.partidas > 0)) {
    return <td className="border border-line-soft p-3 text-center text-text-muted" aria-label={`${label}: sem partidas`}>—</td>;
  }
  return (
    <td className={`border border-line-soft p-3 text-center tabular-nums ${rateClass(stats.winrate)}`}
      aria-label={`${label}: ${stats.winrate}% de vitórias em ${stats.partidas} partidas`}
      title={`${stats.vitorias} vitórias · ${stats.derrotas} derrotas · ${stats.empates} empates`}>
      <strong className="block text-base">{stats.winrate}%</strong>
      <span className="text-xs text-text-soft">{stats.partidas} {stats.partidas === 1 ? "partida" : "partidas"}</span>
    </td>
  );
}

export function MetagameMatrix({ arquetipos, formato, dias }) {
  const { dateQuery } = useDateRangeParams();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("partidas");
  const [minimum, setMinimum] = useState("0");
  const visible = useMemo(() => arquetipos
    .filter(a => a.nome.toLocaleLowerCase("pt-BR").includes(search.trim().toLocaleLowerCase("pt-BR")) && Number(a.metaPct) >= Number(minimum))
    .sort((a, b) => {
      if (sort === "nome") return a.nome.localeCompare(b.nome, "pt-BR");
      const value = item => sort === "winrate" ? Number(item.winrate) || 0
        : (Number(item.vitorias) || 0) + (Number(item.derrotas) || 0) + (Number(item.empates) || 0);
      return value(b) - value(a) || a.nome.localeCompare(b.nome, "pt-BR");
    }), [arquetipos, search, sort, minimum]);
  const missingMatchups = arquetipos.some(a => !Array.isArray(a.matchups));
  const to = slug => `/metagame/${encodeURIComponent(formato)}/${encodeURIComponent(slug)}?dias=${dias}${dateQuery}`;

  return (
    <section aria-labelledby="metagame-matrix-title" className="min-w-0">
      <h2 id="metagame-matrix-title" className="m-0 text-xl font-bold text-text-main">Matriz de confrontos</h2>
      <p className="mt-1 text-sm text-text-soft">Leia cada linha contra o arquétipo da coluna. Winrate = vitórias / total de partidas, incluindo empates.</p>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <label className="grid flex-1 min-w-48 gap-1 text-sm text-text-soft">Buscar arquétipo
          <input type="search" value={search} onChange={event => setSearch(event.target.value)} className={TOURNAMENT_INPUT_CLASS} placeholder="Nome do deck" />
        </label>
        <label className="grid gap-1 text-sm text-text-soft">Presença mínima no meta
          <select value={minimum} onChange={event => setMinimum(event.target.value)} className={TOURNAMENT_INPUT_CLASS}>
            <option value="0">Todos</option><option value="1">1%</option><option value="3">3%</option><option value="5">5%</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm text-text-soft">Ordenar por
          <select value={sort} onChange={event => setSort(event.target.value)} className={TOURNAMENT_INPUT_CLASS}>
            <option value="partidas">Quantidade de partidas</option><option value="winrate">Winrate</option><option value="nome">Nome</option>
          </select>
        </label>
      </div>
      <div className="mb-3 flex flex-wrap gap-3 text-xs text-text-soft">
        <span className="rounded-md bg-danger/20 px-2 py-1">Abaixo de 50%</span>
        <span className="rounded-md bg-surface-raised px-2 py-1">50%</span>
        <span className="rounded-md bg-success/20 px-2 py-1">Acima de 50%</span>
        <span className="py-1">— Sem partidas · {visible.length} arquétipos</span>
      </div>
      {missingMatchups && <p role="alert" className="mb-3 text-sm text-text-soft">Os dados de confrontos estão indisponíveis no momento.</p>}
      {visible.length === 0 ? <p className="text-text-soft">Nenhum arquétipo encontrado com esses filtros.</p> : (
        <div role="region" aria-label="Tabela de confrontos, role para ver todos os arquétipos" tabIndex={0}
          className="max-h-[70vh] overflow-auto rounded-xl border border-line-soft focus-visible:outline-2 focus-visible:outline-brand">
          <table className="w-full border-separate border-spacing-0 text-sm">
            <caption className="sr-only">Winrate do arquétipo da linha contra o da coluna, {dateQuery ? "no intervalo selecionado" : `nos últimos ${dias} dias`}.</caption>
            <thead className="sticky top-0 z-20">
              <tr>
                <th scope="col" className="sticky left-0 z-30 min-w-40 border border-line-soft bg-surface p-3 text-left text-text-main">Arquétipo</th>
                <th scope="col" className="min-w-24 border border-line-soft bg-surface p-3 text-text-main">Geral</th>
                {visible.map(a => <th key={a.slug} scope="col" className="min-w-28 max-w-40 border border-line-soft bg-surface p-3 font-medium">
                  <Link to={to(a.slug)} className="text-brand hover:underline">{a.nome}</Link>
                </th>)}
              </tr>
            </thead>
            <tbody>
              {visible.map(a => {
                const matchups = new Map((a.matchups ?? []).map(m => [m.slug, m]));
                const total = (Number(a.vitorias) || 0) + (Number(a.derrotas) || 0) + (Number(a.empates) || 0);
                return <tr key={a.slug}>
                  <th scope="row" className="sticky left-0 z-10 border border-line-soft bg-surface p-3 text-left">
                    <Link to={to(a.slug)} className="text-brand hover:underline">{a.nome}</Link>
                    <span className="mt-1 block text-xs font-normal text-text-muted">{a.metaPct}% do meta · {a.copias} decks</span>
                  </th>
                  <RateCell stats={{ ...a, partidas: total }} label={`${a.nome}, geral`} />
                  {visible.map(b => Array.isArray(a.matchups)
                    ? <RateCell key={b.slug} stats={matchups.get(b.slug)} label={`${a.nome} contra ${b.nome}`} />
                    : <td key={b.slug} className="border border-line-soft p-3 text-center text-xs text-text-muted">Indisponível</td>)}
                </tr>;
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
