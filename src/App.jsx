import { BrowserRouter, useLocation } from "react-router-dom";
import { Navbar, AuthModal, CardPreviewModal, EditProfileModal, Footer } from "./components";
import { useAuth, useCardPreview, useCardSearch, useDeckBuilder } from "./hooks";
import { AppRoutes } from "./routes";

const BARE_ROUTES = ["/", "/decks", "/blog", "/sobre-mim", "/parceiros"];

function AppContent() {
  const auth = useAuth();
  const cardPreview = useCardPreview();
  const cardSearch = useCardSearch();
  const deckBuilder = useDeckBuilder();
  const { pathname } = useLocation();

  const isBare = BARE_ROUTES.includes(pathname);

  if (isBare) {
    return (
      <AppRoutes
        auth={auth}
        cardPreview={cardPreview}
        cardSearch={cardSearch}
        deckBuilder={deckBuilder}
      />
    );
  }

  return (
    <div className="min-h-screen text-[#f5edff]">
      {/* Global rate-limit toast */}
      {auth.rateLimitMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-xl border border-[rgba(252,88,119,0.4)] bg-[rgba(30,15,45,0.95)] backdrop-blur-md text-[#ffa8b8] text-[0.9rem] font-semibold shadow-[0_8px_24px_rgba(0,0,0,0.4)] animate-[slide-up_300ms_ease-out]">
          {auth.rateLimitMsg}
        </div>
      )}
      <Navbar
        usuario={auth.usuario}
        onOpenAuth={auth.openAuth}
        onLogout={auth.clearAuth}
        isAuthenticated={auth.isAuthenticated}
        onOpenEditProfile={auth.openEditProfileModal}
      />

      <AppRoutes
        auth={auth}
        cardPreview={cardPreview}
        cardSearch={cardSearch}
        deckBuilder={deckBuilder}
      />

      <CardPreviewModal card={cardPreview.previewCard} />

      <AuthModal
        isOpen={auth.showAuthModal}
        onClose={auth.closeAuth}
        activeTab={auth.authTab}
        onTabChange={auth.setAuthTab}
        isLoading={auth.authLoading}
        message={auth.authMessage}
        loginForm={auth.loginForm}
        onLoginFormChange={auth.setLoginForm}
        registerForm={auth.registerForm}
        onRegisterFormChange={auth.setRegisterForm}
        onLoginSubmit={auth.handleLogin}
        onRegisterSubmit={auth.handleRegister}
        loginLockout={auth.loginLockout}
      />

      <EditProfileModal
        isOpen={auth.showEditProfileModal}
        onClose={auth.closeEditProfileModal}
        isLoading={auth.authLoading}
        message={auth.authMessage}
        form={auth.editProfileForm}
        onFormChange={auth.setEditProfileForm}
        onSubmit={auth.handleUpdateProfile}
      />

      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
