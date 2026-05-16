export const TOURNAMENT_FORMATS = [
  { value: "standard", label: "Standard" },
  { value: "modern", label: "Modern" },
  { value: "pioneer", label: "Pioneer" },
  { value: "pauper", label: "Pauper" },
  { value: "commander", label: "Commander" },
  { value: "commander500", label: "Commander 500" },
];

export const TOURNAMENT_FORMAT_LABELS = Object.fromEntries(
  TOURNAMENT_FORMATS.map((format) => [format.value, format.label]),
);

export const getTournamentFormatLabel = (formato) =>
  TOURNAMENT_FORMAT_LABELS[formato] || formato || "—";

export const TOP_CUT_OPTIONS = [
  { value: "", label: "Sem corte" },
  { value: "2", label: "Top 2" },
  { value: "4", label: "Top 4" },
  { value: "8", label: "Top 8" },
  { value: "16", label: "Top 16" },
];

/** Classes de badge para status de torneio/liga. */
export const STATUS_BADGE_CLASS = {
  inscricoes_abertas: "bg-[rgba(34,197,94,0.2)] text-[#22c55e] border border-[#22c55e]",
  em_andamento:       "bg-[rgba(251,191,36,0.2)] text-[#fbbf24] border border-[#fbbf24]",
  finalizado:         "bg-[rgba(239,68,68,0.2)] text-[#ef4444] border border-[#ef4444]",
};

/** Labels legíveis de status. */
export const STATUS_LABEL = {
  inscricoes_abertas: "Inscrições Abertas",
  em_andamento:       "Em Andamento",
  finalizado:         "Finalizado",
};

/** Badge compacto para cards de torneio dentro de uma liga. */
export const TORNEIO_STATUS_BADGE = {
  inscricoes_abertas: "bg-[rgba(34,197,94,0.15)] text-[#4ade80] border border-[rgba(34,197,94,0.4)]",
  em_andamento:       "bg-[rgba(251,191,36,0.15)] text-[#fbbf24] border border-[rgba(251,191,36,0.4)]",
  finalizado:         "bg-[rgba(148,163,184,0.12)] text-[#94a3b8] border border-[rgba(148,163,184,0.3)]",
};

export const TORNEIO_STATUS_LABEL = {
  inscricoes_abertas: "Inscrições",
  em_andamento:       "Ao Vivo",
  finalizado:         "Finalizado",
};
