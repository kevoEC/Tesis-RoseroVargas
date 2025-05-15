import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUI } from "@/hooks/useUI";
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

export default function Proyeccion() {
  const { id: idSolicitud } = useParams();
  const { notify } = useUI();
  const navigate = useNavigate();

  const [solicitudData, setSolicitudData] = useState(null);
  const [proyecciones, setProyecciones] = useState([]);
  const [asesores, setAsesores] = useState([]);
  const [justificativos, setJustificativos] = useState([]);
  const [origenes, setOrigenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    idAsesorComercial: "",
    idJustificativoTransaccion: "",
    idProyeccionSeleccionada: "",
    origenFondos: "",
    enviarProyeccion: false,
    clienteAcepta: false,
  });

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
            idJustificativoTransaccion:
              data.proyeccion?.idJustificativoTransaccion || "",
            idProyeccionSeleccionada:
              data.proyeccion?.idProyeccionSeleccionada || "",
            origenFondos: data.proyeccion?.origenFondos || "",
            enviarProyeccion: data.proyeccion?.enviarProyeccion || false,
            clienteAcepta: data.proyeccion?.clienteAcepta || false,
          });
        }

        const [proyRes, asesoresData, justificativosData, origenesData] =
          await Promise.all([
            getProyeccionesPorSolicitud(idSolicitud),
            getAsesoresComerciales(),
            getJustificativoTransaccion(),
            getOrigenCliente(),
          ]);

        setProyecciones(proyRes.proyecciones || []);
        setAsesores(asesoresData || []);
        setJustificativos(justificativosData || []);
        setOrigenes(origenesData || []);
      } catch (error) {
        console.error(error);
        notify({
          type: "error",
          message: "Error al cargar datos: " + error.message,
        });
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [idSolicitud, notify]);

  const handleGuardar = async () => {
    if (!solicitudData) return;
    try {
      setLoading(true);
      const dataToSave = {
        ...solicitudData,
        proyeccion: formData,
      };
      const response = await updateSolicitud(idSolicitud, dataToSave);
      if (response.success) {
        notify({ type: "success", message: "Datos guardados exitosamente." });
      } else {
        notify({ type: "error", message: "Error al guardar los datos." });
      }
    } catch (error) {
      console.error(error);
      notify({
        type: "error",
        message: "Error al guardar los datos: " + error.message,
      });
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

  return (
    <div className="space-y-6 px-4 sm:px-6 py-6">
      {loading ? (
        <p>Cargando datos...</p>
      ) : (
        <>
          <h2 className="text-xl font-semibold text-gray-800">
            Proyecciones vinculadas
          </h2>
          <Card>
            <CardContent className="space-y-6 px-4 sm:px-6 py-6">
              <TablaCustom2
                columns={columnas}
                data={proyecciones}
                mostrarAgregarNuevo
                onAgregarNuevoClick={() =>
                  navigate(
                    `/solicitudes/editar/${idSolicitud}/proyeccion/nueva`
                  )
                }
                mostrarEditar={false}
                mostrarEliminar={false}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-6">
              <Button
                onClick={handleGuardar}
                disabled={loading}
                className="text-white"
              >
                Guardar datos
              </Button>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormGroup label="Asesor comercial">
                  <Select
                    value={String(formData.idAsesorComercial)}
                    onValueChange={(val) =>
                      setFormData({ ...formData, idAsesorComercial: val })
                    }
                  >
                    <SelectTrigger className="bg-white border border-black">
                      <SelectValue placeholder="-Selecciona un asesor-" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {asesores.map((a) => (
                        <SelectItem
                          key={a.idUsuario}
                          value={String(a.idUsuario)}
                        >
                          {a.nombreCompleto}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormGroup>

                <FormGroup label="Justificativo de transacción">
                  <Select
                    value={String(formData.idJustificativoTransaccion)}
                    onValueChange={(val) =>
                      setFormData({
                        ...formData,
                        idJustificativoTransaccion: val,
                      })
                    }
                  >
                    <SelectTrigger className="bg-white border border-black">
                      <SelectValue placeholder="-Selecciona un justificativo-" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {justificativos.map((j) => (
                        <SelectItem
                          key={j.idJustificativoTransaccion}
                          value={String(j.idJustificativoTransaccion)}
                        >
                          {j.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormGroup>

                <FormGroup label="Proyección seleccionada">
                  <Select
                    value={String(formData.idProyeccionSeleccionada)}
                    onValueChange={(val) =>
                      setFormData({
                        ...formData,
                        idProyeccionSeleccionada: val,
                      })
                    }
                  >
                    <SelectTrigger className="bg-white border border-black">
                      <SelectValue placeholder="-Selecciona una proyección-" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {proyecciones.map((p) => (
                        <SelectItem
                          key={p.idProyeccion}
                          value={String(p.idProyeccion)}
                        >
                          {p.proyeccionNombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormGroup>

                <FormGroup label="Origen de fondos">
                  <Select
                    value={formData.origenFondos}
                    onValueChange={(val) =>
                      setFormData({ ...formData, origenFondos: val })
                    }
                  >
                    <SelectTrigger className="bg-white border border-black">
                      <SelectValue placeholder="-Selecciona origen de fondos-" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {origenes.map((o) => (
                        <SelectItem
                          key={o.idOrigenCliente}
                          value={o.nombreOrigen}
                        >
                          {o.nombreOrigen}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormGroup>

                <FormGroup label="Enviar proyección">
                  <FormSwitch
                    label={formData.enviarProyeccion ? "Sí" : "No"}
                    checked={formData.enviarProyeccion}
                    onChange={(checked) =>
                      setFormData({ ...formData, enviarProyeccion: checked })
                    }
                  />
                </FormGroup>

                <FormGroup label="Aceptación del cliente">
                  <FormSwitch
                    label={
                      formData.clienteAcepta
                        ? "El Cliente Acepta"
                        : "El Cliente No Acepta"
                    }
                    checked={formData.clienteAcepta}
                    onChange={(checked) =>
                      setFormData({ ...formData, clienteAcepta: checked })
                    }
                  />
                </FormGroup>
              </div>
            </CardContent>
          </Card>
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
      <Label className="text-sm font-light text-gray-700">{label}</Label>
    </div>
  );
}
