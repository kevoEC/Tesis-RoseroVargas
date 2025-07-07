// src/components/prospectos/ModalActividad.jsx

import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import { createActividad, updateActividad } from "@/service/Entidades/ActividadService";
import GlassLoader from "@/components/ui/GlassLoader";
import { toast } from "sonner";

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
  const [alert, setAlert] = useState(false);

  // Al abrir/cambiar modo, carga datos si editar
  useEffect(() => {
    if (open) {
      if (modo === "editar" && actividadEditar) {
        setForm({
          idTipoActividad: actividadEditar.idTipoActividad?.toString() ?? "",
          asunto: actividadEditar.asunto ?? "",
          descripcion: actividadEditar.descripcion ?? "",
          duracion: actividadEditar.duracion
            ? convertirDuracionAMinutos(actividadEditar.duracion)
            : "",
          vencimiento: actividadEditar.vencimiento
            ? actividadEditar.vencimiento.substring(0, 16)
            : "",
          idPrioridad: actividadEditar.idPrioridad?.toString() ?? "",
          estado: actividadEditar.estado ? "Finalizada" : "En progreso",
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
    }
    // eslint-disable-next-line
  }, [open, actividadEditar, modo]);

  function convertirDuracionAMinutos(duracionStr) {
    if (!duracionStr) return "";
    const [h, m] = duracionStr.split(":").map(Number);
    return (h * 60 + m).toString();
  }
  function convertirMinutosATiempo(min) {
    if (!min) return "00:00:00";
    const h = String(Math.floor(min / 60)).padStart(2, "0");
    const m = String(min % 60).padStart(2, "0");
    return `${h}:${m}:00`;
  }

  const handleChange = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación simple
    if (
      !form.idTipoActividad ||
      !form.asunto.trim() ||
      !form.descripcion.trim() ||
      !form.duracion ||
      !form.vencimiento ||
      !form.idPrioridad
    ) {
      setAlert(true);
      return;
    }

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
      if (modo === "editar" && actividadEditar) {
        await updateActividad(actividadEditar.idActividad, {
          ...payload,
          idUsuarioPropietario: actividadEditar.idUsuarioPropietario ?? null,
          fechaCreacion: actividadEditar.fechaCreacion ?? null,
        });
        toast.success("Actividad actualizada correctamente.");
      } else {
        await createActividad(payload);
        toast.success("Actividad creada correctamente.");
      }
      onActividadCreada?.();
      onClose?.();
    } catch (error) {
      toast.error("Error al guardar actividad: " + (error?.message || error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <GlassLoader visible={loading} message={modo === "editar" ? "Guardando cambios..." : "Guardando actividad..."} />
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl w-full p-0">
          <div className="relative px-2 py-3 md:px-7 md:py-7">
            <form
              onSubmit={handleSubmit}
              className="space-y-8"
              autoComplete="off"
            >
              <section className="bg-white rounded-2xl border border-gray-200 px-7 py-5 flex flex-col gap-4 shadow-lg transition-colors">
                <h3 className="font-semibold text-lg text-violet-700 mb-3 border-b pb-2">
                  {modo === "editar" ? "Editar Actividad" : "Nueva Actividad"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormGroup label="Tipo de Actividad">
                    <Select
                      value={form.idTipoActividad}
                      onValueChange={val => handleChange("idTipoActividad", val)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {tiposActividad.map((item) => (
                          <SelectItem
                            key={item.idTipoActividad}
                            value={item.idTipoActividad.toString()}
                          >
                            {item.descripcion}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormGroup>
                  <FormGroup label="Prioridad">
                    <Select
                      value={form.idPrioridad}
                      onValueChange={val => handleChange("idPrioridad", val)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {prioridades.map((item) => (
                          <SelectItem
                            key={item.idPrioridad}
                            value={item.idPrioridad.toString()}
                          >
                            {item.categoria}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormGroup>
                  <FormGroup label="Asunto">
                    <Input
                      placeholder="Ej: Seguimiento telefónico"
                      value={form.asunto}
                      maxLength={100}
                      onChange={e => handleChange("asunto", e.target.value)}
                      required
                    />
                  </FormGroup>
                  <FormGroup label="Duración (min)">
                    <Input
                      type="number"
                      placeholder="Ej: 30"
                      value={form.duracion}
                      min={1}
                      max={480}
                      onChange={e => handleChange("duracion", e.target.value)}
                      required
                    />
                  </FormGroup>
                  <FormGroup label="Vencimiento">
                    <Input
                      type="datetime-local"
                      value={form.vencimiento}
                      onChange={e => handleChange("vencimiento", e.target.value)}
                      required
                    />
                  </FormGroup>
                  {modo === "editar" && (
                    <FormGroup label="Estado">
                      <Select
                        value={form.estado}
                        onValueChange={val => handleChange("estado", val)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="En progreso">En progreso</SelectItem>
                          <SelectItem value="Finalizada">Finalizada</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormGroup>
                  )}
                  <div className="md:col-span-2">
                    <Label className="text-sm text-gray-700 font-medium">Descripción</Label>
                    <Textarea
                      rows={3}
                      value={form.descripcion}
                      onChange={e => handleChange("descripcion", e.target.value)}
                      placeholder="Descripción"
                      className="text-sm border-gray-300"
                      required
                    />
                  </div>
                </div>
              </section>
              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="px-6 py-2"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2"
                >
                  {modo === "editar" ? "Guardar Cambios" : "Crear Actividad"}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
      {/* Alert dialog validación campos obligatorios */}
      <AlertDialog open={alert} onOpenChange={setAlert}>
        <AlertDialogContent className="bg-white border border-yellow-300 rounded-xl shadow-xl p-7 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-yellow-700">Faltan campos obligatorios</AlertDialogTitle>
            <div className="text-gray-700 mt-2">
              Completa todos los campos antes de continuar.
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border border-gray-300 bg-white hover:bg-gray-50">Cerrar</AlertDialogCancel>
            <AlertDialogAction asChild>
              <button
                className="bg-violet-600 text-white hover:bg-violet-700 px-4 py-2 rounded"
                onClick={() => setAlert(false)}
                type="button"
              >
                OK
              </button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Agrupador de campo y label
function FormGroup({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="font-medium text-gray-700 text-sm">{label}</Label>
      {children}
    </div>
  );
}
