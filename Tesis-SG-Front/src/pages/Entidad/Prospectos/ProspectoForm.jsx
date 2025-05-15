import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { createProspecto } from "@/service/Entidades/ProspectoService";
import { useAuth } from "@/hooks/useAuth";
import { getAgencias } from "@/service/Catalogos/AgenciaService";
import { getProductosInteres } from "@/service/Catalogos/ProductoInteresService";
import { getOrigenes } from "@/service/Catalogos/OrigenClienteService";
import { getTipoIdentificacion } from "@/service/Catalogos/TipoIdentificacionService";
import GlassLoader from "@/components/ui/GlassLoader";

export default function ProspectoForm({ onClose, onSaved }) {
  const { user } = useAuth();

  const [form, setForm] = useState({
    nombres: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    correoElectronico: "",
    telefonoCelular: "",
    idTipoIdentificacion: "",
    idOrigenCliente: "",
    idProductoInteres: "",
    idAgencia: "",
  });

  const [loading, setLoading] = useState(false);

  const [catalogos, setCatalogos] = useState({
    tipoIdentificaciones: [],
    origenes: [],
    productos: [],
    agencias: [],
  });

  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        const [agencias, productos, origenes, tipoIdentificaciones] =
          await Promise.all([
            getAgencias(),
            getProductosInteres(),
            getOrigenes(),
            getTipoIdentificacion(),
          ]);

        setCatalogos({ agencias, productos, origenes, tipoIdentificaciones });
      } catch (error) {
        toast.error("No se pudieron cargar los catálogos");
      }
    };

    cargarCatalogos();
  }, []);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePhoneChange = (value) => {
    const raw = value.replace(/\D/g, "").slice(0, 10);
    const formatted = raw.replace(/(\d{3})(\d{3})(\d{0,4})/, "$1-$2-$3");
    handleChange("telefonoCelular", formatted);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      estado: true,
      idSolicitudInversion: null,
      fechaCreacion: new Date().toISOString(),
      fechaModificacion: new Date().toISOString(),
      idUsuarioCreacion: user?.id || null,
      idUsuarioModificacion: user?.id || null,
      idUsuarioPropietario: user?.id || null,
      esCliente: false,
    };

    setLoading(true);
    try {
      await createProspecto(payload);
      toast.success("Prospecto guardado correctamente");
      onSaved?.();
      onClose?.();
    } catch (error) {
      toast.error("Error al guardar prospecto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 relative">
      <GlassLoader visible={loading} message="Guardando prospecto..." />
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <FormGroup label="Nombres">
            <Input
              placeholder="Ej: Juan Andrés"
              value={form.nombres}
              onChange={(e) => handleChange("nombres", e.target.value)}
              required
            />
          </FormGroup>

          <FormGroup label="Apellido Paterno">
            <Input
              placeholder="Ej: Pérez"
              value={form.apellidoPaterno}
              onChange={(e) => handleChange("apellidoPaterno", e.target.value)}
              required
            />
          </FormGroup>

          <FormGroup label="Apellido Materno">
            <Input
              placeholder="Ej: Gutiérrez"
              value={form.apellidoMaterno}
              onChange={(e) => handleChange("apellidoMaterno", e.target.value)}
              required
            />
          </FormGroup>

          <FormGroup label="Correo Electrónico">
            <Input
              type="email"
              placeholder="Ej: ejemplo@correo.com"
              value={form.correoElectronico}
              onChange={(e) =>
                handleChange("correoElectronico", e.target.value)
              }
              required
            />
          </FormGroup>

          <FormGroup label="Teléfono Celular">
            <Input
              placeholder="Ej: 099-123-4567"
              value={form.telefonoCelular}
              onChange={(e) => handlePhoneChange(e.target.value)}
              maxLength={12}
              required
            />
          </FormGroup>

          <FormGroup label="Tipo de Identificación">
            <Select
              onValueChange={(val) =>
                handleChange("idTipoIdentificacion", Number(val))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {catalogos.tipoIdentificaciones.map((item) => (
                  <SelectItem
                    key={item.idTipoIdentificacion}
                    value={item.idTipoIdentificacion.toString()}
                  >
                    {item.tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormGroup>

          <FormGroup label="Origen del Cliente">
            <Select
              onValueChange={(val) =>
                handleChange("idOrigenCliente", Number(val))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {catalogos.origenes.map((item) => (
                  <SelectItem
                    key={item.idOrigenCliente}
                    value={item.idOrigenCliente.toString()}
                  >
                    {item.nombreOrigen}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormGroup>

          <FormGroup label="Producto de Interés">
            <Select
              onValueChange={(val) =>
                handleChange("idProductoInteres", Number(val))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {catalogos.productos.map((item) => (
                  <SelectItem
                    key={item.idProductoInteres}
                    value={item.idProductoInteres.toString()}
                  >
                    {item.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormGroup>

          <FormGroup label="Agencia">
            <Select
              onValueChange={(val) => handleChange("idAgencia", Number(val))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {catalogos.agencias.map((item) => (
                  <SelectItem
                    key={item.idAgencia}
                    value={item.idAgencia.toString()}
                  >
                    {item.ciudad}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormGroup>

          <div className="col-span-full">
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              <PlusCircle className="w-4 h-4 mr-2" /> Guardar Prospecto
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
