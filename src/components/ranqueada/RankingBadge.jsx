const STYLE = {
  Bronze: "border-amber-700/40 bg-amber-950/30 text-amber-500",
  Prata: "border-slate-300/40 bg-slate-500/20 text-slate-200",
  Ouro: "border-yellow-400/40 bg-yellow-500/10 text-yellow-300",
  Platina: "border-cyan-300/40 bg-cyan-500/10 text-cyan-200",
  Diamante: "border-violet-300/50 bg-violet-500/15 text-violet-200",
  Fuguete: "border-orange-300/60 bg-gradient-to-r from-fuchsia-500/20 to-orange-500/20 text-orange-200",
};

export function RankingBadge({ divisao = "Prata", compact = false, className = "" }) {
  return <span title={`Divisão ${divisao}`} className={`inline-flex shrink-0 items-center rounded-full border font-bold ${compact ? "px-2 py-0.5 text-[0.65rem]" : "px-3 py-1 text-sm"} ${STYLE[divisao] ?? STYLE.Prata} ${className}`}>
    {divisao}{divisao === "Fuguete" ? " 🚀" : ""}
  </span>;
}
