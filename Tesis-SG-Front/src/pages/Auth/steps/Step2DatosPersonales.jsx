import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import StepIndicator from "@/components/ui/StepIndicator";
import GlassLoader from "@/components/ui/GlassLoader";
import { registroParcial } from "@/service/Registro/RegistroService";

export default function Step2DatosPersonales({ data, setData, onNext, onBack }) {
  const [form, setForm] = useState({
    nombres: data.nombres || "",
    segundoNombre: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    password: data.contrasena || "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const passwordChecks = {
    length: form.password.length >= 8,
    upper: /[A-Z]/.test(form.password),
    lower: /[a-z]/.test(form.password),
    number: /\d/.test(form.password),
    special: /[^A-Za-z0-9]/.test(form.password),
  };

  const allValid =
    Object.values(passwordChecks).every(Boolean) &&
    form.password === form.confirmPassword;

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    const payload = {
      email: data.correo,
      identificacion: data.identificacion,
      terminosAceptados:
        data.aceptaClausula && data.aceptaTerminos && data.aceptaPrivacidad,
      primerNombre: form.nombres,
      segundoNombre: form.segundoNombre,
      primerApellido: form.apellidoPaterno,
      segundoApellido: form.apellidoMaterno,
      contraseña: form.password,
    };

    try {
      const response = await registroParcial(payload);

      if (response.success) {
        // Guardar en localStorage
        localStorage.setItem("idUsuario", response.idUsuario);

        // Actualizar formData global
        setData((prev) => ({
          ...prev,
          nombres: form.nombres,
          contrasena: form.password,
          segundoNombre: form.segundoNombre,
          apellidoPaterno: form.apellidoPaterno,
          apellidoMaterno: form.apellidoMaterno,
        }));

        onNext(); // Avanzar al paso 3
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pattern flex flex-col items-center justify-center px-4 text-[--color-fg]">
      <GlassLoader visible={loading} message="Creando cuenta y enviando correo..." />

      <img src="/png/Logo SG 1 1.png" alt="SG Consulting Group" className="h-14 mb-8" />

      <Card className="w-full max-w-md bg-white text-[--color-fg] shadow-md rounded-xl border border-[--color-border] fade-in-up">
        <CardContent className="py-8 px-10 space-y-6">
          <StepIndicator currentStep={2} />

          <div className="space-y-1 text-left">
            <h1 className="text-3xl font-bold text-black">Datos personales</h1>
            <p className="text-sm text-[--color-muted]">Completa esta información para continuar.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Primer nombre</Label>
              <Input name="nombres" placeholder="Ej. Juan" value={form.nombres} onChange={handleChange} />
            </div>
            <div className="space-y-1.5">
              <Label>Segundo nombre</Label>
              <Input name="segundoNombre" placeholder="Ej. Carlos" value={form.segundoNombre} onChange={handleChange} />
            </div>
            <div className="space-y-1.5">
              <Label>Apellido paterno</Label>
              <Input name="apellidoPaterno" placeholder="Ej. Pérez" value={form.apellidoPaterno} onChange={handleChange} />
            </div>
            <div className="space-y-1.5">
              <Label>Apellido materno</Label>
              <Input name="apellidoMaterno" placeholder="Ej. Gómez" value={form.apellidoMaterno} onChange={handleChange} />
            </div>
          </div>

          <div className="space-y-1.5 pt-4">
            <Label>Contraseña</Label>
            <div className="relative">
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                className="pr-10"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Confirmar contraseña</Label>
            <div className="relative">
              <Input
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                value={form.confirmPassword}
                onChange={handleChange}
                className="pr-10"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute inset-y-0 right-3">
                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {form.password.length > 0 && (
            <div className="text-sm space-y-1 pt-2">
              <p className="font-medium">Tu contraseña debe incluir:</p>
              {Object.entries(passwordChecks).map(([key, passed]) => (
                <div key={key} className="flex items-center gap-2 text-[--color-muted]">
                  {passed ? <CheckCircle className="text-green-600 w-4 h-4" /> : <XCircle className="text-gray-300 w-4 h-4" />}
                  <span>
                    {{
                      length: "Más de 8 caracteres",
                      upper: "Al menos 1 mayúscula",
                      lower: "Al menos 1 minúscula",
                      number: "Al menos 1 número",
                      special: "Al menos 1 caracter especial",
                    }[key]}
                  </span>
                </div>
              ))}
            </div>
          )}

          {error && <p className="text-red-500 text-sm pt-2">{error}</p>}

          <div className="space-y-2 pt-6">
            <Button className="w-full py-3 h-12" onClick={handleSubmit} disabled={!allValid}>
              Continuar
            </Button>
            <Button variant="outline" className="w-full py-3 h-12" onClick={onBack}>
              Volver
            </Button>
          </div>
        </CardContent>
      </Card>

      <footer className="text-center text-xs text-[--color-muted] mt-8">
        © SG CONSULTING GROUP ·{" "}
        <a href="/legal/privacidad" target="_blank" className="underline hover:text-[--color-primary]">
          Privacidad y condiciones
        </a>
      </footer>
    </div>
  );
}
