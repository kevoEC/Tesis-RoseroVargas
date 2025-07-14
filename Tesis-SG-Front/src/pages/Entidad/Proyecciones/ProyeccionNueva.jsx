import { useState } from "react";
import { useParams } from "react-router-dom";
import { useUI } from "@/hooks/useUI";
import { crearProyeccion, getConfiguracionByProductoId } from "@/service/Entidades/ProyeccionService";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Eye } from "lucide-react"; // icono info personalizado
import TablaCustom2 from "@/components/shared/TablaCustom2";
import GlassLoader from "@/components/ui/GlassLoader"; // Import GlassLoader

function formatCurrency(value) {
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

// Componente TooltipSimple básico con CSS
function TooltipSimple({ content, children }) {
  return (
    <div className="relative group inline-block">
      {children}
      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 whitespace-normal w-56 bg-black text-white text-xs rounded p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        {content}
        <svg className="absolute top-full left-1/2 -translate-x-1/2 fill-black" width="16" height="8" viewBox="0 0 16 8" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0L8 8L16 0H0Z" />
        </svg>
      </div>
    </div>
  );
}

export default function ProyeccionNueva() {
  const { id } = useParams();
  const { notify, user } = useUI();

  // Estado del formulario
  const [form, setForm] = useState({
    tipoSolicitud: "1", // fijo y no editable
    idProducto: "1", // inicio en 1 (Renta Fija)
    capital: "",
    plazo: "",
    fechaInicial: "",
    idOrigenCapital: "",
    idSolicitudInversion: parseInt(id),
    costeOperativo: 0, // siempre 0, no se muestra
  });

  const [cronograma, setCronograma] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [bloqueado, setBloqueado] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [accionPendiente, setAccionPendiente] = useState(null);
  const [tasaSeleccionada, setTasaSeleccionada] = useState(null);
  const [tasaValida, setTasaValida] = useState(false);
  const [loading, setLoading] = useState(false); // Estado para loader

  // Control de habilitación de campos según flujo
  const capitalValido = parseFloat(form.capital) >= 1000;
  const origenCapitalHabilitado = capitalValido;
  const plazoHabilitado = origenCapitalHabilitado && form.idOrigenCapital !== "";
  const fechaInicialHabilitada = plazoHabilitado && form.plazo !== "";

  // Opciones plazo por idOrigenCapital corregidas
  const plazosLocal = ["7", "13", "25", "37"];       // Local
  const plazosExtranjero = ["6", "12", "24", "36"]; // Extranjero
  const plazos = form.idOrigenCapital === "2" ? plazosExtranjero : plazosLocal;

  // Mensajes para productos
  const descripcionProducto = {
    "1": "Renta Fija: El pago del rendimiento junto al capital se realiza al final del plazo seleccionado. Ideal para inversiones con rendimiento acumulado hasta vencimiento.",
    "2": "Renta Periódica Mensual: El pago de la rentabilidad se realiza mensualmente, proporcionando flujo constante de ingresos.",
    "3": "Renta Periódica Bimensual: El pago de la rentabilidad se efectúa cada dos meses, equilibrando periodicidad y acumulación.",
    "4": "Renta Periódica Trimestral: El pago de la rentabilidad se efectúa cada tres meses, permitiendo mayor acumulación entre pagos.",
    "5": "Renta Periódica Semestral: El pago de la rentabilidad se realiza cada seis meses, ideal para inversiones con pagos menos frecuentes."
  };

  // Manejo de cambios en el formulario
  const handleChange = (field, value) => {
    // Limpiar tasa y validación cuando cambian campos relevantes
    if (["capital", "idOrigenCapital", "plazo"].includes(field)) {
      setTasaSeleccionada(null);
      setTasaValida(false);
    }
    // Capital solo acepta números y punto
    if (field === "capital") {
      if (value === "" || /^\d*\.?\d*$/.test(value)) {
        setForm(prev => ({ ...prev, [field]: value }));
      }
      return;
    }
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // Validar fecha inicial permitida (solo 01, 10, 20 y no fechas pasadas)
  const validarFechaInicial = (fechaISO) => {
    if (!fechaISO) return false;

    // Extraemos año, mes y día del string ISO "yyyy-mm-dd"
    const [yearStr, monthStr, dayStr] = fechaISO.split("-");
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);

    // Solo permitir días 1, 10 o 20
    if (![1, 10, 20].includes(day)) return false;

    // Fecha de hoy, sin horas (UTC para evitar desfase)
    const ahora = new Date();
    const hoyUTC = new Date(Date.UTC(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()));

    // Fecha seleccionada como UTC (sin horas)
    const fechaSeleccionada = new Date(Date.UTC(year, month - 1, day));

    // Comparar fechaSeleccionada con hoyUTC
    if (fechaSeleccionada < hoyUTC) {
      // Fecha es pasada, inválida
      return false;
    }

    return true;
  };

  // Validar antes de consultar tasa
  // Validar antes de consultar tasa, en orden: origen, plazo, fecha
  const validarConsultaTasa = () => {
    if (!capitalValido) {
      notify.error("El capital debe ser al menos $1000.");
      return false;
    }
    if (!origenCapitalHabilitado || form.idOrigenCapital === "") {
      notify.error("Selecciona el origen del capital.");
      return false;
    }
    if (!plazoHabilitado || form.plazo === "") {
      notify.error("Selecciona el plazo.");
      return false;
    }
    if (!fechaInicialHabilitada || form.fechaInicial === "") {
      notify.error("Selecciona una fecha inicial válida (01, 10 o 20 y no fechas pasadas).");
      return false;
    }
    if (!validarFechaInicial(form.fechaInicial)) {
      notify.error("Fecha inicial no válida. Solo 01, 10 o 20, y no fechas pasadas permitidas.");
      return false;
    }
    return true;
  };


  const consultarTasa = async () => {
    if (!validarConsultaTasa()) return;

    setLoading(true);
    try {
      const payload = {
        ...form,
        idProducto: parseInt(form.idProducto),
        idOrigenCapital: parseInt(form.idOrigenCapital),
        plazo: parseInt(form.plazo),
        capital: parseFloat(form.capital),
      };

      const configuraciones = await getConfiguracionByProductoId(payload.idProducto);

      const posibles = configuraciones.filter(config =>
        config.idOrigen === payload.idOrigenCapital &&
        config.plazo === payload.plazo
      );

      if (posibles.length === 0) {
        notify.error("No hay configuraciones con ese origen y plazo.");
        setTasaValida(false);
        setTasaSeleccionada(null);
        return;
      }

      const configSeleccionada = posibles.find(config =>
        payload.capital >= config.montoMinimo &&
        payload.capital <= config.montoMaximo
      );

      if (!configSeleccionada) {
        notify.error("El capital ingresado no está en un rango válido para ese origen y plazo.");
        setTasaValida(false);
        setTasaSeleccionada(null);
        return;
      }

      notify.success("Tasa encontrada correctamente.");
      setTasaSeleccionada(configSeleccionada.taza);
      setTasaValida(true);

    } catch (error) {
      console.error("Error al consultar tasa:", error);
      notify.error("Error al consultar la tasa.");
      setTasaValida(false);
      setTasaSeleccionada(null);
    } finally {
      setLoading(false);
    }
  };

  const ejecutarGenerar = async () => {
    if (!tasaValida) {
      notify.error("Debes consultar y validar la tasa antes de generar.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        idProducto: parseInt(form.idProducto),
        idUsuario: user?.idUsuario ?? 0,
        idOrigenCapital: parseInt(form.idOrigenCapital),
        tipoSolicitud: parseInt(form.tipoSolicitud)
      };

      const res = await crearProyeccion(payload);

      if (res.success) {
        setResumen(res.proyeccion);
        setCronograma(res.cronograma);
        notify.success("Cronograma generado correctamente.");
        setBloqueado(true);
      } else {
        notify.error("No se pudo generar la proyección.");
      }
    } catch (error) {
      notify.error("Error al generar proyección.");
      console.error("Error al generar proyección:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerar = () => {
    if (!capitalValido || !form.plazo || !form.fechaInicial) {
      notify.error("Todos los campos obligatorios deben estar completos y válidos.");
      return;
    }
    setAccionPendiente(() => ejecutarGenerar);
    setMostrarConfirmacion(true);
  };

  // Texto profesional para origen capital
  const textoAyudaOrigenCapital = form.idOrigenCapital === "1"
    ? "Origen Local: Se aplica un mes de gracia para el Impuesto a la Salida de Divisas (ISD)."
    : form.idOrigenCapital === "2"
      ? "Origen Extranjero: No aplica mes de gracia para ISD, pero se validará que el depósito provenga de una entidad financiera extranjera autorizada."
      : "Primero selecciona un origen de capital para más información.";

  // Producto seleccionado para nota
  const notaProducto = descripcionProducto[form.idProducto] || "";

  return (
    <div className="space-y-6 p-6 relative">
      {/* GlassLoader */}
      <GlassLoader visible={loading} message="Procesando..." />

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-800">Nueva Proyección</h2>
      </div>

      <Card className="border border-gray-700 shadow-sm bg-white rounded-2xl">
        <CardContent className="p-6 space-y-8">

          <h3 className="text-xl font-semibold text-gray-800">Datos para la proyección</h3>

          {/* Primera fila: Tipo solicitud, Producto, Capital */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex flex-col justify-center">
              <Label className="text-sm font-medium text-gray-700">Tipo de solicitud</Label>
              <div className="mt-1 p-2 rounded bg-gray-100 border border-gray-300 text-gray-800 font-semibold">
                Nueva
              </div>
            </div>

            <FormSelect
              label="Producto"
              value={form.idProducto}
              onChange={(val) => handleChange("idProducto", val)}
              options={["1", "2", "3", "4", "5"]}
              labels={[
                "Renta Fija",
                "Renta Periódica Mensual",
                "Renta Periódica Bimensual",
                "Renta Periódica Trimestral",
                "Renta Periódica Semestral",
              ]}
              disabled={bloqueado}
            />

            <FormInput
              label="Capital"
              value={form.capital}
              onChange={(e) => handleChange("capital", e.target.value)}
              disabled={bloqueado}
              placeholder="$"
            />
          </div>

          {/* Nota producto: ocupa toda la fila */}
          <div className="bg-blue-50 border border-blue-300 rounded p-3 text-sm text-blue-800 italic font-medium">
            {notaProducto}
          </div>

          {/* Segunda fila: Origen capital, Plazo, Fecha inicial (solo si capital válido) */}
          {capitalValido && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="relative">
                <FormSelect
                  label={
                    <div className="flex items-center gap-1">
                      Origen del capital
                      <TooltipSimple content={textoAyudaOrigenCapital}>
                        <Eye className="w-4 h-4 text-gray-500 cursor-help" />
                      </TooltipSimple>
                    </div>
                  }
                  value={form.idOrigenCapital}
                  onChange={(val) => handleChange("idOrigenCapital", val)}
                  options={["1", "2"]}
                  labels={["Local", "Extranjero"]}
                  disabled={bloqueado}
                />
              </div>

              <FormSelect
                label="Plazo"
                value={form.plazo}
                onChange={(val) => handleChange("plazo", val)}
                options={plazos}
                labels={plazos.map((p) => `${p} meses`)}
                disabled={bloqueado}
              />

              <FormInput
                label="Fecha inicial"
                type="date"
                value={form.fechaInicial}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || validarFechaInicial(val)) {
                    handleChange("fechaInicial", val);
                  } else {
                    notify.error("Fecha inválida. Solo 01, 10 o 20 de meses actuales o futuros permitidos.");
                  }
                }}
                disabled={bloqueado}
              />
            </div>
          )}

          {/* Coste operativo oculto, solo para payload */}
          <input type="hidden" value={0} readOnly />

          {/* Mostrar tasa seleccionada si existe */}
          {tasaSeleccionada !== null && (
            <div className="bg-blue-100 border border-blue-300 rounded-xl p-4 flex justify-center items-center mt-4">
              <div>
                <p className="text-sm text-blue-600 font-medium">Tasa asignada</p>
                <p className="text-3xl font-bold text-blue-800">{tasaSeleccionada.toFixed(2)}%</p>
              </div>
            </div>
          )}

          {/* Botones consultar tasa y generar cronograma */}
          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
            <Button
              onClick={consultarTasa}
              disabled={bloqueado}
              className="bg-blue-600 hover:bg-blue-800 text-white shadow"
            >
              Consultar tasa
            </Button>

            <Button
              onClick={handleGenerar}
              disabled={bloqueado || !tasaValida}
              className="bg-green-600 hover:bg-green-800 text-white shadow"
            >
              Generar cronograma
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de cronograma */}
      {cronograma.length > 0 && (
        <>
          <Card className="mt-6">
            <CardContent>
              <TablaCustom2
                data={cronograma}
                columns={[
                  { key: "periodo", label: "Período", render: (v) => <div className="text-center">{v}</div> },
                  { key: "fechaInicial", label: "F. Inicial", render: (v) => <div className="text-center">{formatDate(v)}</div> },
                  { key: "fechaVencimiento", label: "F. Vencimiento", render: (v) => <div className="text-center">{formatDate(v)}</div> },
                  { key: "tasa", label: "Tasa", render: (v) => <div className="text-center">{v.toFixed(2)}%</div> },
                  { key: "aporteAdicional", label: "Aporte Adic.", render: (v) => <div className="text-right">{formatCurrency(v)}</div> },
                  { key: "capitalOperacion", label: "Capital", render: (v) => <div className="text-right">{formatCurrency(v)}</div> },
                  { key: "rentabilidad", label: "Rentabilidad", render: (v) => <div className="text-right">{formatCurrency(v)}</div> },
                  { key: "capitalRenta", label: "Capital Renta", render: (v) => <div className="text-right">{formatCurrency(v)}</div> },
                  { key: "costoOperativo", label: "Coste Op.", render: (v) => <div className="text-right">{formatCurrency(v)}</div> },
                  { key: "rentaAcumulada", label: "Renta Acum.", render: (v) => <div className="text-right">{formatCurrency(v)}</div> },
                  { key: "capitalFinal", label: "Capital Final", render: (v) => <div className="text-right">{formatCurrency(v)}</div> },
                  { key: "montoPagar", label: "Monto a Pagar", render: (v) => <div className="text-right">{formatCurrency(v)}</div> },
                ]}
                mostrarAgregarNuevo={false}
                mostrarEditar={false}
                mostrarEliminar={false}
              />
            </CardContent>
          </Card>

          {/* Totales del cronograma */}
          {resumen && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
              <Resumen label="Coste Operativo Total" value={resumen.totalCosteOperativo} />
              <Resumen label="Rentabilidad Total" value={resumen.totalRentabilidad} />
              <Resumen label="Renta Total" value={resumen.totalRentaPeriodo} />
              <Resumen label="Capital + Rendimiento" value={resumen.rendimientosMasCapital} />
              <Resumen label="Valor a Liquidar" value={resumen.valorProyectadoLiquidar} />
              {form.tipoSolicitud === "3" && resumen.fechaIncremento && (
                <Resumen label="Fecha Incremento" value={new Date(resumen.fechaIncremento).toLocaleDateString()} />
              )}
            </div>
          )}
        </>
      )}

      <Dialog open={mostrarConfirmacion} onOpenChange={setMostrarConfirmacion}>
        <DialogContent className="backdrop-blur-md max-w-md">
          <DialogHeader>
            <DialogTitle>¿Generar cronograma?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">¿Estás seguro de que deseas generar el cronograma?</p>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setMostrarConfirmacion(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-primary text-white hover:bg-primary/70"
              onClick={() => {
                setMostrarConfirmacion(false);
                if (accionPendiente) accionPendiente();
              }}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FormInput({ label, value, onChange, type = "text", disabled, placeholder }) {
  return (
    <div className="space-y-1">
      <Label className="text-sm text-gray-700 font-medium">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="text-sm border-gray-700 bg-white"
        placeholder={placeholder}
      />
    </div>
  );
}

function FormSelect({ label, value, onChange, options, labels = [], disabled }) {
  return (
    <div className="space-y-1">
      <Label className="text-sm text-gray-700 font-medium">{label}</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="text-sm border-gray-700 bg-white">
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {options.map((opt, idx) => (
            <SelectItem key={opt} value={opt}>
              {labels[idx] ?? opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function Resumen({ label, value }) {
  return (
    <div className="bg-gray-100 rounded-lg p-4 text-center">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-lg font-semibold text-gray-800">
        {typeof value === "number" ? formatCurrency(value) : value}
      </div>
    </div>
  );
}
