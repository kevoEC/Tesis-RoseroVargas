import { useEffect, useState } from "react";
import { mapIdentificacionToUpdate } from "@/utils/mappers";
import {
  getSolicitudById,
  updateSolicitud,
} from "@/service/Entidades/SolicitudService";
import {
  getActividadEconomicaPrincipal,
  getActividadEconomicaTrabajo,
} from "@/service/Catalogos/ActividadEconomicaService";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import GlassLoader from "@/components/ui/GlassLoader";

export default function ActividadEconomica({ id }) {
  const [loading, setLoading] = useState(true);
  const [solicitudData, setSolicitudData] = useState(null);
  const [catalogoPrincipal, setCatalogoPrincipal] = useState([]);
  const [catalogoTrabajo, setCatalogoTrabajo] = useState([]);

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

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      try {
        const response = await getSolicitudById(id);
        const data = response.data[0];
        setSolicitudData(data);
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

  const handleGuardar = async () => {
    if (!solicitudData) return;
    setLoading(true);
    try {
      const dataToSave = {
        ...solicitudData,
        identificacion: mapIdentificacionToUpdate(solicitudData.identificacion),
        actividadEconomica: {
          ...actividadEconomica,
          esPEP: actividadEconomica.isPEP,
        },
      };
      await updateSolicitud(id, dataToSave)
        .then(res => {
          res.success
            ? toast.success("Datos guardados exitosamente.")
            : toast.error("Error al guardar los datos.");
        });
    } catch (error) {
      toast.error("Error al guardar los datos: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 relative">
      <GlassLoader visible={loading} message="Cargando datos..." />
      {!loading && (
        <>
          <h2 className="text-xl font-semibold text-gray-800">
            Actividad económica
          </h2>
          <Button
            onClick={handleGuardar}
            disabled={loading}
            className="text-white"
          >
            Guardar datos
          </Button>
          <Card>
            <CardContent className="p-6 space-y-6">
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
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

// 🔁 Reutilizables
function FormInput({ label, value, onChange, type = "text" }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      <Input
        placeholder="---"
        type={type}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
function FormSelect({ label, options, value, onChange }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      <Select value={String(value)} onValueChange={onChange}>
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
function FormSwitch({ label, checked, onChange }) {
  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Switch
          checked={checked}
          onCheckedChange={onChange}
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
