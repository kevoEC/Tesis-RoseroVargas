/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { getTipoIdentificacion } from "@/service/Catalogos/TipoIdentificacionService";
import {
  validarEquifax,
  validarLDS,
  createSolicitud,
} from "@/service/Entidades/SolicitudService";
import { Loader2, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";

export default function SolicitudInversionForm({ onClose, idProspecto }) {
  const { user } = useAuth();
  const [tiposIdentificacion, setTiposIdentificacion] = useState([]);

  const [form, setForm] = useState({
    tipoSolicitud: "",
    tipoCliente: "",
    tipoDocumento: "",
    numeroDocumento: "",
    nombres: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    validar: false,
    equifax: "",
    obsEquifax: "",
    listasControl: "",
    obsListasControl: "",
    continuar: "Continuar con la solicitud",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getTipoIdentificacion().then(setTiposIdentificacion);
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validarCampos = () => {
    return (
      form.tipoSolicitud &&
      form.tipoCliente &&
      form.tipoDocumento &&
      form.numeroDocumento.trim() &&
      form.nombres.trim() &&
      form.apellidoPaterno.trim() &&
      form.apellidoMaterno.trim()
    );
  };

  const ejecutarValidaciones = async () => {
    if (!validarCampos()) {
      toast.error("Por favor llena todos los campos antes de validar.");
      return;
    }
    setLoading(true);
    try {
      const resE = await validarEquifax(form.numeroDocumento);
      const equifax = resE.success && resE.resultado.resultado ? "Paso" : "Rechazado";
      const obsEquifax = resE.resultado?.observacion || "Sin observación";

      const resL = await validarLDS({
        identificacion: form.numeroDocumento,
        primerNombre: form.nombres.split(" ")[0] || "",
        segundoNombre: form.nombres.split(" ")[1] || "",
        primerApellido: form.apellidoPaterno,
        segundoApellido: form.apellidoMaterno,
      });
      const listasControl = resL.success && !resL.resultado.coincidencia ? "Paso" : "Rechazado";
      const obsListasControl = resL.resultado?.mensaje || "Sin observación";

      setForm((prev) => ({
        ...prev,
        equifax,
        obsEquifax,
        listasControl,
        obsListasControl,
        validar: true,
      }));

      toast.success("Validación completada");
    } catch (err) {
      toast.error("Error al validar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validarCampos()) {
      toast.error("Completa todos los campos antes de guardar.");
      return;
    }

    const mapTipo = (tipo, values) => values.indexOf(tipo) + 1;
    const payload = {
      idUsuarioPropietario: user.id,
      idProspecto: Number(idProspecto),
      identificacion: {
        tipoSolicitud: mapTipo(form.tipoSolicitud, ["Nueva", "Renovación", "Incremento"]),
        tipoCliente: mapTipo(form.tipoCliente, ["Natural", "Jurídico"]),
        tipoDocumento: mapTipo(form.tipoDocumento, ["Cédula", "RUC", "Pasaporte"]),
        numeroDocumento: form.numeroDocumento,
        nombres: form.nombres,
        apellidoPaterno: form.apellidoPaterno,
        apellidoMaterno: form.apellidoMaterno,
        validar: form.validar,
        equifax: form.equifax,
        obsEquifax: form.obsEquifax,
        listasControl: form.listasControl,
        obsListasControl: form.obsListasControl,
        continuar: form.continuar === "Continuar con la solicitud" ? 1 : 0,
      },
    };

    setLoading(true);
    try {
      const res = await createSolicitud(payload);
      if (res.success) {
        toast.success("Solicitud creada correctamente.");
        onClose?.();
      } else {
        toast.error("Error al guardar solicitud.");
      }
    } catch (err) {
      toast.error("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
<div className="space-y-6 p-4 max-h-[80vh] overflow-y-auto scrollbar-light">
      <Card className="shadow-md rounded-2xl bg-white border border-gray-200">
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormSelect label="Tipo de solicitud" value={form.tipoSolicitud} onChange={(v) => handleChange("tipoSolicitud", v)} options={["Nueva", "Renovación", "Incremento"]} />
            <FormSelect label="Tipo de cliente" value={form.tipoCliente} onChange={(v) => handleChange("tipoCliente", v)} options={["Natural", "Jurídico"]} />
            <FormSelect label="Tipo de documento" value={form.tipoDocumento} onChange={(v) => handleChange("tipoDocumento", v)} options={["Cédula", "RUC", "Pasaporte"]} />
            <FormInput label="Número de documento" value={form.numeroDocumento} onChange={(e) => handleChange("numeroDocumento", e.target.value)} />
            <FormInput label="Nombres" value={form.nombres} onChange={(e) => handleChange("nombres", e.target.value)} />
            <FormInput label="Apellido paterno" value={form.apellidoPaterno} onChange={(e) => handleChange("apellidoPaterno", e.target.value)} />
            <FormInput label="Apellido materno" value={form.apellidoMaterno} onChange={(e) => handleChange("apellidoMaterno", e.target.value)} />

            <div className="flex items-center gap-4 mt-4">
              <Switch
                checked={form.validar}
                onCheckedChange={(c) => {
                  if (!c) return handleChange("validar", false);
                  ejecutarValidaciones();
                }}
              />
              <Label className="text-sm font-medium text-gray-700">Validar</Label>
              {loading && (
                <span className="text-sm text-muted-foreground flex items-center">
                  <Loader2 className="w-4 h-4 animate-spin mr-1" /> Validando...
                </span>
              )}
            </div>
          </div>

          {form.validar && (form.equifax || form.listasControl) && (
            <>
              <Separator className="my-6" />
              <h2 className="text-lg font-semibold text-gray-800">Resultado de Validación</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput label="Identidad (Equifax)" value={form.equifax} disabled />
                <FormTextArea label="Observación Equifax" value={form.obsEquifax} disabled />
                <FormInput label="Listas de Control (LDS)" value={form.listasControl} disabled />
                <FormTextArea label="Observación LDS" value={form.obsListasControl} disabled />
                <FormSelect
                  label="Continuar"
                  value={form.continuar}
                  onChange={(v) => handleChange("continuar", v)}
                  options={["Continuar con la solicitud", "Rechazar solicitud"]}
                  full
                  disabled={form.equifax === "Rechazado" || form.listasControl === "Rechazado"}
                />
              </div>
            </>
          )}

          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={loading} className="bg-primary text-white hover:bg-primary/90 px-6 py-2 rounded-lg">
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <PlusCircle className="w-4 h-4 mr-2" />
              )}
              Guardar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FormInput({ label, value, onChange, disabled }) {
  return (
    <div className="space-y-1">
      <Label className="text-sm text-gray-700 font-medium">{label}</Label>
      <Input value={value} onChange={onChange} disabled={disabled} className="text-sm border-gray-300" placeholder={label} />
    </div>
  );
}

function FormSelect({ label, value, onChange, options = [], full = false, disabled }) {
  return (
    <div className={`space-y-1 ${full ? "md:col-span-2" : ""}`}>
      <Label className="text-sm text-gray-700 font-medium">{label}</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="text-sm border-gray-300 bg-white">
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent className="bg-white border border-gray-200">
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function FormTextArea({ label, value, disabled }) {
  return (
    <div className="space-y-1">
      <Label className="text-sm text-gray-700 font-medium">{label}</Label>
      <textarea
        rows={3}
        value={value}
        disabled={disabled}
        placeholder={label}
        className="w-full text-sm rounded-md border border-gray-300 px-3 py-2 resize-none"
      />
    </div>
  );
}
