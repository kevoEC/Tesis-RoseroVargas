import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import TablaCustom2 from "@/components/shared/TablaCustom2";
import GlassLoader from "@/components/ui/GlassLoader";
import { getClienteById, updateCliente } from "@/service/Entidades/ClienteService";
import { getInversionesPorClienteId } from "@/service/Entidades/InversionService";
import { getCasosPorCliente } from "@/service/Entidades/CasosService";
import { toast } from "sonner";
import { FaUser, FaUserTie, FaFileContract, FaFolderOpen, FaArrowLeft } from "react-icons/fa";

// --- Utilidad para iniciales de avatar
function getInitials(cliente) {
  if (!cliente) return "";
  const n = cliente.nombres?.trim()?.[0] || "";
  const a = cliente.apellidoPaterno?.trim()?.[0] || "";
  return (n + a).toUpperCase();
}

// --- FormGroup reusable
function FormGroup({ label, children }) {
  return (
    <div className="space-y-1">
      <Label className="font-medium text-gray-700 text-sm">{label}</Label>
      {children}
    </div>
  );
}

export default function ClienteForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estados principales
  const [cliente, setCliente] = useState(null);
  const [inversiones, setInversiones] = useState([]);
  const [casos, setCasos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({});

  // --- COLUMNAS TABLAS ---
  const columnasInversiones = [
    { key: "numeroContrato", label: "Contrato" },
    { key: "capital", label: "Capital", render: v => `$${Number(v).toLocaleString("es-EC")}` },
    { key: "fechaInicial", label: "Inicio", render: v => v && new Date(v).toLocaleDateString("es-EC") },
    { key: "fechaVencimiento", label: "Vencimiento", render: v => v && new Date(v).toLocaleDateString("es-EC") },
    { key: "tasa", label: "Tasa", render: v => v ? `${Number(v).toFixed(2)}%` : "-" },
    { key: "estado", label: "Estado", render: v => v ? "Vigente" : "Finalizada" },
    {
      key: "acciones",
      label: "Acciones",
      render: (_, row) => (
        <Button size="sm" variant="outline" onClick={() => navigate(`/inversiones/editar/${row.idInversion}`)}>
          Ver Detalle
        </Button>
      ),
    },
  ];
  const columnasCasos = [
    { key: "titulo", label: "Título" },
    { key: "estado", label: "Estado" },
    { key: "fechaCreacion", label: "F. Creación", render: v => v && new Date(v).toLocaleDateString("es-EC") },
    { key: "responsableNombre", label: "Responsable" },
    {
      key: "acciones",
      label: "Acciones",
      render: (_, row) => (
        <Button size="sm" variant="outline" onClick={() => navigate(`/casos/editar/${row.idCaso}`)}>
          Ver Detalle
        </Button>
      ),
    },
  ];

  // --- Cargar datos ---
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const clienteData = await getClienteById(id);
        setCliente(clienteData);

        const inversionesData = await getInversionesPorClienteId(id);
        setInversiones(Array.isArray(inversionesData) ? inversionesData : []);

        const casosData = await getCasosPorCliente(id);
        setCasos(Array.isArray(casosData) ? casosData : []);
      } catch (e) {
        toast.error("Error al cargar datos del cliente" + (e.message ? `: ${e.message}` : ""));
      }
      setLoading(false);
    })();
  }, [id]);

  // --- Edición ---
  const handleEdit = () => {
    setForm({ ...cliente });
    setEditando(true);
  };
  const handleCancel = () => {
    setEditando(false);
    setForm({});
  };
  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateCliente(form);
      toast.success("Cliente actualizado correctamente");
      setEditando(false);
      // Volver a cargar
      const updated = await getClienteById(id);
      setCliente(updated);
    } catch (e) {
      toast.error("Error al actualizar cliente" + (e.message ? `: ${e.message}` : ""));
    }
    setLoading(false);
  };

  if (loading) return <GlassLoader visible message="Cargando cliente..." />;
  if (!cliente) return <div className="text-center text-gray-600">Cargando datos...</div>;

  // HEADER datos
  const avatarColor = "bg-blue-100 text-blue-700";
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header Dynamics */}
      <div className="flex flex-col md:flex-row items-center justify-between border-b pb-4 rounded-2xl px-4 mb-2 bg-white">
        <div className="flex items-center gap-4">
          {/* Avatar grande */}
          <div className={`rounded-full w-14 h-14 flex items-center justify-center text-2xl font-bold shadow ${avatarColor}`}>
            {getInitials(cliente)}
          </div>
          <div>
            <div className="text-xl font-bold">
              {cliente.nombres} {cliente.apellidoPaterno} {cliente.apellidoMaterno}
            </div>
            <div className="text-xs text-gray-500">Cliente</div>
          </div>
        </div>
        <div className="flex gap-8 items-center mt-2 md:mt-0">
          <div className="flex flex-col items-center">
            <span className="font-semibold">{cliente.propietarioNombreCompleto || "Kevin Rosero"}</span>
            <span className="text-xs text-gray-400">Propietario</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-semibold">{cliente.tipoCliente || "Natural"}</span>
            <span className="text-xs text-gray-400">Tipo de cliente</span>
          </div>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => navigate("/clientes/vista")}
          >
            <FaArrowLeft /> Volver a Clientes
          </Button>
        </div>
      </div>

      {/* PRIMER GRID: Detalles personales (2 col) + Tablas derecha (3 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Detalle cliente */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-14">
                <h1 className="text-2xl font-bold">Detalle de Cliente</h1>
                {!editando && (
                  <Button className="ml-auto" onClick={handleEdit} variant="outline">
                    Editar datos
                  </Button>
                )}
              </div>
              {/* GRID SOLO DATOS PERSONALES */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <section>
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">Datos Personales</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-14">
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
        {/* Tablas DERECHA (Inversiones, Casos) */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <FaFileContract className="text-blue-700" />
                <h2 className="font-semibold text-base">Inversiones del Cliente</h2>
              </div>
              <TablaCustom2 columns={columnasInversiones} data={inversiones || []} mostrarEditar={false} mostrarEliminar={false} mostrarAgregarNuevo={false} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <FaFolderOpen className="text-green-700" />
                <h2 className="font-semibold text-base">Casos del Cliente</h2>
              </div>
              <TablaCustom2 columns={columnasCasos} data={casos || []} mostrarEditar={false} mostrarEliminar={false} mostrarAgregarNuevo={false} />
            </CardContent>
          </Card>
        </div>
      </div>
      {/* --- SEGUNDA SECCIÓN: EL RESTO DE CAMPOS, SIEMPRE 2 COLS, FULL WIDTH --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Actividad Económica */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Actividad Económica</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </CardContent>
        </Card>
        {/* Contacto y Ubicación */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Contacto & Ubicación</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </CardContent>
        </Card>
        {/* Cuenta Bancaria */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Cuenta Bancaria</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
