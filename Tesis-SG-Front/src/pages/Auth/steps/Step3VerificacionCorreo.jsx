import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import StepIndicator from "@/components/ui/StepIndicator";

export default function Step3VerificacionCorreo({ data }) {
  const [email] = useState(data.correo || "usuario@correo.com");

  return (
    <div className="min-h-screen bg-pattern flex flex-col items-center justify-center px-4 text-[--color-fg]">
      {/* Logo SG */}
      <img
        src="/png/Logo SG 1 1.png"
        alt="SG Consulting Group"
        className="h-14 mb-8"
      />

      {/* Card */}
      <Card className="w-full max-w-md bg-white text-[--color-fg] shadow-md rounded-xl border border-[--color-border] fade-in-up">
        <CardContent className="py-8 px-10 space-y-8 text-center">
          <StepIndicator currentStep={3} />

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-black">Revisa tu correo electrónico</h1>
            <p className="text-sm text-[--color-muted] leading-relaxed">
              Te hemos enviado un enlace de activación a: <br />
              <strong className="text-black">{email}</strong> <br />
              Por favor, revisa tu bandeja de entrada (o la carpeta de spam) y sigue las instrucciones para continuar con tu registro.
            </p>
          </div>

          <div className="text-xs text-[--color-muted] pt-2">
            Este paso se completará automáticamente cuando verifiques tu cuenta desde el enlace enviado.
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <footer className="text-center text-xs text-[--color-muted] mt-8">
        © SG CONSULTING GROUP ·{" "}
        <a href="/legal/privacidad" target="_blank" className="underline hover:text-[--color-primary]">
          Privacidad y condiciones
        </a>
      </footer>
    </div>
  );
}
