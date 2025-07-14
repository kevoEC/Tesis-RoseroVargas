import { useLocation, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();    // Tu context de autenticación
  const location = useLocation();                      // Para saber qué ruta intentaba el usuario

  if (isLoading) return null;                          // Mientras carga, no muestra nada (o Loader)

  if (!isAuthenticated) {
    // Guarda la ruta original antes de mandar a login, para volver después
    sessionStorage.setItem("postLoginRedirect", location.pathname + location.search);
    return <Navigate to="/login" replace />;           // Redirige a login
  }

  return <Outlet />;                                   // Renderiza el contenido privado si está autenticado
}
