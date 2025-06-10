import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { createCalendarioOperaciones, updateCalendarioOperaciones } from "@/service/Entidades/CalendarioOperacionesService";
import { useAuth } from "@/hooks/useAuth";
import GlassLoader from "@/components/ui/GlassLoader";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";

export default function CalendarioForm({ onClose, onSaved, initialData }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Estado inicial del formulario
  const [form, setForm] = useState({
    nombre: "",
    fechaCorte: null,
    calendarioInversiones: "1",
    fechaGenerarPagos: null,
    fechaEnvioEECC: null,
    estadoProcesoPagos: false,
    estadoProcesoEnvioEECC: false,
    estadoCalendario: false,
    ...initialData
  });

  // Manejar cambios en los inputs
  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...form,
        idUsuarioCreacion: user?.id,
        idUsuarioPropietario: user?.id
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
      toast.error(`Error al ${initialData ? 'actualizar' : 'crear'} calendario: ${error.message ?? error}`);
    } finally {
      setLoading(false);
    }
  };

  // Componente para seleccionar fecha
  const DatePicker = ({ date, setDate, label }) => (
    <FormGroup label={label}>
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
    </FormGroup>
  );

  return (
    <div className="p-4 relative">
      <GlassLoader visible={loading} message={initialData ? "Actualizando calendario..." : "Creando calendario..."} />
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nombre del calendario */}
          <FormGroup label="Nombre del Calendario">
            <Input
              placeholder="Ej: 01 JUNIO 2026"
              value={form.nombre}
              onChange={(e) => handleChange("nombre", e.target.value)}
              required
            />
          </FormGroup>

          {/* Día de inversiones */}
          <FormGroup label="Día de Inversiones">
            <Input
              type="number"
              min="1"
              max="31"
              placeholder="Ej: 1"
              value={form.calendarioInversiones}
              onChange={(e) => handleChange("calendarioInversiones", e.target.value)}
              required
            />
          </FormGroup>

          {/* Selectores de fecha */}
          <DatePicker 
            date={form.fechaCorte} 
            setDate={(date) => handleChange("fechaCorte", date)} 
            label="Fecha de Corte" 
          />

          <DatePicker 
            date={form.fechaGenerarPagos} 
            setDate={(date) => handleChange("fechaGenerarPagos", date)} 
            label="Fecha para Generar Pagos" 
          />

          <DatePicker 
            date={form.fechaEnvioEECC} 
            setDate={(date) => handleChange("fechaEnvioEECC", date)} 
            label="Fecha para Envío de EECC" 
          />

          {/* Checkboxes de estado */}
          <FormGroup label="Estado del Proceso de Pagos">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="estadoProcesoPagos"
                checked={form.estadoProcesoPagos}
                onCheckedChange={(checked) => handleChange("estadoProcesoPagos", checked)}
              />
              <Label htmlFor="estadoProcesoPagos">
                {form.estadoProcesoPagos ? "Completado" : "Pendiente"}
              </Label>
            </div>
          </FormGroup>

          <FormGroup label="Estado del Proceso de EECC">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="estadoProcesoEnvioEECC"
                checked={form.estadoProcesoEnvioEECC}
                onCheckedChange={(checked) => handleChange("estadoProcesoEnvioEECC", checked)}
              />
              <Label htmlFor="estadoProcesoEnvioEECC">
                {form.estadoProcesoEnvioEECC ? "Completado" : "Pendiente"}
              </Label>
            </div>
          </FormGroup>

          <FormGroup label="Estado del Calendario">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="estadoCalendario"
                checked={form.estadoCalendario}
                onCheckedChange={(checked) => handleChange("estadoCalendario", checked)}
              />
              <Label htmlFor="estadoCalendario">
                {form.estadoCalendario ? "Cerrado" : "Abierto"}
              </Label>
            </div>
          </FormGroup>

          {/* Botón de submit */}
          <div className="col-span-full flex justify-end gap-4">
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
    </div>
  );
}

function FormGroup({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="font-medium text-gray-700 text-sm">{label}</Label>
      {children}
    </div>
  );
}