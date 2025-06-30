import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import GlassLoader from "@/components/ui/GlassLoader";
import { crearPago } from "@/service/Entidades/PagosService";
import { getCalendariosOperaciones } from "@/service/Entidades/CalendarioOperacionesService";
import { useAuth } from "@/hooks/useAuth";

export default function PagosForm({ onClose, onSaved, initialData }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [calendarios, setCalendarios] = useState([]);
  const [form, setForm] = useState({
    idCalendario: "",
    detalle: "",
    ...initialData
  });

  useEffect(() => {
    const cargarCalendarios = async () => {
      try {
        const data = await getCalendariosOperaciones();
        setCalendarios(Array.isArray(data) ? data : []);
      } catch (err) {
        toast.error("Error al cargar calendarios");
      }
    };
    cargarCalendarios();
  }, []);

  const handleChange = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        idCalendario: Number(form.idCalendario),
        cantidadPagos: 0,
        descartarPagos: false,
        generarPagos: false,
        detalle: form.detalle,
        confirmarRegistrosPagos: false,
        idUsuarioCreacion: user?.id,
        idUsuarioPropietario: user?.id,
      };

      await crearPago(payload);
      toast.success("Pago creado correctamente");
      onSaved?.();
      onClose?.();
    } catch (error) {
      toast.error(`Error al crear pago: ${error.message ?? error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative px-2 py-3 md:px-7 md:py-7">
      <GlassLoader visible={loading} message="Guardando pago..." />
      <form
        onSubmit={handleSubmit}
        className="space-y-8 max-w-xl mx-auto"
        autoComplete="off"
      >
        <section className="bg-white rounded-2xl border border-gray-300 px-7 py-5 flex flex-col gap-4 shadow-lg transition-colors">
          <h3 className="font-semibold text-lg text-blue-900 mb-3 border-b pb-2">
            Datos del Pago
          </h3>

          {/* Calendario */}
          <FormGroup label="Calendario">
            <select
              className="w-full border rounded-md p-2 bg-white text-sm"
              value={form.idCalendario}
              onChange={(e) => handleChange("idCalendario", e.target.value)}
              required
            >
              <option value="">Seleccionar calendario...</option>
              {calendarios.length === 0 && (
                <option disabled value="">
                  No hay calendarios disponibles
                </option>
              )}
              {calendarios.map((cal) => (
                <option key={cal.idCalendario} value={cal.idCalendario}>
                  {cal.nombre}
                </option>
              ))}
            </select>
          </FormGroup>

          {/* Detalle */}
          <FormGroup label="Detalle">
            <textarea
              className="w-full border rounded-md p-2 bg-white text-sm"
              placeholder="Detalle del pago..."
              value={form.detalle}
              rows={3}
              onChange={(e) => handleChange("detalle", e.target.value)}
              required
            />
          </FormGroup>
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
            {initialData ? "Actualizar Pago" : "Crear Pago"}
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
