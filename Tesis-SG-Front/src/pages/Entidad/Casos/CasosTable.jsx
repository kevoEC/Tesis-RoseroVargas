import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TablaCustom2 from "@/components/shared/TablaCustom2";
import GlassLoader from "@/components/ui/GlassLoader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { getCasos, deleteCaso } from "@/service/Entidades/CasosService";
import CasoForm from "./CasosForm"; // El formulario de creación
import { Button } from "@/components/ui/button";

export default function CasosTable() {
  const navigate = useNavigate();
  const [casos, setCasos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Carga de casos
  const cargarCasos = async () => {
    setLoading(true);
    try {
      const data = await getCasos();
      setCasos(data);
    } catch (error) {
      toast.error("Error al cargar casos: " + (error.message ?? error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCasos();
  }, []);

  // Nuevo caso (abre el popup)
  const handleAbrirFormulario = () => setIsDialogOpen(true);

  // Editar (redirige)
  const handleEditar = (item) => {
    navigate(`/casos/editar/${item.idCaso}`);
  };

  // Eliminar
  const handleEliminar = async (item) => {
    if (!window.confirm("¿Eliminar este caso?")) return;
    try {
      await deleteCaso(item.idCaso);
      toast.success("Caso eliminado.");
      cargarCasos();
    } catch (err) {
      toast.error("Error al eliminar caso: " + (err.message ?? err));
    }
  };

  // Columnas de la tabla
  const columnas = [
    {
      key: "idCaso",
      label: "",
      render: (value) => (
        <div className="flex items-center justify-center group relative text-violet-500">
          {/* Icono de caso */}
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
    { key: "numeroCaso", label: "Número" },
    { key: "nombreCliente", label: "Cliente" },
    { key: "motivoNombre", label: "Motivo" },
    { key: "descripcion", label: "Descripción" },
    { key: "estado", label: "Estado", render: (value) => (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${
          value === "Iniciado"
            ? "bg-blue-100 text-blue-700"
            : value === "Cerrado"
            ? "bg-gray-300 text-gray-700"
            : "bg-yellow-100 text-yellow-700"
        }`}
      >
        {value}
      </span>
    )},
    { key: "fechaCreacion", label: "Fecha Creación", render: (v) => v ? new Date(v).toLocaleDateString() : "" }
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-full relative">
      <GlassLoader visible={loading} message="Cargando casos..." />
      <Card className="w-full border border-muted rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.12)]">
        <CardHeader>
          <CardTitle className="text-3xl flex items-center">
            Lista de Casos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 overflow-x-auto">
          <TablaCustom2
            columns={columnas}
            data={casos}
            mostrarEditar={true}
            mostrarAgregarNuevo={true}
            mostrarEliminar={true}
            onAgregarNuevoClick={handleAbrirFormulario}
            onEditarClick={handleEditar}
            onEliminarClick={handleEliminar}
          />
        </CardContent>
      </Card>
      {/* Dialog para el formulario de creación de caso */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="min-w-[420px] max-w-xl">
          <DialogHeader>
            <DialogTitle>Agregar Caso</DialogTitle>
            <DialogDescription>
              Completa la información del nuevo caso
            </DialogDescription>
          </DialogHeader>
          <CasoForm
            onClose={() => setIsDialogOpen(false)}
            onSaved={cargarCasos}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
