// src/routes/ProtectedRoute.jsx
import { useLocation, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return null; // Solo aquí puedes retornar null mientras carga, pero nunca permanente

  if (!isAuthenticated) {
    // Guarda la ruta original antes de redirigir
    sessionStorage.setItem("postLoginRedirect", location.pathname + location.search);

    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
