import { useId, useState } from "react";
import { CalendarDays, ChevronDown, X } from "lucide-react";
import { BTN_PRIMARY, BTN_GHOST, TOURNAMENT_INPUT_CLASS } from "../../styles/uiClasses";
import { CalendarField } from "./CalendarField";
import { BaseModal } from "./BaseModal";

const displayDate = value => value.split("-").reverse().join("/");

export function DateRangeFilter({ dataInicio = "", dataFim = "", onApply }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [inicio, setInicio] = useState(dataInicio);
  const [fim, setFim] = useState(dataFim);
  const [active, setActive] = useState("inicio");
  const invalid = !inicio || !fim || inicio > fim;
  const applied = dataInicio && dataFim;
  const apply = range => { setOpen(false); onApply(range); };
  return <div className="mb-5">
    <button type="button" aria-haspopup="dialog" aria-expanded={open}
      className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-brand ${applied ? "border-brand/30 bg-brand/10 text-text-main hover:bg-brand/15" : "border-line-soft bg-transparent text-text-soft hover:border-line hover:bg-surface-soft hover:text-text-main"}`}
      onClick={() => { setInicio(dataInicio); setFim(dataFim); setActive("inicio"); setOpen(true); }}>
      <CalendarDays size={16} className={applied ? "text-brand" : ""} aria-hidden="true" />
      {applied ? `${displayDate(dataInicio)} — ${displayDate(dataFim)}` : "Filtrar por período"}
      <ChevronDown size={14} aria-hidden="true" />
    </button>
    <BaseModal isOpen={open} onClose={() => setOpen(false)} ariaLabelledBy={`${id}-title`} ariaDescribedBy={`${id}-hint`}>
      <form aria-label="Filtrar por datas" onSubmit={event => { event.preventDefault(); if (!invalid) apply({ dataInicio: inicio, dataFim: fim }); }}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div><h2 id={`${id}-title`} className="m-0 text-lg font-semibold text-text-main">Selecionar período</h2>
            <p id={`${id}-hint`} className="mb-0 mt-1 text-sm text-text-muted">{active === "inicio" ? "Escolha a data inicial." : "Agora escolha a data final."}</p></div>
          <button type="button" aria-label="Fechar período" onClick={() => setOpen(false)} className={`${BTN_GHOST} flex min-h-11 min-w-11 items-center justify-center !p-2`}><X size={18} /></button>
        </div>
        <div className="mb-3 grid grid-cols-2 gap-3">
          <label className={`grid min-w-0 gap-1.5 text-xs font-medium ${active === "inicio" ? "text-brand" : "text-text-soft"}`}>De
            <input type="date" required value={inicio} max={fim || undefined} onFocus={() => setActive("inicio")} onChange={e => setInicio(e.target.value)} className={`${TOURNAMENT_INPUT_CLASS} min-w-0 !px-2 !text-sm [&::-webkit-calendar-picker-indicator]:hidden`} />
          </label>
          <label className={`grid min-w-0 gap-1.5 text-xs font-medium ${active === "fim" ? "text-brand" : "text-text-soft"}`}>Até
            <input type="date" required value={fim} min={inicio || undefined} onFocus={() => setActive("fim")} onChange={e => setFim(e.target.value)} className={`${TOURNAMENT_INPUT_CLASS} min-w-0 !px-2 !text-sm [&::-webkit-calendar-picker-indicator]:hidden`} />
          </label>
        </div>
        <CalendarField key={active} inline label={active === "inicio" ? "De" : "Até"} value={active === "inicio" ? inicio : fim || inicio}
          min={active === "fim" ? inicio || undefined : undefined} max={active === "inicio" ? fim || undefined : undefined}
          rangeStart={inicio} rangeEnd={fim} onChange={value => { if (active === "inicio") { setInicio(value); setActive("fim"); } else setFim(value); }} />
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-line-soft pt-4">
          <button type="button" className={BTN_GHOST} onClick={() => apply({})}>Limpar datas</button>
          <button type="submit" disabled={invalid} className={BTN_PRIMARY}>Aplicar datas</button>
        </div>
      </form>
    </BaseModal>
  </div>;
}
