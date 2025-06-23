import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GlassLoader from "@/components/ui/GlassLoader";
import TablaCustom2 from "@/components/shared/TablaCustom2";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { getCasoById, updateCaso } from "@/service/Entidades/CasosService";
import { getInversiones } from "@/service/Entidades/InversionService";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

// Definición de motivos y campos específicos
const MOTIVOS = [
  { id: 6, nombre: "Autorización de actualización de datos" },
  { id: 13, nombre: "Envío de estado de cuenta" },
  { id: 18, nombre: "Pago" },
  { id: 19, nombre: "Generación de pago manual" },
  { id: 35, nombre: "Terminación de inversión" }
];

// Motivos que requieren inversión
const MOTIVOS_REQUIEREN_INVERSION = [18, 19, 35];

const CAMPOS_POR_MOTIVO = {
  13: [
    { key: "fechaCorte", label: "Fecha de Corte", type: "date" },
    { key: "correoEnvio", label: "Correo de Envío", type: "text" },
  ],
  18: [
    { key: "TipoPago", label: "Tipo de Pago", type: "select", options: [{ value: 1, label: "Transferencia" }, { value: 2, label: "Cheque" }] },
    { key: "FechaPago", label: "Fecha de Pago", type: "date" },
    { key: "MontoPago", label: "Monto de Pago", type: "number" },
    { key: "BancoPago", label: "Banco", type: "text" },
    { key: "TipoCuentaPago", label: "Tipo de Cuenta", type: "select", options: [{ value: 1, label: "Ahorros" }, { value: 2, label: "Corriente" }] },
    { key: "NumeroCuentaPago", label: "Número de Cuenta", type: "text" },
  ],
  19: [
    { key: "TipoPago", label: "Tipo de Pago", type: "select", options: [{ value: 1, label: "Transferencia" }, { value: 2, label: "Cheque" }] },
    { key: "FechaPago", label: "Fecha de Pago", type: "date" },
    { key: "MontoPago", label: "Monto de Pago", type: "number" },
    { key: "BancoPago", label: "Banco", type: "text" },
    { key: "TipoCuentaPago", label: "Tipo de Cuenta", type: "select", options: [{ value: 1, label: "Ahorros" }, { value: 2, label: "Corriente" }] },
    { key: "NumeroCuentaPago", label: "Número de Cuenta", type: "text" },
  ],
  35: [
    { key: "MotivoTerminacion", label: "Motivo de Terminación", type: "text" },
  ]
};

// Map label para selects (para modo solo lectura)
const LABELS_SELECT = {
  TipoPago: { 1: "Transferencia", 2: "Cheque" },
  TipoCuentaPago: { 1: "Ahorros", 2: "Corriente" }
};

export default function CasoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState(null);
  const [inversiones, setInversiones] = useState([]);
  const [form, setForm] = useState({ descripcion: "", continuarCaso: false, estado: "" });
  const [continuar, setContinuar] = useState(false);
  const [warning, setWarning] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Mock documentos adjuntos (reemplaza por API real si tienes)
  const [adjuntos] = useState([]);

  // Carga de datos
  useEffect(() => {
    setLoading(true);
    getCasoById(id)
      .then(async (data) => {
        setInitialData(data);
        setForm({ descripcion: data.descripcion || "", continuarCaso: !!data.continuarCaso, estado: data.estado || "Iniciado" });
        setContinuar(!!data.continuarCaso);
        if (data.idInversion && MOTIVOS_REQUIEREN_INVERSION.includes(data.idMotivo)) {
          try {
            const inversionesData = await getInversiones();
            setInversiones(Array.isArray(inversionesData) ? inversionesData : []);
          } catch { setInversiones([]); }
        }
      })
      .catch((err) => toast.error("Error al cargar el caso: " + (err.message ?? err)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !initialData) return <GlassLoader visible message="Cargando caso..." />;

  // Parse datosEspecificos JSON si existe
  let datosEspecificos = {};
  try {
    if (initialData.datosEspecificos && typeof initialData.datosEspecificos === "string") {
      datosEspecificos = JSON.parse(initialData.datosEspecificos);
    }
  } catch (err) { datosEspecificos = {}; console.error("Error parsing datosEspecificos:", err); }

  // Encuentra motivo actual
  const motivo = MOTIVOS.find(m => m.id === initialData.idMotivo);

  // Encuentra inversión bonita
  let inversionNombre = "";
  if (initialData.idInversion && inversiones.length > 0) {
    const inv = inversiones.find(i => i.idInversion === initialData.idInversion);
    if (inv) inversionNombre = `${inv.inversionNombre} - ${inv.nombreCompletoCliente ?? ""}`;
    else inversionNombre = `ID: ${initialData.idInversion}`;
  }

  // Renderiza todos los campos por motivo (camposEspecificos y también los del objeto raíz si existen)
  const renderCamposPorMotivo = () => {
    const campos = CAMPOS_POR_MOTIVO[initialData.idMotivo] || [];
    if (campos.length === 0) return null;
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {campos.map((campo) => {
          // El valor puede venir de datosEspecificos o del objeto root
          let value =
            datosEspecificos[campo.key] ??
            initialData[campo.key] ??
            "";
          // Renderiza bonito select/fecha/number/text
          if (campo.type === "select") {
            value = LABELS_SELECT[campo.key]?.[value] ?? value;
          }
          if (campo.type === "date" && value)
            value = new Date(value).toLocaleDateString("es-EC");
          if (campo.type === "number" && value)
            value = Number(value).toLocaleString("es-EC", { minimumFractionDigits: 2 });

          return (
            <FormGroup key={campo.key} label={campo.label}>
              <Input value={value || ""} disabled />
            </FormGroup>
          );
        })}
      </div>
    );
  };

  // Guardar solo continuar flujo
  const handleContinuarFlujo = async () => {
    setGuardando(true);
    try {
      await updateCaso(initialData.idCaso, {
        continuarCaso: true,
        idUsuarioModificacion: initialData.idUsuarioModificacion,
        idUsuarioPropietario: initialData.idUsuarioPropietario,
      });
      toast.success("El caso ha continuado el flujo. No se puede editar más.");
      setContinuar(true);
      setWarning(false);
    } catch (error) {
      toast.error(`Error al actualizar caso: ${error.message ?? error}`);
    } finally {
      setGuardando(false);
    }
  };

  // Manejador de check continuar
  const handleCheckContinuar = (e) => {
    if (e.target.checked) setWarning(true);
    else setWarning(false);
    setContinuar(e.target.checked);
    if (e.target.checked) handleContinuarFlujo();
  };

  // Estado badge bonito
  const getEstadoBadge = (estado) => {
    switch (estado) {
      case "Iniciado":
        return "bg-blue-100 text-blue-700";
      case "Cerrado":
        return "bg-gray-300 text-gray-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto bg-white min-h-screen">
      {/* Header estilo Dynamics */}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          {initialData.numeroCaso} - {motivo?.nombre || initialData.motivoNombre}
        </h1>
        <span className={`ml-3 px-3 py-1 text-xs font-semibold rounded-full ${getEstadoBadge(initialData.estado)}`}>
          {initialData.estado}
        </span>
      </div>
      <div className="flex flex-wrap text-xs text-gray-700 mb-6 border-b pb-2 gap-8">
        <span>
          <b>Cliente:</b> {initialData.nombreCliente}
        </span>
        {initialData.idInversion && inversionNombre && (
          <span>
            <b>Inversión:</b> {inversionNombre}
          </span>
        )}
        <span>
          <b>Creado:</b> {initialData.fechaCreacion ? new Date(initialData.fechaCreacion).toLocaleString("es-EC") : "-"}
        </span>
        <span>
          <b>Owner:</b> {initialData.nombreUsuarioPropietario || "-"}
        </span>
      </div>

      {/* Dos columnas estilo Dynamics */}
      <form className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Columna IZQUIERDA */}
        <section className="border rounded-xl p-6 shadow-sm mb-0 flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">General</h2>
          {initialData.idInversion && MOTIVOS_REQUIEREN_INVERSION.includes(initialData.idMotivo) && (
            <FormGroup label="Producto de inversión">
              <Input value={inversionNombre} disabled />
            </FormGroup>
          )}
          <FormGroup label="Motivo">
            <Input value={motivo?.nombre || initialData.motivoNombre} disabled />
          </FormGroup>
          <FormGroup label="Descripción">
            <textarea
              className="w-full border border-gray-300 rounded-lg p-2 text-sm"
              value={initialData.descripcion || ""}
              disabled
              rows={3}
            />
          </FormGroup>
          {/* Renderiza campos por motivo */}
          {renderCamposPorMotivo()}
        </section>

        {/* Columna DERECHA */}
        <div className="flex flex-col gap-6 w-full">
          <section className="border rounded-xl p-6 shadow-sm flex flex-col gap-6">
            <div>
              <Label className="font-medium text-gray-700 text-sm mb-1 block">Estado actual</Label>
              <Input value={initialData.estado} disabled className="font-semibold w-32" />
            </div>
            <div className="flex items-center gap-4">
              <Label className="font-medium text-gray-700 text-base">
                <span className="text-violet-800 font-bold text-lg">¿Continuar flujo?</span>
              </Label>
              <input
                type="checkbox"
                checked={continuar}
                onChange={handleCheckContinuar}
                disabled={continuar || guardando}
                className="h-7 w-7 accent-violet-600 border-2 border-violet-300"
              />
              {guardando && (
                <span className="text-xs text-gray-400 ml-2">Guardando...</span>
              )}
            </div>
            {warning && !continuar && (
              <div className="flex items-center gap-2 p-3 rounded bg-yellow-100 text-yellow-800 border border-yellow-300 my-2">
                <AlertCircle className="w-5 h-5" />
                <span>
                  <b>Advertencia:</b> Si continúas el flujo no podrás modificar más este caso.
                </span>
              </div>
            )}
            <div className="flex gap-4 mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/casos/vista")}
                className="px-6"
              >
                Regresar
              </Button>
              <Button
                type="button"
                className="bg-violet-600 hover:bg-violet-700 text-white px-8"
                disabled={continuar}
                onClick={() => {
                  // Si habilitas edición de descripción u otros campos, agrega aquí handleSubmit()
                  toast.info("Editar solo disponible antes de continuar flujo");
                }}
              >
                Actualizar Caso
              </Button>
            </div>
          </section>
          {/* Tabla de adjuntos debajo */}
          <section className="border border-gray-300 rounded-xl p-6 shadow-sm mt-0">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Documentos Adjuntos</h2>
            <TablaCustom2
              columns={[
                { key: "nombre", label: "Nombre" },
                { key: "urlDocumentoAdjunto", label: "Url Documento Adjunto" }
              ]}
              data={adjuntos}
              mostrarEditar={false}
              mostrarAgregarNuevo={false}
              mostrarEliminar={false}
            />
          </section>
        </div>
      </form>
    </div>
  );
}

// Agrupador campo-label
function FormGroup({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="font-medium text-gray-700 text-sm">{label}</Label>
      {children}
    </div>
  );
}
