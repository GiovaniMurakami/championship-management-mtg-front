import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { DeckBuilder, HandSimulator, DeckStats } from "../components";
import { CardPreviewModal } from "../components/deck/CardPreviewModal";
import { useAuth } from "../context/AuthContext";
import { useDeckBuilder } from "../hooks/useDeckBuilder";
import { useCardSearch } from "../hooks/useCardSearch";
import { useCardPreview } from "../hooks/useCardPreview";
import { buscarDeck } from "../services/backendApi";
import { buscarCartasPorNome } from "../services/scryfallApi";

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

  useEffect(() => {
    if (!isEditMode || !id || !token) {
      return;
    }

    let cancelled = false;

    const groupByName = (entries) => {
      const map = new Map();
      for (const entry of entries) {
        const nome = entry.nome;
        if (map.has(nome)) {
          map.get(nome).quantidade += entry.quantidade || 1;
        } else {
          map.set(nome, { nome, quantidade: entry.quantidade || 1 });
        }
      }
      return Array.from(map.values());
    };

    const toCardEntry = (entry, card) => ({
      nome: card?.nome || entry.nome,
      quantidade: entry.quantidade,
      imagem: card?.imagem || "",
      isBasicLand: card?.isBasicLand || false,
      legalities: card?.legalities || {},
      colors: card?.colors || card?.colorIdentity || [],
      cmc: Number.isFinite(card?.cmc) ? card.cmc : Number(card?.cmc) || 0,
      manaCost: card?.manaCost || "",
      typeLine: card?.typeLine || "",
    });

    const loadDeckCards = async () => {
      try {
        const fullDeck = await buscarDeck(id, token);
        if (cancelled) return;

        setOriginalDeck(fullDeck);
        setDeckForm({
          nome: fullDeck.nome,
          formato: fullDeck.formato,
          linkLigaMagic: fullDeck.linkLigaMagic || "",
        });

        const mainEntries = groupByName(fullDeck.maindeck || []);
        const sideEntries = groupByName(fullDeck.sideboard || []);
        const commanderEntries = groupByName(
          Array.isArray(fullDeck.commander)
            ? fullDeck.commander
            : fullDeck.commander
              ? [fullDeck.commander]
              : [],
        );

        const [resolvedMainCards, resolvedSideCards, resolvedCommanderCards] = await Promise.all([
          buscarCartasPorNome(mainEntries.map((entry) => entry.nome)),
          buscarCartasPorNome(sideEntries.map((entry) => entry.nome)),
          buscarCartasPorNome(commanderEntries.map((entry) => entry.nome)),
        ]);

        if (cancelled) return;

        setMainDeck(
          resolvedMainCards.map((card, index) => toCardEntry(mainEntries[index], card)),
        );
        setSideboard(
          resolvedSideCards.map((card, index) => toCardEntry(sideEntries[index], card)),
        );
        setCommander(
          resolvedCommanderCards.map((card, index) => toCardEntry(commanderEntries[index], card)),
        );
      } catch (error) {
        console.error("Erro ao carregar cartas do deck:", error);
      }
    };

    loadDeckCards();

    return () => {
      cancelled = true;
    };
  }, [id, isEditMode, setCommander, setDeckForm, setMainDeck, setSideboard, token]);

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
    <main className="w-[min(1100px,calc(100vw-2rem))] mx-auto pt-[7.5rem] pb-12">
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
    </main>
  );
}
