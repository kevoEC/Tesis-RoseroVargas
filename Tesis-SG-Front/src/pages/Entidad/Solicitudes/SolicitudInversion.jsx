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
import { useEffect, useState, useRef } from "react";
import SolicitudInversionForm from "./SolicitudInversionForm";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import GlassLoader from "@/components/ui/GlassLoader";

function FaseBadge({ fase }) {
  const fases = {
    1: { label: "Llenado de Información", color: "bg-gray-200 text-gray-700" },
    2: { label: "Tareas", color: "bg-blue-100 text-blue-700" },
    3: { label: "Rechazado", color: "bg-yellow-100 text-yellow-700" },
    4: { label: "Finalizado", color: "bg-green-100 text-green-700" },
  };
  const obj = fases[fase] || { label: `Fase ${fase}`, color: "bg-gray-100 text-gray-500" };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${obj.color}`}>{obj.label}</span>
  );
}

export default function SolicitudInversion() {
  const navigate = useNavigate();
  const { roles, user } = useAuth();

  const [solicitudes, setSolicitudes] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Ref para que el toast solo se muestre una vez
  const toastMostradoRef = useRef(false);

  // Determina el título según el rol
  const esMisSolicitudes =
    roles.includes("Externo") || roles.includes("Asesor Comercial");
  const tituloSolicitudes = esMisSolicitudes
    ? "Mis Solicitudes"
    : "Lista de Solicitudes de Inversión";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getSolicitudes();
        let solicitudesFiltradas = data.data;

        // Si es Externo o Asesor Comercial, filtra por propietario
        if (esMisSolicitudes) {
          solicitudesFiltradas = solicitudesFiltradas.filter(
            (sol) => sol.idUsuarioPropietario === user.id
          );
        }

        // Si es Externo y no tiene ninguna solicitud, muestra mensaje una sola vez
        if (
          roles.includes("Externo") &&
          solicitudesFiltradas.length === 0 &&
          !toastMostradoRef.current
        ) {
          toast.info(
            "Es necesario que te crees como prospecto para poder crear una solicitud de inversión."
          );
          toastMostradoRef.current = true;
        }

        setSolicitudes(solicitudesFiltradas);
      } catch (error) {
        console.error("Error al cargar solicitudes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line
  }, [roles, user]);

  const handleEditar = (item) => {
    navigate(`/solicitudes/editar/${item.idSolicitudInversion}`);
  };

  const handleEliminar = async (item) => {
    try {
      await deleteSolicitud(item.idSolicitudInversion);
      setSolicitudes((prev) =>
        prev.filter((s) => s.idSolicitudInversion !== item.idSolicitudInversion)
      );
    } catch (err) {
      console.error("Error al eliminar solicitud:", err);
    }
  };

  const handleAbrirFormulario = () => setIsDialogOpen(true);
  const handleCerrarDialog = () => setIsDialogOpen(false);

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
      key: "faseProceso",
      label: "Fase",
      render: (value) => <FaseBadge fase={value} />,
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
    },
  ];

  return (
    <div className="relative">
      <GlassLoader visible={loading} message="Cargando solicitudes..." />
      <Card className="w-full border border-muted rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.12)]">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-gray-900 flex items-center">
            {tituloSolicitudes}
          </CardTitle>
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
  );
}
