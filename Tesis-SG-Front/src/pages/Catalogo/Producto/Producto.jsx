import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductoByIdVista, updateProducto } from "@/service/Catalogos/ProductoService";
import {
  getConfiguracionesPorProducto,
  deleteConfiguracionProducto,
} from "@/service/Catalogos/ConfiguracionesProductoService";
import TablaCustom2 from "@/components/shared/TablaCustom2";
import GlassLoader from "@/components/ui/GlassLoader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import ConfiguracionesProductoForm from "../ConfiguracionesProducto/ConfiguracionesProductoForm";

const FORMAS_PAGO = [
  { idFormaPago: 1, formaPagoNombre: "No Aplica" },
  { idFormaPago: 2, formaPagoNombre: "Al finalizar" },
  { idFormaPago: 3, formaPagoNombre: "Según su periodicidad" },
];

const periodicidadLabel = {
  0: "Al finalizar",
  1: "Mensual",
  2: "Bimensual",
  3: "Trimestral",
  6: "Semestral",
};

export default function Producto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [producto, setProducto] = useState(null);
  const [configuraciones, setConfiguraciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);

  // Para edición en línea
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});

  // Carga todo: producto + configuraciones asociadas
  const loadAll = async () => {
    setLoading(true);
    try {
      const data = await getProductoByIdVista(id);
      setProducto(data);
      setEditForm({
        ...data,
        descripcion: data.descripcion || "",
        penalidad: data.penalidad ?? "",
        montoMinimoIncremento: data.montoMinimoIncremento ?? "",
      });
      const configs = await getConfiguracionesPorProducto(id);
      setConfiguraciones(Array.isArray(configs) ? configs : []);
    } catch (err) {
      toast.error("Error al cargar datos: " + (err.message ?? err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line
  }, [id]);

  // Eliminar configuración
  const handleEliminarConfig = async (config) => {
    if (!window.confirm("¿Eliminar esta configuración?")) return;
    try {
      await deleteConfiguracionProducto(config.idConfiguraciones);
      toast.success("Configuración eliminada.");
      loadAll();
    } catch (err) {
      toast.error("Error al eliminar: " + (err.message ?? err));
    }
  };

  // Guardar producto editado
  const handleSaveEdit = async () => {
    try {
      await updateProducto(producto.idProducto, {
        ...producto,
        descripcion: editForm.descripcion,
        penalidad: Number(editForm.penalidad),
        montoMinimoIncremento: Number(editForm.montoMinimoIncremento),
        idUsuarioModificacion: producto.idUsuarioCreacion, // Como Pagos, usa el owner
        fechaModificacion: new Date().toISOString(),
      });
      toast.success("Producto actualizado correctamente");
      setEditMode(false);
      loadAll();
    } catch (err) {
      toast.error("Error al actualizar: " + (err.message ?? err));
    }
  };

  // Columnas de configuraciones
  const columnasConfig = [
    {
      key: "montoMinimo",
      label: "Monto Mínimo",
      render: (v) =>
        `$${Number(v).toLocaleString("es-EC", {
          minimumFractionDigits: 2,
        })}`,
    },
    {
      key: "montoMaximo",
      label: "Monto Máximo",
      render: (v) =>
        `$${Number(v).toLocaleString("es-EC", {
          minimumFractionDigits: 2,
        })}`,
    },
    { key: "plazo", label: "Plazo (meses)" },
    {
      key: "taza",
      label: "Tasa (%)",
      render: (v) => `${Number(v).toFixed(2)}%`,
    },
    {
      key: "costeOperativoEEUU",
      label: "Costo EEUU",
      render: (v) =>
        `$${Number(v).toLocaleString("es-EC", {
          minimumFractionDigits: 2,
        })}`,
    },
    { key: "origenNombre", label: "Origen" },
    { key: "tipoTasaNombre", label: "Tipo de tasa" },
    {
      key: "fechaCreacion",
      label: "Fecha Creación",
      render: (v) => (v ? new Date(v).toLocaleDateString() : ""),
    },
    { key: "usuarioCreacion", label: "Creado por" },
  ];

  if (loading) return <GlassLoader visible message="Cargando producto..." />;

  // HEADER tipo Pagos
  return (
    <div className="py-8 px-0 max-w-6xl mx-auto">
      {/* Header Pagos-Style */}
      <div className="flex items-center gap-3 mb-2 border-b border-gray-200 pb-3">
        <Button
          variant="outline"
          onClick={() => navigate("/catalogo/producto/vista")}
          className="px-5 py-2"
        >
          ← Volver
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          {producto?.productoNombre || "-"}
        </h1>
        <span className="text-base text-gray-500 ml-3 font-semibold">
          ID: {producto?.idProducto}
        </span>
        <div className="ml-auto flex flex-col items-end gap-1">
          <span className="text-gray-700 text-base font-medium">
            <b>Creado por:</b> {producto?.usuarioCreacionNombre}
          </span>
          <span className="text-gray-700 text-base font-medium">
            <b>Fecha creación:</b>{" "}
            {producto?.fechaCreacion
              ? new Date(producto.fechaCreacion).toLocaleString("es-EC")
              : "-"}
          </span>
        </div>
      </div>

      {/* Detalle en grid horizontal, sin borde externo */}
      <div className="w-full mt-3 mb-8">
        <div
          className="grid md:grid-cols-2 grid-cols-1 gap-x-12 gap-y-2 p-5 bg-white"
          style={{
            border: "1.5px solid #bbb",
            borderRadius: 12,
          }}
        >
          <Detalle label="Nombre comercial" value={producto?.nombreComercial} />
          <Detalle label="Código" value={producto?.productoCodigo} />
          <Detalle label="Iniciales" value={producto?.iniciales} />
          <Detalle
            label="Periodicidad"
            value={periodicidadLabel[producto?.periocidad]}
          />
          <Detalle
            label="Forma de pago"
            value={
              FORMAS_PAGO.find((f) => f.idFormaPago === producto?.idFormaPago)
                ?.formaPagoNombre || "-"
            }
          />
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-500 w-44">Monto mínimo incremento:</span>
            {editMode ? (
              <Input
                type="number"
                step="0.01"
                className="w-32"
                value={editForm.montoMinimoIncremento}
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    montoMinimoIncremento: e.target.value,
                  }))
                }
              />
            ) : (
              <span className="font-semibold text-gray-900">
                {producto?.montoMinimoIncremento
                  ? `$${Number(producto.montoMinimoIncremento).toLocaleString(
                      "es-EC",
                      { minimumFractionDigits: 2 }
                    )}`
                  : "-"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-500 w-44">Penalidad (%):</span>
            {editMode ? (
              <Input
                type="number"
                step="0.01"
                className="w-32"
                value={editForm.penalidad}
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    penalidad: e.target.value,
                  }))
                }
              />
            ) : (
              <span className="font-semibold text-gray-900">
                {producto?.penalidad !== undefined
                  ? `${producto.penalidad}%`
                  : "-"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm col-span-2">
            <span className="text-gray-500 w-44">Descripción:</span>
            {editMode ? (
              <Textarea
                value={editForm.descripcion}
                rows={2}
                className="w-full"
                maxLength={255}
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    descripcion: e.target.value,
                  }))
                }
              />
            ) : (
              <span className="font-semibold text-gray-900 text-justify">
                {producto?.descripcion}
              </span>
            )}
          </div>
          {/* Botones de edición */}
          <div className="col-span-2 flex justify-end gap-4 mt-3">
            {editMode ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditForm({
                      ...producto,
                      descripcion: producto.descripcion || "",
                      penalidad: producto.penalidad ?? "",
                      montoMinimoIncremento:
                        producto.montoMinimoIncremento ?? "",
                    });
                    setEditMode(false);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  className="bg-violet-600 hover:bg-violet-700 text-white px-7"
                  onClick={handleSaveEdit}
                >
                  Guardar cambios
                </Button>
              </>
            ) : (
              <Button
                className="bg-violet-600 hover:bg-violet-700 text-white px-7"
                onClick={() => setEditMode(true)}
              >
                Editar producto
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabla de configuraciones */}
      <section className="w-full bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Configuraciones de producto
          </h2>
          <Button
            className="bg-violet-600 hover:bg-violet-700 text-white"
            onClick={() => {
              setEditingConfig(null);
              setConfigDialogOpen(true);
            }}
          >
            + Agregar configuración
          </Button>
        </div>
        <TablaCustom2
          columns={columnasConfig}
          data={configuraciones}
          mostrarEditar={true}
          mostrarEliminar={true}
          mostrarAgregarNuevo={false}
          onEditarClick={(cfg) => {
            setEditingConfig(cfg);
            setConfigDialogOpen(true);
          }}
          onEliminarClick={handleEliminarConfig}
        />
      </section>

      {/* Popup para crear/editar configuración */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="min-w-[420px] max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingConfig
                ? "Editar configuración"
                : "Agregar configuración"}
            </DialogTitle>
            <DialogDescription>
              Completa los datos de la configuración para este producto.
            </DialogDescription>
          </DialogHeader>
          <ConfiguracionesProductoForm
            idProducto={producto?.idProducto}
            initialData={editingConfig}
            onClose={() => setConfigDialogOpen(false)}
            onSaved={() => {
              setConfigDialogOpen(false);
              loadAll();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Detalle({ label, value }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-gray-500 w-44">{label}:</span>
      <span className="font-semibold text-gray-900">{value ?? "-"}</span>
    </div>
  );
}
