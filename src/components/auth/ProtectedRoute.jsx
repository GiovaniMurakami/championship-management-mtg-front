import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Spinner } from "../ui/Spinner";

const PUBLIC_AUTH_PATHS = ["/esqueci-senha", "/reset-senha"];

export function ProtectedRoute({ requireAdmin = false, children }) {
  const {
    isAuthenticated,
    authInitialized,
    authRefreshing,
    isAdmin,
    openAuth,
    showAuthModal,
  } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Não abre a modal enquanto um refresh ainda pode recuperar a sessão
    if (authInitialized && !authRefreshing && !isAuthenticated && !showAuthModal) {
      if (PUBLIC_AUTH_PATHS.includes(location.pathname)) return;
      openAuth("login");
    }
  }, [authInitialized, authRefreshing, isAuthenticated, openAuth, showAuthModal, location.pathname]);

  if (!authInitialized || (authRefreshing && !isAuthenticated)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size={44} text="Verificando sessão..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <Spinner size={44} text="Faça login para continuar..." />
      </div>
    );
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md text-center text-[#f5edff]">
          <h2 className="m-0 mb-2 font-['Bebas_Neue',sans-serif] text-[1.8rem] tracking-[0.04em]">
            Acesso restrito
          </h2>
          <p className="m-0 text-[0.95rem] text-[#beafd7]">
            Esta área está disponível apenas para administradores.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
