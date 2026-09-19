import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Checkbox } from "./Checkbox";

/**
 * Dropdown com seleção múltipla e busca local.
 */
export function MultiSelectDropdown({
  options = [],
  value = [],
  onChange,
  placeholder = "Selecionar…",
  searchPlaceholder = "Buscar…",
  disabled = false,
  emptyLabel = "Nenhuma opção",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const rootRef = useRef(null);
  const searchRef = useRef(null);
  const listId = useId();
  const selected = useMemo(() => new Set((value || []).map(String)), [value]);

  const filtered = useMemo(() => {
    const termo = search.trim().toLowerCase();
    if (!termo) return options;
    return options.filter((opt) => String(opt.label || "").toLowerCase().includes(termo));
  }, [options, search]);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    const onKey = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [open]);

  const toggle = (optionValue) => {
    const id = String(optionValue);
    const next = selected.has(id)
      ? [...selected].filter((item) => item !== id)
      : [...selected, id];
    onChange?.(next);
  };

  const selectedLabels = options
    .filter((opt) => selected.has(String(opt.value)))
    .map((opt) => opt.label);

  let triggerText = placeholder;
  if (selectedLabels.length === 1) triggerText = selectedLabels[0];
  else if (selectedLabels.length > 1) triggerText = `${selectedLabels.length} selecionadas`;

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled || options.length === 0}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((atual) => !atual)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-line bg-white/[0.04] px-[0.8rem] py-[0.7rem] text-left text-[0.95rem] text-text-main outline-none transition-[border-color,background-color,box-shadow] duration-200 hover:border-line-strong hover:bg-white/[0.045] focus:border-[rgba(199,149,255,0.92)] focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(167,79,255,0.22)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className={`min-w-0 truncate ${selectedLabels.length ? "text-text-main" : "text-text-muted"}`}>
          {options.length === 0 ? emptyLabel : triggerText}
        </span>
        <span
          className={`h-2 w-2 shrink-0 rotate-45 border-b-2 border-r-2 border-current text-[rgba(245,237,255,0.72)] transition-transform ${open ? "-translate-y-[1px] rotate-[225deg]" : "-translate-y-[62%]"}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          id={listId}
          role="listbox"
          aria-multiselectable="true"
          className="absolute left-0 right-0 top-[calc(100%+0.4rem)] z-30 overflow-hidden rounded-xl border border-[rgba(217,180,255,0.22)] bg-[rgba(18,12,32,0.98)] shadow-[0_12px_28px_rgba(3,2,8,0.55)]"
        >
          <div className="border-b border-line-soft p-2">
            <input
              ref={searchRef}
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-lg border border-line bg-white/[0.04] px-3 py-2 text-sm text-text-main outline-none placeholder:text-text-muted focus:border-[rgba(199,149,255,0.7)]"
              autoComplete="off"
            />
          </div>
          <div className="max-h-56 overflow-y-auto p-1.5">
            {filtered.length === 0 ? (
              <p className="m-0 px-3 py-2 text-sm text-text-muted">Nenhum resultado.</p>
            ) : (
              filtered.map((opt) => {
                const isSelected = selected.has(String(opt.value));
                return (
                  <label
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors ${
                      isSelected
                        ? "bg-[rgba(167,79,255,0.16)] text-text-main"
                        : "text-text-soft hover:bg-[rgba(167,79,255,0.1)] hover:text-text-main"
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggle(opt.value)}
                      disabled={disabled}
                      aria-label={opt.label}
                    />
                    <span className="min-w-0 flex-1 text-[0.88rem] font-medium [overflow-wrap:anywhere]">
                      {opt.label}
                    </span>
                  </label>
                );
              })
            )}
          </div>
          {selected.size > 0 && (
            <div className="flex items-center justify-between gap-2 border-t border-line-soft px-3 py-2">
              <span className="text-xs text-text-muted">{selected.size} selecionada(s)</span>
              <button
                type="button"
                className="border-0 bg-transparent p-0 text-xs font-semibold text-brand hover:text-[#e0c8ff]"
                onClick={() => onChange?.([])}
              >
                Limpar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
