import { Navigate } from "react-router-dom";

export function ProtectedRoute({ isAuthenticated, authInitialized, requireAdmin = false, isAdmin = false, children }) {
  if (!authInitialized) return null;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/torneios" replace />;
  return children;
}
