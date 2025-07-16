import { useEffect, useState } from "react";
import TablaCustom2 from "@/components/shared/TablaCustom2";
import { getTareasPorSolicitud } from "@/service/Entidades/TareaService";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import GlassLoader from "@/components/ui/GlassLoader";

export default function TareasTabla({ idSolicitud }) {
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!idSolicitud) return;
    cargarTareas();
  }, [idSolicitud]);

  const cargarTareas = async () => {
    setLoading(true);
    try {
      const data = await getTareasPorSolicitud(idSolicitud);
      setTareas(data);
    } catch (err) {
      toast.error("Error al cargar tareas: " + err.message);
    } finally {
      setLoading(false);
    }
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
    { key: "tareaNombre", label: "Nombre" },
    {
      key: "nombreResultado",
      label: "Estado",
      render: (value) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          value === "Pendiente" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"
        }`}>
          {value}
        </span>
      ),
    },
    {
      key: "fechaCreacion",
      label: "Creación",
      render: (v) => new Date(v).toLocaleDateString(),
    },
  ];

  return (
    <Card className="relative">
      <GlassLoader visible={loading} message="Cargando tareas..." />
      <CardContent className="p-6">
        <TablaCustom2
          columns={columnas}
          data={tareas}
          mostrarEditar={false}
          mostrarEliminar={false}
          mostrarAgregarNuevo={false}
        />
      </CardContent>
    </Card>
  );
}
