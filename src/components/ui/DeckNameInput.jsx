import { useId, useState } from "react";

export function DeckNameInput({ label, value, onChange, options, disabled }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const matches = [...new Set(options)].filter(name => name.toLocaleLowerCase().includes(value.toLocaleLowerCase())).slice(0, 8);
  const choose = name => { onChange(name); setOpen(false); };
  return <div className="min-w-0" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <label htmlFor={id} className="mb-1 block text-xs font-medium text-text-soft">{label}</label>
    <input id={id} role="combobox" aria-autocomplete="list" aria-expanded={open && matches.length > 0} aria-controls={`${id}-options`} aria-activedescendant={open && matches[active] ? `${id}-${active}` : undefined}
      required maxLength={100} disabled={disabled} value={value} placeholder="Buscar deck…" autoComplete="off"
      className="h-9 w-full rounded-lg border border-line bg-surface px-3 text-sm text-text-main outline-none focus:border-brand"
      onFocus={() => setOpen(true)} onChange={event => { onChange(event.target.value); setActive(0); setOpen(true); }}
      onKeyDown={event => {
        if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); setOpen(false); }
        if (event.key === "ArrowDown") { event.preventDefault(); setOpen(true); setActive(index => Math.min(index + 1, Math.max(0, matches.length - 1))); }
        if (event.key === "ArrowUp") { event.preventDefault(); setActive(index => Math.max(0, index - 1)); }
        if (event.key === "Enter" && open && matches[active]) { event.preventDefault(); choose(matches[active]); }
      }} />
    {open && matches.length > 0 && <div id={`${id}-options`} role="listbox" aria-label={`Sugestões para ${label}`} className="mt-1 max-h-32 overflow-y-auto rounded-lg border border-line bg-[#191022] p-1 shadow-lg">
      {matches.map((name, index) => <button type="button" role="option" aria-selected={active === index} id={`${id}-${index}`} key={name}
        className={`block w-full truncate rounded px-2 py-1.5 text-left text-xs text-text-main hover:bg-brand/20 ${active === index ? "bg-brand/15" : ""}`}
        onMouseDown={event => event.preventDefault()} onClick={() => choose(name)}>{name}</button>)}
    </div>}
  </div>;
}
