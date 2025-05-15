import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { FaArrowLeft } from "react-icons/fa";
import TablaCustom2 from "@/components/shared/TablaCustom2";
import ModalActividad from "@/components/prospectos/ModalActividad";
import SolicitudInversionForm from "@/pages/Entidad/Solicitudes/SolicitudInversionForm";
import { getProspectoById } from "@/service/Entidades/ProspectoService";
import { getActividadesByProspectoId } from "@/service/Entidades/ActividadService";
import { getSolicitudesByProspectoId } from "@/service/Entidades/SolicitudService";
import { getPrioridad } from "@/service/Catalogos/PrioridadService";
import { getTipoActividad } from "@/service/Catalogos/TipoActividadService";

export default function ProspectoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [prospecto, setProspecto] = useState(null);
  const [actividades, setActividades] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [modalNuevaSolicitud, setModalNuevaSolicitud] = useState(false);
  const [solicitudEditar, setSolicitudEditar] = useState(null);
  const [actividadEditar, setActividadEditar] = useState(null);
  const [tiposActividad, setTiposActividad] = useState([]);
  const [prioridades, setPrioridades] = useState([]);

  useEffect(() => {
    const fetchCatalogos = async () => {
      try {
        const [tipos, prioridadesData] = await Promise.all([
          getTipoActividad(),
          getPrioridad(),
        ]);
        setTiposActividad(tipos);
        setPrioridades(prioridadesData);
      } catch (error) {
        console.error("Error cargando catálogos:", error);
      }
    };
    fetchCatalogos();
  }, []);

  useEffect(() => {
    cargarDatosProspecto();
  }, [id]);

  const cargarDatosProspecto = async () => {
    try {
      const datos = await getProspectoById(id);
      const acts = await getActividadesByProspectoId(id);
      const sols = await getSolicitudesByProspectoId(id);
      setProspecto(datos);
      setActividades(acts);
      setSolicitudes(sols);
    } catch (error) {
      toast.error("Error al cargar prospecto: " + error.message);
    }
  };

  const handleActividadCreada = async () => {
    const acts = await getActividadesByProspectoId(id);
    setActividades(acts);
    setActividadEditar(null);
  };

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
  ];

  if (!prospecto) {
    return <p className="text-center text-gray-600">Cargando prospecto...</p>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <Button variant="outline" onClick={() => navigate("/prospectos/vista")}>Volver al Listado de Prospectos</Button>
      </div>

      <h1 className="text-2xl font-bold text-gray-800">Detalle del Prospecto</h1>

      <Card><CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Info label="Nombre completo" value={`${prospecto.nombres} ${prospecto.apellidoPaterno} ${prospecto.apellidoMaterno}`} />
        <Info label="Correo" value={prospecto.correoElectronico} />
        <Info label="Teléfono" value={prospecto.telefonoCelular} />
        <Info label="Tipo Identificación" value={prospecto.tipoIdentificacion} />
        <Info label="Origen del Cliente" value={prospecto.nombreOrigen} />
        <Info label="Producto de Interés" value={prospecto.productoInteres} />
        <Info label="Agencia" value={prospecto.agencia} />
      </CardContent></Card>

      <h2 className="text-xl font-semibold text-gray-800 mt-8">Actividades</h2>
      <Card><CardContent className="p-6">
        <TablaCustom2
          columns={columnasActividad}
          data={actividades}
          mostrarEditar={true}
          mostrarAgregarNuevo={true}
          mostrarEliminar={true}
          onAgregarNuevoClick={() => setModalOpen(true)}
          onEditarClick={(actividad) => {
            setActividadEditar(actividad);
            setModalEditarOpen(true);
          }}
        />
      </CardContent></Card>

      <h2 className="text-xl font-semibold text-gray-800 mt-8">Solicitudes de Inversión</h2>
      <Card><CardContent className="p-6">
        <TablaCustom2
          columns={columnasInversion}
          data={solicitudes}
          mostrarEditar={true}
          mostrarAgregarNuevo={true}
          mostrarEliminar={false}
          onAgregarNuevoClick={() => setModalNuevaSolicitud(true)}
          onEditarClick={(solicitud) => navigate(`/solicitudes/editar/${solicitud.idSolicitudInversion}`)}
        />
      </CardContent></Card>

      <Dialog open={modalNuevaSolicitud} onOpenChange={setModalNuevaSolicitud}>
        <DialogContent className="min-w-[900px] max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Agregar Solicitud</DialogTitle>
            <DialogDescription>Completa la información de la solicitud.</DialogDescription>
          </DialogHeader>
          <SolicitudInversionForm
            idProspecto={id}
            modo="crear"
            onClose={() => {
              setModalNuevaSolicitud(false);
              cargarDatosProspecto();
            }}
          />
        </DialogContent>
      </Dialog>

      {modalOpen && (
        <ModalActividad
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setActividadEditar(null);
          }}
          idProspecto={id}
          modo="crear"
          onActividadCreada={handleActividadCreada}
          tiposActividad={tiposActividad}
          prioridades={prioridades}
        />
      )}

      {modalEditarOpen && (
        <ModalActividad
          open={modalEditarOpen}
          onClose={() => {
            setModalEditarOpen(false);
            setActividadEditar(null);
          }}
          idProspecto={id}
          modo="editar"
          actividadEditar={actividadEditar}
          onActividadCreada={handleActividadCreada}
          tiposActividad={tiposActividad}
          prioridades={prioridades}
        />
      )}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-base font-medium text-gray-900">{value || "-"}</p>
    </div>
  );
}
