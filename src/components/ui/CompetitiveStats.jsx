function Stat({ label, value, tone = "text-text-main" }) {
  return <div className="relative flex min-h-[92px] flex-col justify-center px-5 py-4 text-center after:absolute after:right-0 after:top-1/4 after:h-1/2 after:w-px after:bg-white/[0.08] last:after:hidden max-sm:after:hidden"><strong className={`block text-[1.65rem] font-semibold leading-none tracking-[-0.03em] ${tone}`}>{value}</strong><span className="mt-2 text-[0.68rem] font-semibold uppercase tracking-[0.09em] text-text-subtle">{label}</span></div>;
}

export function CompetitiveStats({ stats = {}, expressiveResults, className = "" }) {
  const items = [
    ["Winrate", `${Number(stats.winrate ?? stats.winRate ?? 0).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`, "text-brand"],
    ["Partidas", stats.totalPartidas ?? stats.partidas ?? 0],
    ["Vitórias", stats.vitorias ?? 0, "text-emerald-300"],
    ["Derrotas", stats.derrotas ?? 0, "text-red-300"],
    ["Empates", stats.empates ?? 0],
  ];
  if (expressiveResults !== undefined) items.push(["Resultados expressivos", expressiveResults, "text-amber-300"]);
  return <section aria-label="Estatísticas" className={`grid grid-cols-2 overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-white/[0.045] shadow-[0_14px_45px_rgba(3,2,8,0.18)] backdrop-blur-xl sm:grid-cols-3 ${items.length === 6 ? "xl:grid-cols-6" : "xl:grid-cols-5"} ${className}`}>{items.map(([label, value, tone]) => <Stat key={label} label={label} value={value} tone={tone} />)}</section>;
}
