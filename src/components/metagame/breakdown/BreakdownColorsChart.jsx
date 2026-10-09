import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

function TooltipCores({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-sm shadow-card">
      <p className="m-0 font-semibold text-text-main">Cor {item.nome}</p>
      <p className="m-0 text-text-soft">{item.value} presença(s) em decks</p>
    </div>
  );
}

export function BreakdownColorsChart({ data }) {
  if (!data?.length) {
    return <p className="m-0 text-text-muted text-sm">Sem dados de cores.</p>;
  }

  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="nome" tick={{ fill: "#d1d5db", fontSize: 13 }} />
          <YAxis allowDecimals={false} tick={{ fill: "#9ca3af", fontSize: 12 }} />
          <Tooltip content={<TooltipCores />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={36}>
            {data.map((entry) => (
              <Cell key={entry.nome} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
