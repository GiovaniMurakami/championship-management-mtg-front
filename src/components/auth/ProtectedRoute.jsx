import { Navigate } from "react-router-dom";
import { Spinner } from "../ui/Spinner";

export function ProtectedRoute({ isAuthenticated, authInitialized, requireAdmin = false, isAdmin = false, children }) {
  if (!authInitialized) return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size={44} text="Verificando sessão..." />
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/torneios" replace />;
  return children;
}
