import { useState } from "react";
// import StepperHeader from "./StepperHeader";
// import StepperBody from "./StepperBody";
import Identificacion from "@/components/solicitud/Identificacion";
import Proyeccion from "@/components/solicitud/Proyeccion";
import DatosGenerales from "@/components/solicitud/DatosGenerales";
import ActividadEconomica from "@/components/solicitud/ActividadEconomica";
import ContactoUbicacion from "@/components/solicitud/ContactoUbicacion";
import Conyuge from "@/components/solicitud/Conyuge";
import Banco from "@/components/solicitud/Banco";
import Beneficiarios from "@/components/solicitud/Beneficiarios";
import Finalizacion from "@/components/solicitud/Finalizacion";
import Adjuntos from "@/components/solicitud/Adjuntos";

const pasos = [
  { id: "identificacion", label: "Identificación" },
  { id: "proyeccion", label: "Proyección" },
  { id: "datos", label: "Datos generales" },
  { id: "actividad", label: "Actividad económica" },
  { id: "contacto", label: "Contacto y ubicación" },
  { id: "conyuge", label: "Cónyuge" },
  { id: "banco", label: "Banco" },
  { id: "beneficiarios", label: "Beneficiarios" },
  { id: "finalizacion", label: "Finalización" },
  { id: "adjuntos", label: "Adjuntos" },
];

// asociamos cada paso a su componente
const componentesPorPaso = {
  identificacion: <Identificacion />,
  proyeccion: <Proyeccion />,
  datos: <DatosGenerales />,
  actividad: <ActividadEconomica />,
  contacto: <ContactoUbicacion />,
  conyuge: <Conyuge />,
  banco: <Banco />,
  beneficiarios: <Beneficiarios />,
  finalizacion: <Finalizacion />,
  adjuntos: <Adjuntos />,
};

export default function FlujoSolicitud() {
  // estado: id del paso activo
  const [pasoActivo, setPasoActivo] = useState(pasos[0].id);

  // avanzar al siguiente
  // eslint-disable-next-line no-unused-vars
  const handleNext = () => {
    const idx = pasos.findIndex((p) => p.id === pasoActivo);
    if (idx < pasos.length - 1) {
      setPasoActivo(pasos[idx + 1].id);
    }
  };

  // retroceder
  // eslint-disable-next-line no-unused-vars
  const handlePrev = () => {
    const idx = pasos.findIndex((p) => p.id === pasoActivo);
    if (idx > 0) {
      setPasoActivo(pasos[idx - 1].id);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* 
      <StepperHeader
        pasos={pasos}
        activo={pasoActivo}
        onChange={(id) => setPasoActivo(id)}
      />

      <StepperBody
        componente={componentesPorPaso[pasoActivo]}
        onNext={handleNext}
        onPrev={handlePrev}
        isFirst={pasoActivo === pasos[0].id}
        isLast={pasoActivo === pasos[pasos.length - 1].id}
      />
      */}
      {/* Puedes dejar solo el componente actual si quieres: */}
      <div className="p-6">
        {componentesPorPaso[pasoActivo]}
      </div>
    </div>
  );
}
