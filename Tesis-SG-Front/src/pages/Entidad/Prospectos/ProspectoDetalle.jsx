import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { FaEdit, FaTrash, FaSort, FaSortUp, FaSortDown, FaPlus, FaFileExport, FaFilePdf, FaFileCsv, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, } from "@/components/ui/table";
import ModalActividad from "@/components/prospectos/ModalActividad";
import { getProspectoById } from "@/service/Entidades/ProspectoService";
import { getActividadesByProspectoId } from "@/service/Entidades/ActividadService";
import { getSolicitudesByProspectoId } from "@/service/Entidades/SolicitudService";
import TablaCustom2 from "@/components/shared/TablaCustom2";
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
  const [actividadEditar, setActividadEditar] = useState(null);

  const [tiposActividad, setTiposActividad] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [catalogosCargados, setCatalogosCargados] = useState(false);

  useEffect(() => {
    const fetchCatalogos = async () => {
      try {
        const [tipos, prioridadesData] = await Promise.all([
          getTipoActividad(),
          getPrioridad(),
        ]);
        console.log("🧾 tipos desde API:", tipos);
        console.log("🧾 prioridades desde API:", prioridadesData);
        setTiposActividad(tipos);
        setPrioridades(prioridadesData);
        setCatalogosCargados(true); // ✅ importante
      } catch (error) {
        console.error("Error cargando catálogos:", error);
      }
    };

    fetchCatalogos();
  }, []);

  useEffect(() => {
    const cargar = async () => {
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

    cargar();
  }, [id]);

  const handleActividadCreada = async () => {
    const acts = await getActividadesByProspectoId(id);
    setActividades(acts);
    setActividadEditar(null);
  };

  if (!prospecto) {
    return <p className="text-center text-gray-600">Cargando prospecto...</p>;
  }

  const columnasActividad = [
    { key: "nombreTipoActividad", label: "Tipo" },
    { key: "asunto", label: "Asunto" },
    {
      key: "descripcion",
      label: "Descripción",
      render: (value) => (
        <span
          className={`max-w-12`}
        >
          {value}
        </span>
      ),
    },
    { key: "duracion", label: "Duración" },
    { key: "vencimiento", label: "Vencimiento" },
    { key: "nombrePrioridad", label: "Prioridad" },
    {
      key: "estado",
      label: "Estado",
      render: (value) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full 
            ${value
            ? "bg-emerald-100 text-emerald-700"
            : "bg-yellow-200 text-yellow-700"
            }`}
        >
          {value ? "Finalizada" : "En Progreso"}
        </span>
      ),
    },
  ];

  const columnasInversion = [
    { key: "idProspecto", label: "Número de Contacto" },
    { key: "nombres", label: "Nombre de Prospecto" },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/********************** Encabezado ***********************/}
      <div>
        <Button variant="outline" onClick={() => navigate("/prospectos/vista")}>
          <span className="flex items-center gap-1">
            <FaArrowLeft /> Volver al Listado de Prospectos
          </span>
        </Button>
      </div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          Detalle del Prospecto
        </h1>
      </div>

      {/*********  Información del prospecto ***********/}
      <Card>
        <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Info
            label="Nombre completo"
            value={`${prospecto.nombres} ${prospecto.apellidoPaterno} ${prospecto.apellidoMaterno}`}
          />
          <Info label="Correo" value={prospecto.correoElectronico} />
          <Info label="Teléfono" value={prospecto.telefonoCelular} />
          <Info
            label="Tipo Identificación"
            value={prospecto.tipoIdentificacion}
          />
          <Info label="Origen del Cliente" value={prospecto.nombreOrigen} />
          <Info
            label="Producto de Interés"
            value={prospecto.productoInteres}
          />
          <Info label="Agencia" value={prospecto.agencia} />
        </CardContent>
      </Card>

      {/************ Actividades ***********/}
      <div className="flex items-center justify-between mt-8">
        <h2 className="text-xl font-semibold text-gray-800">Actividades</h2>
        {/* <Button
          onClick={() => setModalOpen(true)}
          className="bg-blue-600  text-white hover:bg-blue-200 hover:text-gray-700 hover:shadow-xl"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Nueva Actividad
        </Button> */}
      </div>
      <Card>
        <CardContent className="p-6">
          <TablaCustom2
            columns={columnasActividad}
            data={actividades}
            mostrarEditar={true}
            mostrarAgregarNuevo={true}
            mostrarEliminar={true}
            onAgregarNuevoClick={() => setModalOpen(true)}
            onEditarClick={(actividad) => {
              setActividadEditar(actividad); // <-- aquí ya tienes el id y todo
              setModalEditarOpen(true);
            }}
          // onEditarClick={() => setModalEditarOpen(true)}
          // onEliminarClick={handleEliminar}
          />
        </CardContent>
      </Card>
      {/* <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Asunto</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Duración</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {actividades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500 py-4">
                    No hay actividades registradas.
                  </TableCell>
                </TableRow>
              ) : (
                actividades.map((act) => (
                  <TableRow key={act.idActividad}>
                    <TableCell>{act.tipoActividad?.descripcion}</TableCell>
                    <TableCell>{act.asunto}</TableCell>
                    <TableCell>{act.descripcion}</TableCell>
                    <TableCell>{act.duracion}</TableCell>
                    <TableCell>{new Date(act.vencimiento).toLocaleString()}</TableCell>
                    <TableCell>{act.prioridad?.categoria}</TableCell>
                    <TableCell>
                      <span className={act.estado ? "text-green-600" : "text-yellow-600"}>
                        {act.estado ? "Finalizada" : "En progreso"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card> */}

      {/* Solicitudes de Inversión */}
      <div className="flex items-center justify-between mt-8">
        <h2 className="text-xl font-semibold text-gray-800">
          Solicitudes de Inversión
        </h2>
        {/* <Button
          onClick={() => navigate(`/solicitudes/nueva/${id}`)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Nueva Solicitud de Inversión
        </Button> */}
      </div>

      <Card>
        <CardContent className="p-6">
          <TablaCustom2
            columns={columnasInversion}
            data={[]}
            mostrarEditar={true}
            mostrarAgregarNuevo={true}
            mostrarEliminar={true}
          // onEditarClick={handleEditar}
          // onEliminarClick={handleEliminar}
          />
        </CardContent>
      </Card>

      {/* <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número de Contrato</TableHead>
                <TableHead>Nombre del Prospecto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {solicitudes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-gray-500 py-4">
                    No hay solicitudes registradas.
                  </TableCell>
                </TableRow>
              ) : (
                solicitudes.map((sol) => (
                  <TableRow key={sol.idSolicitudInversion}>
                    <TableCell>{sol.numeroContrato}</TableCell>
                    <TableCell>
                      {sol.prospecto?.nombres} {sol.prospecto?.apellidoPaterno}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card> */}

      {/* Modal de Actividad */}
      {modalOpen && (
        <ModalActividad
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setActividadEditar(null);
          }}
          className="bg-amber-50"
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
          className="bg-amber-50"
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
