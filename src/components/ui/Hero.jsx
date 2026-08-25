import { useSiteEstatisticas, formatSiteStatValue } from "../../hooks/useSiteEstatisticas";
import { Button } from "./Button";

export function Hero({ onOpenAuth, isAuthenticated }) {
  const { stats, loading } = useSiteEstatisticas();
  const statItems = [
    { label: "Torneios realizados", value: stats.torneiosRealizados },
    { label: "Jogadores ativos", value: stats.jogadoresAtivos },
    { label: "Formatos suportados", value: stats.formatosSuportados },
  ];

  return (
    <section className="relative mb-12 overflow-hidden rounded-[2rem] border border-line-soft bg-surface shadow-card">
      <div className="absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_at_top,rgba(126,61,181,0.16),transparent_70%)] pointer-events-none" />
      <div className="relative px-[clamp(1.5rem,5vw,4.5rem)] py-[clamp(3.2rem,7vw,6rem)] text-center">
        <p className="m-0 mb-4 text-sm font-semibold text-brand">Magic competitivo, organizado.</p>
        <h1 className="mx-auto mt-0 mb-5 max-w-[780px] font-display text-[clamp(2.5rem,6vw,4.8rem)] font-bold tracking-[-0.045em] leading-[1.02] text-text-main">
          Seus torneios, decks e resultados em um só lugar.
        </h1>
        <p className="mx-auto mb-8 max-w-[620px] text-[clamp(1rem,2vw,1.2rem)] leading-relaxed text-text-soft">
          Organize campeonatos, acompanhe pareamentos em tempo real e entenda o metagame da comunidade brasileira.
        </p>
        {!isAuthenticated && (
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="lg" onClick={() => onOpenAuth?.("register")}>Criar conta grátis</Button>
            <Button variant="secondary" size="lg" onClick={() => onOpenAuth?.("login")}>Entrar</Button>
          </div>
        )}
        <dl className="mx-auto mt-12 grid max-w-[620px] grid-cols-3 divide-x divide-line-soft border-t border-line-soft pt-7 max-[560px]:grid-cols-1 max-[560px]:divide-x-0 max-[560px]:divide-y">
          {statItems.map((stat) => (
            <div key={stat.label} className="px-5 max-[560px]:py-4">
              <dd className="m-0 font-display text-2xl font-bold tracking-[-0.03em] text-text-main">
                {loading ? "—" : formatSiteStatValue(stat.value)}
              </dd>
              <dt className="mt-1 text-xs font-medium text-text-muted">{stat.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
