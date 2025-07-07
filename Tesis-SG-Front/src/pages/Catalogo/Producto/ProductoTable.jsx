import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TablaCustom2 from "@/components/shared/TablaCustom2";
import GlassLoader from "@/components/ui/GlassLoader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  getProductosVista,
  deleteProducto,
} from "@/service/Catalogos/ProductoService";
import ProductoForm from "./ProductoForm";

export default function ProductoTable() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Cargar productos desde la vista
  const cargarProductos = async () => {
    setLoading(true);
    try {
      const data = await getProductosVista();
      setProductos(data);
    } catch (error) {
      toast.error("Error al cargar productos: " + (error.message ?? error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  // Nuevo producto (abre el popup)
  const handleAbrirFormulario = () => setIsDialogOpen(true);

  // Editar (redirige)
  const handleEditar = (item) => {
    navigate(`/catalogo/producto/editar/${item.idProducto}`);
  };

  // Eliminar producto
  const handleEliminar = async (item) => {
    if (!window.confirm("¿Eliminar este producto?")) return;
    try {
      await deleteProducto(item.idProducto);
      toast.success("Producto eliminado.");
      cargarProductos();
    } catch (err) {
      toast.error("Error al eliminar producto: " + (err.message ?? err));
    }
  };

  // Diccionario para mostrar nombre de periodicidad
  const periodicidadLabel = {
    0: "Al finalizar",
    1: "Mensual",
    2: "Bimensual",
    3: "Trimestral",
    6: "Semestral",
  };

  // Columnas de la tabla
  const columnas = [
    {
      key: "idProducto",
      label: "",
      render: (value) => (
          <div className="flex items-center justify-center group relative text-zinc-500">

          {/* Icono de producto */}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <rect x="5" y="5" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 text-xs text-white bg-zinc-800 px-2 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 whitespace-nowrap">
            ID: {value}
          </span>
        </div>
      ),
    },
    { key: "productoNombre", label: "Nombre" },
    { key: "nombreComercial", label: "Comercial" },
    { key: "productoCodigo", label: "Código" },
    { key: "iniciales", label: "Iniciales" },
    { key: "formaPagoNombre", label: "Forma de Pago" },
    {
      key: "periocidad",
      label: "Periodicidad",
      render: (v) => periodicidadLabel[v] ?? v,
    },
    { key: "descripcion", label: "Descripción" },
    {
      key: "fechaCreacion",
      label: "Fecha Creación",
      render: (v) => v ? new Date(v).toLocaleDateString() : "",
    },
    {
      key: "usuarioCreacionNombre",
      label: "Creado por",
    },
  ];

  // Ordenar por fecha de creación descendente
  const productosOrdenados = [...productos].sort(
    (a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion)
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-full relative">
      <GlassLoader visible={loading} message="Cargando productos..." />
      <Card className="w-full border border-muted rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.12)]">
        <CardHeader>
          <CardTitle className="text-3xl flex items-center">
            Lista de Productos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 overflow-x-auto">
          <TablaCustom2
            columns={columnas}
            data={productosOrdenados}
            mostrarEditar={true}
            mostrarAgregarNuevo={true}
            mostrarEliminar={true}
            onAgregarNuevoClick={handleAbrirFormulario}
            onEditarClick={handleEditar}
            onEliminarClick={handleEliminar}
          />
        </CardContent>
      </Card>
      {/* Dialog para el formulario de creación de producto */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="min-w-[420px] max-w-xl">
          <DialogHeader>
            <DialogTitle>Agregar Producto</DialogTitle>
            <DialogDescription>
              Completa la información del nuevo producto
            </DialogDescription>
          </DialogHeader>
          <ProductoForm
            onClose={() => setIsDialogOpen(false)}
            onSaved={cargarProductos}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
