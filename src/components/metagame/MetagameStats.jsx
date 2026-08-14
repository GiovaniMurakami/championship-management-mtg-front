export function winrateStyle(rate) {
  if (rate == null || Number.isNaN(Number(rate))) {
    return { color: "rgba(190,175,215,0.45)", track: "rgba(217,180,255,0.08)" };
  }
  if (rate >= 55) return { color: "#22c55e", track: "rgba(34,197,94,0.18)" };
  if (rate >= 45) return { color: "#fbbf24", track: "rgba(251,191,36,0.18)" };
  return { color: "#ef4444", track: "rgba(239,68,68,0.18)" };
}

export function formatarRecorde(vitorias = 0, derrotas = 0, empates = 0) {
  if (empates > 0) return `${vitorias}-${derrotas}-${empates}`;
  return `${vitorias}-${derrotas}`;
}

export function RecordeTexto({ vitorias = 0, derrotas = 0, empates = 0, className = "" }) {
  return (
    <span className={`tabular-nums text-[#beafd7] ${className}`.trim()}>
      {formatarRecorde(vitorias, derrotas, empates)}
    </span>
  );
}

export function WinrateMeter({ rate, className = "" }) {
  if (rate == null) return <span className="text-[#8f82ad]">—</span>;
  const style = winrateStyle(rate);
  return (
    <div className={`flex flex-col gap-1 min-w-[4.5rem] ${className}`}>
      <span className="text-[0.92rem] font-bold tabular-nums leading-none" style={{ color: style.color }}>
        {rate}%
      </span>
      <div className="h-[4px] rounded-full w-full" style={{ background: style.track }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.min(Math.max(Number(rate) || 0, 0), 100)}%`, background: style.color }}
        />
      </div>
    </div>
  );
}

export function ColocacaoBadge({ colocacao }) {
  const pos = Number(colocacao) || 0;
  if (pos === 1) {
    return (
      <span className="inline-flex items-center justify-center min-w-8 h-8 px-1.5 rounded-full bg-[rgba(251,191,36,0.18)] border border-[rgba(251,191,36,0.55)] text-[0.72rem] font-extrabold text-[#fbbf24]">
        1º
      </span>
    );
  }
  if (pos === 2) {
    return (
      <span className="inline-flex items-center justify-center min-w-8 h-8 px-1.5 rounded-full bg-[rgba(148,163,184,0.15)] border border-[rgba(148,163,184,0.4)] text-[0.72rem] font-extrabold text-[#94a3b8]">
        2º
      </span>
    );
  }
  if (pos === 3) {
    return (
      <span className="inline-flex items-center justify-center min-w-8 h-8 px-1.5 rounded-full bg-[rgba(205,127,50,0.15)] border border-[rgba(205,127,50,0.4)] text-[0.72rem] font-extrabold text-[#cd9a5c]">
        3º
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center min-w-8 h-8 px-1.5 rounded-full bg-white/[0.04] border border-[rgba(217,180,255,0.16)] text-[0.72rem] font-semibold text-[#beafd7]">
      {pos ? `${pos}º` : "—"}
    </span>
  );
}
