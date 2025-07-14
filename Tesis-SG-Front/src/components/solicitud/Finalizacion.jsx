import { useEffect, useState } from "react";
import { mapIdentificacionToUpdate } from "@/utils/mappers";
import {
  getSolicitudById,
  updateSolicitud,
  getNumeroContratoSecuencial,
} from "@/service/Entidades/SolicitudService";
import { getCatalogoFinalizacion } from "@/service/Catalogos/FinalService";
import { finalizarSolicitudYGenerarTareas } from "@/service/Entidades/TareaService";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import GlassLoader from "@/components/ui/GlassLoader";
import { Save } from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export default function FinalizacionForm({ id }) {
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [solicitudData, setSolicitudData] = useState(null);
  const [opcionesAccion, setOpcionesAccion] = useState([]);
  const [finalizacion, setFinalizacion] = useState({
    numeroContrato: "",
    idContinuarSolicitud: "",
    nombreContinuarSolicitud: "",
    motivoFinalizacion: "",
    observacionFinalizacion: "",
    confirmar: false,
  });
  const [alertSinContrato, setAlertSinContrato] = useState(false);
  const [glassMsg, setGlassMsg] = useState("");
  const [bloquearTodo, setBloquearTodo] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await getSolicitudById(id);
        const data = res.data[0];
        setSolicitudData(data);

        // Bloquear todo si faseProceso !== 1
        setBloquearTodo(data.faseProceso !== 1);

        setFinalizacion({
          numeroContrato: data.finalizacion.numeroContrato ?? "",
          idContinuarSolicitud: data.finalizacion.idContinuarSolicitud ?? "",
          nombreContinuarSolicitud: data.finalizacion.nombreContinuarSolicitud ?? "",
          motivoFinalizacion: data.finalizacion.motivoFinalizacion ?? "",
          observacionFinalizacion: data.finalizacion.observacionFinalizacion ?? "",
          confirmar: data.finalizacion.confirmar ?? false,
        });
      } catch (err) {
        toast.error("Error al cargar finalización: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [id]);

  useEffect(() => {
    const cargarCatalogo = async () => {
      try {
        const res = await getCatalogoFinalizacion();
        setOpcionesAccion(Array.isArray(res) ? res : []);
      } catch (err) {
        toast.error("Error al cargar catálogo: " + err.message);
      }
    };
    cargarCatalogo();
  }, []);

  // Guardar Finalización
  const handleGuardar = async () => {
    if (!finalizacion.numeroContrato) {
      setAlertSinContrato(true);
      return;
    }
    if (!solicitudData) return;
    setLoading(true);
    try {
      const payload = {
        ...solicitudData,
        identificacion: mapIdentificacionToUpdate(solicitudData.identificacion),
        finalizacion,
      };
      const res = await updateSolicitud(id, payload);
      res.success
        ? toast.success("Finalización actualizada.")
        : toast.error("Error al actualizar.");
    } catch (err) {
      toast.error("Error al guardar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Generar número de contrato real
  const handleGenerarContrato = async () => {
    if (!solicitudData?.idSolicitudInversion || !solicitudData?.proyeccion?.idProyeccionSeleccionada) {
      toast.error("No se puede generar número de contrato. Verifica que exista una proyección seleccionada.");
      return;
    }
    setGlassMsg("Generando número de contrato...");
    setIsGenerating(true);
    try {
      const result = await getNumeroContratoSecuencial(
        solicitudData.idSolicitudInversion,
        solicitudData.proyeccion.idProyeccionSeleccionada
      );
      if (result && result.numeroContrato) {
        setFinalizacion((f) => ({
          ...f,
          numeroContrato: result.numeroContrato,
        }));
        toast.success("Número de contrato generado.");
      } else {
        toast.error("No se pudo generar el número de contrato.");
      }
    } catch (err) {
      toast.error(err.message || "Error al generar número de contrato.");
    } finally {
      setIsGenerating(false);
      setGlassMsg("");
    }
  };

  // Confirmar: primero guarda datos y luego genera tareas si aplica
  const handleConfirmar = async () => {
    if (bloquearTodo || isGenerating || loading) return;

    if (!finalizacion.numeroContrato) {
      toast.error("Debe generar un número de contrato antes de confirmar.");
      return;
    }

    setIsGenerating(true);
    setGlassMsg("Guardando datos de finalización...");

    try {
      // Guardar primero los datos de finalización
      const payload = {
        ...solicitudData,
        identificacion: mapIdentificacionToUpdate(solicitudData.identificacion),
        finalizacion,
      };
      const res = await updateSolicitud(id, payload);
      if (!res.success) {
        throw new Error("No se pudo guardar la finalización antes de continuar");
      }

      setGlassMsg("Procesando acción...");

      if (finalizacion.idContinuarSolicitud === 1) {
        await finalizarSolicitudYGenerarTareas(id);
        toast.success("Datos guardados y tareas generadas correctamente.");
      } else {
        toast.success("Datos guardados correctamente.");
      }

      setFinalizacion((f) => ({ ...f, confirmar: true }));

    } catch (err) {
      toast.error("Error al confirmar finalización: " + (err.message || err));
    } finally {
      setIsGenerating(false);
      setGlassMsg("");
    }
  };

  // Deshabilita campos si está bloqueado o ya confirmado o en carga
  const disabledCampos = bloquearTodo || !finalizacion.numeroContrato || finalizacion.confirmar || isGenerating || loading;

  if (loading) return <GlassLoader visible message="Cargando finalización..." />;

  return (
    <div className="space-y-6 p-6 relative">
      <GlassLoader visible={isGenerating} message={glassMsg} />

      {/* Mensaje bonito si está bloqueado */}
      {bloquearTodo && (
        <div className="w-full flex items-center px-6 py-2 mb-4 rounded-xl bg-yellow-100 border border-yellow-300 text-yellow-800 font-semibold">
          <span>No se permite editar la finalización en esta fase.</span>
        </div>
      )}

      {/* Diálogo de alerta si falta número de contrato */}
      <AlertDialog open={alertSinContrato} onOpenChange={setAlertSinContrato}>
        <AlertDialogContent className="bg-white border border-gray-200 rounded-xl shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-violet-700 font-semibold">
              Debes generar el número de contrato primero
            </AlertDialogTitle>
            <div className="text-gray-700 mt-2">
              Antes de continuar, debes generar el número de contrato.
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border border-gray-300 bg-white hover:bg-gray-50">
              Cerrar
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex justify-end">
        <Button
          onClick={handleGuardar}
          className="bg-primary text-white hover:bg-primary/80 flex items-center gap-2"
          disabled={bloquearTodo || loading || isGenerating}
        >
          <Save className="w-4 h-4" /> Guardar
        </Button>
      </div>

      <h2 className="text-xl font-semibold">Finalización</h2>

      <Card>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Número de contrato */}
          <div className="flex items-end gap-2">
            <FormInput
              label="Número de contrato"
              value={finalizacion.numeroContrato}
              onChange={() => {}}
              disabled={true}
            />
            <Button
              onClick={handleGenerarContrato}
              className="h-10"
              variant="muted"
              disabled={
                bloquearTodo ||
                !!finalizacion.numeroContrato.trim() ||
                finalizacion.confirmar ||
                isGenerating
              }
            >
              Generar número de contrato
            </Button>
          </div>

          {/* Acción */}
          <FormGroup label="Acción">
            <Select
              disabled={disabledCampos}
              value={String(finalizacion.idContinuarSolicitud)}
              onValueChange={(value) => {
                const id = parseInt(value, 10);
                const seleccion = opcionesAccion.find(o => o.idContinuarSolicitud === id);
                setFinalizacion({
                  ...finalizacion,
                  idContinuarSolicitud: id,
                  nombreContinuarSolicitud: seleccion?.nombre ?? "",
                });
              }}
            >
              <SelectTrigger className="text-sm border border-black">
                <SelectValue placeholder="Seleccione una acción" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {opcionesAccion.map((opt) => (
                  <SelectItem key={opt.idContinuarSolicitud} value={String(opt.idContinuarSolicitud)}>
                    {opt.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormGroup>

          {/* Motivo y observación si opción = 2 */}
          {finalizacion.idContinuarSolicitud === 2 && (
            <>
              <FormInput
                label="Motivo de finalización"
                value={finalizacion.motivoFinalizacion}
                onChange={(e) => setFinalizacion({ ...finalizacion, motivoFinalizacion: e.target.value })}
                disabled={disabledCampos}
              />
              <FormInput
                label="Observación de finalización"
                value={finalizacion.observacionFinalizacion}
                onChange={(e) => setFinalizacion({ ...finalizacion, observacionFinalizacion: e.target.value })}
                disabled={disabledCampos}
              />
            </>
          )}

          {/* Confirmar */}
          {(finalizacion.idContinuarSolicitud === 1 || finalizacion.idContinuarSolicitud === 2) && (
            <ConfirmSwitch
              label="Confirmar"
              checked={finalizacion.confirmar}
              idContinuar={finalizacion.idContinuarSolicitud}
              onConfirm={handleConfirmar}
              className="border border-gray-300 p-4 rounded-md"
              disabled={disabledCampos}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// COMPONENTES AUXILIARES

function FormInput({ label, value, onChange, type = "text", disabled }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      <Input placeholder="---" type={type} value={value} onChange={onChange} disabled={disabled} />
    </div>
  );
}

function ConfirmSwitch({ label, checked, onConfirm, idContinuar, disabled }) {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    setOpen(false);
    if (!disabled) onConfirm();
  };

  if (checked) {
    return (
      <div className="flex items-center gap-4">
        <Switch
          checked
          disabled
          className="bg-violet-600 border-violet-700 opacity-90 !cursor-not-allowed"
          style={{ opacity: 1 }}
        />
        <Label className="text-sm font-medium text-gray-700">{label}</Label>
      </div>
    );
  }

  // Cuando está deshabilitado pero no checked
  if (disabled) {
    return (
      <div className="flex items-center gap-4">
        <Switch
          checked={false}
          disabled
          className="bg-black border-black-400 opacity-80 !cursor-not-allowed"
          style={{ opacity: 1 }}
        />
        <Label className="text-sm font-medium text-gray-700">{label}</Label>
      </div>
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <div className="flex items-center gap-4 cursor-pointer">
          <Switch checked={false} onCheckedChange={() => setOpen(true)} />
          <Label className="text-sm font-medium text-gray-700">{label}</Label>
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-white text-black border border-gray-300">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-violet-700 font-semibold">
            ¿Estás seguro de terminar la solicitud?
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            Sí, {idContinuar === 1 ? "crear tareas" : "finalizar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function FormGroup({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      {children}
    </div>
  );
}
