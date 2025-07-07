import { useEffect, useState } from "react";
import {
  getDashboardProspectosEstadisticas,
  getDashboardSolicitudesEstadisticas,
  getDashboardTareasEstadisticas,
  getDashboardClientesEstadisticas,
  getDashboardInversionesEstadisticas,
  getDashboardPagosCasosEstadisticas,
} from "@/service/Dashboard/DashboardService";
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend, ResponsiveContainer
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import GlassLoader from "@/components/ui/GlassLoader";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const PIE_COLORS = ["#7c3aed", "#6366f1", "#a5b4fc", "#818cf8", "#ddd6fe", "#c7d2fe", "#8b5cf6", "#a21caf", "#10b981", "#fbbf24"];
const BAR_COLORS = ["#7c3aed", "#6366f1", "#a5b4fc", "#818cf8", "#f59e42", "#22c55e"];

export default function DashboardPanel() {
  const [loading, setLoading] = useState(true);
  const [prospectos, setProspectos] = useState(null);
  const [solicitudes, setSolicitudes] = useState(null);
  const [tareas, setTareas] = useState(null);
  const [clientes, setClientes] = useState(null);
  const [inversiones, setInversiones] = useState(null);
  const [pagosCasos, setPagosCasos] = useState(null);
  const [tab, setTab] = useState("resumen");

  useEffect(() => {
    async function cargar() {
      setLoading(true);
      try {
        const [
          p, s, t, c, i, pc
        ] = await Promise.all([
          getDashboardProspectosEstadisticas(),
          getDashboardSolicitudesEstadisticas(),
          getDashboardTareasEstadisticas(),
          getDashboardClientesEstadisticas(),
          getDashboardInversionesEstadisticas(),
          getDashboardPagosCasosEstadisticas()
        ]);
        setProspectos(p);
        setSolicitudes(s);
        setTareas(t);
        setClientes(c);
        setInversiones(i);
        setPagosCasos(pc);
      } catch (err) {}
      finally {
        setLoading(false);
      }
    }
    cargar();
  }, []);

  // KPIs principales
  const kpis = [
    { label: "Prospectos activos", value: prospectos?.activos ?? "-", desc: "Total en gestión" },
    { label: "Clientes", value: clientes?.totalClientes ?? "-", desc: "Registrados" },
    { label: "Inversiones", value: inversiones?.totalInversiones ?? "-", desc: "Actualmente activas" },
    { label: "Capital invertido", value: inversiones ? `$${Number(inversiones.totalCapitalInvertido ?? 0).toLocaleString("es-EC", { minimumFractionDigits: 2 })}` : "-", desc: "USD acumulados" },
    { label: "Solicitudes completadas", value: solicitudes?.totalCompletadas ?? "-", desc: "Flujo terminado" },
    { label: "Tareas aprobadas", value: tareas?.matrizGlobalPorTipoEstado?.find(t => t.nombreResultado === "Aprobado")?.total ?? "-", desc: "Workflow OK" },
    { label: "Pagos registrados", value: pagosCasos?.pagosPorCalendario?.reduce((a, c) => a + c.totalPagos, 0) ?? "-", desc: "De todos los calendarios" },
  ];

  // Fecha en español
  const today = format(new Date(), "EEEE dd 'de' MMMM yyyy", { locale: es });

  if (loading) return <GlassLoader visible message="Cargando Dashboard..." />;

  return (
    <div className="space-y-10 py-8 px-2 md:px-8 animate-fadein">
      {/* Header */}
      <div className="mb-6 px-1 md:px-0">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight flex flex-wrap items-center gap-2">
          Dashboard <span className="text-violet-700 whitespace-nowrap">SG CONSULTING GROUP</span>
        </h1>
        <div className="text-gray-500 text-base mt-2">
          Visualiza el estado actual del negocio y las métricas clave de tus operaciones.
        </div>
        <div className="text-gray-400 text-sm mt-1 select-none">{today.charAt(0).toUpperCase() + today.slice(1)}</div>
      </div>

      {/* KPIs */}
      <div className="w-full overflow-x-auto scrollbar-thin pb-2">
        <div className="flex gap-4 md:gap-6 md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 md:flex-none">
          {kpis.map((item, idx) => (
            <div
              key={idx}
              className={`
                flex-shrink-0 w-64 max-w-[95vw] md:w-auto md:max-w-none
                rounded-2xl bg-white border-2 transition-all duration-300
                border-violet-100 shadow-sm flex flex-col items-center py-5 px-2
                hover:scale-105 hover:shadow-lg
                cursor-pointer h-full
              `}
              style={{ minWidth: 160, boxShadow: "0 4px 18px 0 rgba(124,58,237,0.06)" }}
            >
              <span className="text-sm text-gray-500 text-center break-words max-w-full">{item.label}</span>
              <span className="text-[2.1rem] md:text-xl font-extrabold text-violet-700 mt-1 tracking-tight break-all max-w-full w-full text-center" style={{ maxWidth: 190, wordBreak: 'break-word', lineHeight: 1.2, whiteSpace: "normal" }}>{item.value}</span>
              <span className="text-xs text-gray-400 mt-1 text-center block break-words max-w-full">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="mb-8 flex gap-2 bg-white rounded-xl px-2 py-2 shadow border border-violet-100 overflow-x-auto scrollbar-thin">
          {[
            { label: "Resumen", value: "resumen" },
            { label: "Prospectos", value: "prospectos" },
            { label: "Solicitudes", value: "solicitudes" },
            { label: "Tareas", value: "tareas" },
            { label: "Clientes", value: "clientes" },
            { label: "Inversiones", value: "inversiones" },
            { label: "Pagos & Casos", value: "pagoscasos" },
          ].map(tabOption => (
            <TabsTrigger
              key={tabOption.value}
              value={tabOption.value}
              className={`
                px-5 py-2 rounded-lg font-semibold text-base transition-all
                duration-200 outline-none focus:ring-2 focus:ring-violet-400
                ${tab === tabOption.value
                  ? "bg-violet-600 text-white shadow-lg scale-105"
                  : "bg-gray-50 text-gray-600 hover:bg-violet-50"
                }
                min-w-[120px] text-center
              `}
              style={{ boxShadow: tab === tabOption.value ? "0 2px 10px 0 rgba(124,58,237,0.11)" : undefined }}
            >
              {tabOption.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* --- TAB RESUMEN --- */}
        <TabsContent value="resumen" className="animate-fadein">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            <DashboardCardPie
              title="Prospectos activos/inactivos"
              desc="Distribución de prospectos según su estado actual."
              data={[
                { name: "Activos", value: prospectos?.activos ?? 0 },
                { name: "Inactivos", value: prospectos?.inactivos ?? 0 }
              ]}
              colors={["#7c3aed", "#c7d2fe"]}
            />
            <DashboardCardBar
              title="Solicitudes por estado"
              desc="Cantidad de solicitudes en cada etapa del flujo."
              data={solicitudes?.porEstado ?? []}
              dataKey="totalSolicitudes"
              labelKey="estado"
              color="#7c3aed"
            />
            <DashboardCardBar
              title="Inversiones por producto"
              desc="Monto total invertido por tipo de producto."
              data={inversiones?.porProducto ?? []}
              dataKey="capitalInvertido"
              labelKey="productoNombre"
              color="#6366f1"
            />
          </div>
        </TabsContent>

        {/* --- TAB PROSPECTOS --- */}
        <TabsContent value="prospectos" className="animate-fadein">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            <DashboardCardLine
              title="Evolución mensual de prospectos"
              desc="Prospección de clientes potenciales mes a mes."
              data={prospectos?.porMes ?? []}
              dataKey="totalProspectos"
              labelKey="mes"
              color="#7c3aed"
            />
            <DashboardCardPie
              title="Por producto de interés"
              desc="Productos más atractivos para prospectos."
              data={prospectos?.porProductoInteres ?? []}
              colors={PIE_COLORS}
              nameKey="productoInteres"
              valueKey="total"
            />
            <DashboardCardBar
              title="Origen de prospectos"
              desc="Fuente principal por la que llegan nuevos prospectos."
              data={prospectos?.porOrigen ?? []}
              dataKey="total"
              labelKey="nombreOrigen"
              color="#a21caf"
            />
            <DashboardCardBar
              title="Conversión a clientes"
              desc="Prospectos convertidos vs. no convertidos."
              data={[
                { name: "Convertidos", value: prospectos?.convertidos ?? 0 },
                { name: "No convertidos", value: prospectos?.noConvertidos ?? 0 }
              ]}
              dataKey="value"
              labelKey="name"
              color="#4ade80"
            />
            <DashboardCardPie
              title="Prospectos con y sin solicitud"
              desc="Cantidad de prospectos que ya avanzaron a solicitud."
              data={[
                { name: "Con solicitud", value: prospectos?.prospectosConSolicitud ?? 0 },
                { name: "Sin solicitud", value: prospectos?.prospectosSinSolicitud ?? 0 }
              ]}
              colors={["#0ea5e9", "#fbbf24"]}
            />
          </div>
        </TabsContent>

        {/* --- TAB SOLICITUDES --- */}
        <TabsContent value="solicitudes" className="animate-fadein">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            <DashboardCardLine
              title="Solicitudes mensuales"
              desc="Cantidad de solicitudes registradas por mes."
              data={solicitudes?.porMes ?? []}
              dataKey="totalSolicitudes"
              labelKey="mes"
              color="#7c3aed"
            />
            <DashboardCardPie
              title="Solicitudes completadas"
              desc="Proporción entre solicitudes completadas y en proceso."
              data={[
                { name: "Completadas", value: solicitudes?.totalCompletadas ?? 0 },
                { name: "En proceso", value: ((solicitudes?.porEstado ?? []).reduce((a, s) => a + (s?.totalSolicitudes ?? 0), 0) - (solicitudes?.totalCompletadas ?? 0)) }
              ]}
              colors={["#10b981", "#fbbf24"]}
            />
            <DashboardCardBar
              title="Proyecciones por producto"
              desc="Número de proyecciones por producto."
              data={solicitudes?.proyeccionesPorProducto ?? []}
              dataKey="totalProyecciones"
              labelKey="productoNombre"
              color="#6366f1"
            />
            <DashboardCardBar
              title="Solicitudes con/sin proyección"
              desc="¿Cuántas solicitudes tienen ya una proyección?"
              data={[
                { name: "Con proyección", value: solicitudes?.solicitudesConProyeccionTotal ?? 0 },
                { name: "Sin proyección", value: solicitudes?.solicitudesSinProyeccionTotal ?? 0 }
              ]}
              dataKey="value"
              labelKey="name"
              color="#0ea5e9"
            />
            <DashboardCardPie
              title="Tasa de conversión"
              desc="Porcentaje de prospectos convertidos a solicitud."
              data={[
                { name: "Conversión", value: solicitudes?.porcentajeConversion ?? 0 },
                { name: "No conversión", value: 100 - (solicitudes?.porcentajeConversion ?? 0) }
              ]}
              colors={["#7c3aed", "#fbbf24"]}
            />
          </div>
        </TabsContent>

        {/* --- TAB TAREAS --- */}
        <TabsContent value="tareas" className="animate-fadein">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            <DashboardCardBar
              title="Tareas por tipo y estado"
              desc="Cumplimiento global del workflow en las solicitudes."
              data={tareas?.matrizGlobalPorTipoEstado ?? []}
              dataKey="total"
              labelKey="nombreTipoTarea"
              color="#7c3aed"
            />
            <DashboardCardBar
              title="Tareas pendientes por tipo"
              desc="Tipos de tarea con más pendientes."
              data={tareas?.pendientesPorTipoGlobal ?? []}
              dataKey="totalPendientes"
              labelKey="nombreTipoTarea"
              color="#fbbf24"
            />
            <DashboardCardPie
              title="Contratos firmados"
              desc="Total de contratos ya firmados en el flujo."
              data={[
                { name: "Firmados", value: tareas?.contratosFirmados ?? 0 },
                { name: "Sin firmar", value: ((solicitudes?.porEstado ?? []).reduce((a, s) => a + (s?.totalSolicitudes ?? 0), 0) - (tareas?.contratosFirmados ?? 0)) }
              ]}
              colors={["#10b981", "#6366f1"]}
            />
          </div>
        </TabsContent>

        {/* --- TAB CLIENTES --- */}
        <TabsContent value="clientes" className="animate-fadein">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            <DashboardCardLine
              title="Clientes por mes"
              desc="Evolución mensual del registro de nuevos clientes."
              data={clientes?.porMes ?? []}
              dataKey="totalClientes"
              labelKey="mes"
              color="#7c3aed"
            />
            <DashboardCardPie
              title="Clientes por nacionalidad"
              desc="Origen nacional de los clientes registrados."
              data={clientes?.porNacionalidad ?? []}
              colors={PIE_COLORS}
              nameKey="nacionalidad"
              valueKey="totalClientes"
            />
            <DashboardCardBar
              title="Clientes por edad"
              desc="Rangos de edad de clientes registrados."
              data={clientes?.porEdad ?? []}
              dataKey="total"
              labelKey="rangoEdad"
              color="#818cf8"
            />
            <DashboardCardBar
              title="Clientes por tipo"
              desc="Segmentación por tipo de cliente."
              data={clientes?.porTipoCliente ?? []}
              dataKey="total"
              labelKey="tipoCliente"
              color="#6366f1"
            />
            <DashboardCardPie
              title="Clientes por género"
              desc="Distribución de clientes por género."
              data={clientes?.porGenero ?? []}
              colors={["#7c3aed", "#a5b4fc", "#fbbf24"]}
              nameKey="genero"
              valueKey="total"
            />
            <DashboardCardBar
              title="Clientes por país"
              desc="País de residencia de los clientes."
              data={clientes?.porPais ?? []}
              dataKey="totalClientes"
              labelKey="pais"
              color="#10b981"
            />
          </div>
        </TabsContent>

        {/* --- TAB INVERSIONES --- */}
        <TabsContent value="inversiones" className="animate-fadein">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            <DashboardCardLine
              title="Inversiones mensuales"
              desc="Capital invertido por mes en nuevos productos."
              data={inversiones?.porMes ?? []}
              dataKey="capitalInvertido"
              labelKey="mes"
              color="#10b981"
            />
            <DashboardCardBar
              title="Inversiones por producto"
              desc="Capital invertido por cada tipo de producto."
              data={inversiones?.porProducto ?? []}
              dataKey="capitalInvertido"
              labelKey="productoNombre"
              color="#6366f1"
            />
            <DashboardCardBar
              title="Inversiones por plazo"
              desc="Distribución por plazo (meses) de las inversiones."
              data={inversiones?.porPlazo ?? []}
              dataKey="capitalInvertido"
              labelKey="plazo"
              color="#fbbf24"
            />
            <DashboardCardBar
              title="Inversiones por tipo de cliente"
              desc="Naturaleza del cliente en inversiones."
              data={inversiones?.porTipoCliente ?? []}
              dataKey="capitalInvertido"
              labelKey="tipoCliente"
              color="#a21caf"
            />
            <DashboardCardPie
              title="Inversiones por país"
              desc="Capital invertido por país de residencia."
              data={inversiones?.porPais ?? []}
              colors={PIE_COLORS}
              nameKey="pais"
              valueKey="capitalInvertido"
            />
            <DashboardCardBar
              title="Ranking clientes TOP 3"
              desc="Clientes con mayor monto invertido."
              data={(inversiones?.rankingClientes ?? []).slice(0, 3)}
              dataKey="montoInvertido"
              labelKey="nombreCompleto"
              color="#10b981"
            />
          </div>
        </TabsContent>

        {/* --- TAB PAGOS & CASOS --- */}
        <TabsContent value="pagoscasos" className="animate-fadein">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            <DashboardCardBar
              title="Pagos por calendario"
              desc="Pagos registrados en cada calendario de corte."
              data={pagosCasos?.pagosPorCalendario ?? []}
              dataKey="totalPagos"
              labelKey="nombreCalendario"
              color="#7c3aed"
            />
            <DashboardCardBar
              title="Pagos confirmados/descartados"
              desc="Flujo de pagos aprobados y cancelados."
              data={pagosCasos?.pagosConfirmadosDescartados ?? []}
              dataKey="pagosConfirmados"
              labelKey="nombreCalendario"
              color="#10b981"
            />
            <DashboardCardPie
              title="Casos por motivo"
              desc="Principales motivos para registrar un caso."
              data={pagosCasos?.casosPorMotivo ?? []}
              colors={PIE_COLORS}
              nameKey="motivoNombre"
              valueKey="totalCasos"
            />
            <DashboardCardPie
              title="Pagos por motivo"
              desc="Detalle de pagos realizados por motivo."
              data={pagosCasos?.pagosPorMotivo ?? []}
              colors={PIE_COLORS}
              nameKey="motivoNombre"
              valueKey="totalPagos"
            />
            <DashboardCardPie
              title="Casos por usuario"
              desc="Cantidad de casos registrados por cada usuario."
              data={pagosCasos?.casosPorUsuario ?? []}
              colors={PIE_COLORS}
              nameKey="nombreUsuarioCreacion"
              valueKey="totalCasos"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// --------- COMPONENTES REUTILIZABLES -----------

function DashboardCardPie({ title, desc, data, colors, nameKey = "name", valueKey = "value" }) {
  return (
    <Card className="shadow-sm border-violet-100 h-full flex flex-col justify-between">
      <CardContent className="p-6">
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <div className="text-gray-500 text-sm mb-3">{desc}</div>
        <div className="w-full min-h-[220px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={70}
                label
                nameKey={nameKey}
                dataKey={valueKey}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardCardBar({ title, desc, data, dataKey, labelKey, color }) {
  return (
    <Card className="shadow-sm border-violet-100 h-full flex flex-col justify-between">
      <CardContent className="p-6">
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <div className="text-gray-500 text-sm mb-3">{desc}</div>
        <div className="w-full min-h-[220px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={labelKey} />
              <YAxis />
              <Tooltip />
              <Bar dataKey={dataKey} fill={color} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardCardLine({ title, desc, data, dataKey, labelKey, color }) {
  return (
    <Card className="shadow-sm border-violet-100 h-full flex flex-col justify-between">
      <CardContent className="p-6">
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <div className="text-gray-500 text-sm mb-3">{desc}</div>
        <div className="w-full min-h-[220px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data}>
              <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={3} />
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="5 5" />
              <XAxis dataKey={labelKey} />
              <YAxis />
              <Tooltip />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
