import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EntidadView from "@/components/shared/VistaEntidad";
import { getTareas } from "@/service/Entidades/TareasService";
import TablaCustom2 from "@/components/shared/TablaCustom2";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Tareas() {
  const navigate = useNavigate();
  const [tareas, setTareas] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const cargarTareas = async () => {
    try {
      const data = await getTareas();
      setTareas(data);
    } catch (error) {
      console.error("Error al cargar tareas:", error);
    }
  };

  useEffect(() => {
    cargarTareas();
  }, []);

  /*Cargar los datos al montar el componente*/
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTareas(); // Ejecutar función async
        setTareas(data);
      } catch (error) {
        console.error("Error al cargar tareas:", error);
      }
    };

    fetchData();
  }, []);

  // 🟡 Editar
  const handleEditar = (item) => {
    navigate(`/tareas/editar/${item.idTarea}`);
  };

  // 🔴 Eliminar
  const handleEliminar = async (item) => {
    try {
      await deleteProspecto(item.idProspecto);
      // Si usas refetch dentro de VistaEntidad, lo puedes llamar aquí después
    } catch (err) {
      console.error("Error al eliminar tarea:", err);
    }
  };

  const handleAbrirFormulario = () => {
    setIsDialogOpen(true);
  };
  const handleCerrarDialog = () => {
    setIsDialogOpen(false);
  };

  const columnas = [

    { key: "idTarea", label: "ID --QUITAR--" },
    { key: "nombreTipoTarea", label: "Tipo de Tarea" },
    {
      key: "nombreResultado",
      label: "Resultado",
      render: (value) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${value
              ? "bg-green-100 text-green-700"
              : "bg-yellow-200 text-yellow-700"
            }`}
        >
          {value ? "Aprobado" : "Pendiente"}
        </span>
      ),
    },
    { key: "fechaCreacion", label: "Fecha Creación" },
    { key: "fechaModificacion", label: "Fecha Modificación" },
 

  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-full">
      <Card className="w-full border border-muted rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.12)]">
        <CardHeader>
          <CardTitle className="text-3xl">Lista de Tareas</CardTitle>
        </CardHeader>
        <CardContent className="p-6 overflow-x-auto">
          <TablaCustom2
            columns={columnas}
            data={tareas}
            mostrarEditar={true}
            mostrarAgregarNuevo={false}
            mostrarEliminar={false}
            onAgregarNuevoClick={handleAbrirFormulario}
            onEditarClick={handleEditar}
            onEliminarClick={handleEliminar}
          />
        </CardContent>
      </Card>
    </div>
  );
}
