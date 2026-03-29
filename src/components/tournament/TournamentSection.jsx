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
        <section className="tournaments" id="torneios">
            <div className="section-title">
                <h2>Torneios em destaque</h2>
            </div>
            <div className="banner-grid">
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
                                  className="banner-card"
                                  key={item.id}
                                  style={{ "--format-color": cor, cursor: "pointer" }}
                                  onClick={() => navigate(`/torneios/${item.id}`)}
                              >
                                  <div className="banner-card__accent" />
                                  <div className="banner-card__top">
                                      <span className="format-pill">{formato.toUpperCase()}</span>
                                      {status && (
                                          <span className={`banner-status banner-status--${status}`}>
                                              {STATUS_LABEL[status] || status}
                                          </span>
                                      )}
                                  </div>
                                  <h3 className="banner-card__title">{item.nome}</h3>
                                  <p className="banner-card__date">
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                                      {data}
                                  </p>
                                  {premio && (
                                      <div className="banner-card__prize">
                                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" /></svg>
                                          <strong>{premio}</strong>
                                      </div>
                                  )}
                              </article>
                          );
                      })}
            </div>
        </section>
    );
}
