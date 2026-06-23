import { RankBadge } from "./RankBadge";
import { RankInfoTooltip } from "./RankBadge";
import { extractResumoRank, getRankProgress } from "../../utils/rank";

export function RankProgressBar({ usuario, className = "" }) {
  const resumo = extractResumoRank(usuario);
  if (!resumo) return null;

  const { percent, label, isMax } = getRankProgress(resumo);

  return (
    <div className={`rounded-xl border border-[rgba(217,180,255,0.18)] bg-white/[0.03] p-4 ${className}`}>
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <RankInfoTooltip>
            <span className="text-[0.78rem] font-semibold text-[#beafd7] cursor-help border-b border-dotted border-[rgba(190,175,215,0.45)]">
              Rank competitivo
            </span>
          </RankInfoTooltip>
          <RankBadge rank={resumo.rank} size="md" />
        </div>
        <span className="text-[0.82rem] font-bold text-[#f5edff] tabular-nums">
          {resumo.pontosRank ?? 0} pts
        </span>
      </div>

      <div
        className="h-2 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || "Progresso de rank"}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isMax
              ? "bg-[linear-gradient(90deg,#a855f7,#38bdf8,#f472b6,#a855f7)] bg-[length:200%_100%] animate-[rank-rocket_2.4s_linear_infinite]"
              : "bg-[linear-gradient(90deg,#8e39ed,#c795ff)]"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="m-0 mt-2 text-[0.75rem] text-[#beafd7]">
        {label}
        {!isMax && resumo.proximoRank && (
          <span className="ml-1 opacity-80 inline-flex items-center gap-1">
            → <RankBadge rank={resumo.proximoRank} size="sm" showLabel className="inline-flex align-middle" />
          </span>
        )}
      </p>
    </div>
  );
}
