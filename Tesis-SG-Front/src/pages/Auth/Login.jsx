import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useUI } from "@/hooks/useUI";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff } from "lucide-react";
import GlassLoader from "@/components/ui/GlassLoader";
import { mapearPermisosConIconos } from "@/utils/mapPermisos";

// Función mejorada para evitar "Catálogo" vacío y mostrar depuración de rutas:
function obtenerPrimeraRutaValida(permisos) {
  if (!permisos) return "/";
  for (const permiso of permisos) {
    // Saltar "Catálogo" si no tiene hijos
    if (
      (permiso.Nombre === "Catálogo" || permiso.Menu === 999) &&
      (!permiso.Submenus || permiso.Submenus.length === 0)
    ) {
      continue;
    }
    if (permiso.Ruta && typeof permiso.Ruta === "string") {
      console.log("[obtenerPrimeraRutaValida] Primer menú navegable:", permiso.Nombre, permiso.Ruta);
      return permiso.Ruta;
    }
    if (permiso.Submenus && Array.isArray(permiso.Submenus) && permiso.Submenus.length > 0) {
      const sub = permiso.Submenus.find(s => s.Ruta);
      if (sub) {
        console.log("[obtenerPrimeraRutaValida] Primer submenú navegable:", sub.Nombre, sub.Ruta);
        return sub.Ruta;
      }
    }
  }
  console.log("[obtenerPrimeraRutaValida] No se encontró ruta navegable, se retorna '/'");
  return "/";
}

export default function Login() {
  const { login } = useAuth();
  const { notify } = useUI();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [email, setEmail] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      if (!email || !contraseña) {
        notify.error("Por favor ingresa tus credenciales.");
        return;
      }
      if (!/\S+@\S+\.\S+/.test(email)) {
        notify.error("Por favor ingresa un correo electrónico válido.");
        return;
      }

      setLoading(true);

      console.log("[Login] Intentando login para:", email);

      await login(email, contraseña);

      // Espera a que el usuario esté guardado en localStorage
      const userData = JSON.parse(localStorage.getItem("user"));
      console.log("[Login] userData desde localStorage:", userData);

      let permisos = userData?.permisos || [];
      // Por si acaso, mapea los permisos si no tienen rutas
      if (!permisos[0]?.Ruta && !permisos[0]?.Submenus) {
        permisos = mapearPermisosConIconos(permisos);
      }
      console.log("[Login] Permisos procesados:", permisos);

      const rutaInicial = obtenerPrimeraRutaValida(permisos) || "/";
      console.log("[Login] Ruta inicial encontrada:", rutaInicial);

      notify.success("Bienvenido 👋");
      navigate(rutaInicial);

    } catch (err) {
      notify.error("Error al iniciar sesión", err.message);
      console.error("[Login] Error en login:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pattern flex flex-col items-center justify-center px-4 text-[--color-fg] relative">
      {loading && <GlassLoader message="Verificando credenciales..." />}

      <img
        src="/png/Logo SG 1 1.png"
        alt="SG Consulting Group"
        className="h-14 mb-8 z-10"
      />

      <Card className="w-full max-w-md bg-white text-[--color-fg] shadow-md rounded-xl border border-[--color-border] fade-in-up z-10">
        <CardContent className="py-8 px-10 space-y-8">
          <div className="space-y-1 text-left">
            <h1 className="text-3xl font-bold text-black">Inicio de sesión</h1>
            <p className="text-sm text-[--color-muted]">Ingresa a tu cuenta para continuar.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-base font-medium">
              Correo electrónico
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="usuario@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 text-base bg-[--color-bg] border border-[--color-border]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-base font-medium">
              Contraseña
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={contraseña}
                onChange={(e) => setContraseña(e.target.value)}
                className="h-11 text-base pr-12 bg-[--color-bg] border border-[--color-border]"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-[--color-muted] hover:text-[--color-fg]"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="remember"
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 rounded border-[--color-border] accent-[--color-primary]"
            />
            <label htmlFor="remember" className="text-sm text-[--color-muted]">
              Recordarme en este dispositivo
            </label>
          </div>

          <div className="space-y-3 pt-2">
            <Button
              className="w-full btn-primary btn-animated text-base py-3 h-12"
              onClick={handleLogin}
              disabled={loading}
            >
              Ingresar
            </Button>
          </div>

          <Separator />

          <div className="text-center space-y-1">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-sm text-[--color-muted] hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
            <p className="text-sm text-[--color-muted]">
              ¿No tienes una cuenta?{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="text-[--color-primary] hover:underline font-medium"
              >
                Regístrate
              </button>
            </p>
          </div>
        </CardContent>
      </Card>

      <footer className="text-center text-xs text-[--color-muted] mt-8 z-10">
        © SG CONSULTING GROUP ·{" "}
        <a href="/legal/privacidad" target="_blank" className="underline hover:text-[--color-primary]">
          Privacidad y condiciones
        </a>
      </footer>
    </div>
  );
}
