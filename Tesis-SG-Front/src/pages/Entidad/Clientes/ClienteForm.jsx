import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import TablaCustom2 from "@/components/shared/TablaCustom2";
import GlassLoader from "@/components/ui/GlassLoader";
import { getClienteById, updateCliente } from "@/service/Entidades/ClienteService";
import { getSolicitudesByClienteId } from "@/service/Entidades/SolicitudService";
import { toast } from "sonner";
import { FaUserTie, FaFileContract, FaFolderOpen } from "react-icons/fa";

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-base font-medium text-gray-900">{value ?? "-"}</p>
    </div>
  );
}

export default function ClienteForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estados principales
  const [cliente, setCliente] = useState(null);
  const [solicitudes, setSolicitudes] = useState([]);
  const [inversiones, setInversiones] = useState([]);
  const [casos, setCasos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({}); // Para edición

  // Cargar datos al montar
  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const clienteData = await getClienteById(id);
      setCliente(clienteData);

      // Asumiendo que tienes servicios para traer inversiones y casos:
      // const inversionesData = await getInversionesByClienteId(id);
      // setInversiones(Array.isArray(inversionesData) ? inversionesData : []);

      const solicitudesData = await getSolicitudesByClienteId(id);
      setSolicitudes(Array.isArray(solicitudesData) ? solicitudesData : []);
      // Casos y otras tablas pueden ir aquí...

    } catch (e) {
      toast.error("Error al cargar datos del cliente");
    }
    setLoading(false);
  };

  // Habilitar edición
  const handleEdit = () => {
    setForm({ ...cliente });
    setEditando(true);
  };

  // Cancelar edición
  const handleCancel = () => {
    setEditando(false);
    setForm({});
  };

  // Actualizar campos del formulario
  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Guardar cambios
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateCliente(form); // Envía solo los campos editables (DTO)
      toast.success("Cliente actualizado correctamente");
      setEditando(false);
      cargarDatos();
    } catch (e) {
      toast.error("Error al actualizar cliente");
    }
    setLoading(false);
  };

  if (loading) return <GlassLoader visible message="Cargando cliente..." />;

  if (!cliente) return <div className="text-center text-gray-600">Cargando datos...</div>;

  // --- Columnas para las tablas de la derecha
  const columnasSolicitudes = [
    { key: "idSolicitudInversion", label: "ID" },
    { key: "nombreTipoSolicitud", label: "Tipo" },
    { key: "numeroContrato", label: "Contrato" },
    { key: "fechaCreacion", label: "F. Creación", render: v => new Date(v).toLocaleDateString() },
    { key: "faseProceso", label: "Fase" },
  ];
  // Puedes agregar columnas de inversión y casos si tienes esos datos

  return (
    <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* ---------- Columna principal: Formulario Cliente ----------- */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardContent className="p-6 space-y-8">
            <div className="flex items-center gap-2">
              <FaUserTie className="w-7 h-7 text-blue-600" />
              <h1 className="text-2xl font-bold">Detalle de Cliente</h1>
              {!editando && (
                <Button className="ml-auto" onClick={handleEdit} variant="outline">
                  Editar datos
                </Button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* DATOS PERSONALES */}
              <section>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Datos Personales</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormGroup label="Nombres">
                    <Input disabled value={editando ? form.nombres : cliente.nombres} onChange={e => handleChange("nombres", e.target.value)} />
                  </FormGroup>
                  <FormGroup label="Apellido Paterno">
                    <Input disabled value={editando ? form.apellidoPaterno : cliente.apellidoPaterno} onChange={e => handleChange("apellidoPaterno", e.target.value)} />
                  </FormGroup>
                  <FormGroup label="Apellido Materno">
                    <Input disabled value={editando ? form.apellidoMaterno : cliente.apellidoMaterno} onChange={e => handleChange("apellidoMaterno", e.target.value)} />
                  </FormGroup>
                  <FormGroup label="Número Documento">
                    <Input disabled value={editando ? form.numeroDocumento : cliente.numeroDocumento} />
                  </FormGroup>
                  <FormGroup label="Fecha Nacimiento">
                    <Input type="date" disabled={!editando} value={editando ? form.fechaNacimiento : cliente.fechaNacimiento?.slice(0, 10)} onChange={e => handleChange("fechaNacimiento", e.target.value)} />
                  </FormGroup>
                  <FormGroup label="Tipo Cliente">
                    <Input disabled value={cliente.tipoCliente} />
                  </FormGroup>
                  <FormGroup label="Tipo Identificación">
                    <Input disabled value={cliente.tipoIdentificacion} />
                  </FormGroup>
                  <FormGroup label="Género">
                    <Input disabled={!editando} value={editando ? form.genero : cliente.genero} onChange={e => handleChange("genero", e.target.value)} />
                  </FormGroup>
                  <FormGroup label="Estado Civil">
                    <Input disabled={!editando} value={editando ? form.estadoCivil : cliente.estadoCivil} onChange={e => handleChange("estadoCivil", e.target.value)} />
                  </FormGroup>
                  <FormGroup label="Nacionalidad">
                    <Input disabled={!editando} value={editando ? form.nacionalidad : cliente.nacionalidad} onChange={e => handleChange("nacionalidad", e.target.value)} />
                  </FormGroup>
                  <FormGroup label="Nivel Académico">
                    <Input disabled={!editando} value={editando ? form.nivelAcademico : cliente.nivelAcademico} onChange={e => handleChange("nivelAcademico", e.target.value)} />
                  </FormGroup>
                </div>
              </section>

              {/* ACTIVIDAD ECONÓMICA */}
              <section>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Actividad Económica</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormGroup label="Actividad Principal">
                    <Input disabled={!editando} value={editando ? form.actividadEconomicaPrincipal : cliente.actividadEconomicaPrincipal} onChange={e => handleChange("actividadEconomicaPrincipal", e.target.value)} />
                  </FormGroup>
                  <FormGroup label="Lugar Trabajo">
                    <Input disabled={!editando} value={editando ? form.lugarTrabajo : cliente.lugarTrabajo} onChange={e => handleChange("lugarTrabajo", e.target.value)} />
                  </FormGroup>
                  <FormGroup label="Correo Trabajo">
                    <Input disabled={!editando} value={editando ? form.correoTrabajo : cliente.correoTrabajo} onChange={e => handleChange("correoTrabajo", e.target.value)} />
                  </FormGroup>
                  <FormGroup label="Otra Actividad">
                    <Input disabled={!editando} value={editando ? form.otraActividad : cliente.otraActividad} onChange={e => handleChange("otraActividad", e.target.value)} />
                  </FormGroup>
                  <FormGroup label="Cargo">
                    <Input disabled={!editando} value={editando ? form.cargo : cliente.cargo} onChange={e => handleChange("cargo", e.target.value)} />
                  </FormGroup>
                  <FormGroup label="Antigüedad">
                    <Input disabled={!editando} value={editando ? form.antiguedad : cliente.antiguedad} onChange={e => handleChange("antiguedad", e.target.value)} />
                  </FormGroup>
                  <FormGroup label="Teléfono Trabajo">
                    <Input disabled={!editando} value={editando ? form.telefonoTrabajo : cliente.telefonoTrabajo} onChange={e => handleChange("telefonoTrabajo", e.target.value)} />
                  </FormGroup>
                  <FormGroup label="Fecha Inicio Actividad">
                    <Input type="date" disabled={!editando} value={editando ? form.fechaInicioActividad : cliente.fechaInicioActividad?.slice(0,10)} onChange={e => handleChange("fechaInicioActividad", e.target.value)} />
                  </FormGroup>
                  <FormGroup label="Dirección Trabajo">
                    <Input disabled={!editando} value={editando ? form.direccionTrabajo : cliente.direccionTrabajo} onChange={e => handleChange("direccionTrabajo", e.target.value)} />
                  </FormGroup>
                  <FormGroup label="Referencia Dirección">
                    <Input disabled={!editando} value={editando ? form.referenciaDireccionTrabajo : cliente.referenciaDireccionTrabajo} onChange={e => handleChange("referenciaDireccionTrabajo", e.target.value)} />
                  </FormGroup>
                  <FormGroup label="Es PEP">
                    <Input disabled={!editando} value={editando ? form.esPEP : cliente.esPEP} onChange={e => handleChange("esPEP", e.target.value)} />
                  </FormGroup>
                </div>
              </section>

              {/* CONTACTO Y UBICACIÓN */}
              <section>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Contacto & Ubicación</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormGroup label="Correo Electrónico">
                    <Input disabled={!editando} value={editando ? form.correoElectronico : cliente.correoElectronico} onChange={e => handleChange("correoElectronico", e.target.value)} />
                  </FormGroup>
                  <FormGroup label="Teléfono Celular">
                    <Input disabled={!editando} value={editando ? form.telefonoCelular : cliente.telefonoCelular} onChange={e => handleChange("telefonoCelular", e.target.value)} />
                  </FormGroup>
                  <FormGroup label="Otro Teléfono">
                    <Input disabled={!editando} value={editando ? form.otroTelefono : cliente.otroTelefono} onChange={e => handleChange("otroTelefono", e.target.value)} />
                  </FormGroup>
                  <FormGroup label="Teléfono Fijo">
                    <Input disabled={!editando} value={editando ? form.telefonoFijo : cliente.telefonoFijo} onChange={e => handleChange("telefonoFijo", e.target.value)} />
                  </FormGroup>
                  <FormGroup label="Calle Principal">
                    <Input disabled={!editando} value={editando ? form.callePrincipal : cliente.callePrincipal} onChange={e => handleChange("callePrincipal", e.target.value)} />
                  </FormGroup>
                  <FormGroup label="Número Domicilio">
                    <Input disabled={!editando} value={editando ? form.numeroDomicilio : cliente.numeroDomicilio} onChange={e => handleChange("numeroDomicilio", e.target.value)} />
                  </FormGroup>
                  <FormGroup label="Calle Secundaria">
                    <Input disabled={!editando} value={editando ? form.calleSecundaria : cliente.calleSecundaria} onChange={e => handleChange("calleSecundaria", e.target.value)} />
                  </FormGroup>
                  <FormGroup label="Referencia Domicilio">
                    <Input disabled={!editando} value={editando ? form.referenciaDomicilio : cliente.referenciaDomicilio} onChange={e => handleChange("referenciaDomicilio", e.target.value)} />
                  </FormGroup>
                  <FormGroup label="Sector/Barrio">
                    <Input disabled={!editando} value={editando ? form.sectorBarrio : cliente.sectorBarrio} onChange={e => handleChange("sectorBarrio", e.target.value)} />
                  </FormGroup>
                  <FormGroup label="Tiempo Residencia">
                    <Input disabled={!editando} value={editando ? form.tiempoResidencia : cliente.tiempoResidencia} onChange={e => handleChange("tiempoResidencia", e.target.value)} />
                  </FormGroup>
                  <FormGroup label="País">
                    <Input disabled={!editando} value={editando ? form.pais : cliente.pais} onChange={e => handleChange("pais", e.target.value)} />
                  </FormGroup>
                  <FormGroup label="Provincia">
                    <Input disabled={!editando} value={editando ? form.provincia : cliente.provincia} onChange={e => handleChange("provincia", e.target.value)} />
                  </FormGroup>
                  <FormGroup label="Ciudad">
                    <Input disabled={!editando} value={editando ? form.ciudad : cliente.ciudad} onChange={e => handleChange("ciudad", e.target.value)} />
                  </FormGroup>
                </div>
              </section>

              {/* CUENTA BANCARIA */}
              <section>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Cuenta Bancaria</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormGroup label="Banco">
                    <Input disabled={!editando} value={editando ? form.bancoNombre : cliente.bancoNombre} onChange={e => handleChange("bancoNombre", e.target.value)} />
                  </FormGroup>
                  <FormGroup label="Tipo de Cuenta">
                    <Input disabled={!editando} value={editando ? form.tipoCuenta : cliente.tipoCuenta} onChange={e => handleChange("tipoCuenta", e.target.value)} />
                  </FormGroup>
                  <FormGroup label="Número de Cuenta">
                    <Input disabled={!editando} value={editando ? form.numeroCuenta : cliente.numeroCuenta} onChange={e => handleChange("numeroCuenta", e.target.value)} />
                  </FormGroup>
                </div>
              </section>

              {/* BOTONES */}
              {editando && (
                <div className="flex gap-4 justify-end pt-4">
                  <Button type="button" variant="secondary" onClick={handleCancel}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-primary text-white">
                    Guardar cambios
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>

      {/* --------- Columna derecha: Tablas Relacionadas --------- */}
      <div className="flex flex-col gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <FaFileContract className="text-blue-700" />
              <h2 className="font-semibold text-base">Solicitudes de Inversión</h2>
            </div>
            <TablaCustom2 columns={columnasSolicitudes} data={solicitudes || []} mostrarEditar={false} mostrarEliminar={false} mostrarAgregarNuevo={false} />
          </CardContent>
        </Card>
        {/* Puedes agregar aquí tablas de inversiones y casos con el mismo patrón */}
        {/* ... */}
      </div>
    </div>
  );
}

// Componente FormGroup reutilizable
function FormGroup({ label, children }) {
  return (
    <div className="space-y-1">
      <Label className="font-medium text-gray-700 text-sm">{label}</Label>
      {children}
    </div>
  );
}
