import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TablaCustom2 from "@/components/shared/TablaCustom2";
import GlassLoader from "@/components/ui/GlassLoader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { getCalendariosOperaciones, deleteCalendarioOperaciones } from "@/service/Entidades/CalendarioOperacionesService";
import CalendarioForm from "./CalendariosForm"; // El formulario para crear/editar
import Calendario from "./Calendario";         // El detalle de un calendario

export default function CalendarioTable() {
  const navigate = useNavigate();
  const [calendarios, setCalendarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [selectedCalendario, setSelectedCalendario] = useState(null);

  // Cargar calendarios
  const cargarCalendarios = async () => {
    setLoading(true);
    try {
      const data = await getCalendariosOperaciones();
      setCalendarios(data);
    } catch (error) {
      toast.error("Error al cargar calendarios: " + (error.message ?? error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCalendarios();
  }, []);

  // Crear nuevo
  const handleAbrirFormulario = () => {
    setSelectedCalendario(null);
    setIsDialogOpen(true);
  };

  // Editar existente
const handleEditar = (item) => {
  // Aquí solo navegas, no usas el modal
  navigate(`/calendario/editar/${item.idCalendario}`);
};

  // Ver detalle

  // Eliminar calendario
  const handleEliminar = async (item) => {
    try {
      await deleteCalendarioOperaciones(item.idCalendario);
      toast.success("Calendario eliminado.");
      cargarCalendarios();
    } catch (err) {
      toast.error("Error al eliminar calendario: " + (err.message ?? err));
    }
  };

  // Columnas de la tabla
  const columnas = [
    {
      key: "idCalendario",
      label: "",
      render: (value) => (
        <div className="flex items-center justify-center group relative text-indigo-500">
          {/* Icono de calendario */}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
            <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.7" />
            <path d="M16 3v4M8 3v4M3 9h18" stroke="currentColor" strokeWidth="1.7" />
          </svg>
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 text-xs text-white bg-zinc-800 px-2 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 whitespace-nowrap">
            ID: {value}
          </span>
        </div>
      )
    },
    { key: "nombre", label: "Nombre" },
    { key: "fechaCorte", label: "Fecha Corte", render: (v) => v ? new Date(v).toLocaleDateString() : "" },
    { key: "calendarioInversiones", label: "Día Inversiones" },
    { key: "fechaGenerarPagos", label: "F. Generar Pagos", render: (v) => v ? new Date(v).toLocaleDateString() : "" },
    { key: "fechaEnvioEECC", label: "F. Envío EECC", render: (v) => v ? new Date(v).toLocaleDateString() : "" },
    {
      key: "estadoCalendario",
      label: "Estado",
      render: (v) => {
        const isCerrado = v === 1 || v === true || v === "1" || v === "true";
        return (
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${!isCerrado
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-300 text-gray-700"
            }`}>
            {!isCerrado ? "Abierto" : "Cerrado"}
          </span>
        );
      }
    }
  ];

return (
  <div className="p-4 sm:p-6 md:p-8 max-w-full relative">
    <GlassLoader visible={loading} message="Cargando calendarios..." />
    <Card className="w-full border border-muted rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.12)]">
      <CardHeader>
        <CardTitle className="text-3xl">Lista de Calendarios</CardTitle>
      </CardHeader>
      <CardContent className="p-6 overflow-x-auto">
        <TablaCustom2
          columns={columnas}
          data={calendarios}
          mostrarEditar={true}
          mostrarAgregarNuevo={true}
          mostrarEliminar={true}
          onAgregarNuevoClick={handleAbrirFormulario}
          onEditarClick={handleEditar}
          onEliminarClick={handleEliminar}
        />
      </CardContent>
    </Card>

    {/* Modal SOLO para crear */}
<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
  <DialogContent
  className="
    min-w-[420px]
    max-w-2xl
    max-h-[80vh]
    overflow-y-auto
    scrollbar-thin
    scrollbar-thumb-rounded-full
    scrollbar-thumb-zinc-300
    scrollbar-track-transparent
  "
  >
    <DialogHeader>
      <DialogTitle>Agregar Calendario</DialogTitle>
      <DialogDescription>
        Completa la información del nuevo calendario de operaciones
      </DialogDescription>
    </DialogHeader>
    <CalendarioForm
      onClose={() => setIsDialogOpen(false)}
      onSaved={cargarCalendarios}
    />
  </DialogContent>
</Dialog>

  </div>
);
}
