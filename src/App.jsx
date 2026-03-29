import { BrowserRouter } from "react-router-dom";
import { Navbar, AuthModal, CardPreviewModal, EditProfileModal } from "./components";
import { useAuth, useCardPreview, useCardSearch, useDeckBuilder } from "./hooks";
import { AppRoutes } from "./routes";

function App() {
  const auth = useAuth();
  const cardPreview = useCardPreview();
  const cardSearch = useCardSearch();
  const deckBuilder = useDeckBuilder();

  return (
    <BrowserRouter>
      <div className="min-h-screen text-[#f5edff]">
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
      </div>
    </BrowserRouter>
  );
}

export default App;
