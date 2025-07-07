import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  createConfiguracionProducto,
  updateConfiguracionProducto,
} from "@/service/Catalogos/ConfiguracionesProductoService";
import { useAuth } from "@/hooks/useAuth";
import GlassLoader from "@/components/ui/GlassLoader";

// Catálogo de Origen (puedes ampliarlo)
const ORIGENES = [
  { idOrigen: 1, origenNombre: "Local" },
  { idOrigen: 2, origenNombre: "Extranjero" },
];

// Catálogo de Tipo de Tasa (puedes ampliarlo)
const TIPOS_TASA = [
  { idTipoTasa: 1, tipoTasaNombre: "Por plazo" },
  { idTipoTasa: 2, tipoTasaNombre: "Fija" },
  { idTipoTasa: 3, tipoTasaNombre: "Variable" },
];

export default function ConfiguracionesProductoForm({
  idProducto,
  initialData,
  onClose,
  onSaved,
}) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Estado del formulario
  const [form, setForm] = useState({
    montoMinimo: "",
    montoMaximo: "",
    plazo: "",
    taza: "",
    costeOperativoEEUU: "",
    idOrigen: "",
    idTipoTasa: "",
    ...initialData,
  });

  // Cargar datos iniciales en modo edición
  useEffect(() => {
    if (initialData) setForm({ ...initialData });
  }, [initialData]);

  const handleChange = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

// Guardar configuración
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const payload = {
      montoMinimo: Number(form.montoMinimo),
      montoMaximo: Number(form.montoMaximo),
      plazo: Number(form.plazo),
      taza: Number(form.taza),
      costeOperativoEEUU: Number(form.costeOperativoEEUU),
      idOrigen: Number(form.idOrigen),
      idTipoTasa: Number(form.idTipoTasa),
      idProducto: Number(idProducto),
    };

    // ...validación

if (initialData && initialData.idConfiguraciones) {
  const updatePayload = {
    idConfiguraciones: initialData.idConfiguraciones,
    ...payload,
    idUsuarioCreacion: initialData.idUsuarioCreacion,
    fechaCreacion: initialData.fechaCreacion,
    idUsuarioModificacion: user?.id,
    fechaModificacion: new Date().toISOString(),
  };
  console.log("Payload UPDATE", updatePayload);
  await updateConfiguracionProducto(initialData.idConfiguraciones, updatePayload);
  toast.success("Configuración actualizada correctamente");
} else {
      // Creación
      await createConfiguracionProducto({
        ...payload,
        idUsuarioCreacion: user?.id,
        fechaCreacion: new Date().toISOString(),
      });
      toast.success("Configuración creada correctamente");
    }

    onSaved?.();
    onClose?.();
  } catch (error) {
    toast.error(
      `Error al guardar configuración: ${error.message ?? error}`
    );
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="relative px-2 py-3 md:px-5 md:py-5">
      <GlassLoader visible={loading} message="Guardando configuración..." />
      <form
        onSubmit={handleSubmit}
        className="space-y-7 max-w-xl mx-auto"
        autoComplete="off"
      >
        <section className="bg-white rounded-2xl border border-gray-300 px-7 py-5 flex flex-col gap-4 shadow-lg transition-colors">
          <h3 className="font-semibold text-lg text-violet-700 mb-3 border-b pb-2">
            Configuración del Producto
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormGroup label="Monto mínimo">
              <Input
                type="number"
                min={0}
                step={0.01}
                value={form.montoMinimo}
                onChange={(e) =>
                  handleChange("montoMinimo", e.target.value)
                }
                required
                placeholder="Ej: 1000.00"
              />
            </FormGroup>
            <FormGroup label="Monto máximo">
              <Input
                type="number"
                min={0}
                step={0.01}
                value={form.montoMaximo}
                onChange={(e) =>
                  handleChange("montoMaximo", e.target.value)
                }
                required
                placeholder="Ej: 5000.00"
              />
            </FormGroup>
            <FormGroup label="Plazo (meses)">
              <Input
                type="number"
                min={1}
                step={1}
                value={form.plazo}
                onChange={(e) => handleChange("plazo", e.target.value)}
                required
                placeholder="Ej: 6"
              />
            </FormGroup>
            <FormGroup label="Tasa (%)">
              <Input
                type="number"
                min={0}
                step={0.01}
                value={form.taza}
                onChange={(e) => handleChange("taza", e.target.value)}
                required
                placeholder="Ej: 1.45"
              />
            </FormGroup>
            <FormGroup label="Costo Operativo EEUU">
              <Input
                type="number"
                min={0}
                step={0.01}
                value={form.costeOperativoEEUU}
                onChange={(e) =>
                  handleChange("costeOperativoEEUU", e.target.value)
                }
                required
                placeholder="Ej: 70.00"
              />
            </FormGroup>
            <FormGroup label="Origen de fondos">
              <select
                className="w-full border rounded-md p-2 bg-white text-sm"
                value={form.idOrigen}
                onChange={(e) =>
                  handleChange("idOrigen", e.target.value)
                }
                required
              >
                <option value="">Seleccionar...</option>
                {ORIGENES.map((o) => (
                  <option key={o.idOrigen} value={o.idOrigen}>
                    {o.origenNombre}
                  </option>
                ))}
              </select>
            </FormGroup>
            <FormGroup label="Tipo de tasa">
              <select
                className="w-full border rounded-md p-2 bg-white text-sm"
                value={form.idTipoTasa}
                onChange={(e) =>
                  handleChange("idTipoTasa", e.target.value)
                }
                required
              >
                <option value="">Seleccionar...</option>
                {TIPOS_TASA.map((t) => (
                  <option key={t.idTipoTasa} value={t.idTipoTasa}>
                    {t.tipoTasaNombre}
                  </option>
                ))}
              </select>
            </FormGroup>
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
            {initialData ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </form>
    </div>
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
