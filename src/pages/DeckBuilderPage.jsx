import { useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { DeckBuilder } from "../components";
import { atualizarDeck } from "../services/backendApi";
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
  const navigate = useNavigate();
  const deck = location.state?.deck;

  // Carregar dados e cartas do deck para editar
  useEffect(() => {
    if (isEditMode && deck) {
      onDeckFormChange({
        nome: deck.nome,
        formato: deck.formato,
      });
      
      // Carregar cartas do deck existente
      if (onSetMainDeck && onSetSideboard) {
        const loadDeckCards = async () => {
          try {
            const maindeckCards = [];
            const sideboardCards = [];

            // Processar maindeck
            if (Array.isArray(deck.maindeck)) {
              for (const cartaBackend of deck.maindeck) {
                const cartaScryfall = await buscarCartaPorNome(cartaBackend.nome);
                if (cartaScryfall) {
                  maindeckCards.push({
                    nome: cartaScryfall.nome,
                    quantidade: cartaBackend.quantidade || 1,
                    imagem: cartaScryfall.imagem || "",
                    isBasicLand: cartaScryfall.isBasicLand,
                    legalities: cartaScryfall.legalities || {},
                  });
                }
              }
            }

            // Processar sideboard
            if (Array.isArray(deck.sideboard)) {
              for (const cartaBackend of deck.sideboard) {
                const cartaScryfall = await buscarCartaPorNome(cartaBackend.nome);
                if (cartaScryfall) {
                  sideboardCards.push({
                    nome: cartaScryfall.nome,
                    quantidade: cartaBackend.quantidade || 1,
                    imagem: cartaScryfall.imagem || "",
                    isBasicLand: cartaScryfall.isBasicLand,
                    legalities: cartaScryfall.legalities || {},
                  });
                }
              }
            }

            onSetMainDeck(maindeckCards);
            onSetSideboard(sideboardCards);
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
      // Passar deckId como parâmetro ao atualizar
      onSubmit(event, undefined, id);
    } else {
      // Modo criação normal
      onSubmit(event);
    }
  };

  return (
    <main>
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
        onSubmit={handleSubmit}
        isEditMode={isEditMode}
      />
    </main>
  );
}
