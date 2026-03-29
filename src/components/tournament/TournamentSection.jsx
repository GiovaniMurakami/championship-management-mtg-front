import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listarTorneios } from "../../services/backendApi";
import { useAuth } from "../../hooks/useAuth";
import { SkeletonBannerCard } from "../ui/Skeleton";

const FORMAT_COLORS = {
  modern: "#a78bfa",
  pioneer: "#f59e0b",
  standard: "#34d399",
  legacy: "#f87171",
  vintage: "#60a5fa",
  commander: "#fb923c",
  draft: "#e879f9",
  sealed: "#38bdf8",
};

const getFormatColor = (formato) =>
  FORMAT_COLORS[formato?.toLowerCase()] || "#c795ff";

const STATUS_LABEL = {
  inscricoes_abertas: "Inscrições Abertas",
  em_andamento: "Em Andamento",
  finalizado: "Finalizado",
};

const STATUS_STYLE = {
  inscricoes_abertas: "bg-[rgba(34,197,94,0.15)] text-[#4ade80]",
  em_andamento: "bg-[rgba(251,191,36,0.15)] text-[#fbbf24]",
};

export function TournamentSection() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [torneios, setTorneios] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    listarTorneios(token)
      .then((data) => setTorneios(data.torneios || []))
      .catch((error) => console.error("Erro ao carregar torneios:", error))
      .finally(() => setLoading(false));
  }, [token]);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("pt-BR", { timeZone: "UTC" });

  const items = torneios
    .filter((t) => t.status === "inscricoes_abertas" || t.status === "em_andamento")
    .slice(0, 3);

  if (!loading && items.length === 0) return null;

  return (
    <section className="mb-10" id="torneios">
      <div className="flex items-center justify-between mt-[2.1rem] mb-5">
        <div className="flex items-center gap-3">
          <div className="w-1 h-7 rounded-full bg-[linear-gradient(180deg,#c795ff,#7c3aed)]" />
          <h2 className="m-0 font-['Bebas_Neue',sans-serif] tracking-[0.06em] text-[2.1rem]">
            Torneios em destaque
          </h2>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 max-nav:grid-cols-1">
        {loading
          ? [1, 2, 3].map((i) => <SkeletonBannerCard key={i} />)
          : items.map((item) => {
              const formato = item.formato || "—";
              const cor = getFormatColor(formato);
              const data = item.horario ? formatDate(item.horario) : "—";
              const premio = item.premio || null;
              const status = item.status;

              return (
                <article
                  key={item.id}
                  className="relative border border-[rgba(217,180,255,0.18)] rounded-[1.1rem] px-5 pt-5 pb-[1.1rem] bg-[linear-gradient(160deg,rgba(22,12,46,0.98),rgba(14,8,30,0.98))] shadow-[0_4px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.04)] overflow-hidden cursor-pointer card-hover-glow"
                  style={{ "--format-color": cor, "--glow-color": cor }}
                  onClick={() => navigate(`/torneios/${item.id}`)}
                >
                  {/* Accent bar */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[3px]"
                    style={{ background: `linear-gradient(90deg, transparent, ${cor}, transparent)`, opacity: 0.9 }}
                  />
                  {/* Subtle corner glow */}
                  <div
                    className="absolute top-0 left-0 w-[120px] h-[120px] pointer-events-none opacity-[0.06]"
                    style={{ background: `radial-gradient(circle at 0% 0%, ${cor}, transparent 70%)` }}
                  />

                  <div className="flex items-center justify-between gap-2 mb-[0.85rem]">
                    <span
                      className="inline-flex border rounded-full px-[0.65rem] py-[0.18rem] text-[0.72rem] font-semibold tracking-[0.08em]"
                      style={{
                        borderColor: `color-mix(in srgb, ${cor} 45%, transparent)`,
                        background: `color-mix(in srgb, ${cor} 16%, transparent)`,
                        color: cor,
                      }}
                    >
                      {formato.toUpperCase()}
                    </span>
                    {status && (
                      <span className={`text-[0.68rem] font-medium tracking-[0.05em] px-2 py-[0.15rem] rounded-full ${STATUS_STYLE[status] ?? ""}`}>
                        {STATUS_LABEL[status] || status}
                      </span>
                    )}
                  </div>

                  <h3 className="m-0 mb-3 font-['Bebas_Neue',sans-serif] text-[1.45rem] tracking-[0.04em] leading-[1.1] text-[#f5edff]">
                    {item.nome}
                  </h3>

                  <p className="flex items-center gap-[0.4rem] m-0 mb-[0.55rem] text-[#beafd7] text-[0.82rem]">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    {data}
                  </p>

                  {premio && (
                    <div className="flex items-center gap-[0.4rem] mt-[0.6rem] pt-[0.65rem] border-t border-[rgba(217,180,255,0.2)]">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true" style={{ color: cor, flexShrink: 0 }}>
                        <circle cx="12" cy="8" r="6" />
                        <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
                      </svg>
                      <strong className="text-[#efe6ff] text-[0.85rem] font-semibold">{premio}</strong>
                    </div>
                  )}
                </article>
              );
            })}
      </div>
    </section>
  );
}
