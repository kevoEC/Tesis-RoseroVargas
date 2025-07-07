/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TablaCustom2 from "@/components/shared/TablaCustom2";
import { getTareasPorRol } from "@/service/Entidades/TareaService";
import GlassLoader from "@/components/ui/GlassLoader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

// Mapeo de nombre de rol a ID
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

export default function Tareas() {
  const navigate = useNavigate();
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);

  const obtenerIdRolDesdeStorage = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const nombreRol = user?.roles?.[0];
    return ROLES_MAP[nombreRol] || null;
  };

  const cargarTareas = async () => {
    try {
      const idRol = obtenerIdRolDesdeStorage();
      if (!idRol) {
        toast.error("No se pudo determinar el rol del usuario.");
        return;
      }

      const data = await getTareasPorRol(idRol);
      const ordenadas = [...data].sort((a, b) => {
        if (a.nombreResultado === "Pendiente" && b.nombreResultado !== "Pendiente") return -1;
        if (a.nombreResultado !== "Pendiente" && b.nombreResultado === "Pendiente") return 1;
        return 0;
      });

      setTareas(ordenadas);
    } catch (error) {
      toast.error("Error al cargar tareas: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTareas();
  }, []);

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
    { key: "idTipoTarea", label: "ID Tipo" },
    { key: "tareaNombre", label: "Nombre" },
    {
      key: "nombreResultado",
      label: "Resultado",
      render: (value) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          value === "Pendiente" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"
        }`}>
          {value}
        </span>
      )
    },
    { key: "fechaCreacion", label: "Creación", render: (v) => new Date(v).toLocaleDateString() },
    {
      key: "fechaModificacion",
      label: "Modificación",
      render: (v) =>
        v ? new Date(v).toLocaleDateString() : <span className="text-gray-400 italic">Sin modificación</span>
    }
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-full relative">
      <GlassLoader visible={loading} message="Cargando tareas..." />
      <Card className="w-full border border-muted rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.12)]">
        <CardHeader>
          <CardTitle className="text-3xl">Lista de Tareas</CardTitle>
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
