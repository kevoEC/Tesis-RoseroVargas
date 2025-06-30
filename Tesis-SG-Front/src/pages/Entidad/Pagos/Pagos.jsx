import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getPagoById,
  updatePago,
  generarPagosPorCalendario,
  getCasosPorPago,
  rollbackPagosPorIdPago
} from "@/service/Entidades/PagosService";
import { getCalendarioOperacionesById } from "@/service/Entidades/CalendarioOperacionesService";
import TablaCustom2 from "@/components/shared/TablaCustom2";
import GlassLoader from "@/components/ui/GlassLoader";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel
} from "@/components/ui/alert-dialog";
import { Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function PagosDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [pago, setPago] = useState(null);
  const [calendario, setCalendario] = useState(null);
  const [casos, setCasos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [detalle, setDetalle] = useState("");
  const [generarPagos, setGenerarPagos] = useState(false);
  const [confirmarRegistrosPagos, setConfirmarRegistrosPagos] = useState(false);
  const [descartarPagos, setDescartarPagos] = useState(false);

  const [alertConfig, setAlertConfig] = useState({ open: false });

  const [faltanCasosAlert, setFaltanCasosAlert] = useState(false);

  // Layout
  const gridCols = "grid grid-cols-1 lg:grid-cols-3 gap-8 items-start";

  const reloadAll = async () => {
    setLoading(true);
    try {
      const pagoData = await getPagoById(id);
      setPago(pagoData);
      setDetalle(pagoData?.detalle ?? "");
      setGenerarPagos(!!pagoData?.generarPagos);
      setConfirmarRegistrosPagos(!!pagoData?.confirmarRegistrosPagos);
      setDescartarPagos(!!pagoData?.descartarPagos);

      if (pagoData?.idCalendario) {
        const calData = await getCalendarioOperacionesById(pagoData.idCalendario);
        setCalendario(calData);
      }
      const casosData = await getCasosPorPago(id);
      setCasos(Array.isArray(casosData) ? casosData : []);
    } catch (err) {
      toast.error("Error al cargar pago/casos: " + (err.message ?? err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reloadAll(); }, [id]);

  const soloLectura = !!pago?.confirmarRegistrosPagos;
  const pagosGenerados = !!pago?.generarPagos;
  const tieneCasos = Array.isArray(casos) && casos.length > 0;

  // ALERTDIALOG REUSABLE
  const openAlert = (config) => setAlertConfig({ open: true, ...config });
  const closeAlert = () => setAlertConfig({ open: false });

  // Switch para GENERAR CASOS
  const handleSwitchGenerar = () => {
    if (!pagosGenerados && !soloLectura) {
      openAlert({
        title: "¿Está seguro de generar los casos de pago?",
        description: "Esto generará todos los casos de pago asociados a este calendario.",
        confirmLabel: "Sí, generar",
        onConfirm: async () => {
          setSaving(true);
          try {
            await generarPagosPorCalendario({
              idCalendario: pago.idCalendario,
              idPago: pago.idPago,
              idUsuario: user?.id ?? pago.idUsuarioPropietario
            });
            toast.success("Casos de pago generados correctamente");
            closeAlert();
            await reloadAll();
          } catch (err) {
            toast.error("Error al generar casos de pago: " + (err.message ?? err));
            closeAlert();
          } finally {
            setSaving(false);
          }
        }
      });
    }
  };

  // Switch para CONFIRMAR REGISTRO DE PAGOS
  const handleSwitchConfirmar = () => {
    if (!pagosGenerados || soloLectura || confirmarRegistrosPagos) return;
    const abiertos = casos.filter(c => c.estado !== "Cerrado");
    if (abiertos.length > 0) {
      setFaltanCasosAlert(true);
      return;
    }
    openAlert({
      title: "¿Está seguro de confirmar el registro de pagos?",
      description: "Al confirmar, este pago será cerrado y no podrá modificarse.",
      confirmLabel: "Sí, confirmar",
      onConfirm: async () => {
        setSaving(true);
        try {
          await updatePago(pago.idPago, {
            ...pago,
            confirmarRegistrosPagos: true
          });
          toast.success("Pago confirmado y cerrado correctamente");
          closeAlert();
          await reloadAll();
        } catch (err) {
          toast.error("Error al confirmar pagos: " + (err.message ?? err));
          closeAlert();
        } finally {
          setSaving(false);
        }
      }
    });
  };

  // Switch para DESCARTAR PAGOS
  const handleSwitchDescartar = () => {
    if (!pagosGenerados || soloLectura || confirmarRegistrosPagos) return;
    openAlert({
      title: "¿Está seguro de descartar todos los pagos?",
      description: "Esto eliminará todos los casos de pago generados para este calendario. Podrás generarlos de nuevo.",
      confirmLabel: "Sí, descartar",
      onConfirm: async () => {
        setSaving(true);
        try {
          await rollbackPagosPorIdPago(pago.idPago, user?.id ?? pago.idUsuarioPropietario);
          toast.success("Pagos y casos descartados correctamente, puedes volver a generarlos.");
          closeAlert();
          await reloadAll();
        } catch (err) {
          toast.error("Error al descartar pagos: " + (err.message ?? err));
          closeAlert();
        } finally {
          setSaving(false);
        }
      }
    });
  };

  // Tabla columnas
  const columnasCasos = [
    {
      key: "numeroCaso",
      label: "Título de caso",
      render: (v, row) => (
        <span className="font-mono text-violet-700 cursor-pointer hover:underline"
          onClick={() => navigate(`/casos/editar/${row.idCaso}`)}
        >{v}</span>
      )
    },
    { key: "motivoNombre", label: "Motivo" },
    { key: "nombreCliente", label: "Cliente" },
    {
      key: "fechaPago",
      label: "Fecha de pago",
      render: v => v ? new Date(v).toLocaleDateString() : ""
    },
    {
      key: "montoPago",
      label: "Monto de pago",
      render: v => v !== undefined && v !== null ? `$${Number(v).toLocaleString("es-EC", { minimumFractionDigits: 2 })}` : ""
    },
    { key: "numeroCuentaPago", label: "Cuenta de pago" },
    {
      key: "estado",
      label: "Estado",
      render: value => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          value === "Cerrado"
            ? "bg-gray-300 text-gray-700"
            : "bg-blue-100 text-blue-700"
        }`}>{value}</span>
      )
    }
  ];

  if (loading) return <GlassLoader visible message="Cargando pago..." />;

  // Badge de estado
  const estadoLabel = pago?.confirmarRegistrosPagos
    ? <span className="px-2 py-0.5 rounded-full bg-gray-300 text-gray-700 font-semibold">Cerrado</span>
    : <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 font-semibold">Pendiente</span>;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto bg-white rounded-2xl shadow-lg relative">
      {/* CANDADO Dynamics */}
      {soloLectura && (
        <div className="w-full flex items-center px-6 py-2 bg-gray-50 border-b border-gray-300 shadow-sm mb-4 z-50 rounded-t-xl" style={{ position: "sticky", top: 0 }}>
          <Lock className="text-gray-700 w-5 h-5 mr-2" />
          <span className="font-semibold text-gray-700 text-sm">
            Solo lectura: estado de este registro: <span className="text-violet-700">Cerrado</span>
          </span>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-wrap items-center gap-4 mb-3">
        <Button variant="outline" onClick={() => navigate("/pagos/vista")} className="px-5 py-2">← Volver</Button>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          Pagos {calendario?.nombre || ""}
        </h1>
        <span className="text-sm text-gray-500 ml-2">{estadoLabel}</span>
      </div>

      <div className="flex flex-wrap text-xs text-gray-700 mb-6 border-b pb-2 gap-8">
        <span><b>Calendario:</b> {calendario?.nombre || "-"}</span>
        <span><b>Creado:</b> {pago?.fechaCreacion ? new Date(pago.fechaCreacion).toLocaleString("es-EC") : "-"}</span>
        <span><b>Detalle:</b> {pago?.detalle}</span>
      </div>

      {/* Layout: Izquierda 1/3, derecha 2/3 */}
      <form onSubmit={e => e.preventDefault()} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Panel izquierdo (1/3) */}
        <section className="border rounded-xl p-6 shadow-sm flex flex-col gap-4 min-h-[360px] col-span-1">
          <FormGroup label="Calendario de pagos">
            <input
              type="text"
              className="w-full border rounded-md p-2 bg-gray-100 text-gray-500 font-medium"
              value={calendario?.nombre || ""}
              disabled
            />
          </FormGroup>

          <div className="font-semibold text-gray-800 mb-2">Opciones</div>
          <div className="space-y-2">
            {/* Generar casos de pago */}
            <SwitchLine
              label="Generar casos de pago"
              checked={pagosGenerados}
              onCheckedChange={handleSwitchGenerar}
              disabled={pagosGenerados || soloLectura}
              rightLabel={pagosGenerados ? "Sí" : "No"}
              border
            />
            {/* Confirmar registros de pago */}
            <SwitchLine
              label="Confirmar registros de pago"
              checked={confirmarRegistrosPagos}
              onCheckedChange={handleSwitchConfirmar}
              disabled={!pagosGenerados || soloLectura || !tieneCasos || confirmarRegistrosPagos}
              rightLabel={confirmarRegistrosPagos ? "Sí" : "No"}
              border
            />
          </div>
          <FormGroup label="Detalles">
            <textarea
              className="w-full border rounded-md p-2 bg-white text-sm"
              rows={3}
              value={detalle}
              onChange={e => setDetalle(e.target.value)}
              disabled={soloLectura}
            />
          </FormGroup>
          <div className="pt-2">
            <Button
              type="button"
              className="bg-violet-600 hover:bg-violet-700 text-white w-full"
              onClick={async () => {
                setSaving(true);
                try {
                  await updatePago(pago.idPago, {
                    ...pago,
                    detalle
                  });
                  toast.success("Pago actualizado correctamente");
                  await reloadAll();
                } catch (err) {
                  toast.error("Error al actualizar pago: " + (err.message ?? err));
                } finally {
                  setSaving(false);
                }
              }}
              disabled={soloLectura || saving}
            >
              {saving ? "Guardando..." : "Actualizar pago"}
            </Button>
          </div>
        </section>

        {/* Panel derecho (2/3) */}
        <section className="border rounded-xl p-6 shadow-sm flex flex-col gap-4 min-h-[360px] col-span-2">
          <div className="flex items-center gap-6 mb-3">
            <FormGroup label="Cantidad de pagos" className="mb-0">
              <input
                type="text"
                className="w-28 border rounded-md p-2 bg-gray-100"
                value={pago?.cantidadPagos ?? 0}
                disabled
              />
            </FormGroup>
            <div className="flex items-center gap-2 ml-6">
              <SwitchLine
                label="Descartar pagos"
                checked={descartarPagos}
                onCheckedChange={handleSwitchDescartar}
                disabled={!pagosGenerados || soloLectura || confirmarRegistrosPagos}
                rightLabel={descartarPagos ? "Sí" : "No"}
                border
              />
            </div>
          </div>
          <div className="mb-1">
            <span className="font-semibold text-md text-gray-700">Casos de pago</span>
          </div>
          <TablaCustom2
            columns={columnasCasos}
            data={casos}
            mostrarEditar={true}
            mostrarAgregarNuevo={false}
            mostrarEliminar={false}
            onEditarClick={item => navigate(`/casos/editar/${item.idCaso}`)}
          />
        </section>
      </form>

      {/* AlertDialog REUSABLE */}
      <AlertDialog open={alertConfig.open} onOpenChange={closeAlert}>
        <AlertDialogContent className="bg-white border border-gray-300 rounded-xl shadow-xl p-7 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900">{alertConfig.title}</AlertDialogTitle>
            {alertConfig.description && (
              <div className="text-gray-700 mt-2">{alertConfig.description}</div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border border-gray-300 bg-white hover:bg-gray-50">Cancelar</AlertDialogCancel>
            <AlertDialogAction asChild>
              <button
                className="bg-violet-600 text-white hover:bg-violet-700 px-4 py-2 rounded"
                onClick={async (e) => {
                  e.preventDefault();
                  if (alertConfig.onConfirm) {
                    await alertConfig.onConfirm();
                  }
                }}
                type="button"
                disabled={saving}
              >
                {saving ? "Guardando..." : (alertConfig.confirmLabel || "Sí, continuar")}
              </button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Alerta de casos no cerrados */}
      {faltanCasosAlert && (
        <div className="fixed inset-0 bg-black/20 flex justify-center items-center z-50">
          <div className="bg-white p-7 rounded-xl shadow-lg max-w-sm w-full border border-yellow-400">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-yellow-600 font-bold text-lg">⚠️ Faltan casos por cerrar</span>
            </div>
            <p className="text-gray-800 mb-4">
              No puedes confirmar los pagos porque hay casos pendientes de cerrar.
            </p>
            <div className="flex justify-end gap-4 mt-2">
              <Button variant="outline" onClick={() => setFaltanCasosAlert(false)}>Cerrar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Switch profesional con borde y Sí/No al lado derecho
function SwitchLine({ label, checked, onCheckedChange, disabled, rightLabel, border }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm select-none">{label}</span>
      <div className="flex items-center gap-2">
        <div
          className={`
            px-2 py-0.5 
            flex items-center
          `}
          style={{ minWidth: 46, minHeight: 28 }}
        >
          <Switch
            checked={checked}
            onCheckedChange={onCheckedChange}
            disabled={disabled}
            className={`
              data-[state=checked]:bg-violet-400
              data-[state=unchecked]:bg-gray-200
              border border-gray-400
              transition-colors
              w-10 h-6
            `}
          />
        </div>
        <span className="ml-2 w-6 text-gray-700">{rightLabel}</span>
      </div>
    </div>
  );
}

function FormGroup({ label, children, className }) {
  return (
    <div className={`space-y-1.5 mb-2 ${className ?? ""}`}>
      <span className="block font-medium text-gray-700 text-sm">{label}</span>
      {children}
    </div>
  );
}
