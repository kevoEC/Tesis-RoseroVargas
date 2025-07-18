import { useEffect, useState } from "react";
import { mapIdentificacionToUpdate } from "@/utils/mappers";
import {
  getSolicitudById,
  updateSolicitud,
} from "@/service/Entidades/SolicitudService";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  getCatalogoPais,
  getCatalogoCiudadPorProvincia,
  getCatalogoProvinciaPorPais,
  getCatalogoTipoVia,
} from "@/service/Catalogos/ContactoUbicacionService";
import GlassLoader from "@/components/ui/GlassLoader";

export default function ContactoUbicacion({ id }) {
  const [loading, setLoading] = useState(true);
  const [solicitudData, setSolicitudData] = useState(null);
  const [bloquearTodo, setBloquearTodo] = useState(false);

  const [contactoUbicacion, setContactoUbicacion] = useState({
    correoElectronico: "",
    otroTelefono: "",
    telefonoCelular: "",
    telefonoFijo: "",
    idTipoVia: "",
    callePrincipal: "",
    numeroDomicilio: "",
    calleSecundaria: "",
    referenciaDomicilio: "",
    sectorBarrio: "",
    tiempoResidencia: "",
    idPaisResidencia: "",
    idProvinciaResidencia: "",
    idCiudadResidencia: "",
    residenteOtroPais: false,
    contribuyenteEEUU: false,
    numeroIdentificacionOtroPais: "",
    numeroIdentificacionEEUU: "",
  });
  const [catalogoPaises, setCatalogoPaises] = useState([]);
  const [catalogoProvincias, setCatalogoProvincias] = useState([]);
  const [catalogoCiudades, setCatalogoCiudades] = useState([]);
  const [catalogoTipoVia, setCatalogoTipoVia] = useState([]);

  // Estado para errores de validación
  const [errores, setErrores] = useState({});

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      try {
        const res = await getSolicitudById(id);
        const data = res.data[0];
        setSolicitudData(data);

        setBloquearTodo(data.faseProceso !== 1);

        setContactoUbicacion({
          correoElectronico: data.contactoUbicacion?.correoElectronico || "",
          otroTelefono: data.contactoUbicacion?.otroTelefono || "",
          telefonoCelular: data.contactoUbicacion?.telefonoCelular || "",
          telefonoFijo: data.contactoUbicacion?.telefonoFijo || "",
          callePrincipal: data.contactoUbicacion?.callePrincipal || "",
          numeroDomicilio: data.contactoUbicacion?.numeroDomicilio || "",
          calleSecundaria: data.contactoUbicacion?.calleSecundaria || "",
          referenciaDomicilio: data.contactoUbicacion?.referenciaDomicilio || "",
          sectorBarrio: data.contactoUbicacion?.sectorBarrio || "",
          tiempoResidencia: data.contactoUbicacion?.tiempoResidencia || "",
          idTipoVia: data.contactoUbicacion?.idTipoVia || "",
          idPaisResidencia: data.contactoUbicacion?.idPaisResidencia || "",
          idProvinciaResidencia: data.contactoUbicacion?.idProvinciaResidencia || "",
          idCiudadResidencia: data.contactoUbicacion?.idCiudadResidencia || "",
          residenteOtroPais: data.contactoUbicacion?.residenteOtroPais || false,
          contribuyenteEEUU: data.contactoUbicacion?.contribuyenteEEUU || false,
          numeroIdentificacionOtroPais: data.contactoUbicacion?.numeroIdentificacionOtroPais || "",
          numeroIdentificacionEEUU: data.contactoUbicacion?.numeroIdentificacionEEUU || "",
        });

        const [paises, tipoVia] = await Promise.all([
          getCatalogoPais(),
          getCatalogoTipoVia(),
        ]);
        setCatalogoPaises(paises);
        setCatalogoTipoVia(tipoVia);

        if (data.contactoUbicacion?.idPaisResidencia) {
          const provincias = await getCatalogoProvinciaPorPais(data.contactoUbicacion.idPaisResidencia);
          setCatalogoProvincias(provincias);

          if (data.contactoUbicacion?.idProvinciaResidencia) {
            const ciudades = await getCatalogoCiudadPorProvincia(data.contactoUbicacion.idProvinciaResidencia);
            setCatalogoCiudades(ciudades);
          }
        }
      } catch (err) {
        toast.error("Error al cargar contacto: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [id]);

  // Validación solo para campos obligatorios según especificación
  const validarCampos = () => {
    const nuevosErrores = {};

    // Contacto (solo correoElectronico y telefonoCelular obligatorios)
    if (!contactoUbicacion.correoElectronico?.trim()) {
      nuevosErrores.correoElectronico = "Correo electrónico es obligatorio";
    }
    if (!contactoUbicacion.telefonoCelular?.trim()) {
      nuevosErrores.telefonoCelular = "Teléfono celular es obligatorio";
    }

    // Ubicación - TODOS obligatorios
    if (!contactoUbicacion.idPaisResidencia) {
      nuevosErrores.idPaisResidencia = "País de residencia es obligatorio";
    }
    if (!contactoUbicacion.idProvinciaResidencia) {
      nuevosErrores.idProvinciaResidencia = "Provincia es obligatoria";
    }
    if (!contactoUbicacion.idCiudadResidencia) {
      nuevosErrores.idCiudadResidencia = "Ciudad es obligatoria";
    }
    if (!contactoUbicacion.idTipoVia) {
      nuevosErrores.idTipoVia = "Tipo de vía es obligatorio";
    }
    if (!contactoUbicacion.callePrincipal?.trim()) {
      nuevosErrores.callePrincipal = "Calle principal es obligatoria";
    }
    if (!contactoUbicacion.numeroDomicilio?.trim()) {
      nuevosErrores.numeroDomicilio = "Número de domicilio es obligatorio";
    }
    if (!contactoUbicacion.calleSecundaria?.trim()) {
      nuevosErrores.calleSecundaria = "Calle secundaria es obligatoria";
    }
    if (!contactoUbicacion.referenciaDomicilio?.trim()) {
      nuevosErrores.referenciaDomicilio = "Referencia es obligatoria";
    }
    if (!contactoUbicacion.sectorBarrio?.trim()) {
      nuevosErrores.sectorBarrio = "Sector o barrio es obligatorio";
    }
    // En la función validarCampos() agregamos:
if (!contactoUbicacion.tiempoResidencia || contactoUbicacion.tiempoResidencia === "") {
  nuevosErrores.tiempoResidencia = "Tiempo de residencia es obligatorio";
}


    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleGuardar = async () => {
    if (!solicitudData) return;
    if (!validarCampos()) {
      toast.error("Por favor completa todos los campos obligatorios.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...solicitudData,
        identificacion: mapIdentificacionToUpdate(solicitudData.identificacion),
        contactoUbicacion,
      };
      const res = await updateSolicitud(id, payload);
      if (res.success) toast.success("Contacto actualizado.");
      else toast.error("Error al actualizar contacto.");
    } catch (err) {
      toast.error("Error al guardar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePaisChange = async (idPais) => {
    setContactoUbicacion({
      ...contactoUbicacion,
      idPaisResidencia: idPais,
      idProvinciaResidencia: "",
      idCiudadResidencia: "",
    });
    setCatalogoCiudades([]);
    if (idPais) {
      const provincias = await getCatalogoProvinciaPorPais(idPais);
      setCatalogoProvincias(provincias);
    } else {
      setCatalogoProvincias([]);
    }
  };

  const handleProvinciaChange = async (idProvincia) => {
    setContactoUbicacion({
      ...contactoUbicacion,
      idProvinciaResidencia: idProvincia,
      idCiudadResidencia: "",
    });
    if (idProvincia) {
      const ciudades = await getCatalogoCiudadPorProvincia(idProvincia);
      setCatalogoCiudades(ciudades);
    } else {
      setCatalogoCiudades([]);
    }
  };

  return (
    <div className="space-y-6 p-6 relative">
      <GlassLoader visible={loading} message="Cargando contacto..." />
      {!loading && (
        <>
          <h2 className="text-xl font-semibold">Contacto y Ubicación</h2>
          {bloquearTodo && (
            <div className="w-full flex items-center px-6 py-2 mb-4 rounded-xl bg-yellow-100 border border-yellow-300 text-yellow-800 font-semibold">
              <span>No se permite editar contacto y ubicación en esta fase.</span>
            </div>
          )}
          <Button
            onClick={handleGuardar}
            disabled={loading || bloquearTodo}
            className="text-white"
          >
            Guardar datos
          </Button>

          {/* Sección Contacto */}
          <Card>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormInput
                label="Correo electrónico *"
                value={contactoUbicacion.correoElectronico}
                onChange={(e) =>
                  setContactoUbicacion({
                    ...contactoUbicacion,
                    correoElectronico: e.target.value,
                  })
                }
                disabled={bloquearTodo}
                error={errores.correoElectronico}
              />
              <FormInput
                label="Teléfono celular *"
                value={contactoUbicacion.telefonoCelular}
                onChange={(e) =>
                  setContactoUbicacion({
                    ...contactoUbicacion,
                    telefonoCelular: e.target.value,
                  })
                }
                disabled={bloquearTodo}
                error={errores.telefonoCelular}
              />
              <FormInput
                label="Otro teléfono"
                value={contactoUbicacion.otroTelefono}
                onChange={(e) =>
                  setContactoUbicacion({
                    ...contactoUbicacion,
                    otroTelefono: e.target.value,
                  })
                }
                disabled={bloquearTodo}
              />
              <FormInput
                label="Teléfono fijo"
                value={contactoUbicacion.telefonoFijo}
                onChange={(e) =>
                  setContactoUbicacion({
                    ...contactoUbicacion,
                    telefonoFijo: e.target.value,
                  })
                }
                disabled={bloquearTodo}
              />
            </CardContent>
          </Card>

          {/* Sección Ubicación */}
          <Card>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormGroup label="País de residencia *">
                <Select
                  value={contactoUbicacion.idPaisResidencia}
                  onValueChange={handlePaisChange}
                  disabled={bloquearTodo}
                  aria-invalid={!!errores.idPaisResidencia}
                >
                  <SelectTrigger className="border border-black">
                    <SelectValue placeholder="---" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-xl z-[9999]">
                    {catalogoPaises.map((pais) => (
                      <SelectItem key={pais.idPais} value={pais.idPais}>
                        {pais.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errores.idPaisResidencia && (
                  <p className="text-xs text-red-600 mt-1">{errores.idPaisResidencia}</p>
                )}
              </FormGroup>
              <FormGroup label="Provincia *">
                <Select
                  disabled={!contactoUbicacion.idPaisResidencia || bloquearTodo}
                  value={contactoUbicacion.idProvinciaResidencia}
                  onValueChange={handleProvinciaChange}
                  aria-invalid={!!errores.idProvinciaResidencia}
                >
                  <SelectTrigger className="border border-black">
                    <SelectValue placeholder="---" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-xl z-[9999]">
                    {catalogoProvincias.map((prov) => (
                      <SelectItem key={prov.idProvincia} value={prov.idProvincia}>
                        {prov.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errores.idProvinciaResidencia && (
                  <p className="text-xs text-red-600 mt-1">{errores.idProvinciaResidencia}</p>
                )}
              </FormGroup>
              <FormGroup label="Ciudad *">
                <Select
                  disabled={!contactoUbicacion.idProvinciaResidencia || bloquearTodo}
                  value={contactoUbicacion.idCiudadResidencia}
                  onValueChange={(v) =>
                    setContactoUbicacion({ ...contactoUbicacion, idCiudadResidencia: v })
                  }
                  aria-invalid={!!errores.idCiudadResidencia}
                >
                  <SelectTrigger className="border border-black">
                    <SelectValue placeholder="---" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-xl z-[9999]">
                    {catalogoCiudades.map((ciu) => (
                      <SelectItem key={ciu.idCiudad} value={ciu.idCiudad}>
                        {ciu.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errores.idCiudadResidencia && (
                  <p className="text-xs text-red-600 mt-1">{errores.idCiudadResidencia}</p>
                )}
              </FormGroup>
              <FormGroup label="Tipo de vía *">
                <Select
                  value={contactoUbicacion.idTipoVia}
                  onValueChange={(v) =>
                    setContactoUbicacion({ ...contactoUbicacion, idTipoVia: v })
                  }
                  disabled={bloquearTodo}
                  aria-invalid={!!errores.idTipoVia}
                >
                  <SelectTrigger className="border border-black">
                    <SelectValue placeholder="---" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-xl z-[9999]">
                    {catalogoTipoVia.map((item) => (
                      <SelectItem key={item.idTipoVia} value={item.idTipoVia}>
                        {item.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errores.idTipoVia && (
                  <p className="text-xs text-red-600 mt-1">{errores.idTipoVia}</p>
                )}
              </FormGroup>
              <FormInput
                label="Calle principal *"
                value={contactoUbicacion.callePrincipal}
                onChange={(e) =>
                  setContactoUbicacion({
                    ...contactoUbicacion,
                    callePrincipal: e.target.value,
                  })
                }
                disabled={bloquearTodo}
                error={errores.callePrincipal}
              />
              <FormInput
                label="Número de domicilio *"
                value={contactoUbicacion.numeroDomicilio}
                onChange={(e) =>
                  setContactoUbicacion({
                    ...contactoUbicacion,
                    numeroDomicilio: e.target.value,
                  })
                }
                disabled={bloquearTodo}
                error={errores.numeroDomicilio}
              />
              <FormInput
                label="Calle secundaria *"
                value={contactoUbicacion.calleSecundaria}
                onChange={(e) =>
                  setContactoUbicacion({
                    ...contactoUbicacion,
                    calleSecundaria: e.target.value,
                  })
                }
                disabled={bloquearTodo}
                error={errores.calleSecundaria}
              />
              <FormInput
                label="Referencia *"
                value={contactoUbicacion.referenciaDomicilio}
                onChange={(e) =>
                  setContactoUbicacion({
                    ...contactoUbicacion,
                    referenciaDomicilio: e.target.value,
                  })
                }
                disabled={bloquearTodo}
                error={errores.referenciaDomicilio}
              />
              <FormInput
                label="Tiempo de residencia (años) *"
                type="number"
                value={contactoUbicacion.tiempoResidencia}
                onChange={(e) =>
                  setContactoUbicacion({
                    ...contactoUbicacion,
                    tiempoResidencia: e.target.value,
                  })
                }
                disabled={bloquearTodo}
                error={errores.tiempoResidencia}
              />

              <FormInput
                label="Sector / Barrio *"
                value={contactoUbicacion.sectorBarrio}
                onChange={(e) =>
                  setContactoUbicacion({
                    ...contactoUbicacion,
                    sectorBarrio: e.target.value,
                  })
                }
                disabled={bloquearTodo}
                error={errores.sectorBarrio}
              />
            </CardContent>
          </Card>

          {/* Sección Extranjero / Contribuyente EU */}
          <Card>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormSwitch
                label="Residente otro país"
                checked={contactoUbicacion.residenteOtroPais}
                onChange={(checked) =>
                  setContactoUbicacion({
                    ...contactoUbicacion,
                    residenteOtroPais: checked,
                    // limpiar si deshabilita?
                    numeroIdentificacionOtroPais: checked ? contactoUbicacion.numeroIdentificacionOtroPais : "",
                  })
                }
                disabled={bloquearTodo}
              />
              {contactoUbicacion.residenteOtroPais && (
                <FormInput
                  label="Número de identificación (Otro País)"
                  value={contactoUbicacion.numeroIdentificacionOtroPais}
                  onChange={(e) =>
                    setContactoUbicacion({
                      ...contactoUbicacion,
                      numeroIdentificacionOtroPais: e.target.value,
                    })
                  }
                  disabled={bloquearTodo}
                />
              )}

              <FormSwitch
                label="Contribuyente EEUU"
                checked={contactoUbicacion.contribuyenteEEUU}
                onChange={(checked) =>
                  setContactoUbicacion({
                    ...contactoUbicacion,
                    contribuyenteEEUU: checked,
                    numeroIdentificacionEEUU: checked ? contactoUbicacion.numeroIdentificacionEEUU : "",
                  })
                }
                disabled={bloquearTodo}
              />
              {contactoUbicacion.contribuyenteEEUU && (
                <FormInput
                  label="Número de Identificación(EE.UU.)"
                  value={contactoUbicacion.numeroIdentificacionEEUU}
                  onChange={(e) =>
                    setContactoUbicacion({
                      ...contactoUbicacion,
                      numeroIdentificacionEEUU: e.target.value,
                    })
                  }
                  disabled={bloquearTodo}
                />
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

// Componentes reutilizables
function FormInput({ label, value, onChange, type = "text", disabled, error }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
        {label}
        {error && <span className="text-red-600 text-xs italic">{error}</span>}
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
            border-gray-700
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

function FormGroup({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      {children}
    </div>
  );
}
