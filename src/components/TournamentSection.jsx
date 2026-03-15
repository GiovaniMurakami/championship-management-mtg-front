import { useEffect, useState } from "react";
import { listarTorneios } from "../services/backendApi";
import { useAuth } from "../hooks/useAuth";

const TOURNAMENT_BANNERS = [
  {
    id: 1,
    titulo: "Foguete Night Showdown",
    formato: "Modern",
    data: "22 Mar 2026",
    premio: "R$ 1.200 + booster box",
  },
  {
    id: 2,
    titulo: "Mana Clash Open",
    formato: "Pioneer",
    data: "05 Apr 2026",
    premio: "R$ 2.000",
  },
  {
    id: 3,
    titulo: "Purple Crown Championship",
    formato: "Standard",
    data: "18 Apr 2026",
    premio: "Playmat exclusiva + R$ 900",
  },
];

export function TournamentSection() {
  const { token } = useAuth();
  const [torneios, setTorneios] = useState([]);

  useEffect(() => {
    if (token) {
      listarTorneios(token)
        .then((data) => {
          setTorneios(data.torneios || []);
        })
        .catch((error) => {
          console.error("Erro ao carregar torneios:", error);
        });
    }
  }, [token]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const displayedTorneios = torneios.length > 0 ? torneios.slice(0, 3) : TOURNAMENT_BANNERS;

  return (
    <section className="tournaments" id="torneios">
      <div className="section-title">
        <h2>Torneios em destaque</h2>
        <span>{torneios.length > 0 ? "torneios ativos" : "mock data"}</span>
      </div>
      <div className="banner-grid">
        {displayedTorneios.map((banner) => (
          <article className="banner-card" key={banner.id}>
            <p className="format-pill">{banner.formato}</p>
            <h3>{banner.nome || banner.titulo}</h3>
            <p>{banner.horario ? formatDate(banner.horario) : banner.data}</p>
            <strong>{banner.premio || "Torneio MTG"}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
