import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GlassLoader from "@/components/ui/GlassLoader";
import { updateTarea, getDocumentosPorSolicitudYMotivo } from "@/service/Entidades/TareaService";
import { getTareaById } from "@/service/Entidades/TareasService";
import TablaCustom2 from "@/components/shared/TablaCustom2";
import AdjuntoForm from "@/components/solicitud/AdjuntoForm";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Lock, Eye } from "lucide-react";

export default function TareaDetalleEditable() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tarea, setTarea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [documentos, setDocumentos] = useState([]);
  const [result, setResult] = useState(2);
  const [observacion, setObservacion] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingResult, setPendingResult] = useState(2);
  const [documentoId, setDocumentoId] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [camposEditados, setCamposEditados] = useState({});

  useEffect(() => {
    if (tarea) setCamposEditados(tarea.camposTipo || {});
  }, [tarea]);

  const handleCampoTipoChange = (key, value) => {
    setCamposEditados(prev => ({ ...prev, [key]: value }));
  };

  const soloLectura = tarea && tarea.idResultado === 1;

  // ----------- Documentos ----------
  const MOTIVOS_POR_TIPO = { 1: 23, 2: 23, 3: 14, 4: 7, 5: 8 };

  const cargarTarea = async () => {
    setLoading(true);
    try {
      const res = await getTareaById(id);
      if (res.success) {
        setTarea(res.data);
        setResult(res.data.idResultado);
        setObservacion(res.data.observacion ?? "");
        setCamposEditados(res.data.camposTipo || {});
        const idSolicitudInversion = res.data.idSolicitudInversion ?? 1024;
        const idMotivo = MOTIVOS_POR_TIPO[res.data.idTipoTarea];
        const docs = await getDocumentosPorSolicitudYMotivo(idSolicitudInversion, idMotivo);
        setDocumentos(docs);
      }
    } catch (err) {
      toast.error("Error al cargar la tarea: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTarea();
    // eslint-disable-next-line
  }, [id]);

  // ----------- Guardar -----------
  const handleGuardarTarea = async () => {
    setSaving(true);
    try {
      const payload = {
        idResultado: result,
        observacion,
        camposTipo: camposEditados,
      };
      await updateTarea(tarea.idTarea, payload);
      toast.success("Tarea actualizada correctamente");
      cargarTarea();
    } catch (err) {
      toast.error("Error al guardar tarea: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  // ----------- Resultado select + confirmación ----------
  const handleResultadoChange = (nuevoValor) => {
    if (nuevoValor === 1 || nuevoValor === 3) {
      setPendingResult(nuevoValor);
      setShowConfirmDialog(true);
    } else {
      setResult(nuevoValor);
    }
  };
  const handleConfirmResultado = async () => {
    setResult(pendingResult);
    setShowConfirmDialog(false);
  };

  // ----------- Badge resultado -----------
  const getResultadoBadge = (valor) => {
    switch (valor) {
      case 1:
        return <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700 font-semibold whitespace-nowrap">Aprobado</span>;
      case 3:
        return <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700 font-semibold whitespace-nowrap">Rechazado</span>;
      default:
        return <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800 font-semibold whitespace-nowrap">Pendiente</span>;
    }
  };

  // ----------- Renderiza campos tipo en COLUMNA ---------
  const renderCamposTipo = () => {
    const campos = camposEditados || {};
    switch (tarea.idTipoTarea) {
      case 1:
        return (
          <div className="flex flex-col gap-2">
            <Switch label="Reemplazar contrato" checked={!!campos.ReemplazarContrato} onChange={v => handleCampoTipoChange("ReemplazarContrato", v)} disabled={soloLectura} />
            <Switch label="Reemplazar anexo" checked={!!campos.ReemplazarAnexo} onChange={v => handleCampoTipoChange("ReemplazarAnexo", v)} disabled={soloLectura} />
          </div>
        );
      case 2:
        return (
          <div className="flex flex-col gap-2">
            <Switch label="Reemplazar contrato adendum" checked={!!campos.ReemplazarContratoAdendum} onChange={v => handleCampoTipoChange("ReemplazarContratoAdendum", v)} disabled={soloLectura} />
          </div>
        );
      case 3:
        return (
          <div className="flex flex-col gap-2">
            <Switch label="Firmado por gerencia" checked={!!campos.FirmadoGerencia} onChange={v => handleCampoTipoChange("FirmadoGerencia", v)} disabled={soloLectura} />
            <div>
              <label className="text-sm font-medium text-gray-800">Modo de firma</label>
              <select
                value={campos.IdTipoFirma ?? ""}
                onChange={e => handleCampoTipoChange("IdTipoFirma", Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm mt-1"
                disabled={soloLectura}
              >
                <option value={1}>Física</option>
                <option value={2}>Digital</option>
              </select>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-800">Resumen</label>
            <textarea
              value={campos.DatosTarea || ""}
              onChange={e => handleCampoTipoChange("DatosTarea", e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm"
              rows={4}
              disabled={soloLectura}
            />
          </div>
        );
      case 5:
        return (
          <div className="flex flex-col gap-2">
            <FormInput label="Fecha Operación" value={campos.FechaOperacion || ""} onChange={e => handleCampoTipoChange("FechaOperacion", e.target.value)} disabled={soloLectura} />
            <FormInput label="Cuenta Abono" value={campos.CuentaAbono || ""} onChange={e => handleCampoTipoChange("CuentaAbono", e.target.value)} disabled={soloLectura} />
            <FormInput label="N° Comprobante Abono" value={campos.NumeroComprobanteAbono || ""} onChange={e => handleCampoTipoChange("NumeroComprobanteAbono", e.target.value)} disabled={soloLectura} />
          </div>
        );
      default:
        return null;
    }
  };

  // ----------- Columnas documentos con ojito sólo si soloLectura -----------
  const columnasDocumentos = [
    {
      key: "idDocumento",
      label: "",
      render: (value) => (
        <div className="flex items-center justify-center group relative text-gray-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6M5 4v16h14V4H5zm2 2h10v12H7V6z" />
          </svg>
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 text-xs text-white bg-zinc-800 px-2 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
            ID: {value}
          </span>
        </div>
      ),
    },
    { key: "tipoDocumentoNombre", label: "Tipo de Documento" },
    { key: "motivoNombre", label: "Motivo" },
  ];
  if (soloLectura) {
    columnasDocumentos.push({
      key: "ver",
      label: "Ver",
      render: (_, row) => (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="text-primary hover:bg-violet-100"
          onClick={() => {
            setDocumentoId(row.idDocumento);
            setIsDialogOpen(true);
          }}
          title="Ver"
        >
          <Eye size={18} />
        </Button>
      )
    });
  }

  if (loading || !tarea) return <GlassLoader visible message="Cargando tarea..." />;

  // ----------- HEADER PRO COMO CASOS -----------
  return (
    <div className="relative">
      {soloLectura && (
        <div className="w-full flex items-center px-6 py-2 bg-gray-50 border-b border-gray-300 shadow-sm mb-2 z-50 rounded-t-xl" style={{ position: "sticky", top: 0 }}>
          <Lock className="text-gray-700 w-5 h-5 mr-2" />
          <span className="font-semibold text-gray-700 text-sm">
            Solo lectura: estado de esta tarea: <span className="text-violet-700">Aprobada</span>
          </span>
        </div>
      )}

      <div className="p-6 md:p-10 max-w-6xl mx-auto bg-white">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-3 mb-1">
          <Button variant="outline" onClick={() => navigate("/tareas/vista")} className="px-4 py-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al listado
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3 flex-wrap">
            {tarea.nombreTipoTarea} - Nueva - {tarea.tareaNombre}
            <span className="ml-2">{getResultadoBadge(result)}</span>
          </h1>
        </div>
        <div className="flex flex-wrap text-xs text-gray-700 mb-2 gap-8">
          <span><b>Tipo:</b> {tarea.nombreTipoTarea}</span>
          <span><b>Creado:</b> {tarea.fechaCreacion ? new Date(tarea.fechaCreacion).toLocaleString("es-EC") : "-"}</span>
          <span><b>Owner:</b> {tarea.nombreUsuarioPropietario || "-"}</span>
        </div>
        <hr className="mb-4"/>

        {/* MAIN CONTENT */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* IZQUIERDA */}
          <div className="flex flex-col gap-6">
            <section className="border rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Descripción</h2>
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-900 resize-y"
                rows={5}
                value={tarea.descripcion || ""}
                disabled
              />
            </section>
            <section className="border rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Configuración de tarea</h2>
              {renderCamposTipo()}
            </section>
          </div>
          {/* DERECHA */}
          <div className="flex flex-col gap-6">
            <section className="border rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Resultado</h2>
              <select
                value={result}
                onChange={(e) => handleResultadoChange(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm"
                disabled={soloLectura}
              >
                <option value={2}>Pendiente</option>
                <option value={1}>Aprobado</option>
                <option value={3}>Rechazado</option>
              </select>
              <label className="block text-sm font-medium text-gray-800 mt-5 mb-1">Observación</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-900 resize-y"
                rows={3}
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                disabled={soloLectura}
              />
              {/* Actualizar tarea si está editable */}
              {!soloLectura && (
                <Button
                  className="bg-violet-600 hover:bg-violet-700 text-white w-full mt-4"
                  onClick={handleGuardarTarea}
                  disabled={saving}
                  type="button"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Guardando..." : "Actualizar tarea"}
                </Button>
              )}
            </section>
          </div>
        </div>

        {/* ADJUNTOS OCUPANDO TODA LA FILA */}
        <section className="border rounded-xl p-6 shadow-sm mt-8 col-span-2">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Documentos Adjuntos</h2>
          <TablaCustom2
            columns={columnasDocumentos}
            data={documentos}
            mostrarEditar={!soloLectura}
            mostrarAgregarNuevo={false}
            mostrarEliminar={false}
            onEditarClick={(item) => {
              setDocumentoId(item.idDocumento);
              setIsDialogOpen(true);
            }}
          />
        </section>

        {/* MODAL ADJUNTO */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adjunto</DialogTitle>
              <DialogDescription>
                {soloLectura ? "Visualización de archivo adjunto" : "Editar archivo"}
              </DialogDescription>
            </DialogHeader>
            <AdjuntoForm
              documentoId={documentoId}
              readOnly={soloLectura}
              onClose={() => {
                setIsDialogOpen(false);
                cargarTarea();
              }}
            />
          </DialogContent>
        </Dialog>

        {/* CONFIRM RESULT */}
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent className="bg-white text-gray-900 border border-gray-300">
            <AlertDialogHeader>
              <AlertDialogTitle>
                ¿Estás seguro de marcar esta tarea como {pendingResult === 1 ? "Aprobada" : "Rechazada"}?
              </AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowConfirmDialog(false)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmResultado}>Sí, confirmar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

// ------- Switch y FormInput idénticos a los de Casos/Tareas -------
function Switch({ label, checked, onChange = () => {}, disabled }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <label className="text-sm font-medium">{label}</label>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
          disabled={disabled}
        />
        <div className={`w-11 h-6 rounded-full transition-all ${disabled ? "bg-gray-200" : checked ? "bg-primary" : "bg-gray-300"}`}></div>
        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? "translate-x-5" : ""}`}></div>
      </label>
    </div>
  );
}

function FormInput({ label, value, onChange, disabled }) {
  return (
    <div className="space-y-1.5 mb-2">
      <label className="text-sm font-medium text-gray-800">{label}</label>
      <input
        type="text"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full border border-gray-300 rounded-lg p-2 text-sm"
      />
    </div>
  );
}
