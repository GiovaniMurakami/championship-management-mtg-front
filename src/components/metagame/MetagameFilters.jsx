import { SelectField } from "../ui/SelectField";

export function MetagameFormatNav({ formato, formatos, onFormato }) {
  return (
    <nav
      className="flex flex-wrap items-center gap-x-1 gap-y-1 mb-4 pb-3 border-b border-line-soft text-[0.9rem]"
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
      <span className="text-[0.8rem] text-text-muted whitespace-nowrap">Decks dos últimos</span>
      <SelectField
        size="compact"
        value={String(dias)}
        onChange={(e) => onDias(Number(e.target.value))}
        className="!w-auto min-w-[6.75rem]"
        wrapperClassName="w-auto"
        aria-label="Período em dias"
        options={diasOpcoes.map((d) => ({ value: String(d), label: `${d} dias` }))}
      />
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
