export function ConfirmationIcon({ confirmed, label }) {
  const title = label || (confirmed ? "Resultado confirmado" : "Falta confirmar resultado");

  return (
    <span
      className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-[0.72rem] font-black leading-none ${confirmed ? "border-[rgba(34,197,94,0.38)] bg-[rgba(34,197,94,0.12)] text-[#86efac]" : "border-[rgba(251,191,36,0.35)] bg-[rgba(251,191,36,0.1)] text-[#fde68a]"}`}
      title={title}
      aria-label={title}
    >
      {confirmed ? "✓" : "!"}
    </span>
  );
}

export function ConfirmationSummaryIcon({ confirmation }) {
  const confirmed = confirmation?.fullyConfirmed;
  const title = confirmed
    ? "Resultado confirmado pelos dois jogadores"
    : `${confirmation?.count ?? 0}/${confirmation?.total ?? 2} jogadores confirmaram`;

  return (
    <span
      className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full border px-1.5 text-[0.72rem] font-black leading-none ${confirmed ? "border-[rgba(34,197,94,0.38)] bg-[rgba(34,197,94,0.12)] text-[#86efac]" : "border-[rgba(251,191,36,0.35)] bg-[rgba(251,191,36,0.1)] text-[#fde68a]"}`}
      title={title}
      aria-label={title}
    >
      {confirmed ? "✓✓" : `${confirmation?.count ?? 0}/${confirmation?.total ?? 2}`}
    </span>
  );
}
