import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  getProyeccionesPorSolicitud,
  updateSolicitud,
  getSolicitudById,
} from "@/service/Entidades/ProyeccionService";
import {
  getAsesoresComerciales,
  getJustificativoTransaccion,
} from "@/service/Catalogos/ProyeccionService";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { FaIdCard } from "react-icons/fa";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import TablaCustom2 from "../shared/TablaCustom2";

export default function Proyeccion() {
  const { id: idSolicitud } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [proyecciones, setProyecciones] = useState([]);
  const [asesores, setAsesores] = useState([]);
  const [justificativos, setJustificativos] = useState([]);
  const [solicitudData, setSolicitudData] = useState(null);

  const [form, setForm] = useState({
    idProyeccionSeleccionada: null,
    idAsesorComercial: "",
    idJustificativoTransaccion: "",
    origenFondos: "",
    aceptaCliente: false,
  });

  const [loading, setLoading] = useState(true);
  const [bloqueado, setBloqueado] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [res, asesoresData, justificativosData, solicitud] =
          await Promise.all([
            getProyeccionesPorSolicitud(idSolicitud),
            getAsesoresComerciales(),
            getJustificativoTransaccion(),
            getSolicitudById(idSolicitud),
          ]);

        setProyecciones(res.proyecciones || []);
        setAsesores(asesoresData || []);
        setJustificativos(justificativosData || []);
        setSolicitudData(solicitud.data[0]);

        const p = solicitud.data[0]?.proyeccionVinculada;
        if (p) {
          setForm({
            idProyeccionSeleccionada: p.idProyeccion,
            idAsesorComercial: p.idAsesorComercial?.toString() || "",
            idJustificativoTransaccion:
              p.idJustificativoTransaccion?.toString() || "",
            origenFondos: p.origenFondos || "",
            aceptaCliente: p.aceptaCliente || false,
          });
          setBloqueado(true);
        }
      } catch (err) {
        console.log("Silenciado error de carga:", err);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [idSolicitud]);

  const handleGuardar = async () => {
    if (!solicitudData) return;
    try {
      const payload = {
        ...solicitudData,
        proyeccion: {
          idAsesorComercial: parseInt(form.idAsesorComercial),
          idJustificativoTransaccion: parseInt(form.idJustificativoTransaccion),
          origenFondos: form.origenFondos,
          enviarProyeccion: false,
          clienteAcepta: form.aceptaCliente,
          idProyeccionSeleccionada: form.idProyeccionSeleccionada,
        },
      };
      const res = await updateSolicitud(idSolicitud, payload);
      res.success
        ? toast.success("Proyección guardada correctamente.")
        : toast.error("Error al guardar");
    } catch (err) {
      toast.error("Error: " + err.message);
    }
  };

  const columnas = [
    {
      key: "idProyeccion",
      label: "",
      render: (value) => (
        <div className="flex items-center justify-center group relative text-gray-500">
          <FaIdCard className="w-5 h-5" />
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 text-xs text-white bg-zinc-800 px-2 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 whitespace-nowrap">
            ID: {value}
          </span>
        </div>
      ),
    },
    { key: "proyeccionNombre", label: "Nombre" },
    { key: "tasa", label: "Tasa (%)" },
    { key: "capital", label: "Capital" },
    { key: "fechaInicial", label: "Fecha Inicial" },
  ];

  const puedeSeleccionarProyeccion =
    form.idAsesorComercial && form.idJustificativoTransaccion && form.origenFondos;

  return (
    <div className="space-y-6 px-4 sm:px-6 py-6">
      <h2 className="text-xl font-semibold text-gray-800">Proyecciones vinculadas</h2>

      <Card>
        <CardContent className="space-y-6 px-4 sm:px-6 py-6">
          <TablaCustom2
            columns={columnas}
            data={proyecciones}
            mostrarAgregarNuevo={true}
            mostrarEditar={false}
            mostrarEliminar={false}
            onAgregarNuevoClick={() =>
              navigate(`/solicitudes/editar/${idSolicitud}/proyeccion/nueva`)
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FormGroup label="Asesor comercial">
              <Select
                disabled={bloqueado}
                value={form.idAsesorComercial}
                onValueChange={(v) => setForm((f) => ({ ...f, idAsesorComercial: v }))}
              >
                <SelectTrigger className="bg-white border border-gray-300">
                  <SelectValue placeholder="Seleccionar asesor..." />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {asesores.map((a) => (
                    <SelectItem key={a.idUsuario} value={a.idUsuario.toString()}>
                      {a.nombreCompleto}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormGroup>

            <FormGroup label="Justificativo de transacción">
              <Select
                disabled={bloqueado}
                value={form.idJustificativoTransaccion}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, idJustificativoTransaccion: v }))
                }
              >
                <SelectTrigger className="bg-white border border-gray-300">
                  <SelectValue placeholder="Seleccionar justificativo..." />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {justificativos.map((j) => (
                    <SelectItem key={j.idJustificativoTransaccion} value={j.idJustificativoTransaccion.toString()}>
                      {j.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormGroup>

            <FormGroup label="Origen de fondos">
              <Input
                value={form.origenFondos}
                onChange={(e) => setForm((f) => ({ ...f, origenFondos: e.target.value }))}
                disabled={bloqueado}
              />
            </FormGroup>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <FormGroup label="Aceptación del cliente">
              <FormSwitch
                label={form.aceptaCliente ? "El Cliente Acepta" : "El Cliente No Acepta"}
                checked={form.aceptaCliente}
                onChange={(v) => setForm((f) => ({ ...f, aceptaCliente: v }))}
              />
            </FormGroup>

            <FormGroup label="Proyección seleccionada">
              <Select
                disabled={bloqueado || !puedeSeleccionarProyeccion}
                value={form.idProyeccionSeleccionada?.toString() || ""}
                onValueChange={(val) => {
                  if (!val) return;
                  if (!window.confirm("¿Confirmas seleccionar esta proyección? Esto bloqueará los campos.")) return;
                  setForm((f) => ({
                    ...f,
                    idProyeccionSeleccionada: parseInt(val),
                    aceptaCliente: true,
                  }));
                  setBloqueado(true);
                }}
              >
                <SelectTrigger className="bg-white border border-gray-300">
                  <SelectValue placeholder="Seleccionar proyección..." />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {proyecciones.map((p) => (
                    <SelectItem key={p.idProyeccion} value={p.idProyeccion.toString()}>
                      {p.proyeccionNombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormGroup>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleGuardar}
              className="bg-primary text-white hover:bg-primary/80 hover:shadow-md"
            >
              <PlusCircle className="w-4 h-4 mr-2" /> Guardar Vinculación
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FormGroup({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm text-gray-700 font-medium">{label}</Label>
      {children}
    </div>
  );
}

function FormSwitch({ label, checked, onChange }) {
  return (
    <div className="flex items-center gap-4">
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        className={`inline-flex h-6 w-11 items-center rounded-full border border-gray-400 transition-colors duration-200 ${
          checked ? "bg-primary" : "bg-gray-300"
        }`}
      >
        <span
          className={`h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </Switch>
      <Label className="text-sm font-light text-gray-700">{label}</Label>
    </div>
  );
}
