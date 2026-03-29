import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { DeckBuilder, HandSimulator, DeckStats } from "../components";
import { buscarCartaPorNome } from "../services/scryfallApi";

export function DeckBuilderPage({
  isEditMode = false,
  deckForm,
  onDeckFormChange,
  onSetMainDeck,
  onSetSideboard,
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
}) {
  const { id } = useParams();
  const location = useLocation();
  const deck = location.state?.deck;
  const readOnly = location.state?.readOnly || false;
  const [analysisTab, setAnalysisTab] = useState("mao");

  // Carregar dados e cartas do deck para editar, ou limpar se em modo criação
  useEffect(() => {
    if (!isEditMode && !deck) {
      // Modo criação - garantir que está limpo
      onDeckFormChange({ nome: "", formato: "" });
      if (onSetMainDeck && onSetSideboard) {
        onSetMainDeck([]);
        onSetSideboard([]);
      }
    } else if (isEditMode && deck) {
      onDeckFormChange({
        nome: deck.nome,
        formato: deck.formato,
      });

      // Carregar cartas do deck existente
      if (onSetMainDeck && onSetSideboard) {
        const loadDeckCards = async () => {
          try {
            // Agrupa entradas pelo nome (caso o backend retorne uma por cópia)
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
              cmc: Number.isFinite(cartaScryfall.cmc)
                ? cartaScryfall.cmc
                : Number(cartaScryfall.cmc) || 0,
              manaCost: cartaScryfall.manaCost || "",
              typeLine: cartaScryfall.typeLine || "",
            });

            const mainEntries = groupByName(deck.maindeck || []);
            const sideEntries = groupByName(deck.sideboard || []);

            const [resolvedMain, resolvedSide] = await Promise.all([
              Promise.all(
                mainEntries.map(async (entry) => {
                  const carta = await buscarCartaPorNome(entry.nome);
                  return carta ? toCardEntry(carta, entry.quantidade) : null;
                }),
              ),
              Promise.all(
                sideEntries.map(async (entry) => {
                  const carta = await buscarCartaPorNome(entry.nome);
                  return carta ? toCardEntry(carta, entry.quantidade) : null;
                }),
              ),
            ]);

            onSetMainDeck(resolvedMain.filter(Boolean));
            onSetSideboard(resolvedSide.filter(Boolean));
          } catch (error) {
            console.error("Erro ao carregar cartas do deck:", error);
          }
        };

        loadDeckCards();
      }
    }
  }, [isEditMode, deck, onDeckFormChange, onSetMainDeck, onSetSideboard]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (isEditMode && id) {
      // Passar deckId e deck original como parâmetro ao atualizar
      onSubmit(event, undefined, id, deck);
    } else {
      // Modo criação normal
      onSubmit(event);
    }
  };

  return (
    <main className="w-[min(1100px,calc(100vw-2rem))] mx-auto pt-[7.5rem] pb-12">
      <DeckBuilder
        deckForm={deckForm}
        onDeckFormChange={onDeckFormChange}
        mainSearch={mainSearch}
        onMainSearchChange={onMainSearchChange}
        sideSearch={sideSearch}
        onSideSearchChange={onSideSearchChange}
        mainSuggestions={mainSuggestions}
        sideSuggestions={sideSuggestions}
        mainDeck={mainDeck}
        sideboard={sideboard}
        totalMain={totalMain}
        totalSide={totalSide}
        onAddCard={onAddCard}
        onRemoveCard={onRemoveCard}
        onUpdateCardQuantity={onUpdateCardQuantity}
        onCardMouseEnter={onCardMouseEnter}
        onCardMouseLeave={onCardMouseLeave}
        deckLoading={deckLoading}
        deckMessage={deckMessage}
        cardLimitMessage={cardLimitMessage}
        illegalCardMessage={illegalCardMessage}
        importLoading={importLoading}
        importMessage={importMessage}
        onImportDeck={onImportDeck}
        onSubmit={readOnly ? null : handleSubmit}
        isEditMode={isEditMode}
        readOnly={readOnly}
      />

      <div className="flex flex-col gap-0 mt-6 w-full">
        <div className="flex gap-[0.4rem] mb-[0.85rem]">
          <button
            type="button"
            className={`px-[1.1rem] py-[0.45rem] rounded-full border text-[0.88rem] font-medium cursor-pointer transition-all duration-[180ms] ${
              analysisTab === "mao"
                ? "bg-[rgba(167,79,255,0.18)] border-[rgba(199,149,255,0.5)] text-[#c795ff]"
                : "border-[rgba(217,180,255,0.2)] bg-transparent text-[#beafd7] hover:border-[rgba(199,149,255,0.4)] hover:text-[#f5edff]"
            }`}
            onClick={() => setAnalysisTab("mao")}
          >
            🎴 Mão Inicial
          </button>
          <button
            type="button"
            className={`px-[1.1rem] py-[0.45rem] rounded-full border text-[0.88rem] font-medium cursor-pointer transition-all duration-[180ms] ${
              analysisTab === "stats"
                ? "bg-[rgba(167,79,255,0.18)] border-[rgba(199,149,255,0.5)] text-[#c795ff]"
                : "border-[rgba(217,180,255,0.2)] bg-transparent text-[#beafd7] hover:border-[rgba(199,149,255,0.4)] hover:text-[#f5edff]"
            }`}
            onClick={() => setAnalysisTab("stats")}
          >
            📊 Estatísticas
          </button>
        </div>
        {analysisTab === "mao"
          ? <HandSimulator mainDeck={mainDeck} />
          : <DeckStats mainDeck={mainDeck} />
        }
      </div>
    </main>
  );
}
