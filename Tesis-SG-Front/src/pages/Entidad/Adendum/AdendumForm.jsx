import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import GlassLoader from "@/components/ui/GlassLoader";
import { getCronogramaByProyeccionId } from "@/service/Entidades/ProyeccionService";
import { crearAdendum } from "@/service/Entidades/AdendumService";
import { useAuth } from "@/hooks/useAuth";

// Componente para crear un Adendum (popup/modal)
export default function AdendumForm({ inversion, cronograma: cronogramaProp, onClose, onSaved }) {
  const { user } = useAuth();
  const [cronograma, setCronograma] = useState(cronogramaProp || []);
  const [form, setForm] = useState({
    periodoIncremento: "",
    montoIncremento: "",
  });
  const [loading, setLoading] = useState(false);

  // Cargar cronograma si no lo pasaron por props
  useEffect(() => {
    if (!cronogramaProp && inversion?.idProyeccion) {
      setLoading(true);
      getCronogramaByProyeccionId(inversion.idProyeccion)
        .then((data) => setCronograma(Array.isArray(data) ? data : []))
        .catch(() => toast.error("No se pudo cargar el cronograma"))
        .finally(() => setLoading(false));
    }
  }, [inversion, cronogramaProp]);

  // Manejar cambios de campo
  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Cuando selecciona un periodo, validar si ya hay aporte adicional
  const handlePeriodoChange = (value) => {
    const periodoObj = cronograma.find(p => String(p.Periodo) === String(value));
    if (periodoObj && Number(periodoObj.AporteAdicional) > 0) {
      toast.error("No puedes realizar un incremento en este mes porque ya posee un adendum.");
      setForm((prev) => ({ ...prev, periodoIncremento: "" }));
      return;
    }
    setForm((prev) => ({ ...prev, periodoIncremento: value }));
  };

  // Monto solo money
  const handleMontoChange = (value) => {
    // Permite sólo números y máximo 2 decimales
    const val = value.replace(/[^0-9.]/g, "").replace(/^(\d+\.\d{0,2}).*$/, "$1");
    setForm((prev) => ({ ...prev, montoIncremento: val }));
  };

  // Guardar
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.periodoIncremento) {
      toast.error("Selecciona el período de incremento.");
      return;
    }
    if (!form.montoIncremento || isNaN(form.montoIncremento) || Number(form.montoIncremento) <= 0) {
      toast.error("Ingresa un monto válido para el incremento.");
      return;
    }
    if (!inversion?.idInversion || !inversion?.idProyeccion) {
      toast.error("No se encontró la inversión o proyección.");
      return;
    }
    if (!user?.id) {
      toast.error("No se detectó usuario.");
      return;
    }

    setLoading(true);
    try {
      await crearAdendum({
        idInversion: inversion.idInversion,
        idProyeccionOriginal: inversion.idProyeccion,
        periodoIncremento: Number(form.periodoIncremento),
        montoIncremento: Number(form.montoIncremento),
        idUsuarioCreacion: user.id
      });
      toast.success("Adendum creado correctamente.");
      onSaved?.();
      onClose?.();
    } catch (err) {
      toast.error("Error al crear adendum.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative px-2 py-3 md:px-7 md:py-7">
      <GlassLoader visible={loading} message="Guardando adendum..." />
      <form
        onSubmit={handleSubmit}
        className="space-y-8 max-w-lg mx-auto"
        autoComplete="off"
      >
        <section className="bg-white rounded-2xl border border-gray-200 px-7 py-5 flex flex-col gap-4 shadow-lg transition-colors">
          <h3 className="font-semibold text-lg text-violet-700 mb-3 border-b pb-2">
            Crear Adendum de Incremento
          </h3>
          {/* Selector de periodo */}
          <FormGroup label="Mes/Período de incremento">
            <select
              className="input w-full rounded border-gray-300 py-2 px-3 text-sm"
              required
              value={form.periodoIncremento}
              onChange={e => handlePeriodoChange(e.target.value)}
              disabled={loading || !cronograma.length}
            >
              <option value="">Selecciona un período...</option>
              {cronograma.map(p => (
                <option
                  key={p.Periodo}
                  value={p.Periodo}
                  disabled={Number(p.AporteAdicional) > 0}
                >
                  {`Período ${p.Periodo} (${new Date(p.FechaInicial).toLocaleDateString("es-EC", { month: "short", year: "numeric" })})`}
                  {Number(p.AporteAdicional) > 0 ? " (ya tiene incremento)" : ""}
                </option>
              ))}
            </select>
          </FormGroup>

          {/* Input money */}
          <FormGroup label="Monto del incremento">
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500 font-bold">$</span>
              <Input
                className="pl-7"
                type="text"
                inputMode="decimal"
                pattern="^\d+(\.\d{0,2})?$"
                placeholder="0.00"
                maxLength={12}
                required
                value={form.montoIncremento}
                onChange={e => handleMontoChange(e.target.value)}
                disabled={loading}
                autoComplete="off"
              />
            </div>
          </FormGroup>
        </section>

        {/* Botones */}
        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="px-6 py-2"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2"
            disabled={loading}
          >
            Guardar Adendum
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
