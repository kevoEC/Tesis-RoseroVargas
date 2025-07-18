import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import TablaCustom2 from "@/components/shared/TablaCustom2";
import GlassLoader from "@/components/ui/GlassLoader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import ProspectoForm from "./ProspectoForm";
import { getProspectos, deleteProspecto } from "@/service/Entidades/ProspectoService";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export default function Prospectos() {
  const navigate = useNavigate();
  const { user, roles } = useAuth();
  const [prospectos, setProspectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Para evitar doble toast
  const toastMostradoRef = useRef(false);

  // Título dinámico según rol
  let titulo;
  if (roles.includes("Externo")) {
    titulo = "Crea tu perfil de prospecto";
  } else if (roles.includes("Asesor Comercial")) {
    titulo = "Mis Prospectos";
  } else {
    titulo = "Todos los prospectos";
  }

  // Cargar prospectos
  const cargarProspectos = async () => {
    setLoading(true);
    try {
      const data = await getProspectos();

      let datosFiltrados = data;
      if (roles.includes("Asesor Comercial") || roles.includes("Externo")) {
        datosFiltrados = data.filter(
          (item) => item.idUsuarioPropietario === user.id
        );
      }

      // Si es Externo y no tiene prospectos, muestra el mensaje una sola vez
      if (
        roles.includes("Externo") &&
        datosFiltrados.length === 0 &&
        !toastMostradoRef.current
      ) {
        toast.info(
          "Debes agregarte como prospecto para crear una solicitud de inversión."
        );
        toastMostradoRef.current = true;
      }

      setProspectos(datosFiltrados);
    } catch (error) {
      toast.error("Error al cargar prospectos: " + (error.message ?? error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProspectos();
    // eslint-disable-next-line
  }, [roles, user]);

  // Editar
  const handleEditar = (item) => {
    navigate(`/prospectos/editar/${item.idProspecto}`);
  };

  // Eliminar
  const handleEliminar = async (item) => {
    if (!window.confirm("¿Eliminar este prospecto?")) return;
    try {
      await deleteProspecto(item.idProspecto);
      toast.success("Prospecto eliminado.");
      cargarProspectos();
    } catch (err) {
      toast.error("Error al eliminar prospecto: " + (err.message ?? err));
    }
  };

  const columnas = [
    {
      key: "idProspecto",
      label: "",
      render: (value) => (
        <div className="flex items-center justify-center group relative text-gray-400">
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
        <span className="whitespace-nowrap font-semibold">
          {`${row.nombres ?? ""} ${row.apellidoPaterno ?? ""} ${row.apellidoMaterno ?? ""}`}
        </span>
      ),
    },
    {
      key: "esCliente",
      label: "¿Es Cliente?",
      render: (value) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          value
            ? "bg-green-100 text-green-700"
            : "bg-gray-200 text-gray-600"
        }`}>
          {value ? "Sí" : "No"}
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
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {value ? "Activo" : "Inactivo"}
        </span>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto">
      <GlassLoader visible={loading} message="Cargando prospectos..." />
      <Card className="w-full border border-muted rounded-2xl shadow-[0_4px_10px_rgba(0,0,0,0.10)]">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-gray-900 flex items-center">
            {titulo}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 overflow-x-auto">
          <TablaCustom2
            columns={columnas}
            data={
              [...prospectos].sort(
                (a, b) =>
                  new Date(b.fechaCreacion || b.fechaRegistro || 0) -
                  new Date(a.fechaCreacion || a.fechaRegistro || 0)
              )
            }
            mostrarEditar={true}
            mostrarAgregarNuevo={
              // Si es Externo y ya tiene prospecto, oculta el botón
              roles.includes("Externo") && prospectos.length >= 1
                ? false
                : true
            }
            mostrarEliminar={true}
            onAgregarNuevoClick={() => setIsDialogOpen(true)}
            onEditarClick={handleEditar}
            onEliminarClick={handleEliminar}
          />
        </CardContent>
      </Card>
      {/* Dialog para el formulario de creación */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      >
        <DialogContent className="min-w-[420px] max-w-xl">
          <DialogHeader>
            <DialogTitle>Agregar Prospecto</DialogTitle>
            <DialogDescription>
              Completa la información del nuevo prospecto
            </DialogDescription>
          </DialogHeader>
          <ProspectoForm
            onClose={() => setIsDialogOpen(false)}
            onSaved={cargarProspectos}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
