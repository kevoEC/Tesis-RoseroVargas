import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Step1DatosIniciales from "./steps/Step1DatosIniciales";
import Step2DatosPersonales from "./steps/Step2DatosPersonales";
import Step3VerificacionCorreo from "./steps/Step3VerificacionCorreo";
import Step4VerificacionTelefono from "./steps/Step4VerificacionTelefono";
import Step5ConfirmacionFinal from "./steps/Step5ConfirmacionFinal";
import GlassLoader from "@/components/ui/GlassLoader";
import { validarCorreoToken } from "@/service/Registro/RegistroService";

export default function Register() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    correo: "",
    confirmarCorreo: "",
    identificacion: "",
    nombres: "",
    apellidos: "",
    contrasena: "",
    celular: "",
    token: "",
    aceptaClausula: false,
    aceptaTerminos: false,
    aceptaPrivacidad: false,
  });

  const [loading, setLoading] = useState(true);
  const [errorValidacion, setErrorValidacion] = useState("");
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  useEffect(() => {
    const validar = async () => {
      if (token) {
        try {
          const result = await validarCorreoToken(token);

          if (result.success) {
            // Si el token fue válido, sin importar si ya estaba validado antes
            setStep(4);
          } else {
            setErrorValidacion(result.message);
          }
        } catch (err) {
          setErrorValidacion(err.message || "Error desconocido.");
        }
      }
      setLoading(false);
    };

    validar();
  }, [token]);

  const next = () => setStep((prev) => prev + 1);
  const back = () => setStep((prev) => prev - 1);

  const steps = {
    1: <Step1DatosIniciales data={formData} setData={setFormData} onNext={next} />,
    2: <Step2DatosPersonales data={formData} setData={setFormData} onNext={next} onBack={back} />,
    3: <Step3VerificacionCorreo data={formData} />,
    4: <Step4VerificacionTelefono data={formData} onNext={next} />,
    5: <Step5ConfirmacionFinal />,
  };

  if (loading) {
    return <GlassLoader visible={true} message="Validando enlace de correo..." />;
  }

  if (errorValidacion) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center text-red-600 p-10">
        <div>
          <h1 className="text-2xl font-bold mb-4">⛔ Error de validación</h1>
          <p>{errorValidacion}</p>
        </div>
      </div>
    );
  }

  return <>{steps[step]}</>;
}
