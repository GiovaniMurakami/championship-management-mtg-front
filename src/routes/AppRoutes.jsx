import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../components";
import { Home, DeckBuilderPage, MyDecksPage, TournamentPage, TournamentDetailPage } from "../pages";

export function AppRoutes({ auth, cardPreview, cardSearch, deckBuilder }) {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/decks"
        element={
          <ProtectedRoute isAuthenticated={auth.isAuthenticated}>
            <DeckBuilderPage
              isEditMode={false}
              deckForm={deckBuilder.deckForm}
              onDeckFormChange={deckBuilder.setDeckForm}
              onSetMainDeck={deckBuilder.setMainDeck}
              onSetSideboard={deckBuilder.setSideboard}
              mainSearch={cardSearch.mainSearch}
              onMainSearchChange={cardSearch.setMainSearch}
              sideSearch={cardSearch.sideSearch}
              onSideSearchChange={cardSearch.setSideSearch}
              mainSuggestions={cardSearch.mainSuggestions}
              sideSuggestions={cardSearch.sideSuggestions}
              mainDeck={deckBuilder.mainDeck}
              sideboard={deckBuilder.sideboard}
              totalMain={deckBuilder.totalMain}
              totalSide={deckBuilder.totalSide}
              onAddCard={deckBuilder.addCardToDeck}
              onRemoveCard={deckBuilder.removeCard}
              onUpdateCardQuantity={deckBuilder.updateCardQuantity}
              onCardMouseEnter={cardPreview.openCardPreview}
              onCardMouseLeave={cardPreview.closeCardPreview}
              deckLoading={deckBuilder.deckLoading}
              deckMessage={deckBuilder.deckMessage}
              cardLimitMessage={deckBuilder.cardLimitMessage}
              illegalCardMessage={deckBuilder.illegalCardMessage}
              importLoading={deckBuilder.importLoading}
              importMessage={deckBuilder.importMessage}
              onImportDeck={deckBuilder.importDeckFromTxt}
              onSubmit={(event) => deckBuilder.handleCreateDeck(event, auth.token)}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/meus-decks"
        element={
          <ProtectedRoute isAuthenticated={auth.isAuthenticated}>
            <MyDecksPage token={auth.token} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/editar-deck/:id"
        element={
          <ProtectedRoute isAuthenticated={auth.isAuthenticated}>
            <DeckBuilderPage
              isEditMode={true}
              deckForm={deckBuilder.deckForm}
              onDeckFormChange={deckBuilder.setDeckForm}
              onSetMainDeck={deckBuilder.setMainDeck}
              onSetSideboard={deckBuilder.setSideboard}
              mainSearch={cardSearch.mainSearch}
              onMainSearchChange={cardSearch.setMainSearch}
              sideSearch={cardSearch.sideSearch}
              onSideSearchChange={cardSearch.setSideSearch}
              mainSuggestions={cardSearch.mainSuggestions}
              sideSuggestions={cardSearch.sideSuggestions}
              mainDeck={deckBuilder.mainDeck}
              sideboard={deckBuilder.sideboard}
              totalMain={deckBuilder.totalMain}
              totalSide={deckBuilder.totalSide}
              onAddCard={deckBuilder.addCardToDeck}
              onRemoveCard={deckBuilder.removeCard}
              onUpdateCardQuantity={deckBuilder.updateCardQuantity}
              onCardMouseEnter={cardPreview.openCardPreview}
              onCardMouseLeave={cardPreview.closeCardPreview}
              deckLoading={deckBuilder.deckLoading}
              deckMessage={deckBuilder.deckMessage}
              cardLimitMessage={deckBuilder.cardLimitMessage}
              illegalCardMessage={deckBuilder.illegalCardMessage}
              importLoading={deckBuilder.importLoading}
              importMessage={deckBuilder.importMessage}
              onImportDeck={deckBuilder.importDeckFromTxt}
              onSubmit={(event, token, deckId, originalDeck) => deckBuilder.handleCreateDeck(event, auth.token, deckId, originalDeck)}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/torneios"
        element={
          <ProtectedRoute isAuthenticated={auth.isAuthenticated}>
            <TournamentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/torneios/:id"
        element={
          <ProtectedRoute isAuthenticated={auth.isAuthenticated}>
            <TournamentDetailPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
