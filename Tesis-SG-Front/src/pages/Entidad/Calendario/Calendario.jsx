import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import GlassLoader from "@/components/ui/GlassLoader";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { updateCalendarioOperaciones, getCalendarioOperaciones } from "@/service/Entidades/CalendarioOperacionesService";

export default function EditarCalendario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    nombre: "",
    fechaCorte: null,
    calendarioInversiones: "1",
    fechaGenerarPagos: null,
    fechaEnvioEECC: null,
    estadoProcesoPagos: false,
    estadoProcesoEnvioEECC: false,
    estadoCalendario: false
  });

  // Cargar datos iniciales
  useState(() => {
    const cargarDatos = async () => {
      try {
        const data = await getCalendarioOperaciones(id);
        setForm({
          nombre: data.nombre,
          fechaCorte: new Date(data.fechaCorte),
          calendarioInversiones: data.calendarioInversiones.toString(),
          fechaGenerarPagos: new Date(data.fechaGenerarPagos),
          fechaEnvioEECC: new Date(data.fechaEnvioEECC),
          estadoProcesoPagos: data.estadoProcesoPagos,
          estadoProcesoEnvioEECC: data.estadoProcesoEnvioEECC,
          estadoCalendario: data.estadoCalendario
        });
      } catch (error) {
        toast.error("Error al cargar calendario: " + (error.message ?? error));
        navigate("/calendarios");
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
        fechaCorte: form.fechaCorte.toISOString(),
        calendarioInversiones: form.calendarioInversiones,
        fechaGenerarPagos: form.fechaGenerarPagos.toISOString(),
        fechaEnvioEECC: form.fechaEnvioEECC.toISOString(),
        estadoProcesoPagos: form.estadoProcesoPagos,
        estadoProcesoEnvioEECC: form.estadoProcesoEnvioEECC,
        estadoCalendario: form.estadoCalendario,
        idUsuarioModificacion: user.id
      };

      await updateCalendarioOperaciones(id, payload);
      toast.success("Calendario actualizado correctamente");
      navigate("/calendarios");
    } catch (error) {
      toast.error("Error al actualizar calendario: " + (error.message ?? error));
    } finally {
      setLoading(false);
    }
  };

  const DatePicker = ({ date, setDate, label }) => (
    <div className="space-y-1.5">
      <Label className="font-medium text-gray-700 text-sm">{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
            locale={es}
          />
        </PopoverContent>
      </Popover>
    </div>
  );

  if (loading) return <GlassLoader visible={true} message="Cargando calendario..." />;

  return (
    <div className="p-6 space-y-6 relative">
      <GlassLoader visible={loading} message="Guardando cambios..." />

      {/* Header */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Editar Calendario</h1>
          <p className="text-sm text-gray-600">{form.nombre}</p>
        </div>
      </header>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda - Datos principales */}
        <section className="bg-white shadow rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold">Información General</h2>
          
          <div className="space-y-4">
            <div>
              <Label className="block text-sm font-medium mb-1">
                Nombre <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                value={form.nombre}
                onChange={(e) => handleChange("nombre", e.target.value)}
                required
              />
            </div>

            <DatePicker 
              date={form.fechaCorte} 
              setDate={(date) => handleChange("fechaCorte", date)} 
              label="Fecha de Corte *" 
            />

            <div>
              <Label className="block text-sm font-medium mb-1">
                Día de Inversiones <span className="text-red-500">*</span>
              </Label>
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

        {/* Columna central - Fechas importantes */}
        <section className="bg-white shadow rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold">Fechas Clave</h2>
          
          <div className="space-y-4">
            <DatePicker 
              date={form.fechaGenerarPagos} 
              setDate={(date) => handleChange("fechaGenerarPagos", date)} 
              label="Fecha para Generar Pagos *" 
            />

            <DatePicker 
              date={form.fechaEnvioEECC} 
              setDate={(date) => handleChange("fechaEnvioEECC", date)} 
              label="Fecha para Envío de EECC *" 
            />
          </div>
        </section>

        {/* Columna derecha - Estados */}
        <section className="bg-white shadow rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold">Estados</h2>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="estadoProcesoPagos"
                checked={form.estadoProcesoPagos}
                onCheckedChange={(checked) => handleChange("estadoProcesoPagos", checked)}
              />
              <Label htmlFor="estadoProcesoPagos" className="flex-1">
                <div className="font-medium">Proceso de Pagos</div>
                <p className="text-sm text-gray-500">
                  {form.estadoProcesoPagos ? "Completado" : "Pendiente"}
                </p>
              </Label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="estadoProcesoEnvioEECC"
                checked={form.estadoProcesoEnvioEECC}
                onCheckedChange={(checked) => handleChange("estadoProcesoEnvioEECC", checked)}
              />
              <Label htmlFor="estadoProcesoEnvioEECC" className="flex-1">
                <div className="font-medium">Envío de EECC</div>
                <p className="text-sm text-gray-500">
                  {form.estadoProcesoEnvioEECC ? "Completado" : "Pendiente"}
                </p>
              </Label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="estadoCalendario"
                checked={form.estadoCalendario}
                onCheckedChange={(checked) => handleChange("estadoCalendario", checked)}
              />
              <Label htmlFor="estadoCalendario" className="flex-1">
                <div className="font-medium">Estado del Calendario</div>
                <p className="text-sm text-gray-500">
                  {form.estadoCalendario ? "Cerrado" : "Abierto"}
                </p>
              </Label>
            </div>
          </div>
        </section>

        {/* Botones de acción */}
        <div className="lg:col-span-3 flex justify-end gap-4 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/calendarios")}
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