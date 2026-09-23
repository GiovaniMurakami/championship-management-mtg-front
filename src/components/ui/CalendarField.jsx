import { useId, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { BaseModal } from "./BaseModal";
import { BTN_GHOST, BTN_SECONDARY, TOURNAMENT_INPUT_CLASS } from "../../styles/uiClasses";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const isoDate = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const parseDate = value => value ? new Date(`${value}T12:00:00`) : new Date();

/** Date input with an accessible, themed calendar; values remain YYYY-MM-DD. */
export function CalendarField({ label, value, onChange, min, max, rangeStart, rangeEnd, inline = false }) {
  const id = useId();
  const triggerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => parseDate(value));
  const [focused, setFocused] = useState(value || isoDate(new Date()));
  const today = isoDate(new Date());
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const count = new Date(year, monthIndex + 1, 0).getDate();
  const title = month.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const disabled = date => Boolean((min && date < min) || (max && date > max));
  const close = () => { setOpen(false); triggerRef.current?.focus(); };
  const show = () => {
    const initial = value || (min && today < min ? min : max && today > max ? max : today);
    setMonth(parseDate(initial));
    setFocused(initial);
    setOpen(true);
  };
  const choose = date => { onChange(date); close(); };
  const moveMonth = offset => {
    const next = new Date(year, monthIndex + offset, 1, 12);
    setMonth(next);
    const first = isoDate(next);
    const last = isoDate(new Date(next.getFullYear(), next.getMonth() + 1, 0));
    setFocused(min && min > first && min <= last ? min : first);
  };
  const onDayKey = (event, date) => {
    const offsets = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7, Home: -date.getDay(), End: 6 - date.getDay() };
    if (!(event.key in offsets) && event.key !== "PageUp" && event.key !== "PageDown") return;
    event.preventDefault();
    const next = new Date(date);
    if (event.key === "PageUp" || event.key === "PageDown") {
      const day = next.getDate();
      next.setDate(1);
      next.setMonth(next.getMonth() + (event.key === "PageUp" ? -1 : 1));
      next.setDate(Math.min(day, new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()));
    } else next.setDate(next.getDate() + offsets[event.key]);
    if (disabled(isoDate(next))) return;
    setMonth(next);
    setFocused(isoDate(next));
  };

  const Container = inline ? "div" : BaseModal;
  return <div className="grid min-w-0 gap-1.5">
    {!inline && <>
    <label htmlFor={id} className="text-sm font-medium text-text-soft">{label}</label>
    <div className="relative">
      <input id={id} type="date" required value={value} min={min} max={max}
        onChange={event => onChange(event.target.value)}
        onClick={event => { event.preventDefault(); show(); }}
        className={`${TOURNAMENT_INPUT_CLASS} pr-12 [&::-webkit-calendar-picker-indicator]:hidden`}
        onKeyDown={event => { if (event.altKey && event.key === "ArrowDown") { event.preventDefault(); show(); } }} />
      <button ref={triggerRef} type="button" aria-label={`Abrir calendário: ${label}`} aria-haspopup="dialog" aria-expanded={open}
        onClick={show} className="absolute inset-y-0 right-0 flex w-11 cursor-pointer items-center justify-center rounded-r-lg text-brand transition-colors hover:bg-brand/10 focus-visible:outline-2 focus-visible:outline-brand">
        <CalendarDays size={20} aria-hidden="true" />
      </button>
    </div>
    </>}
    <Container {...(inline ? {} : { isOpen: open, onClose: close, ariaLabelledBy: `${id}-title`, ariaDescribedBy: `${id}-hint` })}>
      {!inline && <>
      <div className="mb-5 flex items-center justify-between border-b border-line-soft pb-4">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-brand/10 p-2.5 text-brand"><CalendarDays size={22} aria-hidden="true" /></span>
          <div><h2 id={`${id}-title`} className="m-0 text-lg font-semibold text-text-main">{label === "De" ? "Data inicial" : label === "Até" ? "Data final" : label}</h2>
            <p id={`${id}-hint`} className="m-0 mt-0.5 text-xs text-text-muted">Escolha um dia para o período.</p></div>
        </div>
        <button type="button" onClick={close} aria-label="Fechar calendário" className={`${BTN_GHOST} flex min-h-11 min-w-11 items-center justify-center !p-2`}><X size={20} /></button>
      </div>
      </>}
      <div className="mb-3 flex items-center justify-between">
        <button type="button" onClick={() => moveMonth(-1)} aria-label="Mês anterior" className={`${BTN_GHOST} min-h-11 !px-3`}><ChevronLeft size={20} /></button>
        <p aria-live="polite" className="m-0 text-base font-semibold capitalize text-text-main">{title}</p>
        <button type="button" onClick={() => moveMonth(1)} aria-label="Próximo mês" className={`${BTN_GHOST} min-h-11 !px-3`}><ChevronRight size={20} /></button>
      </div>
      <div className="grid grid-cols-7" aria-hidden="true">{WEEKDAYS.map(day => <span key={day} className="py-2 text-center text-xs font-medium text-text-muted">{day}</span>)}</div>
      <div role="group" aria-label={`Dias de ${title}`} className="grid grid-cols-7 gap-y-1">
        {Array.from({ length: firstDay }, (_, index) => <span key={`empty-${index}`} />)}
        {Array.from({ length: count }, (_, index) => {
          const date = new Date(year, monthIndex, index + 1, 12);
          const iso = isoDate(date);
          const selected = iso === value;
          const inRange = rangeStart && rangeEnd && iso >= rangeStart && iso <= rangeEnd;
          return <button key={iso} type="button" disabled={disabled(iso)} aria-pressed={selected}
            aria-current={iso === today ? "date" : undefined}
            aria-label={date.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}
            tabIndex={iso === focused ? 0 : -1}
            ref={element => { if (element && open && iso === focused) element.focus(); }}
            onKeyDown={event => onDayKey(event, date)} onClick={() => choose(iso)}
            className={`relative flex min-h-11 cursor-pointer items-center justify-center rounded-lg text-sm tabular-nums transition-colors focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-25 ${selected ? "bg-brand-strong font-semibold text-white shadow-sm" : inRange ? "bg-brand/15 text-text-main hover:bg-brand/25" : "text-text-main hover:bg-surface-hover"}`}>
            {index + 1}{iso === today && <span aria-hidden="true" className={`absolute bottom-1 h-1 w-1 rounded-full ${selected ? "bg-white" : "bg-brand"}`} />}
          </button>;
        })}
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-line-soft pt-4">
        <span className="text-xs text-text-muted">{value ? `Selecionado: ${value.split("-").reverse().join("/")}` : "Nenhuma data selecionada"}</span>
        <button type="button" className={BTN_SECONDARY} disabled={disabled(today)} onClick={() => choose(today)}>Hoje</button>
      </div>
    </Container>
  </div>;
}
