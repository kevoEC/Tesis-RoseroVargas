import { useEffect, useState } from "react";
import {
  getSolicitudById,
  updateSolicitud,
} from "@/service/Entidades/SolicitudService";
import { Card, CardContent } from "@/components/ui/card";
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

export default function FinalizacionForm({ id }) {
  const [loading, setLoading] = useState(true);
  const [solicitudData, setSolicitudData] = useState(null);
  const [finalizacion, setFinalizacion] = useState({
    numeroContrato: "",
    idContinuarSolicitud: "",
    motivoFinalizacion: "",
    observacionFinalizacion: "",
    confirmar: false,
  });
  const [decision, setDecision] = useState("Finalizar con el registro");

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await getSolicitudById(id);
        const data = res.data[0];
        setSolicitudData(data);
        setFinalizacion({
          numeroContrato: data.finalizacion.numeroContrato ?? "",
          idContinuarSolicitud: data.finalizacion.idContinuarSolicitud ?? "",
          motivoFinalizacion: data.finalizacion.motivoFinalizacion ?? "",
          observacionFinalizacion:
            data.finalizacion.observacionFinalizacion ?? "",
          confirmar: data.finalizacion.confirmar ?? false,
        });
      } catch (err) {
        toast.error("Error al cargar datos de finalización: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [id]);

  const handleGuardar = async () => {
    if (!solicitudData) return;
    try {
      setLoading(true);
      const payload = {
        ...solicitudData,
        finalizacion: {
          ...solicitudData.finalizacion,
          ...finalizacion,
        },
      };
      const res = await updateSolicitud(id, payload);
      if (res.success) toast.success("Finalización actualizada.");
      else toast.error("Error al actualizar finalización.");
    } catch (err) {
      toast.error("Error al guardar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Cargando datos de finalización...</p>;

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-xl font-semibold">Finalización</h2>

      <Button onClick={handleGuardar} disabled={loading} className="text-white">
        Guardar datos
      </Button>
      <Card>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          <FormInput
            label="Número de contrato"
            value={finalizacion.numeroContrato}
            onChange={(e) =>
              setFinalizacion({
                ...finalizacion,
                numeroContrato: e.target.value,
              })
            }
          />
          <FormInput
            label="ID Continuar solicitud"
            type="number"
            value={finalizacion.idContinuarSolicitud}
            onChange={(e) =>
              setFinalizacion({
                ...finalizacion,
                idContinuarSolicitud: e.target.value,
              })
            }
          />
          <FormInput
            label="Motivo de finalización"
            value={finalizacion.motivoFinalizacion}
            onChange={(e) =>
              setFinalizacion({
                ...finalizacion,
                motivoFinalizacion: e.target.value,
              })
            }
          />
          <FormInput
            label="Observación de finalización"
            value={finalizacion.observacionFinalizacion}
            onChange={(e) =>
              setFinalizacion({
                ...finalizacion,
                observacionFinalizacion: e.target.value,
              })
            }
          />
          <FormSwitch
            label="Confirmar"
            checked={finalizacion.confirmar}
            onChange={(checked) =>
              setFinalizacion({ ...finalizacion, confirmar: checked })
            }
          />
        </CardContent>
      </Card>

      {/* Select local — no se envía al backend */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-gray-700">Acción</Label>
        <Select value={decision} onValueChange={setDecision}>
          <SelectTrigger className="text-sm border border-black">
            <SelectValue placeholder="Seleccione una acción" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="Finalizar con el registro">
              Finalizar con el registro
            </SelectItem>
            <SelectItem value="Rechazar">Rechazar</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// Reutilizables

function FormInput({ label, value, onChange, type = "text" }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      <Input placeholder="---" type={type} value={value} onChange={onChange} />
    </div>
  );
}


function FormSwitch({ label, checked, onChange }) {
  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Switch
          checked={checked}
          onCheckedChange={onChange}
          className={`
            peer
            inline-flex
            h-6 w-11 shrink-0
            cursor-pointer
            items-center
            rounded-full
            border
            border-gray-700
            transition-colors
            duration-200
            ease-in-out
            ${checked ? "bg-primary" : "bg-gray-300"}
          `}
        />
        {/* Círculo deslizante */}
        <span
          className={`
            pointer-events-none
            absolute
            left-0.5 top-0.5
            h-5 w-5
            transform
            rounded-full
            bg-white
            shadow
            transition-transform
            duration-200
            ease-in-out
            ${checked ? "translate-x-5" : "translate-x-0"}
          `}
        />
      </div>
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
    </div>
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
