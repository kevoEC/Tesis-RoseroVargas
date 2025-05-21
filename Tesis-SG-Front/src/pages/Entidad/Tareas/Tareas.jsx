import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EntidadView from "@/components/shared/VistaEntidad";
import {
  getProspectos,
  deleteProspecto,
} from "@/service/Entidades/ProspectoService";
import TablaCustom2 from "@/components/shared/TablaCustom2";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Tareas() {
  const navigate = useNavigate();

  const [tareas, setTareas] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const cargarProspectos = async () => {
    try {
      const data = await getProspectos();
      setTareas(data);
    } catch (error) {
      console.error("Error al cargar tareas:", error);
    }
  };

  useEffect(() => {
    cargarProspectos();
  }, []);

  /*Cargar los datos al montar el componente*/
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getProspectos(); // Ejecutar función async
        setTareas(data);
      } catch (error) {
        console.error("Error al cargar tareas:", error);
      }
    };

    fetchData();
  }, []);

  // 🟡 Editar
  const handleEditar = (item) => {
    navigate(`/tareas/editar/${item.idProspecto}`);
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
    {
      key: "idProspecto",
      label: "Prospecto",
      render: (value) => (
        <div className="flex items-center justify-center group relative text-gray-500">
          <svg
            className="w-5 h-5 md:w-6 md:h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5.121 17.804A9.003 9.003 0 0112 15c2.486 0 4.735.996 6.364 2.634M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 text-xs text-white bg-zinc-800 px-2 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 whitespace-nowrap">
            ID: {value}
          </span>
        </div>
      ),
    },
    {
      key: "nombreCompleto",
      label: "Nombre completo",
      render: (_, row) => (
        <span className="whitespace-nowrap">
          {`${row.nombres ?? ""} ${row.apellidoPaterno ?? ""} ${
            row.apellidoMaterno ?? ""
          }`}
        </span>
      ),
    },
    { key: "tipoIdentificacion", label: "Tipo ID" },
    { key: "telefonoCelular", label: "Núm. Celular" },
    { key: "correoElectronico", label: "Correo" },
    { key: "nombreOrigen", label: "Origen" },
    { key: "productoInteres", label: "Producto de Interés" },
    { key: "agencia", label: "Agencia" },
    {
      key: "estado",
      label: "Estado",
      render: (value) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            value
              ? "bg-green-100 text-green-700"
              : "bg-yellow-200 text-yellow-700"
          }`}
        >
          {value ? "Activo" : "Inactivo"}
        </span>
      ),
    },
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
