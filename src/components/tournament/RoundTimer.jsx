import { useEffect, useRef, useState } from "react";

const ROUND_DURATION = 50 * 60; // 50 minutes in seconds

function storageKey(torneioId, rodada) {
  return `rt_start_${torneioId}_r${rodada}`;
}

export function RoundTimer({ torneioId, rodadaAtual, status }) {
  const [secondsLeft, setSecondsLeft] = useState(ROUND_DURATION);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (status !== "em_andamento" || !torneioId || !rodadaAtual) return;

    const key = storageKey(torneioId, rodadaAtual);
    let startTime = Number(localStorage.getItem(key) || 0);

    if (!startTime) {
      startTime = Date.now();
      localStorage.setItem(key, String(startTime));
    }

    const tick = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setSecondsLeft(Math.max(0, ROUND_DURATION - elapsed));
    };

    tick();
    intervalRef.current = setInterval(tick, 1000);

    return () => clearInterval(intervalRef.current);
  }, [torneioId, rodadaAtual, status]);

  if (status !== "em_andamento") return null;

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeStr = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  const isOver = secondsLeft === 0;
  const isUrgent = !isOver && secondsLeft <= 5 * 60;
  const isWarning = !isOver && !isUrgent && secondsLeft <= 15 * 60;

  const timerBorderClass = isOver
    ? "border-[rgba(239,68,68,0.8)]"
    : isUrgent
    ? "border-[rgba(239,68,68,0.6)] animate-[rt-pulse_1.5s_ease-in-out_infinite]"
    : isWarning
    ? "border-[rgba(251,191,36,0.5)]"
    : "border-[rgba(44,207,180,0.35)]";

  const displayColorClass = isOver || isUrgent
    ? "text-[#f87171]"
    : isWarning
    ? "text-[#fcd34d]"
    : "text-[#2ccfb4]";

  const displaySizeClass = isOver
    ? "text-[1.1rem] tracking-[0.02em]"
    : "text-[2rem] tracking-[0.05em]";

  const fillGradientClass = isUrgent
    ? "bg-[linear-gradient(90deg,#b91c1c,#f87171)]"
    : isWarning
    ? "bg-[linear-gradient(90deg,#d97706,#fcd34d)]"
    : "bg-[linear-gradient(90deg,#0d9488,#2ccfb4)]";

  return (
    <div className={`border rounded-[0.9rem] bg-[rgba(14,9,28,0.85)] mt-3 overflow-hidden transition-[border-color] duration-300 ${timerBorderClass}`}>
      <div className="flex items-center justify-between px-4 py-[0.65rem] gap-4">
        <div className="flex items-center gap-[0.45rem] text-[#beafd7] text-[0.85rem] font-semibold">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span className="text-[#beafd7]">Rodada {rodadaAtual}</span>
        </div>

        <div className={`font-['Bebas_Neue',monospace] transition-[color] duration-300 ${displayColorClass} ${displaySizeClass}`}>
          {isOver ? "Tempo esgotado" : timeStr}
        </div>

        {isOver && (
          <span className="text-[0.72rem] font-bold text-[#f87171] bg-[rgba(239,68,68,0.15)] border border-[rgba(239,68,68,0.4)] rounded-full px-[0.55rem] py-[0.2rem]">+Tempo Extra</span>
        )}
      </div>

      {!isOver && (
        <div className="h-[3px] bg-[rgba(255,255,255,0.07)] overflow-hidden">
          <div
            className={`h-full rounded-full transition-[width] duration-1000 ease-linear ${fillGradientClass}`}
            style={{ width: `${(secondsLeft / ROUND_DURATION) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}
