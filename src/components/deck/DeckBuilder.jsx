import { useState, useRef, useEffect } from "react";
import { CardSearch } from "./CardSearch";
import { DeckList } from "./DeckList";
import { Button, SelectField } from "../ui";
import { FORM_LABEL_CLASS, MODAL_INPUT_CLASS } from "../../styles/uiClasses";

const FORMATS = [
  { value: "standard", label: "Standard" },
  { value: "modern", label: "Modern" },
  { value: "pioneer", label: "Pioneer" },
  { value: "legacy", label: "Legacy" },
  { value: "commander", label: "Commander" },
  { value: "commander500", label: "Commander 500" },
  { value: "pauper", label: "Pauper" },
];

const EXPORT_FORMATS = [
  { key: "arena", label: "MTG Arena" },
  { key: "mtgo", label: "MTGO (.dek)" },
  { key: "txt", label: "Texto (.txt)" },
  { key: "moxfield", label: "Moxfield / Archidekt" },
];

function buildExport(type, deckForm, mainDeck, sideboard, commander) {
  const main = mainDeck ?? [];
  const side = sideboard ?? [];
  const commanderCards = commander ?? [];
  const isCommander = deckForm.formato === "commander" || deckForm.formato === "commander500";
  const sideSectionLabel = isCommander ? "Commander" : "Sideboard";

  switch (type) {
    case "arena": {
      const lines = ["Deck"];
      main.forEach((c) => lines.push(`${c.quantidade} ${c.nome}`));
      if (commanderCards.length > 0) {
        lines.push("", "Commander");
        commanderCards.forEach((c) => lines.push(`${c.quantidade} ${c.nome}`));
      }
      if (side.length > 0) {
        lines.push("", sideSectionLabel);
        side.forEach((c) => lines.push(`${c.quantidade} ${c.nome}`));
      }
      return { content: lines.join("\n"), ext: "txt" };
    }
    case "mtgo": {
      const lines = [];
      main.forEach((c) => lines.push(`${c.quantidade} ${c.nome}`));
      if (commanderCards.length > 0) {
        lines.push("");
        commanderCards.forEach((c) => lines.push(`CM: ${c.quantidade} ${c.nome}`));
      }
      if (side.length > 0) {
        lines.push("");
        side.forEach((c) => lines.push(`SB: ${c.quantidade} ${c.nome}`));
      }
      return { content: lines.join("\n"), ext: "dek" };
    }
    case "moxfield": {
      const lines = [];
      main.forEach((c) => lines.push(`${c.quantidade} ${c.nome}`));
      if (commanderCards.length > 0) {
        lines.push("", "COMMANDER:");
        commanderCards.forEach((c) => lines.push(`${c.quantidade} ${c.nome}`));
      }
      if (side.length > 0) {
        lines.push("", `${(isCommander ? "SIDEBOARD" : sideSectionLabel).toUpperCase()}:`);
        side.forEach((c) => lines.push(`${c.quantidade} ${c.nome}`));
      }
      return { content: lines.join("\n"), ext: "txt" };
    }
    case "txt":
    default: {
      const lines = [];
      main.forEach((c) => lines.push(`${c.quantidade} ${c.nome}`));
      if (commanderCards.length > 0) {
        lines.push("", "Commander");
        commanderCards.forEach((c) => lines.push(`${c.quantidade} ${c.nome}`));
      }
      if (side.length > 0) {
        lines.push("", "Sideboard");
        side.forEach((c) => lines.push(`${c.quantidade} ${c.nome}`));
      }
      return { content: lines.join("\n"), ext: "txt" };
    }
  }
}

function downloadText(content, filename) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function ExportDropdown({ deckForm, mainDeck, sideboard, commander }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleExport = (key) => {
    const { content, ext } = buildExport(key, deckForm, mainDeck, sideboard, commander);
    const slug = (deckForm.nome || "deck").replace(/\s+/g, "_").toLowerCase();
    downloadText(content, `${slug}.${ext}`);
    setOpen(false);
  };

  const hasCards = (mainDeck?.length ?? 0) > 0;

  return (
    /* export-dropdown: position: relative */
    <div className="relative" ref={ref}>
      {/* btn secondary export-btn */}
      <button
        type="button"
        className="
          inline-flex items-center gap-[0.35rem]
          border border-line rounded-lg px-4 py-[0.6rem]
          cursor-pointer font-bold
          bg-white/[0.03] text-text-main
          transition-all duration-[220ms]
          hover:border-line-strong hover:bg-white/[0.08] hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)]
          active:translate-y-0
          disabled:opacity-60 disabled:cursor-not-allowed
        "
        onClick={() => setOpen((v) => !v)}
        disabled={!hasCards}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Exportar
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        /* export-menu */
        <ul
          className="
            absolute top-[calc(100%+0.4rem)] left-0 z-50
            bg-[#1a1030] border border-line rounded-lg
            py-[0.3rem] px-[0.3rem] m-0 list-none min-w-[180px]
            shadow-[0_8px_28px_rgba(0,0,0,0.5)]
            animate-[fadeInDown_0.14s_ease]
          "
        >
          {EXPORT_FORMATS.map((fmt) => (
            <li key={fmt.key}>
              <button
                type="button"
                className="
                  w-full text-left bg-transparent border-none
                  text-text-soft px-[0.75rem] py-[0.5rem]
                  rounded-md text-[0.88rem] cursor-pointer
                  transition-[background,color] duration-[150ms]
                  hover:bg-[rgba(167,79,255,0.15)] hover:text-text-main
                "
                onClick={() => handleExport(fmt.key)}
              >
                {fmt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PickerHeader({ label, total, limit }) {
  const pct = Math.min(100, (total / limit) * 100);
  const isOver = total > limit;
  const isNearFull = !isOver && pct >= 80;

  return (
    /* picker-header */
    <div className="mb-[0.55rem]">
      {/* picker-header-top */}
      <div className="flex items-baseline justify-between mb-[0.3rem]">
        {/* picker-header-label */}
        <span className="font-bold text-[0.9rem] text-text-main">{label}</span>
        {/* picker-header-count with conditional color */}
        <span
          className={`text-[0.88rem] font-bold ${isOver
              ? "text-[#f87171]"
              : isNearFull
                ? "text-[#fcd34d]"
                : "text-text-soft"
            }`}
        >
          {total}
          {/* picker-header-limit */}
          <span className="font-normal opacity-60">/{limit}</span>
        </span>
      </div>

      {/* picker-progress-track */}
      <div className="h-[3px] rounded-full bg-white/[0.08] overflow-hidden">
        {/* picker-progress-fill with conditional gradient */}
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${isOver
              ? "bg-gradient-to-r from-[#b91c1c] to-[#f87171]"
              : isNearFull
                ? "bg-gradient-to-r from-[#d97706] to-[#fcd34d]"
                : "bg-gradient-to-r from-[#7c3aed] to-[#c795ff]"
            }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function DeckBuilder({
  deckForm,
  onDeckFormChange,
  mainSearch,
  onMainSearchChange,
  sideSearch,
  onSideSearchChange,
  commanderSearch,
  onCommanderSearchChange,
  mainSuggestions,
  sideSuggestions,
  commanderSuggestions,
  mainDeck,
  sideboard,
  commander,
  totalMain,
  totalSide,
  totalCommander,
  onAddCard,
  onRemoveCard,
  onUpdateCardQuantity,
  onCardMouseEnter,
  onCardMouseLeave,
  onPreviewDismiss,
  deckLoading,
  deckMessage,
  cardLimitMessage,
  illegalCardMessage,
  importLoading,
  importMessage,
  onImportDeck,
  onImportPaste,
  onSubmit,
  isEditMode = false,
  readOnly = false,
}) {
  const [invalidFields, setInvalidFields] = useState({ nome: false, formato: false, linkLigaMagic: false });
  const [shakeFields, setShakeFields] = useState({ nome: false, formato: false, linkLigaMagic: false });
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");

  const isCommander = deckForm.formato === "commander" || deckForm.formato === "commander500";
  const isCommander500 = deckForm.formato === "commander500";
  const mainLimit = isCommander ? 99 : 60;
  const sideLimit = isCommander ? 1 : 15;
  const sideLabel = "Sideboard";
  const commanderLimit = 1;

  const triggerFieldFeedback = ({ nome, formato, linkLigaMagic }) => {
    setInvalidFields({ nome, formato, linkLigaMagic });
    setShakeFields({ nome, formato, linkLigaMagic });
    setTimeout(() => {
      setShakeFields({ nome: false, formato: false, linkLigaMagic: false });
    }, 420);
  };

  const handleFormSubmit = (event) => {
    const nomeInvalido = !deckForm.nome.trim();
    const formatoInvalido = !deckForm.formato;
    const linkLigaMagicInvalido = isCommander500 && !deckForm.linkLigaMagic?.trim();

    if (nomeInvalido || formatoInvalido || linkLigaMagicInvalido) {
      event.preventDefault();
      triggerFieldFeedback({
        nome: nomeInvalido,
        formato: formatoInvalido,
        linkLigaMagic: linkLigaMagicInvalido,
      });
      return;
    }

    onSubmit(event);
  };

  const handleImportFileChange = async (event) => {
    const file = event.target.files?.[0];
    await onImportDeck(file);
    event.target.value = "";
  };

  const handlePasteImport = async () => {
    if (!onImportPaste) return;
    await onImportPaste(pasteText);
    setPasteText("");
    setPasteOpen(false);
  };

  return (
    /* deck-builder: animate fade-in, border, rounded, padding, bg, mt */
    <section
      className="animate-[fade-in_400ms_ease-out] border border-line rounded-2xl p-5 bg-[rgba(15,10,29,0.84)]"
      id="decks"
    >
      {/* deck-builder-header */}
      <div className="mb-5 pb-4 border-b border-line">
        {/* deck-builder-title-row */}
        <div className="flex items-center gap-3">
          {/* deck-builder-title */}
          <h2 className="m-0 font-display text-[1.9rem] tracking-[0.04em] text-text-main">
            {readOnly ? "Visualizar deck" : isEditMode ? "Editar deck" : "Novo deck"}
          </h2>

          {readOnly && (
            /* deck-builder-badge deck-builder-badge--readonly */
            <span className="py-[0.2rem] px-[0.65rem] rounded-full text-[0.72rem] font-bold tracking-[0.05em] uppercase border border-[rgba(148,163,184,0.35)] text-[#94a3b8] bg-[rgba(148,163,184,0.12)]">
              Somente leitura
            </span>
          )}
          {isEditMode && !readOnly && (
            /* deck-builder-badge deck-builder-badge--edit */
            <span className="py-[0.2rem] px-[0.65rem] rounded-full text-[0.72rem] font-bold tracking-[0.05em] uppercase border border-[rgba(139,92,246,0.4)] text-[#c4b5fd] bg-[rgba(139,92,246,0.15)]">
              Editando
            </span>
          )}
        </div>
      </div>

      {/* deck-form: display grid, gap */}
      <form className="grid gap-4" onSubmit={handleFormSubmit}>

        {/* form-row two-columns */}
        <div className="grid gap-[0.9rem] sm:grid-cols-2">

          {/* form-label for nome — field-invalid + shake-field applied conditionally */}
          <label
            className={`
              ${FORM_LABEL_CLASS}
              ${invalidFields.nome
                ? "text-[#ffb5c3] [&_input]:border-[rgba(255,98,124,0.95)] [&_input]:shadow-[0_0_0_2px_rgba(255,98,124,0.2)]"
                : ""
              }
              ${shakeFields.nome ? "animate-[field-shake_420ms_ease]" : ""}
            `}
          >
            Nome do deck
            <input
              className={MODAL_INPUT_CLASS}
              value={deckForm.nome}
              onChange={(event) => {
                onDeckFormChange((current) => ({ ...current, nome: event.target.value }));
                setInvalidFields((current) => ({ ...current, nome: false }));
              }}
              placeholder="Ex: Izzet Phoenix"
              required
              disabled={readOnly}
            />
          </label>

          {/* form-label for formato — field-invalid + shake-field applied conditionally */}
          <label
            className={`
              ${FORM_LABEL_CLASS}
              ${invalidFields.formato
                ? "text-[#ffb5c3] [&_.format-select-wrapper]:border-[rgba(255,98,124,0.95)] [&_.format-select-wrapper]:shadow-[0_0_0_2px_rgba(255,98,124,0.2)]"
                : "text-text-soft"
              }
              ${shakeFields.formato ? "animate-[field-shake_420ms_ease]" : ""}
            `}
          >
            Formato
            <div className={`relative format-select-wrapper ${invalidFields.formato ? "border border-[rgba(255,98,124,0.95)] shadow-[0_0_0_2px_rgba(255,98,124,0.2)] rounded-lg" : ""}`}>
              <SelectField
                className="
                  w-full appearance-none
                  border border-line rounded-lg
                  bg-gradient-to-b from-white/[0.06] to-white/[0.02]
                  text-text-main px-[0.7rem] py-[0.65rem] pr-[2.1rem]
                  cursor-pointer
                  transition-[border-color,box-shadow,background-color] duration-[180ms]
                  hover:border-[rgba(199,149,255,0.6)]
                  focus:outline-none focus:border-[rgba(199,149,255,0.92)] focus:shadow-[0_0_0_3px_rgba(167,79,255,0.22)] focus:bg-white/[0.05]
                  [&_option]:text-text-main [&_option]:bg-[#1a1129]
                "
                value={deckForm.formato}
                onChange={(event) => {
                  onDeckFormChange((current) => ({
                    ...current,
                    formato: event.target.value,
                    linkLigaMagic: event.target.value === "commander500" ? current.linkLigaMagic : "",
                  }));
                  setInvalidFields((current) => ({ ...current, formato: false }));
                }}
                required
                disabled={readOnly}
                iconClassName="text-[rgba(245,237,255,0.72)]"
              >
                <option value="" disabled>
                  Selecione um formato
                </option>
                {FORMATS.map((format) => (
                  <option key={format.value} value={format.value}>
                    {format.label}
                  </option>
                ))}
              </SelectField>
            </div>
          </label>
        </div>

        {!readOnly && (
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-white/[0.025] p-3 text-sm text-text-soft">
            <input type="checkbox" checked={Boolean(deckForm.oculto)} onChange={(event) => onDeckFormChange((current) => ({ ...current, oculto: event.target.checked }))} className="mt-0.5 h-4 w-4 accent-violet-500" />
            <span><strong className="block text-text-main">Deck secreto</strong>Não será exibido nas listagens públicas. Você ainda poderá acessá-lo em “Meus decks”.</span>
          </label>
        )}

        {isCommander500 && (
          <label
            className={`
              grid gap-[0.45rem] text-[0.95rem]
              ${invalidFields.linkLigaMagic
                ? "text-[#ffb5c3] [&_input]:border-[rgba(255,98,124,0.95)] [&_input]:shadow-[0_0_0_2px_rgba(255,98,124,0.2)]"
                : "text-text-soft"
              }
              ${shakeFields.linkLigaMagic ? "animate-[field-shake_420ms_ease]" : ""}
            `}
          >
            Link LigaMagic
            <input
              type="url"
              className="border border-line rounded-lg bg-white/[0.03] text-text-main px-[0.7rem] py-[0.65rem] w-full focus:outline-none focus:border-[rgba(199,149,255,0.92)] focus:shadow-[0_0_0_3px_rgba(167,79,255,0.22)]"
              value={deckForm.linkLigaMagic || ""}
              onChange={(event) => {
                onDeckFormChange((current) => ({ ...current, linkLigaMagic: event.target.value }));
                setInvalidFields((current) => ({ ...current, linkLigaMagic: false }));
              }}
              placeholder="https://www.ligamagic.com.br/?view=dks/deck&id=..."
              required={isCommander500}
              disabled={readOnly}
            />
          </label>
        )}

        {(deckForm.formato === "commander500" || deckForm.linkLigaMagic) && (
          <div className="px-3 py-3 rounded-lg border border-[rgba(96,165,250,0.28)] bg-[rgba(59,130,246,0.08)] text-[0.88rem]">
            <span className="text-[#bfdbfe] font-semibold">LigaMagic:</span>{" "}
            {deckForm.linkLigaMagic ? (
              <a
                href={deckForm.linkLigaMagic}
                target="_blank"
                rel="noreferrer"
                className="text-[#dbeafe] underline break-all hover:text-white"
              >
                {deckForm.linkLigaMagic}
              </a>
            ) : (
              <span className="text-text-soft">não informado</span>
            )}
          </div>
        )}

        {isCommander && (
          <div className="px-3 py-3 rounded-lg border border-[rgba(251,191,36,0.28)] bg-[rgba(251,191,36,0.08)] text-[#fde68a] text-[0.88rem]">
            {isCommander500 ? "Commander 500" : "Commander"} usa <strong>99 cartas no maindeck</strong>, <strong>1 comandante</strong> e pode manter sideboard separado, se o formato exigir.
          </div>
        )}

        {/* card-pickers: 2-col grid */}
        <div className={`grid gap-[0.8rem] items-stretch max-sm:grid-cols-1 max-sm:gap-4 ${isCommander ? "grid-cols-3" : "grid-cols-2"}`}>

          {/* picker-column (main) */}
          <div
            className="
              border border-line rounded-lg p-3
              bg-white/[0.01]
              min-h-[clamp(520px,calc(100vh-240px),760px)]
              flex flex-col overflow-hidden
              transition-all duration-[220ms]
              animate-[fade-in_300ms_ease-out]
              hover:border-[rgba(199,149,255,0.3)] hover:bg-white/[0.03] hover:shadow-[0_2px_8px_rgba(167,79,255,0.05)]
              max-sm:min-h-[clamp(400px,calc(100vh-280px),600px)] max-sm:p-4
            "
          >
            <PickerHeader label="Maindeck" total={totalMain} limit={mainLimit} />
            {!readOnly && (
              <CardSearch
                searchValue={mainSearch}
                onSearchChange={onMainSearchChange}
                suggestions={mainSuggestions}
                onCardAdd={(card) => onAddCard(card, "main")}
                onCardMouseEnter={onCardMouseEnter}
                onCardMouseLeave={onCardMouseLeave}
                onPreviewDismiss={onPreviewDismiss}
                title=""
                readOnly={readOnly}
              />
            )}
            <DeckList
              cards={mainDeck}
              onCardRemove={(nome) => onRemoveCard("main", nome)}
              onCardQuantityChange={(nome, quantidade) =>
                onUpdateCardQuantity("main", nome, quantidade)
              }
              onCardMouseEnter={onCardMouseEnter}
              onCardMouseLeave={onCardMouseLeave}
              readOnly={readOnly}
            />
          </div>

          {/* picker-column (side) */}
          <div
            className="
              border border-line rounded-lg p-3
              bg-white/[0.01]
              min-h-[clamp(520px,calc(100vh-240px),760px)]
              flex flex-col overflow-hidden
              transition-all duration-[220ms]
              animate-[fade-in_300ms_ease-out]
              hover:border-[rgba(199,149,255,0.3)] hover:bg-white/[0.03] hover:shadow-[0_2px_8px_rgba(167,79,255,0.05)]
              max-sm:min-h-[clamp(400px,calc(100vh-280px),600px)] max-sm:p-4
            "
          >
            <PickerHeader label={sideLabel} total={totalSide} limit={sideLimit} />
            {!readOnly && (
              <CardSearch
                searchValue={sideSearch}
                onSearchChange={onSideSearchChange}
                suggestions={sideSuggestions}
                onCardAdd={(card) => onAddCard(card, "side")}
                onCardMouseEnter={onCardMouseEnter}
                onCardMouseLeave={onCardMouseLeave}
                onPreviewDismiss={onPreviewDismiss}
                title=""
                readOnly={readOnly}
              />
            )}
            <DeckList
              cards={sideboard}
              onCardRemove={(nome) => onRemoveCard("side", nome)}
              onCardQuantityChange={(nome, quantidade) =>
                onUpdateCardQuantity("side", nome, quantidade)
              }
              onCardMouseEnter={onCardMouseEnter}
              onCardMouseLeave={onCardMouseLeave}
              readOnly={readOnly}
            />
          </div>

          {isCommander && (
            <div
              className="
                border border-line rounded-lg p-3
                bg-white/[0.01]
                min-h-[clamp(520px,calc(100vh-240px),760px)]
                flex flex-col overflow-hidden
                transition-all duration-[220ms]
                animate-[fade-in_300ms_ease-out]
                hover:border-[rgba(199,149,255,0.3)] hover:bg-white/[0.03] hover:shadow-[0_2px_8px_rgba(167,79,255,0.05)]
                max-sm:min-h-[clamp(400px,calc(100vh-280px),600px)] max-sm:p-4
              "
            >
              <PickerHeader label="Comandante" total={totalCommander} limit={commanderLimit} />
              {!readOnly && (
                <CardSearch
                  searchValue={commanderSearch}
                  onSearchChange={onCommanderSearchChange}
                  suggestions={commanderSuggestions}
                  onCardAdd={(card) => onAddCard(card, "commander")}
                  onCardMouseEnter={onCardMouseEnter}
                  onCardMouseLeave={onCardMouseLeave}
                  onPreviewDismiss={onPreviewDismiss}
                  title=""
                  readOnly={readOnly}
                />
              )}
              <DeckList
                cards={commander}
                onCardRemove={(nome) => onRemoveCard("commander", nome)}
                onCardQuantityChange={(nome, quantidade) =>
                  onUpdateCardQuantity("commander", nome, quantidade)
                }
                onCardMouseEnter={onCardMouseEnter}
                onCardMouseLeave={onCardMouseLeave}
                readOnly={readOnly}
              />
            </div>
          )}
        </div>

        {/* deck-actions */}
        <div className="flex gap-3 flex-wrap items-center max-sm:flex-col max-sm:gap-4 max-sm:w-full">
          {!readOnly && (
            <>
              {/* import-btn: btn secondary + inline-flex */}
              <label
                className="
                  inline-flex items-center justify-center gap-[0.4rem]
                  border border-line rounded-lg px-4 py-[0.6rem]
                  cursor-pointer font-bold
                  bg-white/[0.03] text-text-main
                  transition-all duration-[220ms]
                  hover:border-line-strong hover:bg-white/[0.08] hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)]
                  active:translate-y-0
                  max-sm:w-full max-sm:py-[0.85rem] max-sm:text-base max-sm:min-h-[52px]
                "
                htmlFor="import-deck-file"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                {importLoading ? "Importando..." : "Importar (.txt/.dek)"}
              </label>

              {/* import-file-input: visually hidden */}
              <input
                id="import-deck-file"
                type="file"
                accept=".txt,.dek,.deck,text/plain"
                className="absolute w-px h-px opacity-0 pointer-events-none"
                onChange={handleImportFileChange}
                disabled={importLoading}
              />

              {onImportPaste && (
                <button
                  type="button"
                  className="
                    inline-flex items-center justify-center gap-[0.4rem]
                    border border-line rounded-lg px-4 py-[0.6rem]
                    cursor-pointer font-bold
                    bg-white/[0.03] text-text-main
                    transition-all duration-[220ms]
                    hover:border-line-strong hover:bg-white/[0.08]
                    max-sm:w-full max-sm:py-[0.85rem]
                  "
                  onClick={() => setPasteOpen((open) => !open)}
                  disabled={importLoading}
                >
                  Colar lista
                </button>
              )}
            </>
          )}

          <ExportDropdown deckForm={deckForm} mainDeck={mainDeck} sideboard={sideboard} commander={commander} />

          {!readOnly && (
            <Button
              className="max-sm:w-full max-sm:min-h-[52px]"
              type="submit"
              size="lg"
              loading={deckLoading || importLoading}
            >
              {deckLoading
                ? isEditMode ? "Atualizando..." : "Cadastrando..."
                : isEditMode ? "Salvar deck" : "Criar deck"}
            </Button>
          )}
        </div>

        {!readOnly && pasteOpen && onImportPaste && (
          <div className="mt-3 grid gap-2 w-full">
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              rows={8}
              placeholder={"4 Lightning Bolt\n...\nSB: 2 Rest in Peace"}
              className="w-full bg-[rgba(255,255,255,0.04)] border border-line rounded-lg px-3 py-2 text-[0.9rem] text-text-main placeholder:text-text-soft/50"
              disabled={importLoading}
            />
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                className="px-3 py-2 rounded-lg border border-[rgba(199,149,255,0.45)] text-brand font-semibold disabled:opacity-50"
                onClick={handlePasteImport}
                disabled={importLoading || !pasteText.trim()}
              >
                Importar texto
              </button>
              <button
                type="button"
                className="px-3 py-2 rounded-lg border border-line text-text-soft font-semibold"
                onClick={() => { setPasteOpen(false); setPasteText(""); }}
                disabled={importLoading}
              >
                Fechar
              </button>
            </div>
          </div>
        )}

        {/* feedback messages */}
        {importMessage ? (
          <p className="mt-[0.7rem] mb-0 px-3 py-3 rounded-md bg-[rgba(167,79,255,0.15)] text-[#d7b8ff] text-[0.9rem] animate-[fade-in_300ms_ease-out]">
            {importMessage}
          </p>
        ) : null}

        {deckMessage ? (
          <p className="mt-[0.7rem] mb-0 px-3 py-3 rounded-md bg-[rgba(167,79,255,0.15)] text-[#d7b8ff] text-[0.9rem] animate-[fade-in_300ms_ease-out]">
            {deckMessage}
          </p>
        ) : null}

        {/* feedback limit-warning */}
        {cardLimitMessage ? (
          <p className="mt-[0.7rem] mb-0 px-3 py-3 rounded-md bg-[rgba(252,88,119,0.15)] text-[#ffc8d4] text-[0.9rem] animate-[fade-in_300ms_ease-out]">
            {cardLimitMessage}
          </p>
        ) : null}

        {/* feedback illegal-warning */}
        {illegalCardMessage ? (
          <p className="mt-[0.7rem] mb-0 px-3 py-3 rounded-md bg-[rgba(255,107,107,0.18)] text-[#ffb3b3] text-[0.9rem] border-l-[3px] border-l-[#ff6b6b] animate-[fade-in_300ms_ease-out]">
            {illegalCardMessage}
          </p>
        ) : null}
      </form>
    </section>
  );
}
