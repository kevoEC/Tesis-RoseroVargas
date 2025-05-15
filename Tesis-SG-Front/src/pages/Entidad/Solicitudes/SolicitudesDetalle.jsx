// SolicitudesDetalle.jsx
import React, { useState } from "react";
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
import { useParams, useNavigate } from "react-router-dom";
//import TareasSolicitudes from "@/components/solicitud/TareasSolicitudes";

export default function SimpleStepper() {
  const [current, setCurrent] = useState(0);

  const { id } = useParams();

  const steps = [
    {
      id: "identificacion",
      label: "Identificación",
      component: <Identificacion id={id} />,
    },
    { id: "proyeccion", label: "Proyección", component: <Proyeccion /> },
    {
      id: "datos",
      label: "Datos generales",
      component: <DatosGenerales id={id} />,
    },
    {
      id: "actividad",
      label: "Actividad económica",
      component: <ActividadEconomica id={id} />,
    },
    {
      id: "contacto",
      label: "Contacto y ubicación",
      component: <ContactoUbicacion id={id} />,
    },
    { id: "banco", label: "Banco", component: <Banco id={id} /> },
    {
      id: "beneficiarios",
      label: "Beneficiarios",
      component: <Beneficiarios id={id} />,
    },
    
    // --- aquí añades tus dos nuevas pestañas ---
    { id: "adjuntos", label: "Adjuntos", component: <Adjuntos id={id} /> },
    {
      id: "tareas",
      label: "Tareas de solicitudes",
      component: <DatosGenerales id={id} />,
    },
    {
      id: "finalizacion",
      label: "Finalización",
      component: <Finalizacion id={id} />,
    },
  ];

  const goNext = () => setCurrent((c) => Math.min(c + 1, steps.length - 1));
  const goPrev = () => setCurrent((c) => Math.max(c - 1, 0));

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="px-6 py-4 bg-white border-b">
        <div className="flex gap-3 overflow-x-auto md:overflow-visible md:flex-wrap">


          {steps.map((step, idx) => {
            const isActive = idx === current;
            const isCompleted = idx < current;
            const isFuture = idx > current;

            return (
              <div
                key={step.id}
                onClick={() => {
                  if (!isFuture) setCurrent(idx); // Bloquea clic en futuros
                }}
                className={`transition-all flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border
        ${isActive
                    ? "bg-primary/80 text-white border-primary  shadow-md"
                    : isCompleted
                      ? "bg-green-100 text-green-800 border-green-400"
                      : "bg-gray-100 text-gray-700 border-gray-300"
                  }
        ${isFuture ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-gray-200"}
            `}>
                <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold
        ${isCompleted
                    ? "bg-green-500 text-white"
                    : "bg-white text-gray-800 border border-gray-300"
                  }
                `}>
                  {idx + 1}
                </div>
                {step.label}
              </div>
            );
          })}

        </div>
      </div>


      {/* BODY */}
      <div className="flex-1 p-6">{steps[current].component}</div>

      {/* FOOTER */}
      <div className="flex justify-between px-6 py-4 bg-white border-t">
        <button
          onClick={goPrev}
          disabled={current === 0}
          className="px-4 py-2 rounded border disabled:opacity-50 bg-gray-100 hover:bg-white hover:drop-shadow-lg"
        >
          ← Anterior
        </button>
        <button
          onClick={goNext}
          disabled={current === steps.length - 1}
          className="px-4 py-2 rounded bg-primary text-white disabled:opacity-50 hover:bg-primary/85 hover:drop-shadow-lg"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}
