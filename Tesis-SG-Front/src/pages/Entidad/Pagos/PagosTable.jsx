import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TablaCustom2 from "@/components/shared/TablaCustom2";
import GlassLoader from "@/components/ui/GlassLoader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { getPagos, deletePago } from "@/service/Entidades/PagosService";
import PagosForm from "./PagosForm";

export default function PagosTable() {
  const navigate = useNavigate();
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Carga de pagos
  const cargarPagos = async () => {
    setLoading(true);
    try {
      const data = await getPagos();
      setPagos(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Error al cargar pagos: " + (error.message ?? error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPagos();
  }, []);

  // Editar (redirige)
  const handleEditar = (item) => {
    navigate(`/pagos/editar/${item.idPago}`);
  };

  // Eliminar
  const handleEliminar = async (item) => {
    if (!window.confirm("¿Eliminar este pago?")) return;
    try {
      await deletePago(item.idPago);
      toast.success("Pago eliminado.");
      cargarPagos();
    } catch (err) {
      toast.error("Error al eliminar pago: " + (err.message ?? err));
    }
  };

  // Abrir formulario de nuevo pago
  const handleAbrirFormulario = () => setIsDialogOpen(true);

  // Columnas de la tabla de pagos
  const columnas = [
    {
      key: "idPago",
      label: "ID",
      render: (value) => (
        <div className="flex items-center justify-center group relative text-violet-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
            <path d="M8 8h8M8 12h8M8 16h4" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 text-xs text-white bg-zinc-800 px-2 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 whitespace-nowrap">
            ID: {value}
          </span>
        </div>
      )
    },
    { key: "detalle", label: "Detalle" },
    {
      key: "cantidadPagos",
      label: "Cantidad de Pagos",
      render: (v) => <span>{v ?? 0}</span>,
    },
    {
      key: "generarPagos",
      label: "Pagos generados",
      render: (v) =>
        <span className={`px-2 py-1 text-xs rounded-full font-semibold ${v ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
          {v ? "Sí" : "No"}
        </span>
    },
    // Estado ANTES de la fecha de creación
    {
      key: "confirmarRegistrosPagos",
      label: "Estado",
      render: (v) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${v ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-800"}`}>
          {v ? "Completado" : "Pendiente"}
        </span>
      ),
    },
    {
      key: "fechaCreacion",
      label: "Creación",
      render: (v) => v ? new Date(v).toLocaleString("es-EC") : ""
    },
    {
      key: "fechaModificacion",
      label: "Modificación",
      render: (v) => v ? new Date(v).toLocaleString("es-EC") : "-"
    },
  ];

  // Ordenar por fecha de creación descendente (más reciente primero)
  const pagosOrdenados = [...pagos].sort(
    (a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion)
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-full relative">
      <GlassLoader visible={loading} message="Cargando pagos..." />
      <Card className="w-full border border-muted rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.12)]">
        <CardHeader>
          <CardTitle className="text-3xl flex items-center">
            Lista de Pagos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 overflow-x-auto">
          <TablaCustom2
            columns={columnas}
            data={pagosOrdenados}
            mostrarEditar={true}
            mostrarAgregarNuevo={true}
            mostrarEliminar={true}
            onAgregarNuevoClick={handleAbrirFormulario}
            onEditarClick={handleEditar}
            onEliminarClick={handleEliminar}
          />
        </CardContent>
      </Card>
      {/* Dialog para el formulario de creación de pago */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="min-w-[420px] max-w-xl">
          <DialogHeader>
            <DialogTitle>Agregar Pago</DialogTitle>
            <DialogDescription>
              Completa la información del nuevo pago
            </DialogDescription>
          </DialogHeader>
          <PagosForm
            onClose={() => setIsDialogOpen(false)}
            onSaved={cargarPagos}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
