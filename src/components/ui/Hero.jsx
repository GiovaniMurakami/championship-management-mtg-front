import { useSiteEstatisticas, formatSiteStatValue } from "../../hooks/useSiteEstatisticas";

export function Hero({ onOpenAuth, isAuthenticated }) {
  const { stats, loading } = useSiteEstatisticas();

  const statItems = [
    { label: "Torneios realizados", value: stats.torneiosRealizados, color: "#c795ff" },
    { label: "Jogadores ativos", value: stats.jogadoresAtivos, color: "#2ccfb4" },
    { label: "Formatos suportados", value: stats.formatosSuportados, color: "#f0b429" },
  ];

  return (
    <section className="relative overflow-hidden border border-[rgba(217,180,255,0.18)] rounded-3xl mb-10 bg-[radial-gradient(ellipse_at_75%_0%,rgba(123,34,246,0.45),transparent_45%),radial-gradient(ellipse_at_10%_100%,rgba(81,24,164,0.55),transparent_40%),linear-gradient(145deg,#0f0920,#160c30_50%,#1e1040)]">

      {/* Decorative grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(199,149,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(199,149,255,1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Decorative glowing orb */}
      <div className="absolute top-[-60px] right-[-60px] w-[320px] h-[320px] rounded-full bg-[radial-gradient(circle,rgba(167,79,255,0.22),transparent_70%)] pointer-events-none" />

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-[linear-gradient(90deg,transparent,#2ccfb4,#a855f7,#c795ff,#7c3aed,transparent)]" />

      <div className="relative px-[clamp(1.4rem,3vw,2.8rem)] pt-[clamp(2rem,4vw,3.2rem)] pb-[clamp(1.8rem,3.5vw,2.8rem)]">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-[#2ccfb4] shadow-[0_0_8px_rgba(44,207,180,0.8)]" />
          <p className="m-0 text-[#2ccfb4] font-['Bebas_Neue',sans-serif] tracking-[0.14em] text-[0.95rem]">
            Liga competitiva de Magic
          </p>
        </div>

        {/* Headline */}
        <h1 className="mt-0 mb-4 mx-0 max-w-[720px] text-[clamp(2.4rem,5.5vw,4.2rem)] leading-[0.92] font-['Bebas_Neue',sans-serif] tracking-[0.03em] text-[#f5edff]">
          Torneios com energia de{" "}
          <span className="text-gradient-brand">stream</span>,{" "}
          foco competitivo e a vibe{" "}
          <span className="text-gradient-teal">da cena BR</span>.
        </h1>

        {/* Subtitle */}
        <p className="m-0 mb-7 max-w-[580px] text-[#beafd7] text-[1rem] leading-[1.65]">
          Participe dos torneios, construa seus decks e acompanhe as classificações em tempo real. A plataforma definitiva para jogadores competitivos.
        </p>

        {/* CTA buttons */}
        {!isAuthenticated && (
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onOpenAuth?.("register")}
              className="inline-flex items-center gap-2 px-6 py-[0.75rem] rounded-xl font-bold text-[0.95rem] text-white cursor-pointer bg-gradient-to-br from-[#9333ea] to-[#5b21b6] border border-[rgba(199,149,255,0.5)] shadow-[0_4px_20px_rgba(147,51,234,0.35)] transition-all duration-200 hover:shadow-[0_6px_28px_rgba(147,51,234,0.55)] hover:-translate-y-[2px] active:translate-y-0"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
              Criar conta grátis
            </button>
            <button
              type="button"
              onClick={() => onOpenAuth?.("login")}
              className="inline-flex items-center gap-2 px-6 py-[0.75rem] rounded-xl font-bold text-[0.95rem] text-[#d4a8ff] cursor-pointer bg-[rgba(167,79,255,0.1)] border border-[rgba(199,149,255,0.3)] transition-all duration-200 hover:bg-[rgba(167,79,255,0.2)] hover:border-[rgba(199,149,255,0.6)] hover:text-white hover:-translate-y-[2px]"
            >
              Entrar na plataforma
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        )}

        {/* Stats row */}
        <div className="flex flex-wrap gap-x-6 gap-y-3 mt-7 pt-6 border-t border-[rgba(217,180,255,0.12)]">
          {statItems.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-[0.15rem]">
              <span
                className="font-['Bebas_Neue',sans-serif] text-[1.6rem] leading-none tracking-[0.03em]"
                style={{ color: stat.color, textShadow: `0 0 12px ${stat.color}55` }}
              >
                {loading ? "—" : formatSiteStatValue(stat.value)}
              </span>
              <span className="text-[0.75rem] text-[#8b7aab] font-medium tracking-[0.04em] uppercase">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
