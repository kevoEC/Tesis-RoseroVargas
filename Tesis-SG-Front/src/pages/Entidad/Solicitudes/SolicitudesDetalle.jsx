import {
  User, BarChart2, FileText, Briefcase,
  MapPin, Banknote, Users, Paperclip,
  ListTodo, CheckCircle, Lock
} from "lucide-react";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import Identificacion from "@/components/solicitud/Identificacion";
import Proyeccion from "@/components/solicitud/Proyeccion";
import DatosGenerales from "@/components/solicitud/DatosGenerales";
import ActividadEconomica from "@/components/solicitud/ActividadEconomica";
import ContactoUbicacion from "@/components/solicitud/ContactoUbicacion";
import Banco from "@/components/solicitud/Banco";
import Beneficiarios from "@/components/solicitud/Beneficiarios";
import Finalizacion from "@/components/solicitud/Finalizacion";
import Adjuntos from "@/components/solicitud/Adjuntos";
import TareasTabla from "@/components/solicitud/TareasTabla";
import GlassLoader from "@/components/ui/GlassLoader";
import { getSolicitudById } from "@/service/Entidades/SolicitudService"; // Ajusta path si es necesario

const ESTADO_SOLICITUD = {
  1: { label: "En llenado de información", color: "bg-yellow-100 text-yellow-700" },
  2: { label: "Tareas generadas", color: "bg-blue-100 text-blue-700" },
  3: { label: "Solicitud rechazada", color: "bg-red-100 text-red-700" },
  4: { label: "Oportunidad lograda", color: "bg-green-100 text-green-700" },
};

export default function SolicitudesDetalle() {
  const [current, setCurrent] = useState(0);
  const { id } = useParams();

  // Nuevo: Estado global de la solicitud
  const [solicitud, setSolicitud] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carga la solicitud (incluyendo faseProceso) al abrir la pantalla
  useEffect(() => {
    async function cargarSolicitud() {
      setLoading(true);
      try {
        const data = await getSolicitudById(id);
        // Si usas una API con data.data[0], ajusta aquí:
        setSolicitud(data.data ? data.data[0] : data);
      } catch (err) {
        setSolicitud(null);
      } finally {
        setLoading(false);
      }
    }
    cargarSolicitud();
  }, [id]);

  const bloquearEdicion = solicitud?.faseProceso === 4;

  const steps = [
    { label: "Identificación", icon: User, component: <Identificacion id={id} bloquearEdicion={bloquearEdicion} /> },
    { label: "Proyección", icon: BarChart2, component: <Proyeccion id={id} bloquearEdicion={bloquearEdicion} /> },
    { label: "Datos generales", icon: FileText, component: <DatosGenerales id={id} bloquearEdicion={bloquearEdicion} /> },
    { label: "Actividad económica", icon: Briefcase, component: <ActividadEconomica id={id} bloquearEdicion={bloquearEdicion} /> },
    { label: "Contacto y ubicación", icon: MapPin, component: <ContactoUbicacion id={id} bloquearEdicion={bloquearEdicion} /> },
    { label: "Banco", icon: Banknote, component: <Banco id={id} bloquearEdicion={bloquearEdicion} /> },
    { label: "Beneficiarios", icon: Users, component: <Beneficiarios id={id} bloquearEdicion={bloquearEdicion} /> },
    { label: "Adjuntos", icon: Paperclip, component: <Adjuntos id={id} bloquearEdicion={bloquearEdicion} /> },
    { label: "Finalización", icon: CheckCircle, component: <Finalizacion id={id} bloquearEdicion={bloquearEdicion} /> },
    { label: "Tareas", icon: ListTodo, component: <TareasTabla idSolicitud={id} bloquearEdicion={bloquearEdicion} /> }
  ];

  const goNext = () => setCurrent((c) => Math.min(c + 1, steps.length - 1));
  const goPrev = () => setCurrent((c) => Math.max(c - 1, 0));

  if (loading) return <GlassLoader visible message="Cargando solicitud..." />;
  if (!solicitud) return <div className="p-8 text-center text-red-500">No se pudo cargar la solicitud</div>;

  return (
    <div className="flex flex-col min-h-screen antialiased">
      {/* Candado y Estado de solicitud */}
      <div className="w-full px-0">
        {(solicitud.faseProceso && ESTADO_SOLICITUD[solicitud.faseProceso]) && (
          <div className={`flex items-center gap-3 px-6 py-2 border-b rounded-t-xl shadow-sm mb-2
            ${ESTADO_SOLICITUD[solicitud.faseProceso].color} bg-opacity-70`}
            style={{ position: "sticky", top: 0, zIndex: 30 }}
          >
            {solicitud.faseProceso === 4 ? (
              <Lock className="w-5 h-5 text-green-700 mr-1" />
            ) : (
              <CheckCircle className="w-5 h-5 mr-1" />
            )}
            <span className="font-semibold text-sm">
              {ESTADO_SOLICITUD[solicitud.faseProceso].label}
              {solicitud.faseProceso === 4 && " - No editable"}
            </span>
          </div>
        )}
      </div>

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
                  className="flex flex-col items-center justify-center min-w-[80px] cursor-pointer"
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
