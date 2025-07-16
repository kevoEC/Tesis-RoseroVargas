import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { mapIdentificacionToUpdate } from "@/utils/mappers";
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
import GlassLoader from "@/components/ui/GlassLoader";
import {
  getSolicitudById,
  updateSolicitud,
} from "@/service/Entidades/SolicitudService";
import {
  getActividadEconomicaPrincipal,
  getActividadEconomicaTrabajo,
} from "@/service/Catalogos/ActividadEconomicaService";
import { toast } from "sonner";

export default function ActividadEconomica() {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [solicitudData, setSolicitudData] = useState(null);
  const [catalogoPrincipal, setCatalogoPrincipal] = useState([]);
  const [catalogoTrabajo, setCatalogoTrabajo] = useState([]);
  const [bloquearTodo, setBloquearTodo] = useState(false);

  const [actividadEconomica, setActividadEconomica] = useState({
    idActividadEconomicaPrincipal: "",
    idActividadEconomicaLugarTrabajo: "",
    lugarTrabajo: "",
    correoTrabajo: "",
    otraActividadEconomica: "",
    cargo: "",
    antiguedad: "",
    telefonoTrabajo: "",
    fechaInicioActividad: "",
    direccionTrabajo: "",
    referenciaDireccionTrabajo: "",
    isPEP: false,
  });

  // Estado para errores de validación
  const [errores, setErrores] = useState({});

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      try {
        const response = await getSolicitudById(id);
        const data = response.data[0];
        setSolicitudData(data);

        // Bloquea si no está en fase 1
        setBloquearTodo(data.faseProceso !== 1);

        setActividadEconomica({
          idActividadEconomicaPrincipal: data.actividadEconomica?.idActividadEconomicaPrincipal || "",
          idActividadEconomicaLugarTrabajo: data.actividadEconomica?.idActividadEconomicaLugarTrabajo || "",
          lugarTrabajo: data.actividadEconomica?.lugarTrabajo || "",
          correoTrabajo: data.actividadEconomica?.correoTrabajo || "",
          otraActividadEconomica: data.actividadEconomica?.otraActividadEconomica || "",
          cargo: data.actividadEconomica?.cargo || "",
          antiguedad: data.actividadEconomica?.antiguedad || "",
          telefonoTrabajo: data.actividadEconomica?.telefonoTrabajo || "",
          fechaInicioActividad: data.actividadEconomica?.fechaInicioActividad
            ? data.actividadEconomica.fechaInicioActividad.split("T")[0]
            : "",
          direccionTrabajo: data.actividadEconomica?.direccionTrabajo || "",
          referenciaDireccionTrabajo: data.actividadEconomica?.referenciaDireccionTrabajo || "",
          isPEP: data.actividadEconomica?.esPEP || false,
        });

        const [principalRaw, trabajoRaw] = await Promise.all([
          getActividadEconomicaPrincipal(),
          getActividadEconomicaTrabajo(),
        ]);
        setCatalogoPrincipal(
          principalRaw.map((item) => ({
            id: String(item.idActividadEconomicaPrincipal),
            nombre: item.nombre,
          }))
        );
        setCatalogoTrabajo(
          trabajoRaw.map((item) => ({
            id: String(item.idActividadEconomicaLugarTrabajo),
            nombre: item.nombre,
          }))
        );
      } catch (error) {
        toast.error("Error al cargar datos: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [id]);

  // Validación campos obligatorios (excepto otraActividadEconomica)
  const validarCampos = () => {
    const nuevosErrores = {};

    if (!actividadEconomica.idActividadEconomicaPrincipal) {
      nuevosErrores.idActividadEconomicaPrincipal = "Actividad económica principal es obligatoria";
    }
    if (!actividadEconomica.idActividadEconomicaLugarTrabajo) {
      nuevosErrores.idActividadEconomicaLugarTrabajo = "Actividad económica del lugar de trabajo es obligatoria";
    }
    if (!actividadEconomica.lugarTrabajo) {
      nuevosErrores.lugarTrabajo = "Lugar de trabajo es obligatorio";
    }
    if (!actividadEconomica.cargo) {
      nuevosErrores.cargo = "Cargo es obligatorio";
    }
    if (!actividadEconomica.telefonoTrabajo) {
      nuevosErrores.telefonoTrabajo = "Teléfono del trabajo es obligatorio";
    }
    if (!actividadEconomica.fechaInicioActividad) {
      nuevosErrores.fechaInicioActividad = "Fecha de inicio es obligatoria";
    }
    if (!actividadEconomica.antiguedad) {
      nuevosErrores.antiguedad = "Antigüedad es obligatoria";
    }
    if (!actividadEconomica.correoTrabajo) {
      nuevosErrores.correoTrabajo = "Correo electrónico del trabajo es obligatorio";
    }
    if (!actividadEconomica.direccionTrabajo) {
      nuevosErrores.direccionTrabajo = "Dirección del trabajo es obligatoria";
    }
    if (!actividadEconomica.referenciaDireccionTrabajo) {
      nuevosErrores.referenciaDireccionTrabajo = "Referencia de la dirección del trabajo es obligatoria";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleGuardar = async () => {
    if (!solicitudData || bloquearTodo) return;

    if (!validarCampos()) {
      toast.error("Por favor completa todos los campos obligatorios.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...solicitudData,
        identificacion: mapIdentificacionToUpdate(solicitudData.identificacion),
        actividadEconomica: {
          ...solicitudData.actividadEconomica,
          ...actividadEconomica,
          esPEP: actividadEconomica.isPEP,
        },
      };

      const res = await updateSolicitud(id, payload);
      res.success
        ? toast.success("Datos guardados exitosamente.")
        : toast.error("Error al guardar los datos.");
    } catch (error) {
      toast.error("Error al guardar los datos: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 relative">
      <GlassLoader visible={loading} message="Cargando datos..." />

      <h2 className="text-xl font-semibold text-gray-800">Actividad económica</h2>
      {bloquearTodo && (
        <div className="w-full flex items-center px-6 py-2 mb-4 rounded-xl bg-yellow-100 border border-yellow-300 text-yellow-800 font-semibold">
          <span>No se permite editar actividad económica en esta fase.</span>
        </div>
      )}

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex justify-end">
            <Button
              onClick={handleGuardar}
              disabled={bloquearTodo || loading}
              className="text-white bg-primary hover:bg-primary/80"
            >
              Guardar datos
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            <FormSelect
              label="Actividad económica principal"
              options={catalogoPrincipal}
              value={actividadEconomica.idActividadEconomicaPrincipal}
              onChange={(value) =>
                setActividadEconomica((prev) => ({
                  ...prev,
                  idActividadEconomicaPrincipal: value,
                }))
              }
              disabled={bloquearTodo}
              error={errores.idActividadEconomicaPrincipal}
            />

            <FormSelect
              label="Actividad económica del lugar de trabajo"
              options={catalogoTrabajo}
              value={actividadEconomica.idActividadEconomicaLugarTrabajo}
              onChange={(value) =>
                setActividadEconomica((prev) => ({
                  ...prev,
                  idActividadEconomicaLugarTrabajo: value,
                }))
              }
              disabled={bloquearTodo}
              error={errores.idActividadEconomicaLugarTrabajo}
            />

            <FormInput
              label="Otra actividad económica"
              value={actividadEconomica.otraActividadEconomica}
              onChange={(e) =>
                setActividadEconomica((prev) => ({
                  ...prev,
                  otraActividadEconomica: e.target.value,
                }))
              }
              disabled={bloquearTodo}
            />

            <FormInput
              label="Lugar de trabajo"
              value={actividadEconomica.lugarTrabajo}
              onChange={(e) =>
                setActividadEconomica((prev) => ({
                  ...prev,
                  lugarTrabajo: e.target.value,
                }))
              }
              disabled={bloquearTodo}
              error={errores.lugarTrabajo}
            />

            <FormInput
              label="Cargo"
              value={actividadEconomica.cargo}
              onChange={(e) =>
                setActividadEconomica((prev) => ({
                  ...prev,
                  cargo: e.target.value,
                }))
              }
              disabled={bloquearTodo}
              error={errores.cargo}
            />

            <FormInput
              label="Teléfono del trabajo"
              value={actividadEconomica.telefonoTrabajo}
              onChange={(e) =>
                setActividadEconomica((prev) => ({
                  ...prev,
                  telefonoTrabajo: e.target.value,
                }))
              }
              disabled={bloquearTodo}
              error={errores.telefonoTrabajo}
            />

            <FormInput
              label="Fecha de inicio"
              type="date"
              value={actividadEconomica.fechaInicioActividad}
              onChange={(e) =>
                setActividadEconomica((prev) => ({
                  ...prev,
                  fechaInicioActividad: e.target.value,
                }))
              }
              disabled={bloquearTodo}
              error={errores.fechaInicioActividad}
            />

            <FormInput
              label="Antigüedad (años)"
              value={actividadEconomica.antiguedad}
              onChange={(e) =>
                setActividadEconomica((prev) => ({
                  ...prev,
                  antiguedad: e.target.value,
                }))
              }
              disabled={bloquearTodo}
              error={errores.antiguedad}
            />

            <FormInput
              label="Correo electrónico del trabajo"
              value={actividadEconomica.correoTrabajo}
              onChange={(e) =>
                setActividadEconomica((prev) => ({
                  ...prev,
                  correoTrabajo: e.target.value,
                }))
              }
              disabled={bloquearTodo}
              error={errores.correoTrabajo}
            />

            <FormInput
              label="Dirección del trabajo"
              value={actividadEconomica.direccionTrabajo}
              onChange={(e) =>
                setActividadEconomica((prev) => ({
                  ...prev,
                  direccionTrabajo: e.target.value,
                }))
              }
              disabled={bloquearTodo}
              error={errores.direccionTrabajo}
            />

            <FormInput
              label="Referencia de la dirección del trabajo"
              value={actividadEconomica.referenciaDireccionTrabajo}
              onChange={(e) =>
                setActividadEconomica((prev) => ({
                  ...prev,
                  referenciaDireccionTrabajo: e.target.value,
                }))
              }
              disabled={bloquearTodo}
              error={errores.referenciaDireccionTrabajo}
            />

            <FormSwitch
              label="Es PEP"
              checked={actividadEconomica.isPEP}
              onChange={(checked) =>
                setActividadEconomica((prev) => ({
                  ...prev,
                  isPEP: checked,
                }))
              }
              disabled={bloquearTodo}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helpers reutilizables con error
function FormInput({ label, value, onChange, type = "text", disabled, error }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
        {label} {error && <span className="text-red-600 text-xs italic">{error}</span>}
      </Label>
      <Input
        placeholder="---"
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-invalid={!!error}
      />
    </div>
  );
}

function FormSelect({ label, options, value, onChange, disabled, error }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
        {label} {error && <span className="text-red-600 text-xs italic">{error}</span>}
      </Label>
      <Select
        value={String(value)}
        onValueChange={onChange}
        disabled={disabled}
        aria-invalid={!!error}
      >
        <SelectTrigger className="bg-white border border-gray-700">
          <SelectValue placeholder="---" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {options.map((item) => (
            <SelectItem key={item.id} value={String(item.id)}>
              {item.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function FormSwitch({ label, checked, onChange, disabled }) {
  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Switch
          checked={checked}
          onCheckedChange={onChange}
          disabled={disabled}
          className={`
            peer
            inline-flex
            h-6 w-11 shrink-0
            cursor-pointer
            items-center
            rounded-full
            border
            border-gray-400
            transition-colors
            duration-200
            ease-in-out
            ${checked ? "bg-primary" : "bg-gray-300"}
          `}
        />
        <span
          className={`
            pointer-events-none
            absolute
            left-0.5 top-0.5
            h-5 w-5
            transform
            rounded-full
            bg-white
            shadow
            transition-transform
            duration-200
            ease-in-out
            ${checked ? "translate-x-5" : "translate-x-0"}
          `}
        />
      </div>
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
    </div>
  );
}
