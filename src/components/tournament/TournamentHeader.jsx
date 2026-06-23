import { Skeleton } from "../ui/Skeleton";
import { getTournamentFormatLabel } from "../../constants/tournament";
import { ExpandableText } from "./ExpandableText";

const STATUS_CONFIG = {
  inscricoes_abertas: {
    label: "Inscricoes Abertas",
    dot: "#4ade80",
    badge: "bg-[rgba(34,197,94,0.14)] text-[#4ade80] border border-[rgba(34,197,94,0.35)]",
  },
  em_andamento: {
    label: "Em Andamento",
    dot: "#fbbf24",
    badge: "bg-[rgba(251,191,36,0.14)] text-[#fbbf24] border border-[rgba(251,191,36,0.35)]",
  },
  finalizado: {
    label: "Finalizado",
    dot: "#f87171",
    badge: "bg-[rgba(239,68,68,0.14)] text-[#f87171] border border-[rgba(239,68,68,0.35)]",
  },
};

const DEFAULT_STATUS = {
  label: "—",
  dot: "#beafd7",
  badge: "bg-[rgba(255,255,255,0.06)] text-[#beafd7] border border-[rgba(217,180,255,0.2)]",
};

function StatChip({ icon, label, value, accent }) {
  return (
    <div className="flex items-center gap-[0.5rem] px-3 py-[0.45rem] rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(217,180,255,0.14)] min-w-0 max-md:basis-[calc(50%-0.25rem)] max-md:flex-1">
      <span style={accent ? { color: accent } : undefined} className={`flex-shrink-0 ${accent ? undefined : "text-[#8b7aab]"}`}>{icon}</span>
      <span className="text-[0.78rem] text-[#8b7aab] font-medium whitespace-nowrap">{label}</span>
      <span className="text-[0.85rem] font-semibold text-[#f5edff] break-words min-w-0">{value}</span>
    </div>
  );
}

const IconFormat = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M4 7h16M4 12h16M4 17h10" /></svg>;
const IconRound = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
const IconPlayers = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const IconViews = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" /><circle cx="12" cy="12" r="3" /></svg>;
const IconDate = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;

export function TournamentHeader({ torneio, loading, className = "" }) {
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString("pt-BR", { timeZone: "UTC" });
  };

  if (loading) {
    return (
      <div className={`mb-8 max-[480px]:mb-5 ${className}`}>
        <Skeleton width="110px" height="1.5rem" radius="999px" className="mb-3" />
        <Skeleton width="52%" height="clamp(2rem,4vw,3rem)" radius="0.4rem" className="mb-5" />
        <div className="flex gap-2 flex-wrap">
          <Skeleton width="132px" height="2rem" radius="0.75rem" />
          <Skeleton width="148px" height="2rem" radius="0.75rem" />
          <Skeleton width="124px" height="2rem" radius="0.75rem" />
        </div>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[torneio?.status] || DEFAULT_STATUS;

  return (
    <div className={`mb-8 max-[480px]:mb-5 ${className}`}>
      {torneio && (
        <div className="flex items-center gap-2 mb-3">
          <span className={`inline-flex items-center gap-[0.4rem] px-3 py-[0.22rem] rounded-full text-[0.75rem] font-semibold uppercase tracking-[0.06em] ${statusCfg.badge}`}>
            <span className="w-[6px] h-[6px] rounded-full flex-shrink-0" style={{ backgroundColor: statusCfg.dot, boxShadow: `0 0 6px ${statusCfg.dot}` }} />
            {statusCfg.label}
          </span>
        </div>
      )}

      <h1 className="font-['Bebas_Neue',sans-serif] text-[clamp(2rem,4vw,3rem)] tracking-[0.04em] m-0 mb-5 text-white [text-shadow:0_2px_16px_rgba(167,79,255,0.25)] leading-[1.0]">
        {torneio?.nome || torneio?.torneioNome || "Torneio"}
      </h1>

      {torneio?.descricao && (
        <div className="mb-4 rounded-2xl border border-[rgba(217,180,255,0.16)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-[#d8d1e9] text-[0.92rem]">
          <ExpandableText
            label="Descricao"
            text={torneio.descricao}
            maxLength={220}
            alwaysToggle
            collapseMode="section"
            collapsedLabel="Mostrar"
            expandedLabel="Ocultar"
            headerClassName="flex w-full items-center justify-between gap-3 border-none bg-transparent p-0 text-left text-[#a78bfa] cursor-pointer hover:text-white transition-colors"
            labelClassName="text-[0.72rem] uppercase tracking-[0.08em] font-semibold"
            toggleTextClassName="text-[#c795ff]"
          />
        </div>
      )}

      {torneio?.regras && (
        <div className="mb-5 rounded-2xl border border-[rgba(56,189,248,0.16)] bg-[rgba(56,189,248,0.05)] px-4 py-3 text-[#d5ebff] text-[0.9rem]">
          <ExpandableText
            label="Regras do Torneio"
            text={torneio.regras}
            maxLength={260}
            alwaysToggle
            collapseMode="section"
            collapsedLabel="Mostrar"
            expandedLabel="Ocultar"
            headerClassName="flex w-full items-center justify-between gap-3 border-none bg-transparent p-0 text-left text-[#7dd3fc] cursor-pointer hover:text-white transition-colors"
            labelClassName="text-[0.72rem] uppercase tracking-[0.08em] font-semibold"
            toggleTextClassName="text-[#7dd3fc]"
          />
        </div>
      )}

      {torneio && (
        <div className="flex flex-wrap gap-2 max-md:gap-[0.4rem]">
          {torneio.formato && <StatChip icon={<IconFormat />} label="Formato" value={getTournamentFormatLabel(torneio.formato)} accent="#c795ff" />}
          <StatChip icon={<IconRound />} label="Rodada" value={torneio.totalRodadas ? `${torneio.rodadaAtual ?? 0} / ${torneio.totalRodadas}` : `${torneio.rodadaAtual ?? 0} / Sem limite`} accent="#2ccfb4" />
          {torneio.totalInscritos != null && <StatChip icon={<IconPlayers />} label="Inscritos" value={torneio.maxJogadores != null ? `${torneio.totalInscritos} / ${torneio.maxJogadores}` : torneio.totalCheckin != null ? `${torneio.totalInscritos} (${torneio.totalCheckin} check-in)` : String(torneio.totalInscritos)} accent="#2ccfb4" />}
          {torneio.visualizacoes != null && <StatChip icon={<IconViews />} label="Visualizacoes" value={String(torneio.visualizacoes)} accent="#f0b429" />}
          {torneio.horario && <StatChip icon={<IconDate />} label="Data" value={formatDate(torneio.horario)} />}
          {torneio.linkLive && (
            <a href={torneio.linkLive} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-[0.4rem] px-3 py-[0.45rem] rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#f87171] text-[0.82rem] font-semibold no-underline transition-all duration-200 hover:bg-[rgba(239,68,68,0.18)] hover:text-[#fca5a5] max-md:w-full max-md:justify-center">
              Assistir ao vivo
            </a>
          )}
        </div>
      )}
    </div>
  );
}
