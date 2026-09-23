/**
 * Overlay de logout — bloqueia a UI e comunica que a sessão está sendo encerrada.
 */
export function LogoutOverlay({ open }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(6,4,14,0.72)] px-4 backdrop-blur-md animate-[fade-in_180ms_ease-out]"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Encerrando sessão"
    >
      <div className="relative w-[min(320px,100%)] overflow-hidden rounded-2xl border border-line-soft bg-[rgba(18,12,32,0.96)] px-6 py-7 text-center shadow-[0_24px_64px_rgba(0,0,0,0.45)] animate-[scale-focus_220ms_var(--ease-standard)]">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[2px] overflow-hidden"
          aria-hidden="true"
        >
          <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-[#c795ff] to-transparent animate-[logout-shimmer_1.1s_ease-in-out_infinite]" />
        </div>

        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(199,149,255,0.35)] bg-[rgba(167,79,255,0.14)]">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            className="text-[#d9b8ff] animate-[logout-pulse_1.4s_ease-in-out_infinite]"
            aria-hidden="true"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </div>

        <p className="m-0 font-['Bebas_Neue',sans-serif] text-[1.55rem] tracking-[0.08em] text-white">
          Saindo...
        </p>
        <p className="m-0 mt-2 text-[0.9rem] leading-5 text-text-soft">
          Encerrando sua sessão com segurança
        </p>

        <div className="mt-5 flex items-center justify-center gap-1.5" aria-hidden="true">
          <span className="h-1.5 w-1.5 rounded-full bg-[#c795ff] animate-[logout-dot_1.2s_ease-in-out_infinite]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#c795ff] animate-[logout-dot_1.2s_ease-in-out_0.2s_infinite]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#c795ff] animate-[logout-dot_1.2s_ease-in-out_0.4s_infinite]" />
        </div>
      </div>
    </div>
  );
}
