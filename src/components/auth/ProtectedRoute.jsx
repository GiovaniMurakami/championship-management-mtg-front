import { Navigate } from "react-router-dom";

export function ProtectedRoute({ isAuthenticated, requireAdmin = false, isAdmin = false, children }) {
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/torneios" replace />;
  return children;
}
