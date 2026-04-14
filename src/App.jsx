import { BrowserRouter, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider, useToast } from "./context/ToastContext";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { Navbar, AuthModal, EditProfileModal, Footer } from "./components";
import { AppRoutes } from "./routes";
import { useEffect } from "react";

const BARE_ROUTES = ["/", "/blog", "/sobre-mim", "/parceiros"];

/** Conecta eventos de rate-limit do interceptor ao ToastProvider. */
function RateLimitBridge() {
  const { addToast } = useToast();
  useEffect(() => {
    const handle = (e) => addToast(e.detail.message, { type: "error", duration: 8000 });
    window.addEventListener("auth:rateLimited", handle);
    return () => window.removeEventListener("auth:rateLimited", handle);
  }, [addToast]);
  return null;
}

function AppContent() {
  const {
    usuario, openAuth, clearAuth, isAuthenticated, openEditProfileModal,
    showAuthModal, closeAuth, authTab, setAuthTab, authLoading, authMessage,
    loginForm, setLoginForm, registerForm, setRegisterForm, handleLogin,
    handleRegister, loginLockout, showEditProfileModal, closeEditProfileModal,
    editProfileForm, setEditProfileForm, handleUpdateProfile,
  } = useAuth();

  const { pathname } = useLocation();
  const isBare = BARE_ROUTES.includes(pathname);

  if (isBare) return <AppRoutes />;

  return (
    <div className="min-h-screen flex flex-col text-text-main">
      <RateLimitBridge />

      <Navbar
        usuario={usuario}
        onOpenAuth={openAuth}
        onLogout={clearAuth}
        isAuthenticated={isAuthenticated}
        onOpenEditProfile={openEditProfileModal}
      />

      <main className="flex-1">
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </main>

      <AuthModal
        isOpen={showAuthModal}
        onClose={closeAuth}
        activeTab={authTab}
        onTabChange={setAuthTab}
        isLoading={authLoading}
        message={authMessage}
        loginForm={loginForm}
        onLoginFormChange={setLoginForm}
        registerForm={registerForm}
        onRegisterFormChange={setRegisterForm}
        onLoginSubmit={handleLogin}
        onRegisterSubmit={handleRegister}
        loginLockout={loginLockout}
      />

      <EditProfileModal
        isOpen={showEditProfileModal}
        onClose={closeEditProfileModal}
        isLoading={authLoading}
        message={authMessage}
        form={editProfileForm}
        onFormChange={setEditProfileForm}
        onSubmit={handleUpdateProfile}
      />

      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
