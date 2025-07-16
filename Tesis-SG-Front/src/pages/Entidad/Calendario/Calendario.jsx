import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GlassLoader from "@/components/ui/GlassLoader";
import { updateCalendarioOperaciones, getCalendarioOperacionesById } from "@/service/Entidades/CalendarioOperacionesService";

export default function EditarCalendario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    nombre: "",
    fechaCorte: "",
    calendarioInversiones: "1",
    fechaGenerarPagos: "",
    fechaEnvioEECC: "",
    estadoProcesoPagos: false,
    estadoProcesoEnvioEECC: false,
    estadoCalendario: false
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const data = await getCalendarioOperacionesById(id);
        setForm({
          nombre: data.nombre,
          fechaCorte: data.fechaCorte ? data.fechaCorte.split("T")[0] : "",
          calendarioInversiones: data.calendarioInversiones.toString(),
          fechaGenerarPagos: data.fechaGenerarPagos ? data.fechaGenerarPagos.split("T")[0] : "",
          fechaEnvioEECC: data.fechaEnvioEECC ? data.fechaEnvioEECC.split("T")[0] : "",
          estadoProcesoPagos: data.estadoProcesoPagos,
          estadoProcesoEnvioEECC: data.estadoProcesoEnvioEECC,
          estadoCalendario: data.estadoCalendario
        });
      } catch (error) {
        toast.error("Error al cargar calendario: " + (error.message ?? error));
        navigate("/calendario/vista");
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, [id, navigate]);

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        nombre: form.nombre,
        fechaCorte: form.fechaCorte ? new Date(form.fechaCorte).toISOString() : null,
        calendarioInversiones: form.calendarioInversiones,
        fechaGenerarPagos: form.fechaGenerarPagos ? new Date(form.fechaGenerarPagos).toISOString() : null,
        fechaEnvioEECC: form.fechaEnvioEECC ? new Date(form.fechaEnvioEECC).toISOString() : null,
        estadoProcesoPagos: form.estadoProcesoPagos,
        estadoProcesoEnvioEECC: form.estadoProcesoEnvioEECC,
        estadoCalendario: form.estadoCalendario,
        idUsuarioModificacion: user.id
      };

      await updateCalendarioOperaciones(id, payload);
      toast.success("Calendario actualizado correctamente");
      navigate("/calendario/vista");
    } catch (error) {
      toast.error("Error al actualizar calendario: " + (error.message ?? error));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <GlassLoader visible={true} message="Cargando calendario..." />;

  return (
    <div className="p-8 space-y-6 relative">
      {/* HEADER con estado principal */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-5 mb-5 gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight flex items-center gap-2">
            {form.nombre}
            <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full ml-2">
              {form.estadoCalendario ? "CERRADO" : "ABIERTO"}
            </span>
          </h1>
          <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">
            Calendario de operaciones
          </p>
        </div>
      </header>

      {/* FORMULARIO, diseño tipo Dynamics */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* General */}
        <section className="space-y-5 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="font-semibold text-lg text-gray-800 mb-2">General</h2>
          <div className="space-y-4">
            <div>
              <Label className="block text-sm font-medium mb-1">Nombre *</Label>
              <Input
                value={form.nombre}
                onChange={(e) => handleChange("nombre", e.target.value)}
                required
              />
            </div>
            <FormGroup label="Fecha de Corte *">
              <Input
                type="date"
                value={form.fechaCorte}
                onChange={e => handleChange("fechaCorte", e.target.value)}
                required
              />
            </FormGroup>
            <div>
              <Label className="block text-sm font-medium mb-1">Día de Inversiones *</Label>
              <select
                className="w-full border rounded-md p-2 bg-white text-sm"
                value={form.calendarioInversiones}
                onChange={(e) => handleChange("calendarioInversiones", e.target.value)}
                required
              >
                {[...Array(31)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Fechas Clave */}
        <section className="space-y-5 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="font-semibold text-lg text-gray-800 mb-2">Fechas Clave</h2>
          <div className="space-y-4">
            <FormGroup label="Fecha para Generar Pagos *">
              <Input
                type="date"
                value={form.fechaGenerarPagos}
                onChange={e => handleChange("fechaGenerarPagos", e.target.value)}
                required
              />
            </FormGroup>
            <FormGroup label="Fecha para Envío de EECC *">
              <Input
                type="date"
                value={form.fechaEnvioEECC}
                onChange={e => handleChange("fechaEnvioEECC", e.target.value)}
                required
              />
            </FormGroup>
          </div>
        </section>

        {/* ESTADOS (solo lectura) */}
        <section className="space-y-5 bg-gray-50 rounded-xl border border-gray-100 p-6 shadow-none">
          <h2 className="font-semibold text-lg text-gray-800 mb-2">Estados del Calendario</h2>
          <div className="space-y-4">
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
          </div>
        </section>

        {/* Botones abajo, barra completa */}
        <div className="md:col-span-3 flex justify-end gap-4 pt-8 border-t mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/calendario/vista")}
            className="px-6 py-2"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
          >
            Guardar Cambios
          </Button>
        </div>
      </form>
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

// Componente solo lectura para los estados
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
