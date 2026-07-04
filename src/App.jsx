import { BrowserRouter, useLocation, useNavigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider, useToast } from "./context/ToastContext";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { Navbar, AuthModal, EditProfileModal, Footer } from "./components";
import { AppRoutes } from "./routes";
import { useEffect } from "react";
import {
  buildExternalAppUrlForPath,
  resolveExternalNavigationTarget,
  WORDPRESS_APP_URL,
} from "./utils/externalNavigation";

const BARE_ROUTES = ["/landing-page", "/blog", "/sobre-mim", "/parceiros"];

function isBareRoute(pathname) {
  if (BARE_ROUTES.includes(pathname)) return true;
  if (pathname.startsWith("/blog/")) return true;
  return pathname.startsWith("/landing/admin");
}

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

function getWordpressTargetOrigin() {
  try {
    return new URL(WORDPRESS_APP_URL).origin;
  } catch {
    return null;
  }
}

function getWordpressAllowedOrigins() {
  const origins = new Set();
  const configuredOrigin = getWordpressTargetOrigin();
  if (configuredOrigin) origins.add(configuredOrigin);

  try {
    if (document.referrer) origins.add(new URL(document.referrer).origin);
  } catch {
    // Referrer may be absent or malformed; the configured origin remains enough.
  }

  return origins;
}

function getNavigationValueFromMessage(data) {
  if (!data) return "";
  if (typeof data === "string") return data;
  if (typeof data !== "object") return "";

  return data.appPath || data.path || data.pathname || data.href || data.url || "";
}

function resolveWordpressMessageTarget(data) {
  const navigationValue = getNavigationValueFromMessage(data);
  if (!navigationValue) return null;

  try {
    const wordpressUrl = new URL(WORDPRESS_APP_URL);
    const nextUrl = new URL(navigationValue, wordpressUrl.origin);

    if (nextUrl.pathname === wordpressUrl.pathname) {
      return resolveExternalNavigationTarget({ pathname: "/", search: nextUrl.search });
    }
  } catch {
    // Plain internal paths are handled below.
  }

  const target = resolveExternalNavigationTarget({
    pathname: "/",
    search: `?appPath=${encodeURIComponent(navigationValue)}`,
  });

  return target;
}

function WordpressRouteBridge() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (window.parent === window) return;

    const allowedOrigins = getWordpressAllowedOrigins();
    if (allowedOrigins.size === 0) return;

    const handleMessage = (event) => {
      if (event.source !== window.parent) return;
      if (!allowedOrigins.has(event.origin)) return;

      const data = event.data;
      const messageType = typeof data === "object" && data ? data.type : "";
      const acceptsImplicitNavigation = !messageType && getNavigationValueFromMessage(data);
      const acceptsTypedNavigation = [
        "APP_NAVIGATE",
        "WORDPRESS_NAVIGATE",
        "WORDPRESS_ROUTE_CHANGED",
      ].includes(messageType);

      if (!acceptsImplicitNavigation && !acceptsTypedNavigation) return;

      const target = resolveWordpressMessageTarget(data);
      if (!target) return;

      const nextUrl = `${target.pathname}${target.search}`;
      const currentUrl = `${window.location.pathname}${window.location.search}`;
      if (nextUrl !== currentUrl) navigate(nextUrl, { replace: false });
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [navigate]);

  useEffect(() => {
    if (window.parent === window) return;

    const allowedOrigins = getWordpressAllowedOrigins();
    if (allowedOrigins.size === 0) return;

    const path = `${location.pathname}${location.search}`;
    const url = buildExternalAppUrlForPath(path);
    const message = {
      type: "APP_ROUTE_CHANGED",
      source: "championship-management-mtg-front",
      path,
      href: path,
      url,
    };

    allowedOrigins.forEach((origin) => {
      window.parent.postMessage(message, origin);
    });
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
  const isBare = isBareRoute(pathname);
  const isPublicAuthRoute = pathname === "/esqueci-senha"
    || pathname === "/reset-senha"
    || pathname === "/termos-de-uso";

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
    <div className="min-h-screen flex flex-col text-text-main overflow-x-clip">
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

      <main className="flex-1 min-w-0 overflow-x-clip">
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
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
      />

      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
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
