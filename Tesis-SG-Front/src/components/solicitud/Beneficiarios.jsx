import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectValue, SelectContent, SelectTrigger, SelectItem } from "../ui/select";
import TablaCustom2 from "../shared/TablaCustom2";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FaInfoCircle } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getBeneficiariosPorSolicitud, crearBeneficiario, editarBeneficiario, eliminarBeneficiario } from "@/service/Entidades/BeneficiariosService";
import { useAuth } from "@/hooks/useAuth";
import { getTipoIdentificacion } from "@/service/Catalogos/TipoIdentificacionService";
import GlassLoader from "@/components/ui/GlassLoader";
import { getSolicitudById } from "@/service/Entidades/SolicitudService"; // <-- Importa aquí

export default function Beneficiarios() {
  const { id } = useParams();
  const { user } = useAuth();

  const [beneficiarios, setBeneficiarios] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [tiposIdentificacion, setTiposIdentificacion] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingGuardar, setLoadingGuardar] = useState(false);
  const [bloquearTodo, setBloquearTodo] = useState(false); // <-- Control bloqueo

  const [nuevoDato, setNuevoDato] = useState({
    idSolicitudInversion: Number(id),
    nombre: "",
    idTipoDocumento: "",
    numeroDocumento: "",
    correoElectronico: "",
    telefono: "",
    direccion: "",
    porcentajeBeneficio: "",
    fechaCreacion: new Date().toISOString(),
    idUsuarioPropietario: user.idUsuario,
  });

  // NUEVO: cargar fase de solicitud y aplicar bloqueo
  useEffect(() => {
    const obtenerFase = async () => {
      try {
        const res = await getSolicitudById(id);
        const data = res.data[0];
        setBloquearTodo(data.faseProceso !== 1);
      // eslint-disable-next-line no-unused-vars
      } catch (error) {
        setBloquearTodo(false);
      }
    };
    obtenerFase();
  }, [id]);

  const obtenerDatos = async () => {
    setLoading(true);
    try {
      const data = await getBeneficiariosPorSolicitud(id);
      setBeneficiarios(data);
    } catch (error) {
      toast.error("Error al cargar beneficiarios" + (error.message || ""));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchTiposIdentificacion = async () => {
      try {
        const data = await getTipoIdentificacion();
        setTiposIdentificacion(data);
      } catch (error) {
        toast.error("Error al cargar tipos de identificación" + (error.message || ""));
      }
    };
    fetchTiposIdentificacion();
    obtenerDatos();
    // eslint-disable-next-line
  }, []);

  const handleAbrirFormulario = () => {
    setModoEdicion(false);
    setNuevoDato({
      idSolicitudInversion: Number(id),
      nombre: "",
      idTipoDocumento: "",
      numeroDocumento: "",
      correoElectronico: "",
      telefono: "",
      direccion: "",
      porcentajeBeneficio: "",
      fechaCreacion: new Date().toISOString(),
      idUsuarioPropietario: user.idUsuario,
    });
    setModalAbierto(true);
  };

  const handleEditar = (item) => {
    setModoEdicion(true);
    setNuevoDato({
      idBeneficiario: item.idBeneficiario,
      idSolicitudInversion: Number(id),
      nombre: item.nombre,
      idTipoDocumento: item.idTipoDocumento,
      numeroDocumento: item.numeroDocumento,
      correoElectronico: item.correoElectronico,
      telefono: item.telefono,
      direccion: item.direccion,
      porcentajeBeneficio: item.porcentajeBeneficio,
      fechaCreacion: item.fechaCreacion,
      idUsuarioPropietario: user.idUsuario,
    });
    setModalAbierto(true);
  };

  const handleEliminar = async (item) => {
    if (bloquearTodo) return;
    if (!window.confirm(`¿Deseas eliminar a "${item.nombre}"?`)) return;
    setLoading(true);
    try {
      await eliminarBeneficiario(item.idBeneficiario);
      toast.success("Beneficiario eliminado");
      obtenerDatos();
    } catch (error) {
      toast.error("Error al eliminar beneficiario" + (error.message || ""));
    } finally {
      setLoading(false);
    }
  };

const columnas = [
  {
    key: "idBeneficiario",
    label: "",
    render: (v) => (
      <span
        title={`ID Beneficiario: ${v}`}
        className="flex justify-center cursor-default text-gray-600 hover:text-gray-900"
      >
        <FaInfoCircle size={18} />
      </span>
    ),
  },
  { key: "nombre", label: "Nombre" },
  { key: "idTipoDocumento", label: "Tipo Documento" },
  { key: "numeroDocumento", label: "Número Documento" },
  { key: "correoElectronico", label: "Correo" },
  { key: "telefono", label: "Teléfono" },
  { key: "direccion", label: "Dirección" },
  { key: "porcentajeBeneficio", label: "Porcentaje (%)" },
  { key: "fechaCreacion", label: "Fecha de Creación" },
];

  return (
    <div className="space-y-6 p-6 relative">
      <GlassLoader visible={loading || loadingGuardar} message={loadingGuardar ? "Guardando..." : "Cargando beneficiarios..."} />
      {!loading && (
        <>
          <h2 className="text-xl font-semibold text-gray-800">Beneficiarios</h2>
          {bloquearTodo && (
            <div className="w-full flex items-center px-6 py-2 mb-4 rounded-xl bg-yellow-100 border border-yellow-300 text-yellow-800 font-semibold">
              <span>No se permite editar beneficiarios en esta fase.</span>
            </div>
          )}
          <Card>
            <CardContent className="p-6 space-y-4">
              <TablaCustom2
                columns={columnas}
                data={beneficiarios}
                mostrarEditar={!bloquearTodo}
                mostrarAgregarNuevo={!bloquearTodo}
                mostrarEliminar={!bloquearTodo}
                onAgregarNuevoClick={handleAbrirFormulario}
                onEditarClick={handleEditar}
                onEliminarClick={handleEliminar}
              />
            </CardContent>
          </Card>
        </>
      )}

      {/* Modal */}
      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modoEdicion ? "Editar beneficiario" : "Agregar beneficiario"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormGroup label="Nombre">
              <Input
                placeholder="---"
                value={nuevoDato.nombre}
                onChange={(e) => setNuevoDato({ ...nuevoDato, nombre: e.target.value })}
                disabled={bloquearTodo}
              />
            </FormGroup>
            <FormGroup label="Tipo Documento">
              <Select
                value={nuevoDato.idTipoDocumento?.toString() || ""}
                onValueChange={(value) =>
                  setNuevoDato({ ...nuevoDato, idTipoDocumento: Number(value) })
                }
                disabled={bloquearTodo}
              >
                <SelectTrigger className="bg-white border border-gray-300">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {tiposIdentificacion.map((tipo) => (
                    <SelectItem
                      key={tipo.idTipoIdentificacion}
                      value={tipo.idTipoIdentificacion.toString()}
                    >
                      {tipo.tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormGroup>
            <FormGroup label="Número Documento">
              <Input
                placeholder="---"
                value={nuevoDato.numeroDocumento}
                onChange={(e) => setNuevoDato({ ...nuevoDato, numeroDocumento: e.target.value })}
                disabled={bloquearTodo}
              />
            </FormGroup>
            <FormGroup label="Correo electrónico">
              <Input
                placeholder="---"
                type="email"
                value={nuevoDato.correoElectronico}
                onChange={(e) => setNuevoDato({ ...nuevoDato, correoElectronico: e.target.value })}
                disabled={bloquearTodo}
              />
            </FormGroup>
            <FormGroup label="Teléfono">
              <Input
                placeholder="---"
                value={nuevoDato.telefono}
                onChange={(e) => setNuevoDato({ ...nuevoDato, telefono: e.target.value })}
                disabled={bloquearTodo}
              />
            </FormGroup>
            <FormGroup label="Dirección">
              <Input
                placeholder="---"
                value={nuevoDato.direccion}
                onChange={(e) => setNuevoDato({ ...nuevoDato, direccion: e.target.value })}
                disabled={bloquearTodo}
              />
            </FormGroup>
            <FormGroup label="Porcentaje de beneficio">
              <Input
                type="number"
                placeholder="---"
                value={nuevoDato.porcentajeBeneficio}
                onChange={(e) => setNuevoDato({ ...nuevoDato, porcentajeBeneficio: e.target.value })}
                disabled={bloquearTodo}
              />
            </FormGroup>
          </div>
          <DialogFooter className="pt-4">
            <Button
              disabled={loadingGuardar || bloquearTodo}
              onClick={async () => {
                const {
                  nombre,
                  idTipoDocumento,
                  numeroDocumento,
                  correoElectronico,
                  telefono,
                  direccion,
                  porcentajeBeneficio,
                } = nuevoDato;

                if (
                  !nombre.trim() ||
                  !idTipoDocumento ||
                  !numeroDocumento.trim() ||
                  !correoElectronico.trim() ||
                  !telefono.trim() ||
                  !direccion.trim() ||
                  !porcentajeBeneficio
                ) {
                  toast.error("Todos los campos son obligatorios");
                  return;
                }

                setLoadingGuardar(true);
                try {
                  if (modoEdicion) {
                    await editarBeneficiario(nuevoDato.idBeneficiario, nuevoDato);
                    toast.success("Beneficiario actualizado");
                  } else {
                    await crearBeneficiario(nuevoDato);
                    toast.success("Beneficiario creado");
                  }
                  obtenerDatos();
                  setModalAbierto(false);
                  setModoEdicion(false);
                  setNuevoDato({
                    idSolicitudInversion: Number(id),
                    nombre: "",
                    idTipoDocumento: "",
                    numeroDocumento: "",
                    correoElectronico: "",
                    telefono: "",
                    direccion: "",
                    porcentajeBeneficio: "",
                    fechaCreacion: new Date().toISOString(),
                    idUsuarioPropietario: user.idUsuario,
                  });
                } catch (error) {
                  toast.error("No se pudo guardar el beneficiario" + (error.message || ""));
                } finally {
                  setLoadingGuardar(false);
                }
              }}
            >
              {modoEdicion ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
