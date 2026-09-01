import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useParams } from "react-router-dom";
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
const TermosDeUsoPage     = lazy(() => import("../pages/TermosDeUsoPage").then(m => ({ default: m.TermosDeUsoPage })));
const PrivacidadePage     = lazy(() => import("../pages/PrivacidadePage").then(m => ({ default: m.PrivacidadePage })));
const LandingPage         = lazy(() => import("../pages/LandingPage").then(m => ({ default: m.LandingPage })));
const LandingBlogPage     = lazy(() => import("../pages/LandingBlogPage").then(m => ({ default: m.LandingBlogPage })));
const LandingSobreMimPage = lazy(() => import("../pages/LandingSobreMimPage").then(m => ({ default: m.LandingSobreMimPage })));
const LandingParceirosPage = lazy(() => import("../pages/LandingParceirosPage").then(m => ({ default: m.LandingParceirosPage })));
const DashboardPage       = lazy(() => import("../pages/DashboardPage").then(m => ({ default: m.DashboardPage })));
const DashboardBloqueiosPage = lazy(() => import("../pages/DashboardBloqueiosPage").then(m => ({ default: m.DashboardBloqueiosPage })));
const NotFoundPage        = lazy(() => import("../pages/NotFoundPage").then(m => ({ default: m.NotFoundPage })));
const TimePage            = lazy(() => import("../pages/TimePage").then(m => ({ default: m.TimePage })));
const TimeDetailPage      = lazy(() => import("../pages/TimeDetailPage").then(m => ({ default: m.TimeDetailPage })));
const TimeCreatePage      = lazy(() => import("../pages/TimeCreatePage").then(m => ({ default: m.TimeCreatePage })));
const ContadorVidaPage    = lazy(() => import("../pages/ContadorVidaPage").then(m => ({ default: m.ContadorVidaPage })));
const CalculadoraSwissPage = lazy(() => import("../pages/CalculadoraSwissPage").then(m => ({ default: m.CalculadoraSwissPage })));
const MetagamePage = lazy(() => import("../pages/MetagamePage").then(m => ({ default: m.MetagamePage })));
const MetagameArquetipoPage = lazy(() => import("../pages/MetagameArquetipoPage").then(m => ({ default: m.MetagameArquetipoPage })));
const UserProfilePage = lazy(() => import("../pages/UserProfilePage").then(m => ({ default: m.UserProfilePage })));
const PostsPage = lazy(() => import("../pages/PostsPage").then(m => ({ default: m.PostsPage })));
const PostDetailPage = lazy(() => import("../pages/PostDetailPage").then(m => ({ default: m.PostDetailPage })));

const PageLoader = () => <Spinner text="Carregando..." />;
const LegacyPostRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/comunidade/${id}`} replace />;
};

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<TournamentPage />} />
        <Route path="/torneio" element={<Navigate to="/" replace />} />

        <Route path="/decks" element={<MyDecksPage />} />
        <Route path="/comunidade" element={<PostsPage />} />
        <Route path="/comunidade/:id" element={<UuidParamGuard param="id"><PostDetailPage /></UuidParamGuard>} />
        <Route path="/posts" element={<Navigate to="/comunidade" replace />} />
        <Route path="/posts/:id" element={<LegacyPostRedirect />} />
        <Route path="/usuarios/:id" element={
          <UuidParamGuard param="id">
            <UserProfilePage />
          </UuidParamGuard>
        } />
        <Route path="/decks/criar" element={
          <ProtectedRoute><DeckBuilderPage isEditMode={false} /></ProtectedRoute>
        } />
        <Route path="/editar-deck/:id" element={
          <UuidParamGuard param="id" allowSlug>
            <DeckBuilderPage isEditMode={true} />
          </UuidParamGuard>
        } />

        <Route path="/torneios" element={<Navigate to="/" replace />} />
        <Route path="/torneios/criar" element={
          <ProtectedRoute requireAdmin><TournamentCreatePage /></ProtectedRoute>
        } />
        <Route path="/torneios/:id" element={
          <UuidParamGuard param="id" allowTournamentSlug>
            <TournamentDetailPage />
          </UuidParamGuard>
        } />
        <Route path="/torneio/ingressar/:token" element={<TournamentJoinPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute requireAdmin><DashboardPage /></ProtectedRoute>
        } />
        <Route path="/dashboard/anuncios" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard/bloqueios" element={
          <ProtectedRoute requireAdmin><DashboardBloqueiosPage /></ProtectedRoute>
        } />

        <Route path="/times" element={<TimePage />} />
        <Route path="/times/criar" element={
          <ProtectedRoute><TimeCreatePage editMode={false} /></ProtectedRoute>
        } />
        <Route path="/times/:id" element={
          <UuidParamGuard param="id">
            <TimeDetailPage />
          </UuidParamGuard>
        } />
        <Route path="/times/:id/editar" element={
          <ProtectedRoute>
            <UuidParamGuard param="id">
              <TimeCreatePage editMode={true} />
            </UuidParamGuard>
          </ProtectedRoute>
        } />

        <Route path="/ligas" element={<LigaPage />} />
        <Route path="/metagame" element={<MetagamePage />} />
        <Route path="/metagame/:formato/:slug" element={<MetagameArquetipoPage />} />
        <Route path="/ligas/criar" element={
          <ProtectedRoute requireAdmin><LigaCreatePage editMode={false} /></ProtectedRoute>
        } />
        <Route path="/ligas/:id" element={
          <UuidParamGuard param="id">
            <LigaDetailPage />
          </UuidParamGuard>
        } />
        <Route path="/ligas/:id/editar" element={
          <ProtectedRoute requireAdmin>
            <UuidParamGuard param="id">
              <LigaCreatePage editMode={true} />
            </UuidParamGuard>
          </ProtectedRoute>
        } />

        <Route path="/ferramentas" element={<Navigate to="/ferramentas/contador-vida" replace />} />
        <Route path="/ferramentas/contador-vida" element={<ContadorVidaPage />} />
        <Route path="/ferramentas/calculadora-swiss" element={<CalculadoraSwissPage />} />

        <Route path="/esqueci-senha" element={<EsqueciSenhaPage />} />
        <Route path="/reset-senha" element={<ResetSenhaPage />} />
        <Route path="/termos-de-uso" element={<TermosDeUsoPage />} />
        <Route path="/privacidade" element={<PrivacidadePage />} />
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
