import { BrowserRouter, useLocation, useNavigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";
import { ToastProvider, useToast } from "./context/ToastContext";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { Navbar, AuthModal, EditProfileModal, Footer, AdSenseLayout, ScrollToTop, CookieConsentBanner, Analytics, AnuncioDiarioModal, LogoutOverlay, NewsletterOptInModal } from "./components";
import { AppRoutes } from "./routes";
import { useEffect } from "react";
import { resolveExternalNavigationTarget } from "./utils/externalNavigation";
import { isLandingShellRoute } from "./utils/landingShell";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

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

function AppContent() {
  const {
    usuario, openAuth, clearAuth, isAuthenticated, openEditProfileModal,
    showAuthModal, closeAuth, authTab, setAuthTab, authLoading, authMessage,
    loginForm, setLoginForm, registerForm, setRegisterForm, handleLogin,
    handleRegister, loginLockout, showEditProfileModal, closeEditProfileModal,
    editProfileForm, setEditProfileForm, handleUpdateProfile,
    handleDeleteAccount, deleteAccountLoading, deleteAccountError,
    loggingOut,
    showNewsletterOptIn, newsletterOptInLoading, responderNewsletterOptIn,
    podeEditarBlog,
  } = useAuth();

  const { pathname } = useLocation();
  const isBare = isLandingShellRoute(pathname);
  const isPublicAuthRoute = pathname === "/esqueci-senha"
    || pathname === "/reset-senha";

  if (isBare) {
    return (
      <>
        <RateLimitBridge />
        <Analytics />
        <ExternalRouteSync />
        <AppRoutes />
        <AuthModal
          isOpen={showAuthModal && !isPublicAuthRoute}
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
          usuarioNome={usuario?.nome || ""}
          onDeleteAccount={handleDeleteAccount}
          deleteLoading={deleteAccountLoading}
          deleteError={deleteAccountError}
          podeEditarAssinatura={Boolean(podeEditarBlog)}
        />
        <LogoutOverlay open={loggingOut} />
      </>
    );
  }

  return (
    <div className="flex min-h-screen min-h-dvh flex-col overflow-x-clip text-text-main">
      <RateLimitBridge />
      <Analytics />
      <ExternalRouteSync />

      <Navbar
        usuario={usuario}
        onOpenAuth={openAuth}
        onLogout={clearAuth}
        isAuthenticated={isAuthenticated}
        onOpenEditProfile={openEditProfileModal}
        loggingOut={loggingOut}
      />

      <main className="flex-1 min-w-0">
        <AdSenseLayout>
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
        </AdSenseLayout>
      </main>

      <AuthModal
        isOpen={showAuthModal && !isPublicAuthRoute}
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
        usuarioNome={usuario?.nome || ""}
        onDeleteAccount={handleDeleteAccount}
        deleteLoading={deleteAccountLoading}
        deleteError={deleteAccountError}
        podeEditarAssinatura={Boolean(podeEditarBlog)}
      />

      <Footer />
      <CookieConsentBanner />
      <AnuncioDiarioModal />
      <LogoutOverlay open={loggingOut} />
      <NewsletterOptInModal
        isOpen={showNewsletterOptIn && !showAuthModal && !loggingOut}
        isLoading={newsletterOptInLoading}
        onAccept={() => responderNewsletterOptIn(true)}
        onDecline={() => responderNewsletterOptIn(false)}
      />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
