import { useNavigate } from "react-router-dom";
import {
  getSolicitudes,
  deleteSolicitud,
} from "@/service/Entidades/SolicitudService";
import TablaCustom2 from "@/components/shared/TablaCustom2";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import SolicitudInversionForm from "./SolicitudInversionForm";

export default function SolicitudInversion() {
  const navigate = useNavigate();

  const [solicitudes, setSolicitudes] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getSolicitudes(); // Ejecutar función async

        console.log("Inversiones", data.data);

        setSolicitudes(data.data); // Almacenar solo las identificaciones
      } catch (error) {
        console.error("Error al cargar solicitudes:", error);
      }
    };

    fetchData();
  }, []);

  // ✏️ Editar
  const handleEditar = (item) => {
    navigate(`/solicitudes/editar/${item.idSolicitudInversion}`);
  };

  // ❌ Eliminar
  const handleEliminar = async (item) => {
    try {
      await deleteSolicitud(item.idSolicitudInversion);
    } catch (err) {
      console.error("Error al eliminar solicitud:", err);
    }
  };

  const handleAbrirFormulario = () => {
    setIsDialogOpen(true);
  };
  const handleCerrarDialog = () => {
    setIsDialogOpen(false);
  };

const columnasSolicitud = [
  {
  key: "idSolicitudInversion",
  label: "",
  render: (value) => (
    <div className="flex items-center justify-center group relative text-gray-500">
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12h6m-6 4h6M5 4v16h14V4H5zm2 2h10v12H7V6z"
        />
      </svg>
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 text-xs text-white bg-zinc-800 px-2 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 whitespace-nowrap">
        ID: {value}
      </span>
    </div>
  ),
},
    {
    key: "tipoSolicitud",
    label: "Tipo de Solicitud",
    render: (_, row) => row.identificacion?.nombreTipoSolicitud || "—",
  },
      {
    key: "numeroDocumento",
    label: "N° Documento",
    render: (_, row) => row.identificacion?.numeroDocumento || "—",
  },
    {
    key: "tipoDocumento",
    label: "Tipo de Documento",
    render: (_, row) => row.identificacion?.nombreTipoDocumento || "—",
  },
  {
    key: "nombreCompleto",
    label: "Nombre completo",
    render: (_, row) => row.nombreCompletoProspecto || "—",
  },
  {
    key: "tipoCliente",
    label: "Tipo de Cliente",
    render: (_, row) => row.identificacion?.nombreTipoCliente || "—",
  },
  {
    key: "nombrePropietario",
    label: "Propietario",
    render: (value) => value || "—",
  }
];


  return (
    <div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Solicitudes de Inversión - Todos</CardTitle>
          </CardHeader>
          <CardContent>
            <TablaCustom2
              columns={columnasSolicitud}
              data={solicitudes}
              mostrarEditar={true}
              mostrarAgregarNuevo={false}
              mostrarEliminar={true}
              onAgregarNuevoClick={handleAbrirFormulario}
              onEditarClick={handleEditar}
              onEliminarClick={handleEliminar}
            />
          </CardContent>
        </Card>
        {/* Dialog para el formulario */}
        <Dialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          className="min-w-3xl"
        >
          <DialogContent className="min-w-3xl">
            <DialogHeader>
              <DialogTitle>Agregar Solicitud</DialogTitle>
              <DialogDescription>
                Completa la información de la nueva solicitud
              </DialogDescription>
            </DialogHeader>
            <SolicitudInversionForm onClose={handleCerrarDialog} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
