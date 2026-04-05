import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../components";
import { Spinner } from "../components/ui/Spinner";
import { Home } from "../pages/Home";

// Rotas lazy-loaded — cada rota gera um chunk separado pelo Vite
const DeckBuilderPage = lazy(() => import("../pages/DeckBuilderPage").then(m => ({ default: m.DeckBuilderPage })));
const MyDecksPage = lazy(() => import("../pages/MyDecksPage").then(m => ({ default: m.MyDecksPage })));
const TournamentPage = lazy(() => import("../pages/TournamentPage").then(m => ({ default: m.TournamentPage })));
const TournamentDetailPage = lazy(() => import("../pages/TournamentDetailPage").then(m => ({ default: m.TournamentDetailPage })));
const TournamentCreatePage = lazy(() => import("../pages/TournamentCreatePage").then(m => ({ default: m.TournamentCreatePage })));
const TournamentJoinPage = lazy(() => import("../pages/TournamentJoinPage").then(m => ({ default: m.TournamentJoinPage })));
const LigaPage = lazy(() => import("../pages/LigaPage").then(m => ({ default: m.LigaPage })));
const LigaDetailPage = lazy(() => import("../pages/LigaDetailPage").then(m => ({ default: m.LigaDetailPage })));
const LigaCreatePage = lazy(() => import("../pages/LigaCreatePage").then(m => ({ default: m.LigaCreatePage })));
const EsqueciSenhaPage = lazy(() => import("../pages/EsqueciSenhaPage").then(m => ({ default: m.EsqueciSenhaPage })));
const ResetSenhaPage = lazy(() => import("../pages/ResetSenhaPage").then(m => ({ default: m.ResetSenhaPage })));
const LandingPage = lazy(() => import("../pages/LandingPage").then(m => ({ default: m.LandingPage })));
const LandingDecksPage = lazy(() => import("../pages/LandingDecksPage").then(m => ({ default: m.LandingDecksPage })));
const LandingBlogPage = lazy(() => import("../pages/LandingBlogPage").then(m => ({ default: m.LandingBlogPage })));
const LandingSobreMimPage = lazy(() => import("../pages/LandingSobreMimPage").then(m => ({ default: m.LandingSobreMimPage })));
const LandingParceirosPage = lazy(() => import("../pages/LandingParceirosPage").then(m => ({ default: m.LandingParceirosPage })));

const PageLoader = () => <Spinner text="Carregando..." />;

export function AppRoutes({ auth, cardPreview, cardSearch, deckBuilder }) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/torneio" element={<Home onOpenAuth={auth.openAuth} isAuthenticated={auth.isAuthenticated} />} />
        <Route
          path="/decks"
          element={
            <ProtectedRoute isAuthenticated={auth.isAuthenticated} authInitialized={auth.authInitialized}>
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
                onPreviewDismiss={cardPreview.closeCardPreview}
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
            <ProtectedRoute isAuthenticated={auth.isAuthenticated} authInitialized={auth.authInitialized}>
              <MyDecksPage token={auth.token} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/editar-deck/:id"
          element={
            <ProtectedRoute isAuthenticated={auth.isAuthenticated} authInitialized={auth.authInitialized}>
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
                onPreviewDismiss={cardPreview.closeCardPreview}
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
            <ProtectedRoute isAuthenticated={auth.isAuthenticated} authInitialized={auth.authInitialized}>
              <TournamentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/torneios/criar"
          element={
            <ProtectedRoute isAuthenticated={auth.isAuthenticated} authInitialized={auth.authInitialized} requireAdmin isAdmin={auth.isAdmin}>
              <TournamentCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/torneios/:id"
          element={
            <ProtectedRoute isAuthenticated={auth.isAuthenticated} authInitialized={auth.authInitialized}>
              <TournamentDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/torneio/ingressar/:token"
          element={
            <ProtectedRoute isAuthenticated={auth.isAuthenticated} authInitialized={auth.authInitialized}>
              <TournamentJoinPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ligas"
          element={
            <ProtectedRoute isAuthenticated={auth.isAuthenticated} authInitialized={auth.authInitialized}>
              <LigaPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ligas/criar"
          element={
            <ProtectedRoute isAuthenticated={auth.isAuthenticated} authInitialized={auth.authInitialized} requireAdmin isAdmin={auth.isAdmin}>
              <LigaCreatePage editMode={false} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ligas/:id"
          element={
            <ProtectedRoute isAuthenticated={auth.isAuthenticated} authInitialized={auth.authInitialized}>
              <LigaDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ligas/:id/editar"
          element={
            <ProtectedRoute isAuthenticated={auth.isAuthenticated} authInitialized={auth.authInitialized} requireAdmin isAdmin={auth.isAdmin}>
              <LigaCreatePage editMode={true} />
            </ProtectedRoute>
          }
        />
        <Route path="/esqueci-senha" element={<EsqueciSenhaPage />} />
        <Route path="/reset-senha" element={<ResetSenhaPage />} />
        <Route path="/decks" element={<LandingDecksPage />} />
        <Route path="/blog" element={<LandingBlogPage />} />
        <Route path="/sobre-mim" element={<LandingSobreMimPage />} />
        <Route path="/parceiros" element={<LandingParceirosPage />} />
        <Route path="/landing-page" element={<Navigate to="/" replace />} />
        <Route path="/landing-page/decks" element={<Navigate to="/decks" replace />} />
        <Route path="/landing-page/blog" element={<Navigate to="/blog" replace />} />
        <Route path="/landing-page/sobre-mim" element={<Navigate to="/sobre-mim" replace />} />
        <Route path="/landing-page/parceiros" element={<Navigate to="/parceiros" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
