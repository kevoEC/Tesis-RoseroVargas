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
import { getCatalogoFinalizacion } from "@/service/Catalogos/FinalService";

export default function FinalizacionForm({ id }) {
  const [loading, setLoading] = useState(true);
  const [solicitudData, setSolicitudData] = useState(null);
  const [opcionesAccion, setOpcionesAccion] = useState([]);
  const [finalizacion, setFinalizacion] = useState({
    numeroContrato: "",
    idContinuarSolicitud: "", /*viene de catálogo, valor sería 1, 2 o sin seleccionar*/
    nombreContinuarSolicitud: ""/*También viene de catálogo*/,
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
          nombreContinuarSolicitud: data.finalizacion.nombreContinuarSolicitud ?? "",
          motivoFinalizacion: data.finalizacion.motivoFinalizacion ?? "",
          observacionFinalizacion: data.finalizacion.observacionFinalizacion ?? "",
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

  /*Cargo catálogo de acciones*/
  useEffect(() => {
    const cargarCatalogo = async () => {
      try {
        const res = await getCatalogoFinalizacion();
        /*solo para verificar que sea array*/
        const catalogo = Array.isArray(res) ? res : [];
        setOpcionesAccion(catalogo);

      } catch (err) {
        toast.error("Error al cargar catálogo de acciones: " + err.message);
      }
    };
    cargarCatalogo();
  }, []);
  const handleGuardar = async () => {
    if (!solicitudData) return;
    try {
      setLoading(true);
      const payload = {
        ...solicitudData, finalizacion: {
          ...solicitudData.finalizacion,
          ...finalizacion,
        },
      };
      console.log("payload finalización" + JSON.stringify(payload))
      const res = await updateSolicitud(id, payload);
      if (res.success) toast.success("Finalización actualizada.");
      else toast.error("Error al actualizar finalización.");
    } catch (err) {
      toast.error("Error al guardar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const generarContrato = () => {
    const provisional = `PROVISIONAL-${ Math.random() * (10 - 1 + 1)}`;
    setFinalizacion((f) => ({
      ...f,
      numeroContrato: provisional,
    }));
  };

  if (loading) return <p>Cargando datos de finalización...</p>;

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-xl font-semibold">Finalización</h2>

      <Button onClick={handleGuardar} disabled={loading} className="text-white">
        Guardar datos
      </Button>


      <Card>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        
            <div className="flex items-end gap-2">
  
              <div className="flex flex-col space-y-1">
                <Label className="text-sm font-medium text-gray-700">
                  Número de contrato
                </Label>
                <Input
                  placeholder="---"
                  type="text"
                  value={finalizacion.numeroContrato}
                  onChange={(e) =>
                    setFinalizacion({
                      ...finalizacion,
                      numeroContrato: e.target.value,
                    })
                  }
                  className="h-10"
                />
              </div>

              <Button
                onClick={generarContrato}
                className="h-10"
                variant="muted"
              >
                Generar contrato
              </Button>
            </div>

            {/* Dropdown unificado para acción */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">
                Acción
              </Label>
              <Select
                value={String(finalizacion.idContinuarSolicitud)}
                onValueChange={(value) => {
                  const id = parseInt(value, 10);
                  const seleccion = opcionesAccion.find(
                    (o) => o.idContinuarSolicitud === id
                  );
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
                  {opcionesAccion.length > 0 ? (
                    opcionesAccion.map((opt) => (
                      <SelectItem
                        key={opt.idContinuarSolicitud}
                        value={String(opt.idContinuarSolicitud)}
                      >
                        {opt.nombre}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem disabled value="no-options">
                      No hay opciones disponibles
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>


            {/* Renderizado condicional según la selección */}
            {finalizacion.idContinuarSolicitud === 1 && (
              <>
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
              </>
            )}

            {finalizacion.idContinuarSolicitud === 2 && (
              <FormSwitch
                label="Confirmar"
                checked={finalizacion.confirmar}
                onChange={(checked) =>
                  setFinalizacion({ ...finalizacion, confirmar: checked })
                }
              />
            )}
            {/* Si idContinuarSolicitud es "" o cualquier otro, no se renderiza ninguno */}
          </CardContent>
      </Card>
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
