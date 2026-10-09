import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { isSlugArquetipoClicavel } from "../../../utils/metagameBreakdown";

function TooltipPartidas({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-sm shadow-card">
      <p className="m-0 font-semibold text-text-main">{item.nome}</p>
      <p className="m-0 text-text-soft">
        {item.partidas} partida(s) · winrate {item.winrate}%
      </p>
      <p className="m-0 mt-1 text-text-muted text-xs">
        {item.vitorias}V · {item.empates}E · {item.derrotas}D
      </p>
      {isSlugArquetipoClicavel(item.slug) && (
        <p className="m-0 mt-1 text-xs text-text-muted">Clique para filtrar a matriz</p>
      )}
    </div>
  );
}

function rotuloY({ x, y, payload }) {
  const nome = payload?.value ?? "";
  const curto = nome.length > 18 ? `${nome.slice(0, 16)}…` : nome;
  return (
    <text x={x} y={y} dy={4} textAnchor="end" fill="#d1d5db" fontSize={12}>
      {curto}
    </text>
  );
}

export function BreakdownWinrateChart({ data, selectedSlug = null, onSelect }) {
  if (!data?.length) {
    return <p className="m-0 text-text-muted text-sm">Sem partidas suficientes para o gráfico.</p>;
  }

  const altura = Math.max(240, data.length * 40);

  const handleSelect = (slug) => {
    if (!onSelect || !isSlugArquetipoClicavel(slug)) return;
    onSelect(selectedSlug === slug ? null : slug);
  };

  return (
    <div style={{ height: altura }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 8, right: 16, top: 8, bottom: 8 }}
          onClick={(state) => {
            const slug = state?.activePayload?.[0]?.payload?.slug;
            if (slug) handleSelect(slug);
          }}
          style={{ cursor: "pointer" }}
        >
          <CartesianGrid stroke="rgba(255,255,255,0.06)" horizontal={false} />
          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            label={{ value: "Partidas", position: "insideBottomRight", offset: -2, fill: "#9ca3af", fontSize: 11 }}
          />
          <YAxis type="category" dataKey="nome" width={128} tick={rotuloY} interval={0} />
          <Tooltip content={<TooltipPartidas />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
          <Legend
            wrapperStyle={{ fontSize: 12, color: "#9ca3af" }}
            formatter={(value) => ({ vitorias: "Vitórias", empates: "Empates", derrotas: "Derrotas" }[value] || value)}
          />
          <Bar dataKey="vitorias" stackId="partidas" fill="#34d399" radius={[0, 0, 0, 0]} barSize={18} name="vitorias">
            {data.map((entry) => (
              <Cell
                key={`v-${entry.slug}`}
                fillOpacity={!selectedSlug || entry.slug === selectedSlug ? 1 : 0.28}
              />
            ))}
          </Bar>
          <Bar dataKey="empates" stackId="partidas" fill="#fbbf24" barSize={18} name="empates">
            {data.map((entry) => (
              <Cell
                key={`e-${entry.slug}`}
                fillOpacity={!selectedSlug || entry.slug === selectedSlug ? 1 : 0.28}
              />
            ))}
          </Bar>
          <Bar dataKey="derrotas" stackId="partidas" fill="#f87171" radius={[0, 6, 6, 0]} barSize={18} name="derrotas">
            {data.map((entry) => (
              <Cell
                key={`d-${entry.slug}`}
                fillOpacity={!selectedSlug || entry.slug === selectedSlug ? 1 : 0.28}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
