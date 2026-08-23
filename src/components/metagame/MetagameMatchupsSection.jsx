import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { RecordeTexto, WinrateMeter } from "./MetagameStats";

function valorMatchup(matchup, key) {
  if (key === "nome") return (matchup.nome || "").toLocaleLowerCase("pt-BR");
  if (key === "partidas") return Number(matchup.partidas) || 0;
  if (key === "vde") {
    return (Number(matchup.vitorias) || 0) * 10000
      - (Number(matchup.derrotas) || 0) * 100
      + (Number(matchup.empates) || 0);
  }
  return Number(matchup.winrate) || 0;
}

function ordenarMatchups(matchups, sort) {
  const sinal = sort.dir === "asc" ? 1 : -1;
  return [...matchups].sort((a, b) => {
    const va = valorMatchup(a, sort.key);
    const vb = valorMatchup(b, sort.key);
    if (typeof va === "string") {
      const cmp = va.localeCompare(vb, "pt-BR");
      return (cmp === 0 ? a.nome.localeCompare(b.nome, "pt-BR") : cmp) * sinal;
    }
    if (va !== vb) return (va - vb) * sinal;
    return a.nome.localeCompare(b.nome, "pt-BR");
  });
}

function SortHeader({ label, column, sort, onSort, align = "left" }) {
  const ativo = sort.key === column;
  return (
    <th
      className={`px-3 py-2.5 ${align === "right" ? "text-right" : "text-left"}`}
      aria-sort={ativo ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
    >
      <button
        type="button"
        className={`inline-flex items-center gap-1 border-none bg-transparent p-0 cursor-pointer uppercase tracking-[0.06em] text-[0.7rem] font-bold text-brand hover:text-white ${
          align === "right" ? "ml-auto" : ""
        }`}
        onClick={() => onSort(column)}
      >
        {label}
        <span className="inline-flex flex-col gap-px" aria-hidden="true">
          <span
            className={`w-0 h-0 border-x-[3px] border-x-transparent border-b-[4px] ${
              ativo && sort.dir === "asc" ? "border-b-[#c795ff]" : "border-b-[rgba(190,175,215,0.35)]"
            }`}
          />
          <span
            className={`w-0 h-0 border-x-[3px] border-x-transparent border-t-[4px] ${
              ativo && sort.dir === "desc" ? "border-t-[#c795ff]" : "border-t-[rgba(190,175,215,0.35)]"
            }`}
          />
        </span>
      </button>
    </th>
  );
}

export function MetagameMatchupsSection({ matchups = [], formato, dias }) {
  const [sort, setSort] = useState({ key: "partidas", dir: "desc" });
  const ordenados = useMemo(() => ordenarMatchups(matchups, sort), [matchups, sort]);

  const ordenarColuna = (column) => {
    setSort((atual) => {
      if (atual.key === column) {
        return { key: column, dir: atual.dir === "desc" ? "asc" : "desc" };
      }
      return { key: column, dir: column === "nome" ? "asc" : "desc" };
    });
  };

  return (
    <section className="mb-8">
      <div className="mb-3">
        <h2 className="m-0 text-text-main text-[1.25rem]">Matchups</h2>
        <p className="m-0 mt-1 text-[0.82rem] text-text-muted">
          Desempenho contra cada arquétipo neste período.
        </p>
      </div>
      {ordenados.length === 0 ? (
        <p className="m-0 text-text-soft">Ainda não há confrontos registrados neste período.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line-soft bg-white/[0.02]">
          <table className="w-full text-left text-[0.9rem] border-collapse">
            <thead className="bg-[#21133a]">
              <tr>
                <SortHeader label="Contra" column="nome" sort={sort} onSort={ordenarColuna} />
                <SortHeader label="Partidas" column="partidas" sort={sort} onSort={ordenarColuna} />
                <SortHeader label="Recorde" column="vde" sort={sort} onSort={ordenarColuna} />
                <SortHeader label="Winrate" column="winrate" sort={sort} onSort={ordenarColuna} />
              </tr>
            </thead>
            <tbody>
              {ordenados.map((m) => (
                <tr
                  key={m.slug}
                  className="border-t border-line-soft hover:bg-[rgba(167,79,255,0.06)] transition-colors"
                >
                  <td className="px-3 py-3">
                    <Link
                      className="text-[#d9b4ff] font-semibold no-underline hover:underline"
                      to={`/metagame/${encodeURIComponent(formato)}/${encodeURIComponent(m.slug)}?dias=${dias}`}
                    >
                      {m.nome}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-text-main tabular-nums">
                    {m.partidas}
                    <span className="ml-1 text-[0.72rem] text-text-muted font-normal">
                      {m.partidas === 1 ? "jogo" : "jogos"}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <RecordeTexto vitorias={m.vitorias} derrotas={m.derrotas} empates={m.empates} />
                  </td>
                  <td className="px-3 py-3 w-[7.5rem]">
                    <WinrateMeter rate={m.winrate} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
