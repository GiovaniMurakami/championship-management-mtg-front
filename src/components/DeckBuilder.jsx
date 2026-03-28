import { useState, useRef, useEffect } from "react";
import { CardSearch } from "./CardSearch";
import { DeckList } from "./DeckList";

const FORMATS = [
  { value: "standard", label: "Standard" },
  { value: "modern", label: "Modern" },
  { value: "pioneer", label: "Pioneer" },
  { value: "legacy", label: "Legacy" },
  { value: "commander", label: "Commander" },
  { value: "pauper", label: "Pauper" },
];

const EXPORT_FORMATS = [
  { key: "arena",   label: "MTG Arena" },
  { key: "mtgo",    label: "MTGO (.dek)" },
  { key: "txt",     label: "Texto (.txt)" },
  { key: "moxfield",label: "Moxfield / Archidekt" },
];

function buildExport(type, deckForm, mainDeck, sideboard) {
  const main = mainDeck ?? [];
  const side = sideboard ?? [];

  switch (type) {
    case "arena": {
      const lines = ["Deck"];
      main.forEach((c) => lines.push(`${c.quantidade} ${c.nome}`));
      if (side.length > 0) {
        lines.push("", "Sideboard");
        side.forEach((c) => lines.push(`${c.quantidade} ${c.nome}`));
      }
      return { content: lines.join("\n"), ext: "txt" };
    }
    case "mtgo": {
      const lines = [];
      main.forEach((c) => lines.push(`${c.quantidade} ${c.nome}`));
      if (side.length > 0) {
        lines.push("");
        side.forEach((c) => lines.push(`SB: ${c.quantidade} ${c.nome}`));
      }
      return { content: lines.join("\n"), ext: "dek" };
    }
    case "moxfield": {
      const lines = [];
      main.forEach((c) => lines.push(`${c.quantidade} ${c.nome}`));
      if (side.length > 0) {
        lines.push("", "SIDEBOARD:");
        side.forEach((c) => lines.push(`${c.quantidade} ${c.nome}`));
      }
      return { content: lines.join("\n"), ext: "txt" };
    }
    case "txt":
    default: {
      const total = main.reduce((s, c) => s + (c.quantidade || 0), 0);
      const lines = [
        `// ${deckForm.nome || "Deck"}`,
        `// Formato: ${deckForm.formato || "—"}`,
        `// ${total} cartas`,
        "",
      ];
      main.forEach((c) => lines.push(`${c.quantidade} ${c.nome}`));
      if (side.length > 0) {
        lines.push("", `// Sideboard (${side.reduce((s, c) => s + (c.quantidade || 0), 0)})`);
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

function ExportDropdown({ deckForm, mainDeck, sideboard }) {
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
    const { content, ext } = buildExport(key, deckForm, mainDeck, sideboard);
    const slug = (deckForm.nome || "deck").replace(/\s+/g, "_").toLowerCase();
    downloadText(content, `${slug}.${ext}`);
    setOpen(false);
  };

  const hasCards = (mainDeck?.length ?? 0) > 0;

  return (
    <div className="export-dropdown" ref={ref}>
      <button
        type="button"
        className="btn secondary export-btn"
        onClick={() => setOpen((v) => !v)}
        disabled={!hasCards}
      >
        Exportar
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true" style={{ marginLeft: "0.35rem" }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <ul className="export-menu">
          {EXPORT_FORMATS.map((fmt) => (
            <li key={fmt.key}>
              <button type="button" onClick={() => handleExport(fmt.key)}>
                {fmt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
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
  mainSuggestions,
  sideSuggestions,
  mainDeck,
  sideboard,
  totalMain,
  totalSide,
  onAddCard,
  onRemoveCard,
  onUpdateCardQuantity,
  onCardMouseEnter,
  onCardMouseLeave,
  deckLoading,
  deckMessage,
  cardLimitMessage,
  illegalCardMessage,
  importLoading,
  importMessage,
  onImportDeck,
  onSubmit,
  isEditMode = false,
  readOnly = false,
}) {
  const [invalidFields, setInvalidFields] = useState({ nome: false, formato: false });
  const [shakeFields, setShakeFields] = useState({ nome: false, formato: false });

  const triggerFieldFeedback = ({ nome, formato }) => {
    setInvalidFields({ nome, formato });
    setShakeFields({ nome, formato });

    setTimeout(() => {
      setShakeFields({ nome: false, formato: false });
    }, 420);
  };

  const handleFormSubmit = (event) => {
    const nomeInvalido = !deckForm.nome.trim();
    const formatoInvalido = !deckForm.formato;

    if (nomeInvalido || formatoInvalido) {
      event.preventDefault();
      triggerFieldFeedback({ nome: nomeInvalido, formato: formatoInvalido });
      return;
    }

    onSubmit(event);
  };

  const handleImportFileChange = async (event) => {
    const file = event.target.files?.[0];
    await onImportDeck(file);
    event.target.value = "";
  };

  return (
    <section className="deck-builder" id="decks">
      <div className="section-title">
        <h2>
          {readOnly ? "Visualizar deck" : isEditMode ? "Editar deck" : "Cadastrar deck"}
        </h2>
        <span>integrado ao backend</span>
      </div>

      <form className="deck-form" onSubmit={handleFormSubmit}>
        <div className="form-row two-columns">
          <label
            className={`form-label ${invalidFields.nome ? "field-invalid" : ""} ${shakeFields.nome ? "shake-field" : ""}`}
          >
            Nome do deck
            <input
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

          <label
            className={`form-label ${invalidFields.formato ? "field-invalid" : ""} ${shakeFields.formato ? "shake-field" : ""}`}
          >
            Formato
            <div className="select-field">
              <select
                className="format-select"
                value={deckForm.formato}
                onChange={(event) => {
                  onDeckFormChange((current) => ({ ...current, formato: event.target.value }));
                  setInvalidFields((current) => ({ ...current, formato: false }));
                }}
                required
                disabled={readOnly}
              >
                <option value="" disabled>
                  Selecione um formato
                </option>
                {FORMATS.map((format) => (
                  <option key={format.value} value={format.value}>
                    {format.label}
                  </option>
                ))}
              </select>
            </div>
          </label>
        </div>

        <div className="card-pickers">
          <div className="picker-column">
            <h3>Maindeck ({totalMain}/60+)</h3>
            {!readOnly && (
              <CardSearch
                searchValue={mainSearch}
                onSearchChange={onMainSearchChange}
                suggestions={mainSuggestions}
                onCardAdd={(card) => onAddCard(card, "main")}
                onCardMouseEnter={onCardMouseEnter}
                onCardMouseLeave={onCardMouseLeave}
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

          <div className="picker-column">
            <h3>Sideboard ({totalSide}/15)</h3>
            {!readOnly && (
              <CardSearch
                searchValue={sideSearch}
                onSearchChange={onSideSearchChange}
                suggestions={sideSuggestions}
                onCardAdd={(card) => onAddCard(card, "side")}
                onCardMouseEnter={onCardMouseEnter}
                onCardMouseLeave={onCardMouseLeave}
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
        </div>

        <div className="deck-actions">
          {!readOnly && (
            <>
              <label className="btn secondary import-btn" htmlFor="import-deck-file">
                {importLoading ? "Importando..." : "Importar deck (.txt)"}
              </label>
              <input
                id="import-deck-file"
                type="file"
                accept=".txt"
                className="import-file-input"
                onChange={handleImportFileChange}
                disabled={importLoading}
              />
            </>
          )}

          <ExportDropdown deckForm={deckForm} mainDeck={mainDeck} sideboard={sideboard} />

          {!readOnly && (
            <button className="btn primary" type="submit" disabled={deckLoading || importLoading}>
              {deckLoading ? (isEditMode ? "Atualizando..." : "Cadastrando...") : isEditMode ? "Atualizar deck" : "Cadastrar deck"}
            </button>
          )}
        </div>

        {importMessage ? <p className="feedback">{importMessage}</p> : null}
        {deckMessage ? <p className="feedback">{deckMessage}</p> : null}
        {cardLimitMessage ? <p className="feedback limit-warning">{cardLimitMessage}</p> : null}
        {illegalCardMessage ? (
          <p className="feedback illegal-warning">{illegalCardMessage}</p>
        ) : null}
      </form>
    </section>
  );
}
