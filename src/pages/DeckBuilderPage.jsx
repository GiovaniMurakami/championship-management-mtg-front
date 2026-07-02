import { useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { DeckBuilder, HandSimulator, DeckStats } from "../components";
import { CardPreviewModal } from "../components/deck/CardPreviewModal";
import { PageShell } from "../components/ui/PageShell";
import { useAuth } from "../context/AuthContext";
import { useDeckBuilder } from "../hooks/useDeckBuilder";
import { useCardSearch } from "../hooks/useCardSearch";
import { useCardPreview } from "../hooks/useCardPreview";
import { buscarDeck } from "../services/backendApi";
import { deckHasCardLists, hydrateDeckCards } from "../utils/hydrateDeckCards";
import { logError } from "../utils/logger";
import { usePageTitle } from "../hooks/usePageTitle";
import { PAGE_TITLES } from "../constants/pageTitles";

export function DeckBuilderPage({ isEditMode = false }) {
  const { token } = useAuth();
  const { id } = useParams();
  const location = useLocation();
  const readOnly = location.state?.readOnly || new URLSearchParams(location.search).get("modo") === "visualizar";
  const [analysisTab, setAnalysisTab] = useState("mao");
  const [originalDeck, setOriginalDeck] = useState(location.state?.deck ?? null);

  const {
    deckForm, setDeckForm, mainDeck, setMainDeck, sideboard, setSideboard, commander, setCommander,
    deckLoading, deckMessage, cardLimitMessage, illegalCardMessage,
    importLoading, importMessage, totalMain, totalSide, totalCommander,
    addCardToDeck, updateCardQuantity, removeCard, handleCreateDeck, importDeckFromTxt,
  } = useDeckBuilder();

  const {
    mainSearch, setMainSearch, sideSearch, setSideSearch, commanderSearch, setCommanderSearch,
    mainSuggestions, sideSuggestions, commanderSuggestions,
  } = useCardSearch();

  const { previewCard, openCardPreview, closeCardPreview } = useCardPreview();
  const tokenRef = useRef(token);
  tokenRef.current = token;
  const deckFromState = location.state?.deck;

  const deckPageTitle = readOnly
    ? PAGE_TITLES.visualizarDeck
    : isEditMode
      ? (deckForm.nome || originalDeck?.nome || PAGE_TITLES.editarDeck)
      : PAGE_TITLES.criarDeck;

  usePageTitle(deckPageTitle, {
    loading: isEditMode && deckLoading && !deckForm.nome && !originalDeck?.nome,
  });

  useEffect(() => {
    if (!isEditMode || !id) {
      return;
    }

    let cancelled = false;
    const isCancelled = () => cancelled;

    const applyDeck = (deck) => hydrateDeckCards(deck, {
      setOriginalDeck,
      setDeckForm,
      setMainDeck,
      setSideboard,
      setCommander,
      isCancelled,
    });

    const loadDeckCards = async () => {
      try {
        if (deckHasCardLists(deckFromState, id)) {
          await applyDeck(deckFromState);
          return;
        }

        const fullDeck = await buscarDeck(id, tokenRef.current);
        if (cancelled) return;
        await applyDeck(fullDeck);
      } catch (error) {
        logError("Erro ao carregar cartas do deck:", error);
      }
    };

    loadDeckCards();

    return () => {
      cancelled = true;
    };
  }, [id, isEditMode, location.key, deckFromState, setCommander, setDeckForm, setMainDeck, setSideboard]);

  useEffect(() => {
    return () => closeCardPreview();
  }, [closeCardPreview]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isEditMode && id) {
      handleCreateDeck(event, token, id, originalDeck);
    } else {
      handleCreateDeck(event, token);
    }
  };

  return (
    <PageShell className="max-w-[1100px]">
      {originalDeck && (
        <div className="flex flex-wrap items-center gap-3 mb-4 px-1">
          <div className="text-[0.9rem] text-text-soft">
            {originalDeck.visualizacoes != null ? `${originalDeck.visualizacoes} visualizacoes` : ""}
          </div>
          {originalDeck.usuario?.nome && (
            <div className="text-[0.9rem] text-text-soft">
              por <span className="text-text-main">{originalDeck.usuario.nome}</span>
            </div>
          )}
        </div>
      )}

      <DeckBuilder
        deckForm={deckForm}
        onDeckFormChange={setDeckForm}
        mainSearch={mainSearch}
        onMainSearchChange={setMainSearch}
        sideSearch={sideSearch}
        onSideSearchChange={setSideSearch}
        commanderSearch={commanderSearch}
        onCommanderSearchChange={setCommanderSearch}
        mainSuggestions={mainSuggestions}
        sideSuggestions={sideSuggestions}
        commanderSuggestions={commanderSuggestions}
        mainDeck={mainDeck}
        sideboard={sideboard}
        commander={commander}
        totalMain={totalMain}
        totalSide={totalSide}
        totalCommander={totalCommander}
        onAddCard={addCardToDeck}
        onRemoveCard={removeCard}
        onUpdateCardQuantity={updateCardQuantity}
        onCardMouseEnter={openCardPreview}
        onCardMouseLeave={closeCardPreview}
        onPreviewDismiss={closeCardPreview}
        deckLoading={deckLoading}
        deckMessage={deckMessage}
        cardLimitMessage={cardLimitMessage}
        illegalCardMessage={illegalCardMessage}
        importLoading={importLoading}
        importMessage={importMessage}
        onImportDeck={importDeckFromTxt}
        onSubmit={readOnly ? null : handleSubmit}
        isEditMode={isEditMode}
        readOnly={readOnly}
      />

      <div className="flex flex-col gap-0 mt-6 w-full">
        <div className="flex gap-[0.4rem] mb-[0.85rem]">
          {[
            { key: "mao", label: "🎴 Mão Inicial" },
            { key: "stats", label: "📊 Estatísticas" },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              className={`px-[1.1rem] py-[0.45rem] rounded-full border text-[0.88rem] font-medium cursor-pointer transition-all duration-[180ms] ${
                analysisTab === key
                  ? "bg-[rgba(167,79,255,0.18)] border-[rgba(199,149,255,0.5)] text-[#c795ff]"
                  : "border-line bg-transparent text-text-soft hover:border-[rgba(199,149,255,0.4)] hover:text-text-main"
              }`}
              onClick={() => setAnalysisTab(key)}
            >
              {label}
            </button>
          ))}
        </div>
        {analysisTab === "mao"
          ? <HandSimulator mainDeck={mainDeck} />
          : <DeckStats mainDeck={mainDeck} />
        }
      </div>

      <CardPreviewModal card={previewCard} />
    </PageShell>
  );
}
