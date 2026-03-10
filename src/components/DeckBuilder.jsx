import { useState } from "react";
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
        <h2>{isEditMode ? "Editar deck" : "Cadastrar deck"}</h2>
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
            <CardSearch
              searchValue={mainSearch}
              onSearchChange={onMainSearchChange}
              suggestions={mainSuggestions}
              onCardAdd={(card) => onAddCard(card, "main")}
              onCardMouseEnter={onCardMouseEnter}
              onCardMouseLeave={onCardMouseLeave}
              title=""
            />
            <DeckList
              cards={mainDeck}
              onCardRemove={(nome) => onRemoveCard("main", nome)}
              onCardQuantityChange={(nome, quantidade) =>
                onUpdateCardQuantity("main", nome, quantidade)
              }
              onCardMouseEnter={onCardMouseEnter}
              onCardMouseLeave={onCardMouseLeave}
            />
          </div>

          <div className="picker-column">
            <h3>Sideboard ({totalSide}/15)</h3>
            <CardSearch
              searchValue={sideSearch}
              onSearchChange={onSideSearchChange}
              suggestions={sideSuggestions}
              onCardAdd={(card) => onAddCard(card, "side")}
              onCardMouseEnter={onCardMouseEnter}
              onCardMouseLeave={onCardMouseLeave}
              title=""
            />
            <DeckList
              cards={sideboard}
              onCardRemove={(nome) => onRemoveCard("side", nome)}
              onCardQuantityChange={(nome, quantidade) =>
                onUpdateCardQuantity("side", nome, quantidade)
              }
              onCardMouseEnter={onCardMouseEnter}
              onCardMouseLeave={onCardMouseLeave}
            />
          </div>
        </div>

        <div className="deck-actions">
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

          <button className="btn primary" type="submit" disabled={deckLoading || importLoading}>
            {deckLoading ? (isEditMode ? "Atualizando..." : "Cadastrando...") : isEditMode ? "Atualizar deck" : "Cadastrar deck"}
          </button>
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
