import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listarTorneios } from "../../services/backendApi";
import { useAuth } from "../../hooks/useAuth";
import { SkeletonBannerCard } from "../ui/Skeleton";
import { getTournamentFormatLabel } from "../../constants/tournament";
import { logError } from "../../utils/logger";
import { formatBrasiliaDate } from "../../utils/brasiliaTime";

const FORMAT_COLORS = {
  modern: "#a78bfa",
  pioneer: "#f59e0b",
  standard: "#34d399",
  legacy: "#f87171",
  vintage: "#60a5fa",
  commander: "#fb923c",
  commander500: "#f59e0b",
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
    const load = async () => {
      setLoading(true);
      try {
        const [abertos, andamento] = await Promise.all([
          listarTorneios(token, { status: "inscricoes_abertas", limite: 3, offset: 0 }),
          listarTorneios(token, { status: "em_andamento", limite: 3, offset: 0 }),
        ]);
        const merged = [...(abertos.torneios || []), ...(andamento.torneios || [])]
          .sort((a, b) => new Date(a.horario) - new Date(b.horario))
          .slice(0, 3);
        setTorneios(merged);
      } catch (error) {
        logError("Erro ao carregar torneios:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const formatDate = (dateString) => formatBrasiliaDate(dateString);

  const items = torneios;

  if (!loading && items.length === 0) return null;

  return (
    <section className="mb-10" id="torneios">
      <div className="flex items-center justify-between mt-[2.1rem] mb-5">
        <div>
          <h2 className="m-0 font-display font-bold tracking-[-0.035em] text-[2rem] text-text-main">
            Torneios em destaque
          </h2>
          <p className="m-0 mt-1 text-sm text-text-muted">Inscrições abertas e eventos em andamento.</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 max-nav:grid-cols-1">
        {loading
          ? [1, 2, 3].map((i) => <SkeletonBannerCard key={i} />)
          : items.map((item) => {
            const formato = item.formato || "—";
            const cor = getFormatColor(formato);
            const data = item.horario ? formatDate(item.horario) : "—";
            const descricao = item.descricao || item.premio || null;
            const status = item.status;
            const banner = item.bannerUrl || null;

            return (
              <article
                key={item.id}
                className="relative border border-line-soft rounded-2xl bg-surface shadow-card overflow-hidden cursor-pointer transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-overlay"
                style={{ "--format-color": cor, "--glow-color": cor }}
                onClick={() => navigate(`/torneios/${item.id}`)}
              >
                {/* Banner image */}
                {banner ? (
                  <div className="relative w-full h-[160px] overflow-hidden">
                    <img
                      src={banner}
                      alt={`Banner de ${item.nome}`}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/45" />
                    {/* Accent bar over banner */}
                    <div
                      className="absolute top-0 left-0 right-0 h-[3px]"
                      style={{ background: `linear-gradient(90deg, transparent, ${cor}, transparent)`, opacity: 0.9 }}
                    />
                  </div>
                ) : (
                  /* Accent bar (no banner) */
                  <div
                    className="absolute top-0 left-0 right-0 h-[3px]"
                    style={{ background: `linear-gradient(90deg, transparent, ${cor}, transparent)`, opacity: 0.9 }}
                  />
                )}

                <div className={`px-5 pb-[1.1rem] ${banner ? "pt-3" : "pt-5"}`}>
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
                      {getTournamentFormatLabel(formato).toUpperCase()}
                    </span>
                    {status && (
                      <span className={`text-[0.68rem] font-medium tracking-[0.05em] px-2 py-[0.15rem] rounded-full ${STATUS_STYLE[status] ?? ""}`}>
                        {STATUS_LABEL[status] || status}
                      </span>
                    )}
                  </div>

                  <h3 className="m-0 mb-3 font-display text-[1.3rem] font-semibold tracking-[-0.025em] leading-[1.2] text-text-main">
                    {item.nome}
                  </h3>

                  <p className="flex items-center gap-[0.4rem] m-0 mb-[0.55rem] text-text-soft text-[0.82rem]">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    {data}
                  </p>

                  {descricao && (
                    <p className="m-0 mt-[0.6rem] pt-[0.65rem] border-t border-line text-[0.83rem] leading-[1.5] text-text-soft line-clamp-3">
                      {descricao}
                    </p>
                  )}

                  {item.visualizacoes != null && (
                    <div className="flex items-center gap-[0.35rem] mt-[0.75rem] text-[0.76rem] text-text-soft">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true" style={{ color: cor, flexShrink: 0 }}>
                        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      <span>{item.visualizacoes} visualizações</span>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
      </div>
    </section>
  );
}
