import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import StepIndicator from "@/components/ui/StepIndicator";
import GlassLoader from "@/components/ui/GlassLoader";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from "@/components/ui/select";
import {
  enviarCodigoTelefono,
  validarCodigoTelefono
} from "@/service/Registro/RegistroService";

const countries = [
  { code: "+593", label: "Ecuador" },
  { code: "+57", label: "Colombia" },
  { code: "+51", label: "Perú" },
  { code: "+52", label: "México" },
  { code: "+1", label: "EE.UU." },
];

export default function Step4VerificacionTelefono({ onNext }) {
  const idUsuario = localStorage.getItem("idUsuario");
  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("+593");
  const [token, setToken] = useState("");
  const [openConfirm, setOpenConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const fullPhone = `${country} ${phone}`;

  useEffect(() => {
    if (!idUsuario) {
      toast.error("ID de usuario no encontrado.");
    }
  }, []);

  const sendToken = async () => {
    setOpenConfirm(false);
    setLoading(true);

    try {
      const response = await enviarCodigoTelefono({
        idUsuario: parseInt(idUsuario),
        numero: phone,
        extension: country
      });

      if (!response.success) {
        toast.error(response.message || "No se pudo enviar el SMS.");
        return;
      }

      if (response.yaValidado) {
        toast.success("Número ya validado ✅");
        onNext();
        return;
      }

      toast.success("Código enviado por SMS 📲");
      setStep("token");
    } catch (error) {
      toast.error("Error al contactar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const verifyToken = async () => {
    setLoading(true);

    try {
      const response = await validarCodigoTelefono({
        idUsuario: parseInt(idUsuario),
        codigo: token
      });

      if (!response.success) {
        toast.error(response.message || "Código inválido o expirado.");
        return;
      }

      toast.success("Número verificado correctamente ✅");
      onNext();
    } catch (error) {
      toast.error("Error al validar el código.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pattern flex flex-col items-center justify-center px-4 text-[--color-fg]">
      <GlassLoader visible={loading} message="Procesando solicitud..." />

      <img
        src="/png/Logo SG 1 1.png"
        alt="SG Consulting Group"
        className="h-14 mb-6"
      />

      <Card className="w-full max-w-md bg-white text-[--color-fg] shadow-md rounded-xl border border-[--color-border] fade-in-up">
        <CardContent className="py-8 px-10 space-y-6">
          <StepIndicator currentStep={4} />

          {step === "phone" ? (
            <>
              <div className="text-left space-y-1">
                <h2 className="text-2xl font-bold text-black">Validar celular</h2>
                <p className="text-sm text-[--color-muted]">
                  Ingresa tu número de celular para enviarte un código de verificación.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-medium">Número de celular</Label>
                <div className="flex gap-2">
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger className="w-32 h-11 bg-[--color-bg] border border-[--color-border] text-sm">
                      <SelectValue placeholder="País" />
                    </SelectTrigger>
                    <SelectContent className="bg-white shadow-xl rounded-md border border-[--color-border]">
                      {countries.map((c) => (
                        <SelectItem
                          key={c.code}
                          value={c.code}
                          className="text-sm px-3 py-2"
                        >
                          {c.code} {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    type="tel"
                    placeholder="Ej. 0991234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="flex-1 h-11 text-base bg-[--color-bg] border border-[--color-border]"
                  />
                </div>
              </div>

              <div className="pt-4">
                <AlertDialog open={openConfirm} onOpenChange={setOpenConfirm}>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      className="w-full btn-primary btn-animated text-base py-3 h-12"
                      disabled={!phone.trim()}
                    >
                      Enviar código
                    </Button>
                  </AlertDialogTrigger>

                  <AlertDialogContent className="bg-white border border-[--color-border] shadow-2xl rounded-2xl p-6 text-[--color-fg] max-w-md w-full space-y-4">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-lg font-semibold text-center leading-relaxed">
                        ¿Deseas enviar el código a <span className="text-black font-bold">{fullPhone}</span>?
                      </AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex justify-center gap-4 pt-2">
                      <AlertDialogCancel className="btn-microsoft btn-animated px-6 h-10 text-sm">
                        Cancelar
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="btn-primary btn-animated px-6 h-10 text-sm"
                        onClick={sendToken}
                      >
                        Sí, enviar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </>
          ) : (
            <>
              <div className="text-left space-y-1">
                <h2 className="text-2xl font-bold text-black">Código de verificación</h2>
                <p className="text-sm text-[--color-muted]">
                  Ingresa el código que te enviamos al número{" "}
                  <strong className="text-black">{fullPhone}</strong>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="token" className="text-base font-medium">
                  Código de verificación
                </Label>
                <Input
                  id="token"
                  type="text"
                  placeholder="Ej. 123456"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="h-11 text-base bg-[--color-bg] border border-[--color-border]"
                />
              </div>

              <div className="pt-4">
                <Button
                  type="button"
                  onClick={verifyToken}
                  className="w-full btn-primary btn-animated text-base py-3 h-12"
                  disabled={!token.trim()}
                >
                  Confirmar
                </Button>
              </div>
            </>
          )}
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
