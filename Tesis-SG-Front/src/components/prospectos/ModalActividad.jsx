// src/components/prospectos/ModalActividad.jsx
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { createActividad } from "@/service/Entidades/ActividadService";
import GlassLoader from "@/components/ui/GlassLoader";

export default function ModalActividad({
  open,
  onClose,
  onActividadCreada,
  modo,
  actividadEditar = null,
  tiposActividad = [],
  prioridades = [],
  idProspecto
}) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    idTipoActividad: "",
    asunto: "",
    descripcion: "",
    duracion: "",
    vencimiento: "",
    idPrioridad: "",
    estado: "En progreso",
  });

  useEffect(() => {
    if (modo === "editar" && actividadEditar) {
      const { idTipoActividad, asunto, descripcion, duracion, vencimiento, idPrioridad, estado } = actividadEditar;
      setForm({
        idTipoActividad: idTipoActividad?.toString() || "",
        asunto,
        descripcion,
        duracion: convertirDuracionAMinutos(duracion),
        vencimiento: vencimiento?.substring(0, 16),
        idPrioridad: idPrioridad?.toString() || "",
        estado: estado ? "Finalizada" : "En progreso",
      });
    } else {
      setForm({
        idTipoActividad: "",
        asunto: "",
        descripcion: "",
        duracion: "",
        vencimiento: "",
        idPrioridad: "",
        estado: "En progreso",
      });
    }
  }, [open]);

  const convertirDuracionAMinutos = (duracionStr) => {
    const [h, m] = duracionStr.split(":").map(Number);
    return (h * 60 + m).toString();
  };

  const convertirMinutosATiempo = (min) => {
    const h = String(Math.floor(min / 60)).padStart(2, "0");
    const m = String(min % 60).padStart(2, "0");
    return `${h}:${m}:00`;
  };

  const handleChange = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      idTipoActividad: parseInt(form.idTipoActividad),
      asunto: form.asunto,
      descripcion: form.descripcion,
      duracion: convertirMinutosATiempo(parseInt(form.duracion)),
      vencimiento: form.vencimiento,
      idPrioridad: parseInt(form.idPrioridad),
      estado: form.estado === "Finalizada",
      idProspecto,
    };

    try {
      await createActividad(payload);
      if (onActividadCreada) onActividadCreada(); // 🔁 recarga tabla
      onClose(); // ✅ cierra modal
    } catch (error) {
      console.error("Error al crear actividad:", error);
      alert("Hubo un error al crear la actividad. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <GlassLoader message="Guardando actividad..." visible={loading} />
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="min-w-[900px] max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{modo === "editar" ? "Editar Actividad" : "Nueva Actividad"}</DialogTitle>
            <DialogDescription>Completa la información de la actividad.</DialogDescription>
          </DialogHeader>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md mt-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormSelect
                  label="Tipo de Actividad"
                  value={form.idTipoActividad}
                  onChange={(val) => handleChange("idTipoActividad", val)}
                  options={tiposActividad.map((t) => ({ label: t.descripcion, value: t.idTipoActividad }))}
                />
                <FormSelect
                  label="Prioridad"
                  value={form.idPrioridad}
                  onChange={(val) => handleChange("idPrioridad", val)}
                  options={prioridades.map((p) => ({ label: p.categoria, value: p.idPrioridad }))}
                />
                <FormInput label="Asunto" value={form.asunto} onChange={(e) => handleChange("asunto", e.target.value)} />
                <FormInput label="Duración (min)" value={form.duracion} type="number" onChange={(e) => handleChange("duracion", e.target.value)} />
                <FormInput label="Vencimiento" value={form.vencimiento} type="datetime-local" onChange={(e) => handleChange("vencimiento", e.target.value)} />
                {modo === "editar" && (
                  <FormSelect
                    label="Estado"
                    value={form.estado}
                    onChange={(val) => handleChange("estado", val)}
                    options={[
                      { label: "En progreso", value: "En progreso" },
                      { label: "Finalizada", value: "Finalizada" },
                    ]}
                  />
                )}
                <div className="md:col-span-2">
                  <Label className="text-sm text-gray-700 font-medium">Descripción</Label>
                  <Textarea
                    rows={3}
                    value={form.descripcion}
                    onChange={(e) => handleChange("descripcion", e.target.value)}
                    placeholder="Descripción"
                    className="text-sm border-gray-300"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {modo === "editar" ? "Guardar Cambios" : "Crear Actividad"}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Subcomponentes reutilizables
function FormInput({ label, value, onChange, type = "text" }) {
  return (
    <div className="space-y-1">
      <Label className="text-sm text-gray-700 font-medium">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={onChange}
        className="text-sm border-gray-300"
        placeholder={label}
      />
    </div>
  );
}

function FormSelect({ label, value, onChange, options = [] }) {
  return (
    <div className="space-y-1">
      <Label className="text-sm text-gray-700 font-medium">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="text-sm border-gray-300 bg-white">
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent className="bg-white border border-gray-200">
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value.toString()}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
