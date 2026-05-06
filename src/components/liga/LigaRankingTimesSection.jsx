function calcWinRate(vitorias, derrotas, empates) {
  const total = (vitorias ?? 0) + (derrotas ?? 0) + (empates ?? 0);
  return total > 0 ? Math.round(((vitorias ?? 0) / total) * 100) : null;
}

function winRateStyle(rate) {
  if (rate === null) return { color: "rgba(190,175,215,0.4)" };
  if (rate >= 60) return { color: "#22c55e" };
  if (rate >= 40) return { color: "#fbbf24" };
  return { color: "#ef4444" };
}

const AVATAR_PALETTES = [
  "from-[#8e39ed] to-[#5f23b3]",
  "from-[#0d9488] to-[#0891b2]",
  "from-[#d97706] to-[#b45309]",
  "from-[#7c3aed] to-[#4f46e5]",
  "from-[#be185d] to-[#9d174d]",
];

function getInitials(nome) {
  if (!nome) return "?";
  return nome.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

const getTotalMembros = (time) =>
  time.totalMembros ?? time.membroIds?.length ?? time.membros?.length ?? null;

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-[58px] rounded-[0.9rem] bg-white/[0.04] animate-pulse" />
      ))}
    </div>
  );
}

export function LigaRankingTimesSection({ ranking, loading }) {
  if (loading) return <LoadingSkeleton />;

  const times = ranking?.times || ranking?.rankingTimes || [];

  if (!ranking || times.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <div className="text-[2.5rem] opacity-25">🛡️</div>
        <p className="m-0 text-[1rem] font-medium text-[rgba(190,175,215,0.55)]">Nenhum dado de ranking de times disponível.</p>
        <p className="m-0 text-[0.85rem] text-[rgba(190,175,215,0.3)] max-w-[320px] leading-relaxed">
          O ranking será gerado automaticamente conforme os times jogarem.
        </p>
      </div>
    );
  }

  const cardClass =
    "bg-[linear-gradient(155deg,rgba(26,16,50,0.98)_0%,rgba(16,10,32,0.98)_100%)] rounded-[1rem] border border-[rgba(217,180,255,0.15)] overflow-hidden";

  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between px-5 py-[0.6rem] border-b border-[rgba(217,180,255,0.1)] bg-white/[0.015]">
        <span className="text-[0.78rem] text-[#beafd7]">
          <span className="font-semibold text-[#f5edff]">{times.length}</span>{" "}
          time{times.length !== 1 ? "s" : ""}
        </span>
        <span className="text-[0.72rem] text-[rgba(190,175,215,0.4)]">ordenado por pontos</span>
      </div>
      <ul className="divide-y divide-[rgba(217,180,255,0.07)] m-0 p-0 list-none">
        {times.map((time, idx) => {
          const pos = time.posicao ?? idx + 1;
          const nome = time.nome || time.time?.nome || "—";
          const pts = time.pontos ?? 0;
          const wins = time.vitorias ?? 0;
          const losses = time.derrotas ?? 0;
          const draws = time.empates ?? 0;
          const winRate = calcWinRate(wins, losses, draws);
          const wr = winRateStyle(winRate);

          return (
            <li
              key={time.id ?? time.timeId ?? idx}
              className="flex items-center gap-3 px-5 py-[0.85rem] transition-colors duration-150 hover:bg-white/[0.025]"
            >
              {/* Position */}
              <span className="inline-flex items-center justify-center w-8 text-[0.8rem] text-[rgba(190,175,215,0.4)] font-semibold flex-shrink-0">
                {pos <= 3 ? (
                  <span
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-[0.72rem] font-extrabold leading-none ${
                      pos === 1
                        ? "bg-[linear-gradient(135deg,#ffd700,#b8860b)] text-[#3d2800]"
                        : pos === 2
                        ? "bg-[linear-gradient(135deg,#d0d0d0,#888)] text-[#1e1e1e]"
                        : "bg-[linear-gradient(135deg,#cd7f32,#8b4513)] text-[#fff8f0]"
                    }`}
                  >
                    {pos}
                  </span>
                ) : (
                  pos
                )}
              </span>

              {/* Avatar */}
              <span
                className={`w-9 h-9 rounded-full bg-gradient-to-br ${AVATAR_PALETTES[idx % AVATAR_PALETTES.length]} flex items-center justify-center text-[0.72rem] font-bold text-white flex-shrink-0 select-none`}
              >
                {getInitials(nome)}
              </span>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <span className="font-semibold overflow-hidden text-ellipsis whitespace-nowrap text-[0.92rem] text-[#c4b5fd] block">
                  {nome}
                </span>
                {getTotalMembros(time) != null && (
                  <span className="text-[0.72rem] text-[rgba(190,175,215,0.45)]">{getTotalMembros(time)} membros</span>
                )}
              </div>

              {/* W/D/L */}
              <div className="hidden min-[520px]:flex items-center gap-[0.3rem] flex-shrink-0">
                <span className="text-[0.7rem] font-semibold text-[#22c55e] bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.25)] rounded-full px-[0.5rem] py-[0.1rem]">
                  {wins}V
                </span>
                {draws > 0 && (
                  <span className="text-[0.7rem] font-semibold text-[#fbbf24] bg-[rgba(251,191,36,0.1)] border border-[rgba(251,191,36,0.25)] rounded-full px-[0.5rem] py-[0.1rem]">
                    {draws}E
                  </span>
                )}
                <span className="text-[0.7rem] font-semibold text-[#ef4444] bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.25)] rounded-full px-[0.5rem] py-[0.1rem]">
                  {losses}D
                </span>
              </div>

              {/* Win rate */}
              {winRate !== null && (
                <span
                  className="hidden min-[600px]:block text-[0.75rem] font-semibold flex-shrink-0 w-[3.2rem] text-right"
                  style={{ color: wr.color }}
                >
                  {winRate}%
                </span>
              )}

              {/* Points */}
              <span className="font-['Bebas_Neue',sans-serif] text-[1.3rem] tracking-[0.04em] flex-shrink-0 w-[3rem] text-right text-[rgba(240,180,41,0.7)]">
                {pts}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
