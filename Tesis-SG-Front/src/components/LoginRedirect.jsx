import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import Login from "@/pages/Auth/Login";

// Copia aquí la función:
function obtenerPrimeraRutaValida(permisos) {
  if (!permisos) return "/";
  for (const permiso of permisos) {
    if (
      (permiso.Nombre === "Catálogo" || permiso.Menu === 999) &&
      (!permiso.Submenus || permiso.Submenus.length === 0)
    ) {
      continue;
    }
    if (permiso.Ruta && typeof permiso.Ruta === "string") {
      return permiso.Ruta;
    }
    if (permiso.Submenus && Array.isArray(permiso.Submenus) && permiso.Submenus.length > 0) {
      const sub = permiso.Submenus.find(s => s.Ruta);
      if (sub) return sub.Ruta;
    }
  }
  return "/";
}

export default function LoginRedirect() {
  const { isAuthenticated, permisos, isLoading } = useAuth();

  if (isLoading) return null;
  if (isAuthenticated) {
    // Redirige al primer menú disponible
    const rutaInicial = obtenerPrimeraRutaValida(permisos) || "/";
    return <Navigate to={rutaInicial} replace />;
  }

  return <Login />;
}
