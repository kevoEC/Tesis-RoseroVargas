import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPagoById, updatePago, generarPagosPorCalendario } from "@/service/Entidades/PagosService";
import { getCalendarioOperacionesById } from "@/service/Entidades/CalendarioOperacionesService";
import { getCasosPorPago } from "@/service/Entidades/PagosService";
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

export default function PagosDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pago, setPago] = useState(null);
  const [calendario, setCalendario] = useState(null);
  const [casos, setCasos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Estados de campos y switches
  const [detalle, setDetalle] = useState("");
  const [generarPagos, setGenerarPagos] = useState(false);
  const [confirmarRegistrosPagos, setConfirmarRegistrosPagos] = useState(false);
  const [descartarPagos, setDescartarPagos] = useState(false);

  // Dialogo de confirmación
  const [showGenerarAlert, setShowGenerarAlert] = useState(false);

  // Cargar pago y todo lo relacionado
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

  const handleActualizarPago = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updatePago(pago.idPago, {
        ...pago,
        detalle,
        confirmarRegistrosPagos,
        descartarPagos
      });
      toast.success("Pago actualizado correctamente");
      await reloadAll();
    } catch (err) {
      toast.error("Error al actualizar pago: " + (err.message ?? err));
    } finally {
      setSaving(false);
    }
  };

  const soloLectura = !!pago?.confirmarRegistrosPagos;
  const pagosGenerados = !!pago?.generarPagos;
  const tieneCasos = Array.isArray(casos) && casos.length > 0;

  const handleGenerarPagos = async () => {
    setShowGenerarAlert(false);
    setSaving(true);
    try {
      await generarPagosPorCalendario({
        idCalendario: pago.idCalendario,
        idPago: pago.idPago,
        idUsuario: pago.idUsuarioPropietario
      });
      toast.success("Casos de pago generados correctamente");
      await reloadAll();
    } catch (err) {
      toast.error("Error al generar casos de pago: " + (err.message ?? err));
    } finally {
      setSaving(false);
    }
  };

  const onSwitchGenerarChange = (checked) => {
    if (!pagosGenerados && checked && !soloLectura) setShowGenerarAlert(true);
  };

  const onSwitchDescartarChange = async (checked) => {
    setSaving(true);
    try {
      await updatePago(pago.idPago, {
        ...pago,
        descartarPagos: checked
      });
      await reloadAll();
    } catch (err) {
      toast.error("Error al actualizar descartar pagos: " + (err.message ?? err));
    } finally {
      setSaving(false);
    }
  };

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

  const estadoLabel = pago?.confirmarRegistrosPagos
    ? <span className="px-2 py-0.5 rounded-full bg-gray-300 text-gray-700 font-semibold">Cerrado</span>
    : <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 font-semibold">Pendiente</span>;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto bg-white rounded-2xl shadow-lg">
      {/* Header tipo Dynamics */}
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

      <form onSubmit={handleActualizarPago} className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Panel izquierdo */}
        <section className="border rounded-xl p-6 shadow-sm flex flex-col gap-4 min-h-[360px]">
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
            <div className="flex items-center justify-between gap-2">
              <label className="text-sm select-none min-w-[170px]">Generar casos de pago</label>
              <div className="flex items-center gap-2">
                <Switch
                  checked={pagosGenerados}
                  onCheckedChange={onSwitchGenerarChange}
                  disabled={pagosGenerados || soloLectura}
                  id="generarPagos"
                />
                <span className="ml-2 w-6 text-gray-700">{pagosGenerados ? "Sí" : "No"}</span>
              </div>
            </div>
            {/* Confirmar registros de pago */}
            <div className="flex items-center justify-between gap-2">
              <label className="text-sm select-none min-w-[170px]">Confirmar registros de pago</label>
              <div className="flex items-center gap-2">
                <Switch
                  checked={confirmarRegistrosPagos}
                  onCheckedChange={e => setConfirmarRegistrosPagos(e)}
                  disabled={!pagosGenerados || soloLectura || !tieneCasos}
                  id="confirmarPagos"
                />
                <span className="ml-2 w-6 text-gray-700">{confirmarRegistrosPagos ? "Sí" : "No"}</span>
              </div>
            </div>
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
              type="submit"
              className="bg-violet-600 hover:bg-violet-700 text-white w-full"
              disabled={soloLectura || saving}
            >
              {saving ? "Guardando..." : "Actualizar pago"}
            </Button>
          </div>
        </section>

        {/* Panel derecho */}
        <section className="border rounded-xl p-6 shadow-sm flex flex-col gap-4 min-h-[360px]">
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
              <label className="text-sm select-none min-w-[110px]">Descartar pagos</label>
              <Switch
                checked={descartarPagos}
                onCheckedChange={onSwitchDescartarChange}
                disabled={!pagosGenerados || soloLectura}
                id="descartarPagos"
              />
              <span className="ml-2 w-6 text-gray-700">{descartarPagos ? "Sí" : "No"}</span>
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

      {/* Dialog de confirmación para generar casos */}
      <AlertDialog open={showGenerarAlert} onOpenChange={setShowGenerarAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro de generar los casos de pago?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleGenerarPagos}>Sí, generar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
