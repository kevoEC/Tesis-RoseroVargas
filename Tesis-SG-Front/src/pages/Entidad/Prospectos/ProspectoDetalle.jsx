import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TablaCustom2 from "@/components/shared/TablaCustom2";
import GlassLoader from "@/components/ui/GlassLoader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import ModalActividad from "@/components/prospectos/ModalActividad";
import SolicitudInversionForm from "@/pages/Entidad/Solicitudes/SolicitudInversionForm";
import { getProspectoById } from "@/service/Entidades/ProspectoService";
import { getActividadesByProspectoId } from "@/service/Entidades/ActividadService";
import { getSolicitudesByProspectoId } from "@/service/Entidades/SolicitudService";
import { getPrioridad } from "@/service/Catalogos/PrioridadService";
import { getTipoActividad } from "@/service/Catalogos/TipoActividadService";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

const FASE_PROCESO_MAP = {
  1: { label: "Llenado de Información", color: "bg-yellow-100 text-yellow-700" },
  2: { label: "Tareas Generadas", color: "bg-blue-100 text-blue-700" },
  3: { label: "Solicitud Rechazada", color: "bg-red-100 text-red-700" },
  4: { label: "Completada", color: "bg-green-100 text-green-700" },
};

export default function ProspectoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [prospecto, setProspecto] = useState(null);
  const [actividades, setActividades] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [modalNuevaSolicitud, setModalNuevaSolicitud] = useState(false);

  const [actividadEditar, setActividadEditar] = useState(null);

  const [tiposActividad, setTiposActividad] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [alertFaltaActividad, setAlertFaltaActividad] = useState(false);

  useEffect(() => {
    setLoading(true);
    cargarDatosProspecto();
    // eslint-disable-next-line
  }, [id]);

  const cargarDatosProspecto = async () => {
    try {
      const [datos, acts, sols, tipos, prios] = await Promise.all([
        getProspectoById(id),
        getActividadesByProspectoId(id),
        getSolicitudesByProspectoId(id),
        getTipoActividad(),
        getPrioridad(),
      ]);
      setProspecto(datos);
      setActividades(acts);
      setSolicitudes(sols);
      setTiposActividad(tipos);
      setPrioridades(prios);
    } catch (error) {
      toast.error("Error al cargar prospecto: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Validación para crear solicitud (debe haber una actividad en estado true)
  const puedeCrearSolicitud = actividades.some(a => a.estado === true);

  // --- Validaciones ---
  const handleAgregarSolicitud = () => {
    if (prospecto?.esCliente) return;
    if (!puedeCrearSolicitud) {
      setAlertFaltaActividad(true);
      return;
    }
    setModalNuevaSolicitud(true);
  };

  const handleAgregarActividad = () => {
    if (prospecto?.esCliente) return;
    setModalOpen(true);
  };

  // SOLO LECTURA SI ES CLIENTE
  const esSoloLectura = !!prospecto?.esCliente;

  // --- COLUMNAS ---
  const columnasActividad = [
    {
      key: "idActividad",
      label: "",
      render: (value) => (
        <div className="flex items-center justify-center group relative text-gray-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17h6m-6-4h6m2 9a2 2 0 002-2V7a2 2 0 00-2-2h-3.586a1 1 0 01-.707-.293l-1.414-1.414A1 1 0 0011.586 3H9a2 2 0 00-2 2v14a2 2 0 002 2h6z" />
          </svg>
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 text-xs text-white bg-zinc-800 px-2 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 whitespace-nowrap">
            ID: {value}
          </span>
        </div>
      )
    },
    { key: "nombreTipoActividad", label: "Tipo" },
    { key: "asunto", label: "Asunto" },
    {
      key: "descripcion",
      label: "Descripción",
      render: (value) => <span className="max-w-12 truncate block">{value}</span>,
    },
    { key: "duracion", label: "Duración" },
    { key: "vencimiento", label: "Vencimiento" },
    { key: "nombrePrioridad", label: "Prioridad" },
    {
      key: "estado",
      label: "Estado",
      render: (value) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${value ? "bg-emerald-100 text-emerald-700" : "bg-yellow-200 text-yellow-700"}`}>
          {value ? "Finalizada" : "En Progreso"}
        </span>
      )
    },
  ];

  const columnasInversion = [
    {
      key: "idSolicitudInversion",
      label: "",
      render: (value) => (
        <div className="flex items-center justify-center group relative text-gray-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6M5 4v16h14V4H5zm2 2h10v12H7V6z" />
          </svg>
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 text-xs text-white bg-zinc-800 px-2 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 whitespace-nowrap">
            ID: {value}
          </span>
        </div>
      )
    },
    { key: "numeroDocumento", label: "N° Documento", render: (_, row) => row.identificacion?.numeroDocumento || "—" },
    { key: "nombreTipoSolicitud", label: "Tipo Solicitud", render: (_, row) => row.identificacion?.nombreTipoSolicitud || "—" },
    { key: "nombreTipoCliente", label: "Tipo Cliente", render: (_, row) => row.identificacion?.nombreTipoCliente || "—" },
    { key: "nombreTipoDocumento", label: "Tipo Documento", render: (_, row) => row.identificacion?.nombreTipoDocumento || "—" },
    { key: "nombreCompletoProspecto", label: "Nombre Prospecto" },
    {
      key: "faseProceso",
      label: "Fase Proceso",
      render: (value) => {
        const fase = FASE_PROCESO_MAP[value] || { label: "Desconocido", color: "bg-gray-100 text-gray-500" };
        return (
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${fase.color}`}>
            {fase.label}
          </span>
        );
      }
    }
  ];

  // Loader Dynamics
  if (loading || !prospecto) {
    return <GlassLoader visible message="Cargando prospecto..." />;
  }

  // Estado badge
  const estadoBadge = prospecto?.esCliente ? (
    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold ml-2">Cliente</span>
  ) : (
    <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-semibold ml-2">Prospecto</span>
  );

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto bg-white rounded-2xl shadow-lg relative">
      {/* Candado Dynamics */}
      {esSoloLectura && (
        <div
          className="w-full flex items-center px-6 py-2 bg-gray-50 border-b border-gray-300 shadow-sm mb-4 z-50 rounded-t-xl"
          style={{ position: "sticky", top: 0 }}
        >
          <Lock className="text-gray-700 w-5 h-5 mr-2" />
          <span className="font-semibold text-gray-700 text-sm">
            Solo lectura: este prospecto ya es cliente. No se pueden agregar actividades ni solicitudes.
          </span>
        </div>
      )}

      {/* HEADER Dynamics */}
      <div className="flex flex-wrap items-center gap-4 mb-3">
        <Button variant="outline" onClick={() => navigate("/prospectos/vista")} className="px-5 py-2">← Volver</Button>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          {prospecto?.nombres} {prospecto?.apellidoPaterno} {prospecto?.apellidoMaterno}
        </h1>
        <span className="text-base text-gray-500 ml-2"><b>ID:</b> {prospecto?.idProspecto}</span>
        {estadoBadge}
      </div>
      <div className="flex flex-wrap text-xs text-gray-700 mb-6 border-b pb-2 gap-8">
        <span><b>Correo:</b> {prospecto?.correoElectronico || "-"}</span>
        <span><b>Teléfono:</b> {prospecto?.telefonoCelular || "-"}</span>
        <span><b>Tipo Identificación:</b> {prospecto?.tipoIdentificacion || "-"}</span>
        <span><b>Origen:</b> {prospecto?.nombreOrigen || "-"}</span>
        <span><b>Producto Interés:</b> {prospecto?.productoInteres || "-"}</span>
        <span><b>Agencia:</b> {prospecto?.agencia || "-"}</span>
      </div>

      {/* Layout tipo Dynamics: Izquierda 1/3, Derecha 2/3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Panel izquierdo: Opciones */}
        <section className="border rounded-xl p-6 shadow-sm flex flex-col gap-4 min-h-[360px] col-span-1 bg-white">
          <div>
            <div className="font-semibold text-gray-800 mb-2">Opciones</div>
            <Button
              className="bg-violet-600 hover:bg-violet-700 text-white w-full"
              disabled={esSoloLectura}
              onClick={handleAgregarActividad}
            >
              + Agregar actividad
            </Button>
            <Button
              className="bg-violet-600 hover:bg-violet-700 text-white w-full mt-4"
              disabled={esSoloLectura}
              onClick={handleAgregarSolicitud}
            >
              + Crear solicitud de inversión
            </Button>
          </div>
        </section>

        {/* Panel derecho: Tablas */}
        <section className="col-span-2 flex flex-col gap-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <span className="font-semibold text-lg text-gray-700">Actividades</span>
            </div>
            <TablaCustom2
              columns={columnasActividad}
              data={actividades}
              mostrarEditar={!esSoloLectura}
              mostrarAgregarNuevo={!esSoloLectura}
              mostrarEliminar={!esSoloLectura}
              onAgregarNuevoClick={handleAgregarActividad}
              onEditarClick={actividad => {
                setActividadEditar(actividad);
                setModalEditarOpen(true);
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-4 mb-2">
              <span className="font-semibold text-lg text-gray-700">Solicitudes de Inversión</span>
            </div>
            <TablaCustom2
              columns={columnasInversion}
              data={solicitudes}
              mostrarEditar={true}
              mostrarAgregarNuevo={!esSoloLectura}
              mostrarEliminar={false}
              onAgregarNuevoClick={handleAgregarSolicitud}
              onEditarClick={solicitud => navigate(`/solicitudes/editar/${solicitud.idSolicitudInversion}`)}
            />
          </div>
        </section>
      </div>

      {/* Modal para nueva solicitud */}
      <AlertDialog open={modalNuevaSolicitud} onOpenChange={setModalNuevaSolicitud}>
        <AlertDialogContent className="bg-white border border-gray-300 rounded-xl shadow-xl p-7 max-w-4xl w-full">
          <AlertDialogHeader>
            <AlertDialogTitle>Agregar Solicitud</AlertDialogTitle>
            <div className="text-gray-700 mb-2">Completa la información de la solicitud.</div>
          </AlertDialogHeader>
          <SolicitudInversionForm
            idProspecto={id}
            modo="crear"
            onClose={() => {
              setModalNuevaSolicitud(false);
              cargarDatosProspecto();
            }}
          />
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal para nueva actividad */}
      <ModalActividad
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setActividadEditar(null);
          cargarDatosProspecto();
        }}
        idProspecto={id}
        modo="crear"
        onActividadCreada={cargarDatosProspecto}
        tiposActividad={tiposActividad}
        prioridades={prioridades}
      />
      {/* Modal para editar actividad */}
      <ModalActividad
        open={modalEditarOpen}
        onClose={() => {
          setModalEditarOpen(false);
          setActividadEditar(null);
          cargarDatosProspecto();
        }}
        idProspecto={id}
        modo="editar"
        actividadEditar={actividadEditar}
        onActividadCreada={cargarDatosProspecto}
        tiposActividad={tiposActividad}
        prioridades={prioridades}
      />

      {/* Alert: No puede crear solicitud sin actividades válidas */}
      <AlertDialog open={alertFaltaActividad} onOpenChange={setAlertFaltaActividad}>
        <AlertDialogContent className="bg-white border border-yellow-300 rounded-xl shadow-xl p-7 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-yellow-700">No hay actividades válidas</AlertDialogTitle>
            <div className="text-gray-700 mt-2">
              Para crear una solicitud de inversión, primero debe registrar al menos <b>una actividad finalizada</b> (en estado "Finalizada") para este prospecto.
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border border-gray-300 bg-white hover:bg-gray-50">Cerrar</AlertDialogCancel>
            <AlertDialogAction asChild>
              <button
                className="bg-violet-600 text-white hover:bg-violet-700 px-4 py-2 rounded"
                onClick={() => setAlertFaltaActividad(false)}
                type="button"
              >
                OK
              </button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
