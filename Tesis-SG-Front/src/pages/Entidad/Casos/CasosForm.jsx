import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createCaso } from "@/service/Entidades/CasosService";
import { getClientes } from "@/service/Entidades/ClienteService";
import { getInversiones } from "@/service/Entidades/InversionService";
import { useAuth } from "@/hooks/useAuth";
import GlassLoader from "@/components/ui/GlassLoader";

// Motivos REALES por ID (puedes agregar más si tienes)
const MOTIVOS = [
  { idMotivo: 6, nombre: "Autorización de actualización de datos" },
  { idMotivo: 19, nombre: "Generación de pago manual" },
  { idMotivo: 35, nombre: "Terminación de inversión" },
];

// Solo estos motivos requieren inversión asociada
const MOTIVOS_CON_INVERSION = [19, 35];

export default function CasoForm({ onClose, onSaved, initialData }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Clientes e inversiones
  const [clientes, setClientes] = useState([]);
  const [inversiones, setInversiones] = useState([]);

  // Estado del formulario
  const [form, setForm] = useState({
    idCliente: "",
    idMotivo: "",
    descripcion: "",
    idInversion: "",
    continuarCaso: false,
    estado: "Iniciado",
    ...initialData
  });

  // Carga inicial de clientes e inversiones
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const clientesData = await getClientes();
        setClientes(clientesData);
        const inversionesData = await getInversiones();
        setInversiones(inversionesData);
      } catch (err) {
        toast.error("Error al cargar clientes o inversiones: " + err.message);
      }
    };
    cargarDatos();
  }, []);

  // Si cambia de motivo, limpia la inversión si no corresponde
  useEffect(() => {
    if (!MOTIVOS_CON_INVERSION.includes(Number(form.idMotivo))) {
      setForm((prev) => ({ ...prev, idInversion: "" }));
    }
  }, [form.idMotivo]);

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  // Guardar
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        idCliente: Number(form.idCliente),
        idMotivo: Number(form.idMotivo),
        descripcion: form.descripcion,
        idInversion: form.idInversion ? Number(form.idInversion) : null,
        continuarCaso: form.continuarCaso || false,
        estado: form.estado || "Iniciado",
        idUsuarioCreacion: user?.id,
        idUsuarioPropietario: user?.id,
        idPago: null, // Nunca enviar
      };

      await createCaso(payload);
      toast.success("Caso creado correctamente");
      onSaved?.();
      onClose?.();
    } catch (error) {
      toast.error(`Error al crear caso: ${error.message ?? error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative px-2 py-3 md:px-7 md:py-7">
      <GlassLoader visible={loading} message="Guardando caso..." />
      <form
        onSubmit={handleSubmit}
        className="space-y-8 max-w-xl mx-auto"
        autoComplete="off"
      >
        <section className="bg-white rounded-2xl border border-gray-300 px-7 py-5 flex flex-col gap-4 shadow-lg transition-colors">
          <h3 className="font-semibold text-lg text-blue-900 mb-3 border-b pb-2">Datos del Caso</h3>
          {/* Cliente */}
          <FormGroup label="Cliente">
            <select
              className="w-full border rounded-md p-2 bg-white text-sm"
              value={form.idCliente}
              onChange={(e) => handleChange("idCliente", e.target.value)}
              required
            >
              <option value="">Seleccionar cliente...</option>
              {clientes.map((cli) => (
                <option key={cli.idCliente} value={cli.idCliente}>
                  {cli.numeroDocumento} — {cli.nombres} {cli.apellidoPaterno} {cli.apellidoMaterno}
                </option>
              ))}
            </select>
          </FormGroup>
          {/* Motivo */}
          <FormGroup label="Motivo del Caso">
            <select
              className="w-full border rounded-md p-2 bg-white text-sm"
              value={form.idMotivo}
              onChange={(e) => handleChange("idMotivo", e.target.value)}
              required
            >
              <option value="">Seleccionar motivo...</option>
              {MOTIVOS.map((motivo) => (
                <option key={motivo.idMotivo} value={motivo.idMotivo}>
                  {motivo.nombre}
                </option>
              ))}
            </select>
          </FormGroup>
          {/* Descripción */}
          <FormGroup label="Descripción">
            <textarea
              className="w-full border rounded-md p-2 bg-white text-sm"
              placeholder="Descripción breve del caso"
              value={form.descripcion}
              rows={4}
              onChange={(e) => handleChange("descripcion", e.target.value)}
              required
            />
          </FormGroup>
          {/* Inversión solo para motivos habilitados */}
          {MOTIVOS_CON_INVERSION.includes(Number(form.idMotivo)) && (
            <FormGroup label="Inversión asociada">
              <select
                className="w-full border rounded-md p-2 bg-white text-sm"
                value={form.idInversion}
                onChange={(e) => handleChange("idInversion", e.target.value)}
                required
              >
                <option value="">Seleccionar inversión...</option>
                {inversiones.map((inv) => (
                  <option key={inv.idInversion} value={inv.idInversion}>
                    {/* Formato igual al table: SG-FRF-2025-0001 - Renta Fija - $2000 (7 meses) | Cliente: Juan Perez */}
                    {inv.inversionNombre}{" | "}{inv.nombreCompletoCliente}
                  </option>
                ))}
              </select>
            </FormGroup>
          )}
        </section>
        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="px-6 py-2">
            Cancelar
          </Button>
          <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2">
            {initialData ? "Actualizar Caso" : "Crear Caso"}
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
