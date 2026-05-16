import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Spinner } from "../ui/Spinner";

export function ProtectedRoute({ requireAdmin = false, children }) {
  const {
    isAuthenticated,
    authInitialized,
    isAdmin,
    openAuth,
    showAuthModal,
  } = useAuth();

  useEffect(() => {
    if (authInitialized && !isAuthenticated && !showAuthModal) {
      openAuth("login");
    }
  }, [authInitialized, isAuthenticated, openAuth, showAuthModal]);

  if (!authInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size={44} text="Verificando sessÃ£o..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <Spinner size={44} text="FaÃ§a login para continuar..." />
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
            Esta Ã¡rea estÃ¡ disponÃ­vel apenas para administradores.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
