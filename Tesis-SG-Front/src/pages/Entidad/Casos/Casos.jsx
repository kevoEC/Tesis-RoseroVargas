import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // 👈 Importante
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateCaso, getCasoById } from "@/service/Entidades/CasosService";
import { useAuth } from "@/hooks/useAuth";
import GlassLoader from "@/components/ui/GlassLoader";
import { getInversiones } from "@/service/Entidades/InversionService";

// Motivos que requieren inversión asociada
const MOTIVOS_REQUIEREN_INVERSION = [19, 35];

export default function Casos({ onClose, onSaved }) {
  const { idCaso } = useParams(); // 👈 Extrae el ID de la URL
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState(null);
  const [inversiones, setInversiones] = useState([]);
  const [form, setForm] = useState({
    descripcion: "",
    continuarCaso: false,
    estado: "Iniciado"
  });

  // Fetch del caso al montar el componente
  useEffect(() => {
    if (!idCaso) return;
    setLoading(true);
    getCasoById(idCaso)
      .then((data) => {
        setInitialData(data);
        setForm({
          descripcion: data.descripcion || "",
          continuarCaso: !!data.continuarCaso,
          estado: data.estado || "Iniciado"
        });
        // Si el motivo requiere inversión, carga todas las inversiones para mostrar el nombre bonito
        if (MOTIVOS_REQUIEREN_INVERSION.includes(data.idMotivo)) {
          getInversiones()
            .then(setInversiones)
            .catch(() => setInversiones([]));
        }
      })
      .catch((err) => {
        toast.error("Error al cargar el caso: " + (err.message ?? err));
      })
      .finally(() => setLoading(false));
  }, [idCaso]);

  const handleChange = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Actualiza el caso
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        descripcion: form.descripcion,
        continuarCaso: form.continuarCaso,
        estado: form.estado,
        idUsuarioModificacion: user?.id,
        idUsuarioPropietario: initialData.idUsuarioPropietario
      };
      await updateCaso(initialData.idCaso, payload);
      toast.success("Caso actualizado correctamente");
      onSaved?.();
      onClose?.();
    } catch (error) {
      toast.error(`Error al actualizar caso: ${error.message ?? error}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !initialData) return <GlassLoader visible message="Cargando caso..." />;

  // Encuentra la inversión para mostrar el nombre bonito
  let inversionNombre = "";
  if (
    initialData.idInversion &&
    inversiones.length > 0 &&
    MOTIVOS_REQUIEREN_INVERSION.includes(initialData.idMotivo)
  ) {
    const inv = inversiones.find((i) => i.idInversion === initialData.idInversion);
    if (inv) {
      inversionNombre = `${inv.inversionNombre} - ${inv.nombreCompletoCliente ?? ""}`;
    } else {
      inversionNombre = `ID: ${initialData.idInversion}`;
    }
  }

  return (
    <div className="relative px-2 py-3 md:px-7 md:py-7">
      <GlassLoader visible={loading} message="Actualizando caso..." />
      <form
        onSubmit={handleSubmit}
        className="space-y-8 max-w-xl mx-auto"
        autoComplete="off"
      >
        <section className="bg-white rounded-2xl border border-gray-300 px-7 py-5 flex flex-col gap-4 shadow-lg transition-colors">
          <h3 className="font-semibold text-lg text-violet-900 mb-3 border-b pb-2">
            Detalles del Caso
          </h3>
          <FormGroup label="Número de Caso">
            <Input value={initialData.numeroCaso || ""} disabled />
          </FormGroup>
          <FormGroup label="Cliente">
            <Input value={initialData.nombreCliente || ""} disabled />
          </FormGroup>
          <FormGroup label="Motivo">
            <Input value={initialData.motivoNombre || ""} disabled />
          </FormGroup>
          <FormGroup label="Descripción">
            <textarea
              className="w-full border border-gray-300 rounded-lg p-2 text-sm"
              value={form.descripcion}
              onChange={e => handleChange("descripcion", e.target.value)}
              rows={3}
              disabled
            />
          </FormGroup>
          {/* Inversión asociada si aplica */}
          {initialData.idInversion && (
            <FormGroup label="Inversión Asociada">
              <Input value={inversionNombre} disabled />
            </FormGroup>
          )}
          {/* Estado (editable) */}
          <FormGroup label="Estado">
            <select
              className="w-full border rounded-md p-2 bg-white text-sm"
              value={form.estado}
              onChange={e => handleChange("estado", e.target.value)}
            >
              <option value="Iniciado">Iniciado</option>
              <option value="Cerrado">Cerrado</option>
            </select>
          </FormGroup>
          {/* Continuar caso (editable) */}
          <FormGroup label="¿Continuar Flujo del Caso?">
            <input
              type="checkbox"
              checked={form.continuarCaso}
              onChange={e => handleChange("continuarCaso", e.target.checked)}
            />
          </FormGroup>
        </section>
        {/* BOTONES */}
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
            Actualizar Caso
          </Button>
        </div>
      </form>
    </div>
  );
}

// Agrupador campo-label
function FormGroup({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="font-medium text-gray-700 text-sm">{label}</Label>
      {children}
    </div>
  );
}
