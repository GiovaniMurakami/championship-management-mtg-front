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
  return (
    <section className="tournaments" id="torneios">
      <div className="section-title">
        <h2>Torneios em destaque</h2>
        <span>mock data</span>
      </div>
      <div className="banner-grid">
        {TOURNAMENT_BANNERS.map((banner) => (
          <article className="banner-card" key={banner.id}>
            <p className="format-pill">{banner.formato}</p>
            <h3>{banner.titulo}</h3>
            <p>{banner.data}</p>
            <strong>{banner.premio}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
