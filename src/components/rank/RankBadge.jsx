import { getRankMeta } from "../../utils/rank";
import { Tooltip } from "../ui/Tooltip";

export function RankBadge({ rank, size = "sm", showLabel = true, className = "" }) {
  const meta = getRankMeta(rank);
  if (!meta) return null;

  const sizeClass = size === "lg"
    ? "text-[0.82rem] px-2 py-[0.2rem] gap-1"
    : size === "md"
      ? "text-[0.75rem] px-[0.55rem] py-[0.12rem] gap-[0.3rem]"
      : "text-[0.68rem] px-[0.45rem] py-[0.06rem] gap-[0.25rem]";

  const rocketClass = meta.isRocket
    ? "bg-[linear-gradient(135deg,rgba(168,85,247,0.35),rgba(56,189,248,0.25),rgba(244,114,182,0.3))] animate-[rank-rocket_2.4s_ease-in-out_infinite] shadow-[0_0_12px_rgba(168,85,247,0.35)]"
    : "bg-white/[0.06]";

  return (
    <span
      className={`inline-flex items-center rounded-full border font-bold uppercase tracking-[0.05em] whitespace-nowrap ${sizeClass} ${rocketClass} ${className}`}
      style={{ borderColor: `${meta.color}88`, color: meta.color }}
      title={meta.label}
    >
      <span aria-hidden="true" className="leading-none">{meta.icon}</span>
      {showLabel && <span>{meta.label}</span>}
    </span>
  );
}

export function RankInfoTooltip({ children, placement = "top" }) {
  return (
    <Tooltip
      content="Perder para jogador de rank menor custa mais pontos."
      placement={placement}
    >
      {children}
    </Tooltip>
  );
}
