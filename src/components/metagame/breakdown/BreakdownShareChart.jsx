import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { isSlugArquetipoClicavel } from "../../../utils/metagameBreakdown";

function TooltipShare({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-sm shadow-card">
      <p className="m-0 font-semibold text-text-main">{item.nome}</p>
      <p className="m-0 text-text-soft">{item.value}% · {item.copias} deck(s)</p>
      {isSlugArquetipoClicavel(item.slug) && (
        <p className="m-0 mt-1 text-xs text-text-muted">Clique para filtrar a matriz</p>
      )}
    </div>
  );
}

export function BreakdownShareChart({ data, selectedSlug = null, onSelect }) {
  if (!data?.length) {
    return <p className="m-0 text-text-muted text-sm">Sem dados de share.</p>;
  }

  const handleSelect = (slug) => {
    if (!onSelect || !isSlugArquetipoClicavel(slug)) return;
    onSelect(selectedSlug === slug ? null : slug);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] items-center">
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="nome"
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={100}
              paddingAngle={2}
              cursor="pointer"
              onClick={(_, index) => handleSelect(data[index]?.slug)}
            >
              {data.map((entry) => {
                const ativo = !selectedSlug || entry.slug === selectedSlug;
                return (
                  <Cell
                    key={entry.slug}
                    fill={entry.fill}
                    stroke="transparent"
                    fillOpacity={ativo ? 1 : 0.28}
                    style={{ outline: "none" }}
                  />
                );
              })}
            </Pie>
            <Tooltip content={<TooltipShare />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="m-0 p-0 list-none space-y-2 max-h-[280px] overflow-auto">
        {data.map((item) => {
          const clicavel = isSlugArquetipoClicavel(item.slug);
          const ativo = !selectedSlug || item.slug === selectedSlug;
          const selecionado = selectedSlug === item.slug;
          return (
            <li key={item.slug}>
              <button
                type="button"
                disabled={!clicavel}
                onClick={() => handleSelect(item.slug)}
                className={`flex w-full items-center gap-2 rounded-lg px-1.5 py-1 text-left text-sm transition-colors ${
                  clicavel
                    ? "cursor-pointer hover:bg-white/[0.05]"
                    : "cursor-default opacity-70"
                } ${selecionado ? "bg-white/[0.07] ring-1 ring-brand/40" : ""} ${
                  ativo ? "" : "opacity-40"
                }`}
              >
                <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: item.fill }} />
                <span className="text-text-main truncate flex-1">{item.nome}</span>
                <span className="text-text-soft tabular-nums">{item.value}%</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
