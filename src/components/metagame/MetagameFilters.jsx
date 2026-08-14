export function MetagameFormatNav({ formato, formatos, onFormato }) {
  return (
    <nav
      className="flex flex-wrap items-center gap-x-1 gap-y-1 mb-4 pb-3 border-b border-[rgba(217,180,255,0.12)] text-[0.9rem]"
      aria-label="Formatos"
    >
      {formatos.map((f, idx) => (
        <span key={f.value} className="inline-flex items-center">
          {idx > 0 && <span className="mx-2 text-[#5c5270]" aria-hidden="true">|</span>}
          <button
            type="button"
            onClick={() => onFormato(f.value)}
            className={`bg-transparent border-none p-0 cursor-pointer font-semibold ${
              f.value === formato ? "text-white" : "text-[#d9b4ff] hover:text-white"
            }`}
          >
            {f.label}
          </button>
        </span>
      ))}
    </nav>
  );
}

export function MetagamePeriodoSelect({ dias, diasOpcoes, onDias }) {
  return (
    <label className="flex items-center gap-2 shrink-0">
      <span className="text-[0.8rem] text-[#8f82ad] whitespace-nowrap">Decks dos últimos</span>
      <select
        value={String(dias)}
        onChange={(e) => onDias(Number(e.target.value))}
        className="border border-[rgba(217,180,255,0.2)] rounded-[0.7rem] bg-white/[0.03] text-[#f5edff] px-3 py-1.5 text-[0.88rem] [color-scheme:dark] [&_option]:bg-[#1a1129]"
      >
        {diasOpcoes.map((d) => (
          <option key={d} value={d}>{d} dias</option>
        ))}
      </select>
    </label>
  );
}

export function MetagameFilters({ formato, dias, onFormato, onDias, formatos, diasOpcoes }) {
  return (
    <div className="mb-5">
      <MetagameFormatNav formato={formato} formatos={formatos} onFormato={onFormato} />
      <MetagamePeriodoSelect dias={dias} diasOpcoes={diasOpcoes} onDias={onDias} />
    </div>
  );
}
