import { useState, useEffect } from "react";
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
import { toast } from "sonner";
import { createSolicitud } from "@/service/Entidades/SolicitudService";
import { getTipoCliente } from "@/service/Catalogos/TipoClienteService";
import { getTipoIdentificacion } from "@/service/Catalogos/TipoIdentificacionService";
import { validarEquifax, validarLDS } from "@/service/Entidades/SolicitudService";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const continuarOptions = [
  { id: 1, label: "Continuar con la solicitud" },
  { id: 0, label: "Rechazar solicitud" },
];

export default function SolicitudInversionForm({
  idProspecto = null,
  idCliente = null,
  onClose,
  onSaved,
}) {
  const { user } = useAuth(); // <<== trae el usuario

  const [catalogos, setCatalogos] = useState({
    tipoCliente: [],
    tipoDocumento: [],
  });

  const [form, setForm] = useState({
    tipoSolicitud: 1,
    tipoCliente: "",
    tipoDocumento: "",
    numeroDocumento: "",
    nombres: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    validar: false,
    equifax: "",
    obsEquifax: "",
    listasControl: "",
    obsListasControl: "",
    continuar: 1,
  });
  const [loading, setLoading] = useState(false);
  const [loadingValidacion, setLoadingValidacion] = useState(false);
  const [bloquearCampos, setBloquearCampos] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [cli, doc] = await Promise.all([
          getTipoCliente(),
          getTipoIdentificacion(),
        ]);
        setCatalogos({
          tipoCliente: cli,
          tipoDocumento: doc,
        });
      } catch (err) {
        toast.error("No se pudieron cargar los catálogos.");
      }
    })();
  }, []);

  const handleChange = (key, val) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  // --- VALIDACIÓN Equifax + LDS ---
  const ejecutarValidaciones = async () => {
    if (loadingValidacion || bloquearCampos) return;

    if (
      !form.tipoCliente ||
      !form.tipoDocumento ||
      !form.numeroDocumento.trim() ||
      !form.nombres.trim() ||
      !form.apellidoPaterno.trim() ||
      !form.apellidoMaterno.trim()
    ) {
      toast.error("Por favor llena todos los campos antes de validar.");
      return false;
    }

    setLoadingValidacion(true);
    toast.info("Validando información en Equifax y LDS...");

    try {
      // --- Equifax ---
      const resE = await validarEquifax(form.numeroDocumento);
      if (resE.success) {
        const r = resE.resultado;
        handleChange(
          "equifax",
          r.error ? "Error" : r.resultado ? "Paso" : "Rechazado"
        );
        handleChange("obsEquifax", r.observacion || "Sin observación");
      } else {
        handleChange("equifax", "Error");
        handleChange("obsEquifax", "Error en validación Equifax");
      }
      // --- LDS ---
      const nombresArr = (form.nombres ?? "").trim().split(" ");
      const primerNombre = nombresArr[0] || "";
      const segundoNombre = nombresArr.slice(1).join(" ") || "";
      const resL = await validarLDS({
        identificacion: form.numeroDocumento,
        primerNombre,
        segundoNombre,
        primerApellido: form.apellidoPaterno,
        segundoApellido: form.apellidoMaterno,
      });
      if (resL.success) {
        const r = resL.resultado;
        handleChange(
          "listasControl",
          r.error ? "Error" : r.coincidencia ? "Rechazado" : "Paso"
        );
        handleChange("obsListasControl", r.mensaje || "Sin observación");
      } else {
        handleChange("listasControl", "Error");
        handleChange("obsListasControl", "Error en validación LDS");
      }
      setBloquearCampos(true);
      handleChange("validar", true);
      toast.success("Validación completada.");
      return true;
    } catch {
      toast.error("Ocurrió un error durante la validación.");
      return false;
    } finally {
      setLoadingValidacion(false);
    }
  };

  const handleEditarCampos = () => {
    setBloquearCampos(false);
    setForm((prev) => ({ ...prev, validar: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.tipoCliente ||
      !form.tipoDocumento ||
      !form.numeroDocumento.trim() ||
      !form.nombres.trim() ||
      !form.apellidoPaterno.trim() ||
      !form.apellidoMaterno.trim()
    ) {
      toast.error("Todos los campos son obligatorios.");
      return;
    }

    if (!form.validar) {
      toast.error("Debes validar antes de guardar la solicitud.");
      return;
    }

    // SOLO restringe guardar si Equifax O LDS = "Rechazado". Si es "Error" en LDS se permite.
    if (
      form.equifax === "Rechazado" ||
      form.listasControl === "Rechazado"
    ) {
      toast.error(
        "No puedes guardar una solicitud rechazada por validación."
      );
      return;
    }
    if (Number(form.continuar) !== 1) {
      toast.error("Solo puedes guardar si seleccionas 'Continuar con la solicitud'.");
      return;
    }

    const payload = {
      idUsuarioPropietario: user?.id ?? null, // <<==== AQUI VA EL USUARIO
      idProspecto: idProspecto ?? null,
      idCliente: idCliente ?? null,
      identificacion: {
        tipoSolicitud: 1,
        tipoCliente: Number(form.tipoCliente),
        tipoDocumento: Number(form.tipoDocumento),
        numeroDocumento: form.numeroDocumento.trim(),
        nombres: form.nombres.trim(),
        apellidoPaterno: form.apellidoPaterno.trim(),
        apellidoMaterno: form.apellidoMaterno.trim(),
        validar: form.validar,
        equifax: form.equifax,
        obsEquifax: form.obsEquifax,
        listasControl: form.listasControl,
        obsListasControl: form.obsListasControl,
        continuar: Number(form.continuar),
      },
    };

    // 🔍 Ver en consola:
    console.log("Payload enviado:", payload);

    setLoading(true);
    try {
      await createSolicitud(payload);
      toast.success("Solicitud de inversión creada correctamente.");
      onSaved?.();
      onClose?.();
    } catch (err) {
      toast.error("Error al crear solicitud: " + (err.message ?? err));
    } finally {
      setLoading(false);
    }
  };

  const camposBasicosLlenos =
    form.tipoCliente &&
    form.tipoDocumento &&
    form.numeroDocumento.trim() &&
    form.nombres.trim() &&
    form.apellidoPaterno.trim() &&
    form.apellidoMaterno.trim();

  const puedeValidar = camposBasicosLlenos && !form.validar;

  return (
    <div className="relative px-2 py-3 md:px-7 md:py-7">
      <GlassLoader
        visible={loading || loadingValidacion}
        message={
          loading
            ? "Guardando solicitud..."
            : loadingValidacion
            ? "Validando..."
            : ""
        }
      />
      <form
        onSubmit={handleSubmit}
        className="space-y-8 max-w-xl mx-auto"
        autoComplete="off"
      >
        <section className="bg-white rounded-2xl border border-gray-200 px-7 py-5 flex flex-col gap-4 shadow-lg transition-colors">
          <h3 className="font-semibold text-lg text-violet-700 mb-3 border-b pb-2">
            Nueva Solicitud de Inversión
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormGroup label="Tipo de Solicitud">
              <Input
                value="Nueva"
                disabled
                className="bg-gray-100 font-semibold"
                placeholder="Nueva"
              />
            </FormGroup>
            <FormGroup label="Tipo de Cliente">
              <Select
                required
                value={form.tipoCliente}
                disabled={bloquearCampos}
                onValueChange={(val) => handleChange("tipoCliente", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {catalogos.tipoCliente.map((item) => (
                    <SelectItem
                      key={item.idTipoCliente}
                      value={item.idTipoCliente.toString()}
                    >
                      {item.nombreTipoCliente}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormGroup>
            <FormGroup label="Tipo de Documento">
              <Select
                required
                value={form.tipoDocumento}
                disabled={bloquearCampos}
                onValueChange={(val) => handleChange("tipoDocumento", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {catalogos.tipoDocumento.map((item) => (
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
            <FormGroup label="Número de Identificación">
              <Input
                value={form.numeroDocumento}
                onChange={(e) => handleChange("numeroDocumento", e.target.value)}
                maxLength={20}
                required
                disabled={bloquearCampos}
                placeholder="Ej: 1004177448"
              />
            </FormGroup>
            <FormGroup label="Nombres">
              <Input
                value={form.nombres}
                onChange={(e) => handleChange("nombres", e.target.value)}
                maxLength={60}
                required
                disabled={bloquearCampos}
                placeholder="Ej: Kevin Rodrigo"
              />
            </FormGroup>
            <FormGroup label="Apellido Paterno">
              <Input
                value={form.apellidoPaterno}
                onChange={(e) => handleChange("apellidoPaterno", e.target.value)}
                maxLength={30}
                required
                disabled={bloquearCampos}
                placeholder="Ej: Rosero"
              />
            </FormGroup>
            <FormGroup label="Apellido Materno">
              <Input
                value={form.apellidoMaterno}
                onChange={(e) =>
                  handleChange("apellidoMaterno", e.target.value)
                }
                maxLength={30}
                disabled={bloquearCampos}
                placeholder="Ej: Insuasti"
              />
            </FormGroup>
          </div>

          {/* Botón validar solo si todos los campos obligatorios llenos y no está validado */}
          {puedeValidar && (
            <div className="flex justify-end mt-2">
              <Button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                onClick={ejecutarValidaciones}
                disabled={loadingValidacion || bloquearCampos}
              >
                {loadingValidacion && (
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                )}
                Validar Información
              </Button>
            </div>
          )}

          {/* Si ya validó, muestra el bloque de resultados y el campo Continuar */}
          {form.validar && (
            <div className="mt-4 border-t pt-4">
              <div className="flex flex-col gap-3 w-full">
                <FormGroup label="Identidad (Equifax)">
                  <Input value={form.equifax} disabled />
                </FormGroup>
                <FormGroup label="Observación Equifax">
                  <textarea
                    rows={2}
                    className="w-full rounded-md border border-gray-300 p-2 bg-gray-50 text-sm"
                    value={form.obsEquifax}
                    disabled
                  />
                </FormGroup>
                <FormGroup label="Listas de Control (LDS)">
                  <Input value={form.listasControl} disabled />
                </FormGroup>
                <FormGroup label="Observación LDS">
                  <textarea
                    rows={2}
                    className="w-full rounded-md border border-gray-300 p-2 bg-gray-50 text-sm"
                    value={form.obsListasControl}
                    disabled
                  />
                </FormGroup>
                <FormGroup label="Continuar">
                  <Select
                    value={String(form.continuar)}
                    disabled={
                      form.equifax === "Rechazado" ||
                      form.listasControl === "Rechazado"
                    }
                    onValueChange={(val) => handleChange("continuar", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Continuar" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {continuarOptions.map((opt) => (
                        <SelectItem key={opt.id} value={String(opt.id)}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormGroup>
                <div className="flex justify-end mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="px-5"
                    onClick={handleEditarCampos}
                    disabled={loading || loadingValidacion}
                  >
                    Editar datos
                  </Button>
                </div>
              </div>
            </div>
          )}
        </section>
        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="px-6 py-2"
            disabled={loading || loadingValidacion}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2"
            disabled={
              loading ||
              loadingValidacion ||
              !form.validar ||
              Number(form.continuar) !== 1 ||
              form.equifax === "Rechazado" ||
              form.listasControl === "Rechazado"
            }
          >
            Guardar Solicitud
          </Button>
        </div>
      </form>
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
