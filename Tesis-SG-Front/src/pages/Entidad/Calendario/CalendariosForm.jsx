import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { createCalendarioOperaciones, updateCalendarioOperaciones } from "@/service/Entidades/CalendarioOperacionesService";
import { useAuth } from "@/hooks/useAuth";
import GlassLoader from "@/components/ui/GlassLoader";

export default function CalendarioForm({ onClose, onSaved, initialData }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // --- Manejo de fechas como string "yyyy-MM-dd"
  const [form, setForm] = useState({
    nombre: "",
    fechaCorte: initialData?.fechaCorte
      ? initialData.fechaCorte.split("T")[0]
      : "",
    calendarioInversiones: initialData?.calendarioInversiones
      ? initialData.calendarioInversiones.toString()
      : "1",
    fechaGenerarPagos: initialData?.fechaGenerarPagos
      ? initialData.fechaGenerarPagos.split("T")[0]
      : "",
    fechaEnvioEECC: initialData?.fechaEnvioEECC
      ? initialData.fechaEnvioEECC.split("T")[0]
      : "",
    estadoProcesoPagos: initialData?.estadoProcesoPagos || false,
    estadoProcesoEnvioEECC: initialData?.estadoProcesoEnvioEECC || false,
    estadoCalendario: initialData?.estadoCalendario || false,
    ...initialData,
  });

  const handleChange = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...form,
        fechaCorte: form.fechaCorte
          ? new Date(form.fechaCorte).toISOString()
          : null,
        fechaGenerarPagos: form.fechaGenerarPagos
          ? new Date(form.fechaGenerarPagos).toISOString()
          : null,
        fechaEnvioEECC: form.fechaEnvioEECC
          ? new Date(form.fechaEnvioEECC).toISOString()
          : null,
        idUsuarioCreacion: user?.id,
        idUsuarioPropietario: user?.id,
      };

      if (initialData?.idCalendario) {
        await updateCalendarioOperaciones(initialData.idCalendario, payload);
        toast.success("Calendario actualizado correctamente");
      } else {
        await createCalendarioOperaciones(payload);
        toast.success("Calendario creado correctamente");
      }

      onSaved?.();
      onClose?.();
    } catch (error) {
      toast.error(
        `Error al ${
          initialData ? "actualizar" : "crear"
        } calendario: ${error.message ?? error}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Input date con estilos PRO
  const DateInput = ({ value, onChange, label }) => (
    <FormGroup label={label}>
      <div className="relative">
        <Input
          type="date"
          value={value}
          onChange={onChange}
          className="pr-10"
          required
        />
        <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-5 h-5" />
      </div>
    </FormGroup>
  );

  return (
    <div className="relative px-2 py-3 md:px-8 md:py-8">
      <GlassLoader
        visible={loading}
        message={
          initialData ? "Actualizando calendario..." : "Creando calendario..."
        }
      />
      <form
        onSubmit={handleSubmit}
        className="space-y-8 max-w-xl mx-auto"
        autoComplete="off"
      >
        {/* DATOS GENERALES */}
        <section className="bg-white rounded-2xl border border-gray-300 px-7 py-5 flex flex-col gap-4 shadow-lg transition-colors">
          <h3 className="font-semibold text-lg text-blue-900 mb-3 border-b pb-2">
            Datos Generales
          </h3>
          <FormGroup label="Nombre del Calendario">
            <Input
              placeholder="Ej: 01 JUNIO 2026"
              value={form.nombre}
              onChange={(e) => handleChange("nombre", e.target.value)}
              required
            />
          </FormGroup>
          <FormGroup label="Corte de las Inversiones">
            <select
              className="w-full border rounded-md p-2 bg-white text-sm"
              value={form.calendarioInversiones}
              onChange={(e) =>
                handleChange("calendarioInversiones", e.target.value)
              }
              required
            >
              <option value="1">1</option>
              <option value="10">10</option>
              <option value="20">20</option>
            </select>
          </FormGroup>
        </section>

        {/* FECHAS CLAVE */}
        <section className="bg-white rounded-2xl border border-gray-300 px-7 py-5 flex flex-col gap-4 shadow-lg transition-colors">
          <h3 className="font-semibold text-lg text-blue-900 mb-3 border-b pb-2">
            Fechas Clave
          </h3>
          <DateInput
            value={form.fechaCorte}
            onChange={(e) => handleChange("fechaCorte", e.target.value)}
            label="Fecha de Corte"
          />
          <DateInput
            value={form.fechaGenerarPagos}
            onChange={(e) => handleChange("fechaGenerarPagos", e.target.value)}
            label="Fecha para Generar Pagos"
          />
          <DateInput
            value={form.fechaEnvioEECC}
            onChange={(e) => handleChange("fechaEnvioEECC", e.target.value)}
            label="Fecha para Envío de EECC"
          />
        </section>

        {/* ESTADOS */}
        <section className="bg-gray-50 rounded-2xl border border-gray-200 px-7 py-5 flex flex-col gap-4 shadow transition-colors">
          <h3 className="font-semibold text-lg text-blue-900 mb-3 border-b pb-2">
            Estados
          </h3>
          <EstadoVisor
            label="Proceso de Pagos"
            value={form.estadoProcesoPagos}
            textoActivo="Completado"
            textoInactivo="Pendiente"
          />
          <EstadoVisor
            label="Envío de EECC"
            value={form.estadoProcesoEnvioEECC}
            textoActivo="Completado"
            textoInactivo="Pendiente"
          />
          <EstadoVisor
            label="Estado del Calendario"
            value={form.estadoCalendario}
            textoActivo="Cerrado"
            textoInactivo="Abierto"
          />
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
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
          >
            {initialData ? "Actualizar Calendario" : "Crear Calendario"}
          </Button>
        </div>
      </form>
    </div>
  );
}

// Componente reutilizable para campos
function FormGroup({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="font-medium text-gray-700 text-sm">{label}</Label>
      {children}
    </div>
  );
}

// Visualización de estados tipo badge
function EstadoVisor({ label, value, textoActivo, textoInactivo }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="font-medium text-gray-700">{label}</span>
      <span
        className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
          value
            ? "bg-green-100 text-green-700"
            : "bg-yellow-100 text-yellow-700"
        }`}
      >
        {value ? textoActivo : textoInactivo}
      </span>
    </div>
  );
}
