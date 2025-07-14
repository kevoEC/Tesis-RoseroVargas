import { useAuth } from "@/hooks/useAuth";
import Login from "@/pages/Auth/Login";

export default function LoginRedirect() {
  const { isAuthenticated } = useAuth();

  // Si ya está autenticado, NO renderizas nada (el ProtectedRoute manejará el resto)
  if (isAuthenticated) return null;

  return <Login />;
}

