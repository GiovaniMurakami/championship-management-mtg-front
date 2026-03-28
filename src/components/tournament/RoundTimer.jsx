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

  const stateClass = isOver ? "rt--over" : isUrgent ? "rt--urgent" : isWarning ? "rt--warning" : "";

  return (
    <div className={`round-timer ${stateClass}`}>
      <div className="rt-inner">
        <div className="rt-left">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span className="rt-label">Rodada {rodadaAtual}</span>
        </div>

        <div className={`rt-display ${stateClass}`}>
          {isOver ? "Tempo esgotado" : timeStr}
        </div>

        {isOver && (
          <span className="rt-overtime-badge">+Tempo Extra</span>
        )}
      </div>

      {!isOver && (
        <div className="rt-progress-track">
          <div
            className={`rt-progress-fill ${stateClass}`}
            style={{ width: `${(secondsLeft / ROUND_DURATION) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}
