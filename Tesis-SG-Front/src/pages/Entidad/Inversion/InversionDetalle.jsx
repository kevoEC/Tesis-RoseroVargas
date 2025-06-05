import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import GlassLoader from "@/components/ui/GlassLoader";
import TablaCustom2 from "@/components/shared/TablaCustom2";
import { getInversionById } from "@/service/Entidades/InversionService";
import { getSolicitudesByClienteId } from "@/service/Entidades/SolicitudService";
import { getAdendumsByInversionId } from "@/service/Entidades/InversionService";
import { FaUserTie, FaFileContract, FaFolderOpen, FaArrowLeft } from "react-icons/fa";
import { Button } from "@/components/ui/button";

function formatCurrency(value) {
  if (value === null || value === undefined) return "-";
  return `$${Number(value).toLocaleString("es-EC", { minimumFractionDigits: 2 })}`;
}
function formatDate(isoDate) {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  return date.toLocaleDateString("es-EC", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Extrae el nombre del producto del contrato (después del primer guión largo)
function getProductoNombre(inversionNombre) {
  // Ejemplo: "SG-FRF-2025-0001 - Renta Fija - $2000 (7 meses)"
  // Extrae "Renta Fija"
  if (!inversionNombre) return "";
  const regex = /- ([^-]+) -/;
  const match = inversionNombre.match(regex);
  if (match && match[1]) {
    return match[1].trim();
  }
  return "";
}

export default function DetalleInversion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [inversion, setInversion] = useState(null);
  const [solicitudes, setSolicitudes] = useState([]);
  const [adendums, setAdendums] = useState([]);
  const [periodos, setPeriodos] = useState([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getInversionById(id);
        setInversion(data);

        // Parsear periodos
        let arrPeriodos = [];
        if (data?.periodosJson) {
          try {
            arrPeriodos = JSON.parse(data.periodosJson);
          } catch (e) {
            console.error("Error al parsear periodosJson:", e);
            arrPeriodos = [];
          }
        }
        setPeriodos(Array.isArray(arrPeriodos) ? arrPeriodos : []);

        // Tablas derechas (Solicitudes y Adendums)
        if (data?.idCliente) {
          const solicitudesRes = await getSolicitudesByClienteId(data.idCliente);
          setSolicitudes(Array.isArray(solicitudesRes) ? solicitudesRes : []);
        }
        if (data?.idInversion) {
          try {
            const adendumsRes = await getAdendumsByInversionId(data.idInversion);
            setAdendums(Array.isArray(adendumsRes) ? adendumsRes : []);
          } catch {
            setAdendums([]);
          }
        }
      } catch (e) {
        console.error("Error al cargar la inversión:", e);
        setInversion(null);
      }
      setLoading(false);
    })();
  }, [id]);

  // Columnas
  const columnasSolicitudes = [
    { key: "nombreTipoSolicitud", label: "Tipo" },
    { key: "numeroContrato", label: "Contrato" },
    { key: "fechaCreacion", label: "F. Creación", render: v => formatDate(v) },
    { key: "faseProceso", label: "Fase" },
  ];

  const columnasAdendums = [
    { key: "nombreDocumento", label: "Nombre" },
    { key: "fechaCreacion", label: "F. Creación", render: v => formatDate(v) },
    { key: "estado", label: "Estado" },
    { key: "usuarioCreacionNombreCompleto", label: "Creado por" },
  ];

  const columnasCronograma = [
    { key: "Periodo", label: "Período" },
    { key: "FechaInicial", label: "Inicio", render: v => formatDate(v) },
    { key: "FechaVencimiento", label: "Vencimiento", render: v => formatDate(v) },
    { key: "Tasa", label: "Tasa", render: v => v ? `${Number(v).toFixed(2)}%` : "-" },
    { key: "AporteAdicional", label: "Aporte Adic.", render: formatCurrency },
    { key: "CapitalOperacion", label: "Capital", render: formatCurrency },
    { key: "Rentabilidad", label: "Rentabilidad", render: formatCurrency },
    { key: "CapitalRenta", label: "Capital+Renta", render: formatCurrency },
    { key: "CostoOperativo", label: "Coste Op.", render: formatCurrency },
    { key: "RentaAcumulada", label: "Renta Acum.", render: formatCurrency },
    { key: "CapitalFinal", label: "Capital Final", render: formatCurrency },
    { key: "MontoPagar", label: "Monto Pagar", render: formatCurrency }
  ];

  if (loading) return <GlassLoader visible message="Cargando inversión..." />;
  if (!inversion)
    return <div className="text-center text-gray-600">No se encontró la inversión.</div>;

  // Layout: Info principal (65%) | Relacionadas (35%) -> puedes cambiar a 7/12 y 5/12 si quieres más espacio para la info principal
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* ---------- HEADER estilo Dynamics ----------- */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-4 bg-white border-b pb-4 rounded-2xl px-4">
        {/* Botón volver */}
        <Button
          variant="outline"
          className="flex items-center gap-2 mb-2 md:mb-0"
          onClick={() => navigate("/inversiones/vista")}
        >
          <FaArrowLeft />
        </Button>
        {/* Header principal */}
        <div className="flex-1 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
          {/* Nombre Inversión y Capital */}
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="rounded-full w-12 h-12 bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
                <FaFileContract />
              </div>
              <div>
                <div className="text-md font-bold text-gray-800">
                  {inversion.inversionNombre}{" "}
                  <span className="font-normal text-gray-500">
                    {inversion.plazo ? `(${inversion.plazo} meses)` : ""}
                  </span>
                </div>
                <div className="text-lg text-blue-800 font-semibold">
                  {formatCurrency(inversion.capital)}
                </div>
              </div>
            </div>
          </div>
          {/* Usuario propietario y Cliente */}
          <div className="flex flex-row gap-8">
            <div className="flex flex-col items-center">
              <div className="text-base text-gray-800 font-semibold flex items-center gap-2">
                <FaUserTie className="text-indigo-700" />
                <span>{inversion.usuarioPropietarioNombreCompleto || "Sin asignar"}</span>
              </div>
              <div className="text-xs text-gray-400">Propietario</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-base text-blue-900 font-semibold">
                {inversion.nombreCompletoCliente}
              </div>
              <div className="text-xs text-gray-400">Cliente</div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- CUERPO PRINCIPAL ----------- */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* --------- Columna Izquierda: Información --------- */}
        <div className="md:col-span-5 space-y-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Información del producto</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* PRODUCTO recortado */}
                <Info label="Producto" value={getProductoNombre(inversion.inversionNombre)} />
                <Info label="Plazo" value={inversion.plazo ? `${inversion.plazo} meses` : "-"} />
                <Info label="Tasa" value={inversion.tasa ? `${Number(inversion.tasa).toFixed(2)}%` : "-"} />
                <Info label="Estado" value={inversion.terminada ? "Finalizada" : "Vigente"} />
                <Info label="Capital" value={formatCurrency(inversion.capital)} />
                <Info label="Aporte Adicional" value={formatCurrency(inversion.aporteAdicional)} />
                <Info label="Coste Operativo" value={formatCurrency(inversion.costeOperativo)} />
                <Info label="Coste Notarización" value={formatCurrency(inversion.costeNotarizacion)} />
                <Info label="Fecha Inicial" value={formatDate(inversion.fechaInicial)} />
                <Info label="Fecha Vencimiento" value={formatDate(inversion.fechaVencimiento)} />
                <Info label="Rentabilidad Total" value={formatCurrency(inversion.totalRentabilidad)} />
                <Info label="Renta Total" value={formatCurrency(inversion.totalRentaPeriodo)} />
                <Info label="Valor a Liquidar" value={formatCurrency(inversion.valorProyectadoLiquidar)} />
                <Info label="Capital + Rendimiento" value={formatCurrency(inversion.rendimientosMasCapital)} />
                <Info label="Usuario Creación" value={inversion.usuarioCreacionNombreCompleto} />
                <Info label="Fecha Creación" value={formatDate(inversion.fechaCreacion)} />
                <Info label="Usuario Modificación" value={inversion.usuarioModificacionNombreCompleto ?? "-"} />
                <Info label="Fecha Modificación" value={formatDate(inversion.fechaModificacion)} />
              </div>
            </CardContent>
          </Card>
        </div>
        {/* --------- Columna Derecha: Relacionadas --------- */}
        <div className="md:col-span-7 flex flex-col gap-6">
          {/* Solicitudes de Inversión */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <FaFileContract className="text-blue-700" />
                <h2 className="font-semibold text-base">Solicitudes de Inversión</h2>
              </div>
              <TablaCustom2
                columns={columnasSolicitudes}
                data={solicitudes}
                mostrarEditar={false}
                mostrarEliminar={false}
                mostrarAgregarNuevo={true}
                onAgregarNuevoClick={() => navigate("/solicitudes/nuevo")}
              />
            </CardContent>
          </Card>
          {/* ADENDUMS */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <FaFolderOpen className="text-green-700" />
                <h2 className="font-semibold text-base">Adendums</h2>
              </div>
              <TablaCustom2
                columns={columnasAdendums}
                data={adendums}
                mostrarEditar={false}
                mostrarEliminar={false}
                mostrarAgregarNuevo={false}
              />
            </CardContent>
          </Card>
        </div>
      </div>
      {/* --------- Cronograma --------- */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <FaFolderOpen /> Cronograma de la Inversión
          </h2>
          <TablaCustom2
            columns={columnasCronograma}
            data={periodos}
            mostrarEditar={false}
            mostrarEliminar={false}
            mostrarAgregarNuevo={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-base font-medium text-gray-900">{value ?? "-"}</p>
    </div>
  );
}
