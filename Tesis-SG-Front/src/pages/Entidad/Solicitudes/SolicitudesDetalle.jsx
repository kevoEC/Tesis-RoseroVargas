import {
  User, BarChart2, FileText, Briefcase,
  MapPin, Banknote, Users, Paperclip,
  ListTodo, CheckCircle
} from "lucide-react";
import { useParams } from "react-router-dom";
import { useState } from "react";

import Identificacion from "@/components/solicitud/Identificacion";
import Proyeccion from "@/components/solicitud/Proyeccion";
import DatosGenerales from "@/components/solicitud/DatosGenerales";
import ActividadEconomica from "@/components/solicitud/ActividadEconomica";
import ContactoUbicacion from "@/components/solicitud/ContactoUbicacion";
import Banco from "@/components/solicitud/Banco";
import Beneficiarios from "@/components/solicitud/Beneficiarios";
import Finalizacion from "@/components/solicitud/Finalizacion";
import Adjuntos from "@/components/solicitud/Adjuntos";

export default function SolicitudesDetalle() {
  const [current, setCurrent] = useState(0);
  const { id } = useParams();

  const steps = [
    { label: "Identificación", icon: User, component: <Identificacion id={id} /> },
    { label: "Proyección", icon: BarChart2, component: <Proyeccion id={id} /> },
    { label: "Datos generales", icon: FileText, component: <DatosGenerales id={id} /> },
    { label: "Actividad económica", icon: Briefcase, component: <ActividadEconomica id={id} /> },
    { label: "Contacto y ubicación", icon: MapPin, component: <ContactoUbicacion id={id} /> },
    { label: "Banco", icon: Banknote, component: <Banco id={id} /> },
    { label: "Beneficiarios", icon: Users, component: <Beneficiarios id={id} /> },
    { label: "Adjuntos", icon: Paperclip, component: <Adjuntos id={id} /> },
    { label: "Finalización", icon: CheckCircle, component: <Finalizacion id={id} /> },
    { label: "Tareas", icon: ListTodo, component: <DatosGenerales id={id} /> }
  ];

  const goNext = () => setCurrent((c) => Math.min(c + 1, steps.length - 1));
  const goPrev = () => setCurrent((c) => Math.max(c - 1, 0));

  return (
    <div className="flex flex-col min-h-screen antialiased">
{/* BOTONES DE NAVEGACIÓN FIJOS ABAJO */}
<div className="fixed bottom-12 left-0 w-full z-50 px-6 py-3 flex justify-end">
  <div className="flex justify-end gap-2">
    <button
      onClick={goPrev}
      disabled={current === 0}
      className="w-10 h-10 rounded-full border border-gray-300 text-gray-700 bg-white disabled:opacity-30 hover:bg-gray-100 transition"
    >
      ←
    </button>
    <button
      onClick={goNext}
      disabled={current === steps.length - 1}
      className="w-10 h-10 rounded-full bg-violet-600 text-white disabled:bg-gray-300 hover:bg-violet-700 transition"
    >
      →
    </button>
  </div>
</div>


      {/* HEADER */}
      <div className="px-6 py-6 bg-white">
        <div className="relative z-10">
          <div className="grid grid-cols-10 gap-2">
            {steps.map((step, idx) => {
              const isActive = idx === current;
              const isCompleted = idx < current;

              return (
                <div
                  key={step.label}
                  className="flex flex-col items-center justify-center min-w-[80px]"
                  onClick={() => {
                    if (idx <= current) setCurrent(idx);
                  }}
                >
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-full border-2 
                      ${isCompleted ? "bg-violet-600 text-white border-violet-600"
                        : isActive ? "border-violet-600 text-violet-600"
                        : "border-gray-300 text-gray-400"
                      }`}
                  >
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] text-center mt-1 text-gray-600 leading-tight">
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Barra de progreso */}
          <div className="relative h-2 mt-6 bg-gray-200 rounded-full">
            <div
              className="absolute top-0 left-0 h-2 bg-violet-500 rounded-full transition-all duration-300"
              style={{
                width: `${(current / (steps.length - 1)) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* CUERPO */}
      <div className="flex-1 p-6">{steps[current].component}</div>
    </div>
  );
}
