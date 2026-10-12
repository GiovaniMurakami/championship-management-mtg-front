function cellStyle(winrate) {
  if (winrate == null) return { background: "rgba(255,255,255,0.04)", color: "#6b7280" };
  const t = Math.max(0, Math.min(100, winrate)) / 100;
  // vermelho (ruim) → neutro → verde (bom)
  const r = Math.round(239 - t * 160);
  const g = Math.round(68 + t * 140);
  const b = Math.round(68 + t * 20);
  return {
    background: `rgba(${r},${g},${b},0.35)`,
    color: "#f3f4f6",
  };
}

export function BreakdownMatchupHeat({ heat }) {
  const labels = heat?.labels || [];
  if (labels.length < 2) {
    return <p className="m-0 text-text-muted text-sm">Poucos arquétipos para matriz de confrontos.</p>;
  }

  const cellMap = new Map(
    (heat.cells || []).map((c) => [`${c.row}:${c.col}`, c])
  );

  const rows = heat.filtroSlug
    ? labels.filter((l) => l.slug === heat.filtroSlug)
    : labels;
  const cols = heat.filtroSlug
    ? labels.filter((l) => l.slug !== heat.filtroSlug)
    : labels;

  if (heat.filtroSlug && cols.length === 0) {
    return <p className="m-0 text-text-muted text-sm">Sem confrontos registrados para este arquétipo.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="border-collapse text-[0.75rem] min-w-full">
        <thead>
          <tr>
            <th className="p-1.5 text-left text-text-muted font-medium sticky left-0 bg-surface z-[1]">vs</th>
            {cols.map((l) => (
              <th key={l.slug} className="p-1.5 text-text-soft font-medium max-w-[72px] truncate" title={l.nome}>
                {l.nome}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.slug}>
              <th className="p-1.5 text-left text-text-main font-medium sticky left-0 bg-surface max-w-[100px] truncate" title={row.nome}>
                {row.nome}
              </th>
              {cols.map((col) => {
                const cell = cellMap.get(`${row.slug}:${col.slug}`);
                const isDiag = row.slug === col.slug;
                const style = isDiag
                  ? { background: "rgba(255,255,255,0.02)", color: "#4b5563" }
                  : cellStyle(cell?.winrate);
                return (
                  <td
                    key={col.slug}
                    className="p-0 text-center tabular-nums"
                    title={
                      isDiag
                        ? "—"
                        : cell?.winrate != null
                          ? `${cell.winrate}% em ${cell.partidas} partida(s)`
                          : "Sem confrontos"
                    }
                  >
                    <div
                      className="min-w-[48px] min-h-[36px] flex items-center justify-center rounded-md m-0.5"
                      style={style}
                    >
                      {isDiag ? "·" : cell?.winrate != null ? `${Math.round(cell.winrate)}` : "—"}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
