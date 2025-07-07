import { useEffect, useState } from "react";
import {useParams } from "react-router-dom";
import { toast } from "sonner";
import { mapIdentificacionToUpdate } from "@/utils/mappers";
import {
  getSolicitudById,
  updateSolicitud,
} from "@/service/Entidades/SolicitudService";
import { getProyeccionesPorSolicitud } from "@/service/Entidades/ProyeccionService";
import {
  getAsesoresComerciales,
  getJustificativoTransaccion,
  getOrigenCliente,
} from "@/service/Catalogos/ProyeccionService";
import { Card, CardContent } from "@/components/ui/card";
import TablaCustom2 from "../shared/TablaCustom2";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import ProyeccionNueva from "@/pages/Entidad/Proyecciones/ProyeccionNueva";
import GlassLoader from "@/components/ui/GlassLoader";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction
} from "@/components/ui/alert-dialog";

export default function Proyeccion({ bloquearEdicion = false }) {
  const { id: idSolicitud } = useParams();

  const [solicitudData, setSolicitudData] = useState(null);
  const [proyecciones, setProyecciones] = useState([]);
  const [asesores, setAsesores] = useState([]);
  const [justificativos, setJustificativos] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [origenes, setOrigenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    idAsesorComercial: "",
    idJustificativoTransaccion: "",
    idProyeccionSeleccionada: "",
    origenFondos: "",
    enviarProyeccion: false,
    clienteAcepta: false,
  });

  const [alertFaltaCampos, setAlertFaltaCampos] = useState(false);
  const proyeccionesDisponibles = Array.isArray(proyecciones) && proyecciones.length > 0;

  // NUEVO: Deshabilita campos y agregar nueva si clienteAcepta === true
  const clienteYaAcepto = !!formData.clienteAcepta;

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      try {
        if (idSolicitud) {
          const res = await getSolicitudById(idSolicitud);
          const data = res.data[0];
          setSolicitudData(data);
          setFormData({
            idAsesorComercial: data.proyeccion?.idAsesorComercial || "",
            idJustificativoTransaccion: data.proyeccion?.idJustificativoTransaccion || "",
            idProyeccionSeleccionada: data.proyeccion?.idProyeccionSeleccionada || "",
            origenFondos: data.proyeccion?.origenFondos || "",
            enviarProyeccion: false,
            clienteAcepta: !!data.proyeccion?.clienteAcepta, // <-- AQUI!!
          });
        }
        const [proyRes, asesoresData, justificativosData, origenesData] = await Promise.all([
          getProyeccionesPorSolicitud(idSolicitud).catch(() => ({ proyecciones: [] })),
          getAsesoresComerciales().catch(() => []),
          getJustificativoTransaccion().catch(() => []),
          getOrigenCliente().catch(() => []),
        ]);
        setProyecciones(proyRes.proyecciones || []);
        setAsesores(asesoresData || []);
        setJustificativos(justificativosData || []);
        setOrigenes(origenesData || []);
      } catch (error) {
        toast.error("Error al cargar los datos de la solicitud." + error.message);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [idSolicitud, isModalOpen]);

  const handleGuardar = async () => {
    if (!solicitudData) return;
    const faltanCampos = !formData.idAsesorComercial ||
      !formData.idJustificativoTransaccion ||
      !formData.idProyeccionSeleccionada ||
      !formData.origenFondos;

    if (!proyeccionesDisponibles || faltanCampos) {
      setAlertFaltaCampos(true);
      return;
    }

    try {
      setLoading(true);
      const dataToSave = {
        ...solicitudData,
        identificacion: mapIdentificacionToUpdate(solicitudData.identificacion),
        proyeccion: {
          ...formData,
          enviarProyeccion: false,
        },
      };
      const response = await updateSolicitud(idSolicitud, dataToSave);
      response.success
        ? toast.success("Datos guardados exitosamente.")
        : toast.error("Error al guardar los datos.");
    } catch (error) {
      toast.error("Error al guardar los datos." + error.message);
    } finally {
      setLoading(false);
    }
  };

  const columnas = [
    { key: "proyeccionNombre", label: "Nombre" },
    { key: "tasa", label: "Tasa (%)" },
    { key: "capital", label: "Capital" },
    { key: "fechaInicial", label: "Fecha Inicial" },
    { key: "idUsuarioCreacion", label: "Usuario Creador" },
  ];

  // Ahora los campos se deshabilitan SI clienteAcepta es true o bloquearEdicion o no hay proyecciones
  const deshabilitarCampos = bloquearEdicion || !proyeccionesDisponibles || clienteYaAcepto;

  return (
    <div className="space-y-6 px-4 sm:px-6 py-6 relative">
      <GlassLoader visible={loading} message="Cargando datos..." />
      {/* --- Mensaje característico de bloqueo --- */}
      {bloquearEdicion && (
        <div className="w-full flex items-center px-6 py-2 mb-4 rounded-xl bg-yellow-100 border border-yellow-300 text-yellow-800 font-semibold">
          <span>No se permite editar la proyección en esta fase.</span>
        </div>
      )}
      {!loading && (
        <>
          <h2 className="text-xl font-semibold text-gray-800">
            Proyecciones vinculadas
          </h2>
          <Card>
            <CardContent className="space-y-6 px-4 sm:px-6 py-6">
              {proyeccionesDisponibles ? (
                <TablaCustom2
                  columns={columnas}
                  data={proyecciones}
                  mostrarAgregarNuevo={!clienteYaAcepto && !bloquearEdicion}
                  onAgregarNuevoClick={() => setIsModalOpen(true)}
                  mostrarEditar={false}
                  mostrarEliminar={false}
                />
              ) : (
                <div className="py-6 text-center text-gray-500">
                  No se encontraron proyecciones vinculadas.<br />
                  <Button
                    className="mt-4"
                    onClick={() => setIsModalOpen(true)}
                    disabled={bloquearEdicion || clienteYaAcepto}
                  >
                    Crear nueva proyección
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-6">
              <Button
                onClick={handleGuardar}
                disabled={deshabilitarCampos}
                className="text-white bg-primary hover:bg-primary/85"
              >
                Guardar datos
              </Button>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormGroup label="Asesor comercial">
                  <Select
                    value={formData.idAsesorComercial ? String(formData.idAsesorComercial) : ""}
                    onValueChange={(val) =>
                      setFormData({ ...formData, idAsesorComercial: Number(val) })
                    }
                    disabled={deshabilitarCampos}
                  >
                    <SelectTrigger className="bg-white border border-black">
                      <SelectValue placeholder="-Selecciona un asesor-" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {asesores.map((a) => (
                        <SelectItem key={a.idUsuario} value={String(a.idUsuario)}>
                          {a.nombreCompleto}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormGroup>

                <FormGroup label="Justificativo de transacción">
                  <Select
                    value={formData.idJustificativoTransaccion ? String(formData.idJustificativoTransaccion) : ""}
                    onValueChange={(val) =>
                      setFormData({ ...formData, idJustificativoTransaccion: Number(val) })
                    }
                    disabled={deshabilitarCampos}
                  >
                    <SelectTrigger className="bg-white border border-black">
                      <SelectValue placeholder="-Selecciona un justificativo-" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {justificativos.map((j) => (
                        <SelectItem key={j.idJustificativoTransaccion} value={String(j.idJustificativoTransaccion)}>
                          {j.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormGroup>

                <FormGroup label="Proyección seleccionada">
                  <Select
                    value={formData.idProyeccionSeleccionada ? String(formData.idProyeccionSeleccionada) : ""}
                    onValueChange={(val) =>
                      setFormData({ ...formData, idProyeccionSeleccionada: Number(val) })
                    }
                    disabled={deshabilitarCampos}
                  >
                    <SelectTrigger className="bg-white border border-black">
                      <SelectValue placeholder="-Selecciona una proyección-" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {proyecciones.map((p) => (
                        <SelectItem key={p.idProyeccion} value={String(p.idProyeccion)}>
                          {p.proyeccionNombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormGroup>

                <div className="md:col-span-2">
                  <FormGroup label="Origen de fondos">
                    <textarea
                      className="w-full border border-black rounded-md px-3 py-2 text-sm"
                      rows={3}
                      placeholder="Describe el origen de los fondos"
                      value={formData.origenFondos}
                      onChange={(e) =>
                        setFormData({ ...formData, origenFondos: e.target.value })
                      }
                      disabled={deshabilitarCampos}
                    />
                  </FormGroup>
                </div>

                <FormGroup label="Aceptación del cliente">
                  <FormSwitch
                    label={
                      formData.clienteAcepta
                        ? "El Cliente Acepta"
                        : "El Cliente No Acepta"
                    }
                    checked={formData.clienteAcepta}
                    onChange={(checked) => {
                      if (
                        !formData.idAsesorComercial ||
                        !formData.idJustificativoTransaccion ||
                        !formData.idProyeccionSeleccionada ||
                        !formData.origenFondos
                      ) {
                        setAlertFaltaCampos(true);
                        return;
                      }
                      setFormData({ ...formData, clienteAcepta: checked });
                    }}
                    disabled={deshabilitarCampos}
                  />
                </FormGroup>
              </div>
            </CardContent>
          </Card>

          {/* Modal para nueva proyección */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="w-full max-w-4xl max-h-[calc(100vh-4rem)] overflow-y-auto p-4">
              <ProyeccionNueva />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Alert para campos faltantes */}
          <AlertDialog open={alertFaltaCampos} onOpenChange={setAlertFaltaCampos}>
            <AlertDialogContent className="bg-white border border-gray-200 rounded-xl shadow-xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-violet-700 font-semibold">Faltan campos obligatorios</AlertDialogTitle>
                <div className="text-gray-700 mt-2">
                  Para continuar, debes llenar todos los campos y tener al menos una proyección creada y seleccionada.
                </div>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border border-gray-300 bg-white hover:bg-gray-50">
                  Cerrar
                </AlertDialogCancel>
                <AlertDialogAction asChild>
                  <button
                    className="bg-violet-600 text-white hover:bg-violet-700 px-4 py-2 rounded"
                    onClick={() => setAlertFaltaCampos(false)}
                    type="button"
                  >
                    OK
                  </button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}

function FormGroup({ label, children }) {
  return (
    <div className="space-y-1">
      <Label className="text-sm text-gray-700 font-medium">{label}</Label>
      {children}
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
      <Label className="text-sm font-light text-gray-700">{label}</Label>
    </div>
  );
}
