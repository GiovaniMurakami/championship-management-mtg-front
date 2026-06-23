import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../components";
import { UuidParamGuard } from "../components/ui/UuidParamGuard";
import { Spinner } from "../components/ui/Spinner";

// Rotas lazy-loaded — cada rota gera um chunk separado pelo Vite
const DeckBuilderPage     = lazy(() => import("../pages/DeckBuilderPage").then(m => ({ default: m.DeckBuilderPage })));
const MyDecksPage         = lazy(() => import("../pages/MyDecksPage").then(m => ({ default: m.MyDecksPage })));
const TournamentPage      = lazy(() => import("../pages/TournamentPage").then(m => ({ default: m.TournamentPage })));
const TournamentDetailPage = lazy(() => import("../pages/TournamentDetailPage").then(m => ({ default: m.TournamentDetailPage })));
const TournamentCreatePage = lazy(() => import("../pages/TournamentCreatePage").then(m => ({ default: m.TournamentCreatePage })));
const TournamentJoinPage  = lazy(() => import("../pages/TournamentJoinPage").then(m => ({ default: m.TournamentJoinPage })));
const LigaPage            = lazy(() => import("../pages/LigaPage").then(m => ({ default: m.LigaPage })));
const LigaDetailPage      = lazy(() => import("../pages/LigaDetailPage").then(m => ({ default: m.LigaDetailPage })));
const LigaCreatePage      = lazy(() => import("../pages/LigaCreatePage").then(m => ({ default: m.LigaCreatePage })));
const EsqueciSenhaPage    = lazy(() => import("../pages/EsqueciSenhaPage").then(m => ({ default: m.EsqueciSenhaPage })));
const ResetSenhaPage      = lazy(() => import("../pages/ResetSenhaPage").then(m => ({ default: m.ResetSenhaPage })));
const LandingPage         = lazy(() => import("../pages/LandingPage").then(m => ({ default: m.LandingPage })));
const LandingBlogPage     = lazy(() => import("../pages/LandingBlogPage").then(m => ({ default: m.LandingBlogPage })));
const LandingSobreMimPage = lazy(() => import("../pages/LandingSobreMimPage").then(m => ({ default: m.LandingSobreMimPage })));
const LandingParceirosPage = lazy(() => import("../pages/LandingParceirosPage").then(m => ({ default: m.LandingParceirosPage })));
const DashboardPage       = lazy(() => import("../pages/DashboardPage").then(m => ({ default: m.DashboardPage })));
const NotFoundPage        = lazy(() => import("../pages/NotFoundPage").then(m => ({ default: m.NotFoundPage })));
const TimePage            = lazy(() => import("../pages/TimePage").then(m => ({ default: m.TimePage })));
const TimeDetailPage      = lazy(() => import("../pages/TimeDetailPage").then(m => ({ default: m.TimeDetailPage })));
const TimeCreatePage      = lazy(() => import("../pages/TimeCreatePage").then(m => ({ default: m.TimeCreatePage })));

const PageLoader = () => <Spinner text="Carregando..." />;

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={
          <ProtectedRoute><TournamentPage /></ProtectedRoute>
        } />
        <Route path="/torneio" element={<Navigate to="/" replace />} />

        <Route path="/decks" element={
          <ProtectedRoute><MyDecksPage /></ProtectedRoute>
        } />
        <Route path="/decks/criar" element={
          <ProtectedRoute><DeckBuilderPage isEditMode={false} /></ProtectedRoute>
        } />
        <Route path="/editar-deck/:id" element={
          <ProtectedRoute>
            <UuidParamGuard param="id">
              <DeckBuilderPage isEditMode={true} />
            </UuidParamGuard>
          </ProtectedRoute>
        } />

        <Route path="/torneios" element={<Navigate to="/" replace />} />
        <Route path="/torneios/criar" element={
          <ProtectedRoute requireAdmin><TournamentCreatePage /></ProtectedRoute>
        } />
        <Route path="/torneios/:id" element={
          <ProtectedRoute>
            <UuidParamGuard param="id">
              <TournamentDetailPage />
            </UuidParamGuard>
          </ProtectedRoute>
        } />
        <Route path="/torneio/ingressar/:token" element={<TournamentJoinPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute requireAdmin><DashboardPage /></ProtectedRoute>
        } />

        <Route path="/times" element={
          <ProtectedRoute><TimePage /></ProtectedRoute>
        } />
        <Route path="/times/criar" element={
          <ProtectedRoute><TimeCreatePage editMode={false} /></ProtectedRoute>
        } />
        <Route path="/times/:id" element={
          <ProtectedRoute>
            <UuidParamGuard param="id">
              <TimeDetailPage />
            </UuidParamGuard>
          </ProtectedRoute>
        } />
        <Route path="/times/:id/editar" element={
          <ProtectedRoute>
            <UuidParamGuard param="id">
              <TimeCreatePage editMode={true} />
            </UuidParamGuard>
          </ProtectedRoute>
        } />

        <Route path="/ligas" element={
          <ProtectedRoute><LigaPage /></ProtectedRoute>
        } />
        <Route path="/ligas/criar" element={
          <ProtectedRoute requireAdmin><LigaCreatePage editMode={false} /></ProtectedRoute>
        } />
        <Route path="/ligas/:id" element={
          <ProtectedRoute>
            <UuidParamGuard param="id">
              <LigaDetailPage />
            </UuidParamGuard>
          </ProtectedRoute>
        } />
        <Route path="/ligas/:id/editar" element={
          <ProtectedRoute requireAdmin>
            <UuidParamGuard param="id">
              <LigaCreatePage editMode={true} />
            </UuidParamGuard>
          </ProtectedRoute>
        } />

        <Route path="/esqueci-senha" element={<EsqueciSenhaPage />} />
        <Route path="/reset-senha" element={<ResetSenhaPage />} />
        <Route path="/blog" element={<LandingBlogPage />} />
        <Route path="/sobre-mim" element={<LandingSobreMimPage />} />
        <Route path="/parceiros" element={<LandingParceirosPage />} />

        {/* Redirects de rotas antigas */}
        <Route path="/landing-page" element={<Navigate to="/" replace />} />
        <Route path="/landing-page/blog" element={<Navigate to="/blog" replace />} />
        <Route path="/landing-page/sobre-mim" element={<Navigate to="/sobre-mim" replace />} />
        <Route path="/landing-page/parceiros" element={<Navigate to="/parceiros" replace />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
