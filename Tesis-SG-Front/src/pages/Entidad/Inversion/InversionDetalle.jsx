// DetalleInversion.jsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import GlassLoader from "@/components/ui/GlassLoader";
import TablaCustom2 from "@/components/shared/TablaCustom2";
import { getInversionById } from "@/service/Entidades/InversionService";
import { getAdendumsPorInversion } from "@/service/Entidades/AdendumService";
import { FaFileContract, FaUserTie, FaFolderOpen, FaArrowLeft } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import AdendumForm from "@/pages/Entidad/Adendum/AdendumForm"; // <-- Asegúrate de la ruta
import { Dialog, DialogContent } from "@/components/ui/dialog"; // o tu modal favorito
import { toast } from "sonner";

// --- Estado Adendum map
const ADENDUM_ESTADO_MAP = {
  1: { label: "Creado", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  2: { label: "Comprobante", color: "bg-blue-100 text-blue-700 border-blue-300" },
  3: { label: "Completado", color: "bg-emerald-100 text-emerald-700 border-emerald-300" },
};

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
function getProductoNombre(inversionNombre) {
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
  const [adendums, setAdendums] = useState([]);
  const [periodos, setPeriodos] = useState([]);

  // ----------- MODAL NUEVO ADENDUM -------------
  const [modalAdendumOpen, setModalAdendumOpen] = useState(false);

  // Recarga todo (para refrescar después de crear adendum)
  const cargarTodo = async () => {
    setLoading(true);
    try {
      const data = await getInversionById(id);
      setInversion(data);

      let arrPeriodos = [];
      if (data?.periodosJson) {
        try {
          arrPeriodos = JSON.parse(data.periodosJson);
        } catch (e) {
          arrPeriodos = [];
        }
      }
      setPeriodos(Array.isArray(arrPeriodos) ? arrPeriodos : []);

      if (data?.idInversion) {
        try {
          const adendumsRes = await getAdendumsPorInversion(data.idInversion);
          setAdendums(adendumsRes?.adendums || []);
        } catch (e) {
          setAdendums([]);
        }
      }
    } catch (e) {
      setInversion(null);
      toast.error("No se pudo cargar la inversión.");
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarTodo();
    // eslint-disable-next-line
  }, [id]);

  // --- Columnas Adendums
  const columnasAdendums = [
    {
      key: "idAdendum",
      label: "",
      render: (value) => (
        <div className="flex items-center justify-center group relative text-gray-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="3" y="5" width="18" height="14" rx="2" className="stroke-current" />
            <path d="M8 2v4" className="stroke-current" />
            <path d="M16 2v4" className="stroke-current" />
          </svg>
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 text-xs text-white bg-zinc-800 px-2 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 whitespace-nowrap">
            ID: {value}
          </span>
        </div>
      )
    },
    { key: "nombreAdendum", label: "Nombre" },
    {
      key: "estado",
      label: "Estado",
      render: (v) => {
        const est = ADENDUM_ESTADO_MAP[v] || { label: "Desconocido", color: "bg-gray-100 text-gray-700 border-gray-300" };
        return (
          <span className={`px-2 py-1 text-xs font-bold rounded-full border ${est.color}`}>
            {est.label}
          </span>
        );
      }
    },
    { key: "fechaCreacion", label: "F. Creación", render: v => formatDate(v) }
  ];

  // --- Gráfica (sin renta acumulada, solo capital, rentabilidad y monto pagar)
  const chartData = periodos.map(p => ({
    Periodo: `P${p.Periodo}`,
    Capital: p.Capital,
    Rentabilidad: p.Rentabilidad,
    MontoPagar: p.MontoPagar
  }));

  // --- Info principal y proyección separadas
  const infoProducto1 = [
    { label: "Producto", value: <b>{getProductoNombre(inversion?.inversionNombre)}</b> },
    { label: "Plazo", value: <b>{inversion?.plazo ? `${inversion.plazo} meses` : "-"}</b> },
    { label: "Tasa", value: <b>{inversion?.tasa ? `${Number(inversion.tasa).toFixed(2)}%` : "-"}</b> },
    { label: "Estado", value: <b>{inversion?.terminada ? "Finalizada" : "Vigente"}</b> },
  ];
  const infoProducto2 = [
    { label: "Capital", value: formatCurrency(inversion?.capital) },
    { label: "Aporte Adicional", value: formatCurrency(inversion?.aporteAdicional) },
    { label: "Valor a Liquidar", value: formatCurrency(inversion?.valorProyectadoLiquidar) },
    { label: "Capital + Rendimiento", value: formatCurrency(inversion?.rendimientosMasCapital) },
    { label: "Rentabilidad Total", value: formatCurrency(inversion?.totalRentabilidad) },
    { label: "Renta Total", value: formatCurrency(inversion?.totalRentaPeriodo) },
    { label: "Fecha Inicial", value: <b>{formatDate(inversion?.fechaInicial)}</b> },
    { label: "Fecha Vencimiento", value: <b>{formatDate(inversion?.fechaVencimiento)}</b> },
    { label: "Coste Operativo", value: formatCurrency(inversion?.totalCosteOperativo) },
    { label: "Coste Notarización", value: formatCurrency(inversion?.costeNotarizacion) },
  ];

  if (loading) return <GlassLoader visible message="Cargando inversión..." />;
  if (!inversion)
    return <div className="text-center text-gray-600">No se encontró la inversión.</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* HEADER estilo Dynamics */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-4 bg-white border-b pb-4 rounded-2xl px-4">
        <Button
          variant="outline"
          className="flex items-center gap-2 mb-2 md:mb-0"
          onClick={() => navigate("/inversiones/vista")}
        >
          <FaArrowLeft />
        </Button>
        <div className="flex-1 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
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
          <div className="text-xs text-gray-500 font-semibold">
            Creada el {formatDate(inversion.fechaCreacion)}
          </div>
        </div>
      </div>

      {/* ---- GRID PRINCIPAL 2x2 ---- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Columna 1 */}
        <div className="flex flex-col gap-8 h-full">
          {/* Info producto */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Información del producto</h2>
              <div className="space-y-1">
                {infoProducto1.map((item, i) => (
                  <InfoRow key={i} label={item.label} value={item.value} />
                ))}
              </div>
            </CardContent>
          </Card>
          {/* -- Caja expansiva junto a tabla -- */}
          <div className="flex flex-col h-full" style={{ minHeight: 280 }}>
            <Card className="flex-1 h-full">
              <CardContent className="p-6 flex flex-col h-full">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Valores de Proyección</h2>
                <div className="space-y-1">
                  {infoProducto2.map((item, i) => (
                    <InfoRow key={i} label={item.label} value={item.value} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Columna 2 */}
        <div className="flex flex-col gap-8 h-full">
          {/* Gráfica Rentabilidad */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-md font-semibold text-gray-700 mb-3">
                Rentabilidad y Capital de la Inversión (por período)
              </h2>
              <div className="w-full min-h-[220px]">
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="Periodo" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Capital" stroke="#6366f1" strokeWidth={2.5} />
                    <Line type="monotone" dataKey="Rentabilidad" stroke="#10b981" strokeWidth={2.5} />
                    <Line type="monotone" dataKey="MontoPagar" stroke="#f59e42" strokeWidth={2.5} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          {/* Tabla Adendums, caja expansiva */}
          <div className="flex flex-col h-full" style={{ minHeight: 280 }}>
            <Card className="flex-1 h-full">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-center gap-2 mb-2">
                  <FaFolderOpen className="text-green-700" />
                  <h2 className="font-semibold text-base">Adendums de la Inversión</h2>
                  <Button
                    className="ml-auto bg-violet-600 hover:bg-violet-700 text-white px-4 py-2"
                    size="sm"
                    onClick={() => setModalAdendumOpen(true)}
                  >
                    Nuevo Adendum
                  </Button>
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
      </div>

      {/* ---- Cronograma ---- */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <FaFolderOpen /> Cronograma de la Inversión
          </h2>
          <TablaCustom2
            columns={[
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
            ]}
            data={periodos}
            mostrarEditar={false}
            mostrarEliminar={false}
            mostrarAgregarNuevo={false}
          />
        </CardContent>
      </Card>

      {/* ---- MODAL NUEVO ADENDUM ---- */}
      <Dialog open={modalAdendumOpen} onOpenChange={setModalAdendumOpen}>
        <DialogContent className="bg-white rounded-xl max-w-lg w-full border">
          <AdendumForm
            inversion={inversion}
            cronograma={periodos}
            onClose={() => setModalAdendumOpen(false)}
            onSaved={() => {
              setModalAdendumOpen(false);
              cargarTodo(); // recarga adendums y todo lo demás
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between border-b last:border-b-0 pb-1 mb-1 last:mb-0 last:pb-0">
      <span className="text-xs text-gray-600">{label}</span>
      <span className="text-sm font-semibold text-gray-900 text-right">{value ?? "-"}</span>
    </div>
  );
}
