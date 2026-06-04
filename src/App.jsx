import { BrowserRouter, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider, useToast } from "./context/ToastContext";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { Navbar, AuthModal, EditProfileModal, Footer } from "./components";
import { AppRoutes } from "./routes";
import { useEffect } from "react";
import { resolveExternalNavigationTarget, WORDPRESS_APP_URL } from "./utils/externalNavigation";

const BARE_ROUTES = ["/blog", "/sobre-mim", "/parceiros"];

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

function ExternalRouteSync() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const target = resolveExternalNavigationTarget(location);
    if (!target) return;

    const nextUrl = `${target.pathname}${target.search}`;
    const currentUrl = `${location.pathname}${location.search}`;

    if (nextUrl !== currentUrl) {
      navigate(nextUrl, { replace: true });
    }
  }, [location, navigate]);

  return null;
}

function getWordpressTargetOrigin() {
  try {
    return new URL(WORDPRESS_APP_URL).origin;
  } catch {
    return null;
  }
}

function WordpressRouteBridge() {
  const location = useLocation();

  useEffect(() => {
    if (window.parent === window) return;

    const targetOrigin = getWordpressTargetOrigin();
    if (!targetOrigin) return;

    window.parent.postMessage(
      {
        type: "APP_ROUTE_CHANGED",
        path: `${location.pathname}${location.search}`,
      },
      targetOrigin,
    );
  }, [location.pathname, location.search]);

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

  if (isBare) {
    return (
      <>
        <ExternalRouteSync />
        <WordpressRouteBridge />
        <AppRoutes />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col text-text-main">
      <RateLimitBridge />
      <ExternalRouteSync />
      <WordpressRouteBridge />

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
