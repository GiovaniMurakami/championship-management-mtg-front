import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { DeckBuilder, HandSimulator, DeckStats } from "../components";
import { CardPreviewModal } from "../components/deck/CardPreviewModal";
import { useAuth } from "../context/AuthContext";
import { useDeckBuilder } from "../hooks/useDeckBuilder";
import { useCardSearch } from "../hooks/useCardSearch";
import { useCardPreview } from "../hooks/useCardPreview";
import { buscarCartasPorNome } from "../services/scryfallApi";

export function DeckBuilderPage({ isEditMode = false }) {
  const { token } = useAuth();
  const { id } = useParams();
  const location = useLocation();
  const deck = location.state?.deck;
  const readOnly = location.state?.readOnly || false;
  const [analysisTab, setAnalysisTab] = useState("mao");

  const {
    deckForm, setDeckForm, mainDeck, setMainDeck, sideboard, setSideboard,
    deckLoading, deckMessage, cardLimitMessage, illegalCardMessage,
    importLoading, importMessage, totalMain, totalSide,
    addCardToDeck, updateCardQuantity, removeCard, handleCreateDeck, importDeckFromTxt,
  } = useDeckBuilder();

  const {
    mainSearch, setMainSearch, sideSearch, setSideSearch,
    mainSuggestions, sideSuggestions,
  } = useCardSearch();

  const { previewCard, openCardPreview, closeCardPreview } = useCardPreview();

  // Carregar dados do deck para editar, ou limpar em modo criação
  useEffect(() => {
    if (!isEditMode && !deck) {
      setDeckForm({ nome: "", formato: "" });
      setMainDeck([]);
      setSideboard([]);
    } else if (isEditMode && deck) {
      setDeckForm({ nome: deck.nome, formato: deck.formato });

      const loadDeckCards = async () => {
        try {
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

          const toCardEntry = (cartaScryfall, quantidade) => ({
            nome: cartaScryfall.nome,
            quantidade,
            imagem: cartaScryfall.imagem || "",
            isBasicLand: cartaScryfall.isBasicLand,
            legalities: cartaScryfall.legalities || {},
            colors: cartaScryfall.colors || cartaScryfall.colorIdentity || [],
            cmc: Number.isFinite(cartaScryfall.cmc) ? cartaScryfall.cmc : Number(cartaScryfall.cmc) || 0,
            manaCost: cartaScryfall.manaCost || "",
            typeLine: cartaScryfall.typeLine || "",
          });

          const mainEntries = groupByName(deck.maindeck || []);
          const sideEntries = groupByName(deck.sideboard || []);

          const [resolvedMainCards, resolvedSideCards] = await Promise.all([
            buscarCartasPorNome(mainEntries.map((entry) => entry.nome)),
            buscarCartasPorNome(sideEntries.map((entry) => entry.nome)),
          ]);

          const resolvedMain = resolvedMainCards.map((carta, index) =>
            carta ? toCardEntry(carta, mainEntries[index].quantidade) : null,
          );
          const resolvedSide = resolvedSideCards.map((carta, index) =>
            carta ? toCardEntry(carta, sideEntries[index].quantidade) : null,
          );

          setMainDeck(resolvedMain.filter(Boolean));
          setSideboard(resolvedSide.filter(Boolean));
        } catch (error) {
          console.error("Erro ao carregar cartas do deck:", error);
        }
      };

      loadDeckCards();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);

  useEffect(() => {
    return () => closeCardPreview();
  }, [closeCardPreview]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isEditMode && id) {
      handleCreateDeck(event, token, id, deck);
    } else {
      handleCreateDeck(event, token);
    }
  };

  return (
    <main className="w-[min(1100px,calc(100vw-2rem))] mx-auto pt-[7.5rem] pb-12">
      <DeckBuilder
        deckForm={deckForm}
        onDeckFormChange={setDeckForm}
        mainSearch={mainSearch}
        onMainSearchChange={setMainSearch}
        sideSearch={sideSearch}
        onSideSearchChange={setSideSearch}
        mainSuggestions={mainSuggestions}
        sideSuggestions={sideSuggestions}
        mainDeck={mainDeck}
        sideboard={sideboard}
        totalMain={totalMain}
        totalSide={totalSide}
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
