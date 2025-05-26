import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GlassLoader from "@/components/ui/GlassLoader";
import { getTareaById, updateTarea, getDocumentosPorSolicitudYMotivo } from "@/service/Entidades/TareasService";
import TablaCustom2 from "@/components/shared/TablaCustom2";
import AdjuntoForm from "@/components/solicitud/AdjuntoForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";

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

  const MOTIVOS_POR_TIPO = {
    1: 23,
    2: 23,
    3: 7,
    4: 8,
    5: 14,
  };

  const cargarTarea = async () => {
    try {
      const res = await getTareaById(id);
      if (res.success) {
        setTarea(res.data);
        setResult(res.data.idResultado);
        setObservacion(res.data.observacion ?? "");

        const idMotivo = MOTIVOS_POR_TIPO[res.data.idTipoTarea];
        const docs = await getDocumentosPorSolicitudYMotivo(res.data.idSolicitudInversion, idMotivo);
        setDocumentos(docs.data || []);
      }
    } catch (err) {
      toast.error("Error al cargar la tarea: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTarea();
  }, [id]);

  const handleResultadoChange = (nuevoValor) => {
    if (nuevoValor === 1 || nuevoValor === 3) {
      setPendingResult(nuevoValor);
      setShowConfirmDialog(true);
    } else {
      setResult(nuevoValor);
    }
  };

  const handleConfirmResultado = async () => {
    try {
      const payload = {
        idResultado: pendingResult,
        observacion,
        camposTipo: tarea.camposTipo,
      };
      await updateTarea(tarea.idTarea, payload);
      toast.success("Tarea actualizada correctamente");
      setResult(pendingResult);
    } catch (err) {
      toast.error("Error al actualizar tarea");
    } finally {
      setShowConfirmDialog(false);
    }
  };

  if (loading || !tarea) return <GlassLoader visible message="Cargando tarea..." />;

  const renderCamposTipo = () => {
    const campos = tarea.camposTipo || {};
    switch (tarea.idTipoTarea) {
      case 1:
        return (
          <>
            <Switch label="Reemplazar contrato" checked={campos.ReemplazarContrato} disabled />
            <Switch label="Reemplazar anexo" checked={campos.ReemplazarAnexo} disabled />
          </>
        );
      case 2:
        return (
          <Switch label="Reemplazar contrato adendum" checked={campos.ReemplazarContratoAdendum} disabled />
        );
      case 3:
        return (
          <>
            <Switch label="Firmado por gerencia" checked={campos.FirmadoGerencia} disabled />
            <div>
              <label className="text-sm font-medium text-gray-800">Modo de firma</label>
              <select
                value={campos.IdTipoFirma}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm mt-1"
                disabled
              >
                <option value={1}>Física</option>
                <option value={2}>Digital</option>
              </select>
            </div>
          </>
        );
      case 4:
        return (
          <>
            <label className="text-sm font-medium text-gray-800">Resumen</label>
            <textarea
              value={campos.DatosTarea}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm"
              rows={4}
              disabled
            />
          </>
        );
      case 5:
        return (
          <>
            <FormInput label="Fecha Operación" value={campos.FechaOperacion} disabled />
            <FormInput label="Cuenta Abono" value={campos.CuentaAbono} disabled />
            <FormInput label="N° Comprobante Abono" value={campos.NumeroComprobanteAbono} disabled />
          </>
        );
      default:
        return null;
    }
  };

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

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-10 bg-white shadow rounded-xl">
      <div className="flex justify-between items-start">
        <Button variant="outline" onClick={() => navigate("/tareas/vista")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al listado
        </Button>
        <Button onClick={handleConfirmResultado} className="bg-primary text-white hover:bg-primary/80 flex items-center gap-2">
          <Save className="w-4 h-4" />
          Guardar
        </Button>
      </div>

      <div className="text-2xl font-bold">
        {tarea.nombreTipoTarea} - Nueva - <span className="font-normal text-gray-700">{tarea.tareaNombre}</span>
        <div className="text-sm text-gray-500 mt-1">Tarea de solicitud</div>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-10">
          <section className="border border-gray-300 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Descripción</h2>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-900 resize-y"
              rows={5}
              value={tarea.descripcion || ""}
              disabled
            />
          </section>

          <section className="border border-gray-300 rounded-xl p-6 shadow-sm space-y-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Configuración de tarea</h2>
            {renderCamposTipo()}
          </section>
        </div>

        <div className="space-y-10">
          <section className="border border-gray-300 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Resultado</h2>
            <select
              value={result}
              onChange={(e) => handleResultadoChange(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm"
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
            />
          </section>
        </div>
      </div>

      <section className="border border-gray-300 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Documentos Adjuntos</h2>
        <TablaCustom2
          columns={columnasDocumentos}
          data={documentos}
          mostrarEditar={true}
          mostrarAgregarNuevo={false}
          mostrarEliminar={false}
          onEditarClick={(item) => {
            setDocumentoId(item.idDocumento);
            setIsDialogOpen(true);
          }}
        />
      </section>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjunto</DialogTitle>
            <DialogDescription>Editar archivo</DialogDescription>
          </DialogHeader>
          <AdjuntoForm
            documentoId={documentoId}
            onClose={() => {
              setIsDialogOpen(false);
              cargarTarea();
            }}
          />
        </DialogContent>
      </Dialog>

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
  );
}

function Switch({ label, checked, onChange = () => {}, disabled }) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium">{label}</label>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
          disabled={disabled}
        />
        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/80 rounded-full peer peer-checked:bg-primary transition-all"></div>
        <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5"></div>
      </label>
    </div>
  );
}

function FormInput({ label, value, disabled }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-800">{label}</label>
      <input
        type="text"
        value={value || ""}
        disabled={disabled}
        className="w-full border border-gray-300 rounded-lg p-2 text-sm"
      />
    </div>
  );
}
