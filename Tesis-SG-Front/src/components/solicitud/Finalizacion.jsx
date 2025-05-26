import { useEffect, useState } from "react";
import { mapIdentificacionToUpdate } from "@/utils/mappers";
import {
  getSolicitudById,
  updateSolicitud,
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

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await getSolicitudById(id);
        const data = res.data[0];
        setSolicitudData(data);
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

  const handleGuardar = async () => {
    if (!solicitudData) return;
    try {
      setLoading(true);
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

  const generarContrato = () => {
    const provisional = `PROVISIONAL-${Math.floor(Math.random() * 1000)}`;
    setFinalizacion((f) => ({
      ...f,
      numeroContrato: provisional,
    }));
  };

  const handleConfirmar = async () => {
    if (finalizacion.idContinuarSolicitud === 1) {
      setIsGenerating(true);
      try {
        await finalizarSolicitudYGenerarTareas(id);
        toast.success("Tareas generadas correctamente.");
      } catch (err) {
        toast.error("Error al generar tareas: " + err.message);
      } finally {
        setIsGenerating(false);
      }
    }
    setFinalizacion({ ...finalizacion, confirmar: true });
  };

  if (loading) return <GlassLoader visible message="Cargando finalización..." />;

  return (
    <div className="space-y-6 p-6 relative">
      <GlassLoader visible={isGenerating} message="Generando tareas..." />

      <div className="flex justify-end">
        <Button onClick={handleGuardar} className="bg-primary text-white hover:bg-primary/80 flex items-center gap-2">
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
              onChange={(e) => setFinalizacion({ ...finalizacion, numeroContrato: e.target.value })}
              disabled={finalizacion.confirmar}
            />
            <Button
              onClick={generarContrato}
              className="h-10"
              variant="muted"
              disabled={!!finalizacion.numeroContrato.trim() || finalizacion.confirmar}
            >
              Generar contrato
            </Button>
          </div>

          {/* Acción */}
          <FormGroup label="Acción">
            <Select
              disabled={finalizacion.confirmar}
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
              />
              <FormInput
                label="Observación de finalización"
                value={finalizacion.observacionFinalizacion}
                onChange={(e) => setFinalizacion({ ...finalizacion, observacionFinalizacion: e.target.value })}
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
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FormInput({ label, value, onChange, type = "text", disabled }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      <Input placeholder="---" type={type} value={value} onChange={onChange} disabled={disabled} />
    </div>
  );
}

function ConfirmSwitch({ label, checked, onConfirm, idContinuar }) {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    setOpen(false);
    onConfirm();
  };

  if (checked) {
    return (
      <div className="flex items-center gap-4">
        <Switch checked disabled className="bg-primary border-primary" />
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
          <AlertDialogTitle>
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
