import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import TablaCustom2 from "@/components/shared/TablaCustom2";
import { getTareasPorRol } from "@/service/Entidades/TareaService";
import GlassLoader from "@/components/ui/GlassLoader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const ROLES_MAP = {
  "Administrador": 1,
  "Asesor Comercial": 2,
  "Asesor Legal": 3,
  "Analista de riesgos": 4,
  "Analista de emisión": 5,
  "Analista financiero": 6,
  "Gerencia Comercial": 7,
  "Gerencia": 8,
  "Externo": 9
};

const ROLES_TITULO = {
  5: "Bandeja de Emisiones",
  3: "Bandeja de Legal",
  6: "Bandeja Financiera",
  7: "Bandeja Comercial",
  4: "Bandeja de Riesgos",
  externo: "Carga de comprobante de abono",
  comercial: "Solicitar comprobante de abono",
};

export default function Tareas() {
  const navigate = useNavigate();
  const { roles, user } = useAuth();
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);

  const toastMostradoRef = useRef(false);

  // Determinar el rol principal y su id
  const nombreRol = roles?.[0] || "";
  const idRol = ROLES_MAP[nombreRol] || null;

  // Titulo dinámico para externos y comercial
  let titulo = "Lista de Tareas";
  if (nombreRol === "Externo") {
    titulo = ROLES_TITULO.externo;
  } else if (nombreRol === "Asesor Comercial") {
    titulo = ROLES_TITULO.comercial;
  } else if (ROLES_TITULO[idRol]) {
    titulo = ROLES_TITULO[idRol];
  }

  useEffect(() => {
    const cargarTareas = async () => {
      setLoading(true);
      try {
        if (!idRol) {
          toast.error("No se pudo determinar el rol del usuario.");
          return;
        }
        const data = await getTareasPorRol(idRol);

        let filtradas = [...data];

        // Si es Externo o Asesor Comercial, solo tareas donde es el creador
        if (nombreRol === "Externo" || nombreRol === "Asesor Comercial") {
          filtradas = filtradas.filter(
            t => t.idUsuarioCreacion === user.id
          );

          // Toast de pendiente SOLO UNA VEZ si hay tareas pendientes
          if (!toastMostradoRef.current && filtradas.some(t => t.nombreResultado === "Pendiente")) {
            if (nombreRol === "Externo") {
              toast.info("Recuerda realizar el depósito del capital para continuar con la solicitud.");
            } else if (nombreRol === "Asesor Comercial") {
              toast.info("Recuerda solicitar al Cliente el comprobante de abono del capital.");
            }
            toastMostradoRef.current = true;
          }
        }

        // Ordenar: fechaCreacion DESC (más nuevo primero)
        filtradas.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
        setTareas(filtradas);

      } catch (error) {
        toast.error("Error al cargar tareas: " + (error.message ?? error));
      } finally {
        setLoading(false);
      }
    };

    cargarTareas();
    // eslint-disable-next-line
  }, [roles, user]);

  const handleEditar = (item) => {
    navigate(`/tareas/editar/${item.idTarea}`);
  };

  const columnas = [
    {
      key: "idTarea",
      label: "",
      render: (value) => (
        <div className="flex items-center justify-center group relative text-gray-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17h6m-6-4h6m2 9a2 2 0 002-2V7a2 2 0 00-2-2h-3.586a1 1 0 01-.707-.293l-1.414-1.414A1 1 0 0011.586 3H9a2 2 0 00-2 2v14a2 2 0 002 2h6z" />
          </svg>
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 text-xs text-white bg-zinc-800 px-2 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 whitespace-nowrap">
            ID: {value}
          </span>
        </div>
      )
    },
    {
      key: "nombreTipoTarea",
      label: "Tipo de Tarea",
      render: (value) => (
        <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-700 border border-blue-300 shadow-sm">
          {value}
        </span>
      )
    },
    { key: "tareaNombre", label: "Nombre" },
    {
      key: "nombreResultado",
      label: "Resultado",
      render: (value) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          value === "Pendiente"
            ? "bg-yellow-100 text-yellow-700"
            : value === "Aprobado"
            ? "bg-green-100 text-green-700"
            : value === "Rechazado"
            ? "bg-red-100 text-red-700"
            : "bg-gray-200 text-gray-700"
        }`}>
          {value}
        </span>
      )
    },
    {
      key: "fechaCreacion",
      label: "Creación",
      render: (v) => v
        ? new Date(v).toLocaleDateString("es-EC", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          })
        : ""
    },
    {
      key: "fechaModificacion",
      label: "Modificación",
      render: (v) =>
        v
          ? new Date(v).toLocaleDateString("es-EC", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            })
          : <span className="text-gray-400 italic">Sin modificación</span>
    }
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-full relative">
      <GlassLoader visible={loading} message="Cargando tareas..." />
      <Card className="w-full border border-muted rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.12)]">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-gray-900 flex items-center">
            {titulo}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 overflow-x-auto">
          <TablaCustom2
            columns={columnas}
            data={tareas}
            mostrarEditar={true}
            mostrarEliminar={true}
            mostrarAgregarNuevo={false}
            onEditarClick={handleEditar}
            onEliminarClick={(item) => console.log("Eliminar:", item)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
