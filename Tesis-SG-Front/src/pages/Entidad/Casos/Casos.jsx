import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GlassLoader from "@/components/ui/GlassLoader";
import TablaCustom2 from "@/components/shared/TablaCustom2";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Calendar as CalendarIcon, Lock, Eye } from "lucide-react";
import { getCasoById, updateCaso, getDocumentosPorCaso, ejecutarFlujoCaso } from "@/service/Entidades/CasosService";
import { getInversiones } from "@/service/Entidades/InversionService";
import { getCatalogoBancos, getCatalogoTiposCuenta } from "@/service/Catalogos/BancoService";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import AdjuntoForm from "@/components/solicitud/AdjuntoForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

function getCamposPorMotivo(idMotivo) {
  if (idMotivo === 18 || idMotivo === 19) {
    return [
      { key: "TipoPago", default: "" },
      { key: "FechaPago", default: "" },
      { key: "MontoPago", default: "" },
      { key: "BancoPago", default: "" },
      { key: "TipoCuentaPago", default: "" },
      { key: "NumeroCuentaPago", default: "" },
    ];
  }
  if (idMotivo === 13) {
    return [
      { key: "fechaCorte", default: "" },
      { key: "correoEnvio", default: "" },
    ];
  }
  if (idMotivo === 35) {
    return [
      { key: "MotivoTerminacion", default: "" },
    ];
  }
  return [];
}

const TIPO_PAGO_OPTIONS = [
  { value: 1, label: "Rentabilidad mensual" },
  { value: 2, label: "Pago final" },
  { value: 3, label: "Terminación" }
];
const FECHA_CORTE_OPTIONS = [
  { value: 1, label: "1" },
  { value: 10, label: "10" },
  { value: 20, label: "20" }
];

const MOTIVOS = [
  { id: 6, nombre: "Autorización de actualización de datos" },
  { id: 13, nombre: "Envío de estado de cuenta" },
  { id: 18, nombre: "Pago" },
  { id: 19, nombre: "Generación de pago manual" },
  { id: 35, nombre: "Terminación de inversión" }
];
const MOTIVOS_REQUIEREN_INVERSION = [18, 19, 35];

function DateInput({ value, onChange, label, required = true, disabled }) {
  return (
    <FormGroup label={label}>
      <div className="relative">
        <Input
          type="date"
          value={value}
          onChange={onChange}
          className={`pr-10 ${disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
          required={required}
          disabled={disabled}
        />
        <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-5 h-5" />
      </div>
    </FormGroup>
  );
}

export default function CasoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id;

  const [loadingCaso, setLoadingCaso] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(true);

  const [initialData, setInitialData] = useState(null);
  const [inversiones, setInversiones] = useState([]);
  const [bancos, setBancos] = useState([]);
  const [tiposCuenta, setTiposCuenta] = useState([]);
  const [form, setForm] = useState({});
  const [continuar, setContinuar] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [modalAdvertencia, setModalAdvertencia] = useState(false);

  // Adjuntos
  const [documentos, setDocumentos] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [documentoId, setDocumentoId] = useState(null);
  const [soloVerAdjunto, setSoloVerAdjunto] = useState(false);

  // Cargar caso y luego documentos
  const reloadCaso = async () => {
    setLoadingCaso(true);
    try {
      const data = await getCasoById(id);
      let datosEspecificosObj = {};
      try {
        datosEspecificosObj = data.datosEspecificos
          ? (typeof data.datosEspecificos === "string"
            ? JSON.parse(data.datosEspecificos)
            : data.datosEspecificos)
          : {};
      } catch { datosEspecificosObj = {}; }
      const camposMotivo = getCamposPorMotivo(data.idMotivo);
      let datosFinales = {};
      camposMotivo.forEach(({ key, default: def }) => {
        if (datosEspecificosObj[key] !== undefined && datosEspecificosObj[key] !== null) {
          datosFinales[key] = datosEspecificosObj[key];
        } else if (
          data[key.charAt(0).toLowerCase() + key.slice(1)] !== undefined &&
          data[key.charAt(0).toLowerCase() + key.slice(1)] !== null
        ) {
          datosFinales[key] = data[key.charAt(0).toLowerCase() + key.slice(1)];
        } else {
          datosFinales[key] = def;
        }
      });
      setInitialData(data);
      setForm({
        ...data,
        datosEspecificos: datosFinales
      });
      setContinuar(!!data.continuarCaso);

      const [bancosData, tiposCuentaData] = await Promise.all([
        getCatalogoBancos().catch(() => []),
        getCatalogoTiposCuenta().catch(() => [])
      ]);
      setBancos(bancosData);
      setTiposCuenta(tiposCuentaData);
      if (data.idInversion && MOTIVOS_REQUIEREN_INVERSION.includes(data.idMotivo)) {
        try {
          const inversionesData = await getInversiones();
          setInversiones(Array.isArray(inversionesData) ? inversionesData : []);
        } catch { setInversiones([]); }
      }
      if (data.idCaso) cargarDocumentos(data.idCaso);
    } catch (err) {
      toast.error("Error al recargar el caso: " + (err.message ?? err));
    } finally {
      setLoadingCaso(false);
    }
  };

  // Solo recarga la lista de documentos (no el caso)
  const cargarDocumentos = async (idCaso) => {
    setLoadingDocs(true);
    try {
      const docs = await getDocumentosPorCaso(idCaso);
      setDocumentos(docs);
    } catch (err) {
      toast.error("Error al cargar documentos: " + err.message);
      setDocumentos([]);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => { reloadCaso(); }, [id]);

  const motivo = initialData && MOTIVOS.find(m => m.id === initialData.idMotivo);

  let inversionNombre = "";
  if (initialData && initialData.idInversion && inversiones.length > 0) {
    const inv = inversiones.find(i => i.idInversion === initialData.idInversion);
    inversionNombre = inv
      ? `${inv.inversionNombre} - ${inv.nombreCompletoCliente ?? ""}`
      : `ID: ${initialData.idInversion}`;
  }

  const handleDatosChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      datosEspecificos: { ...prev.datosEspecificos, [key]: value }
    }));
  };

  const datosEspecificosLlenos = () => {
    if (!initialData) return false;
    const idMotivo = initialData.idMotivo;
    if (idMotivo === 18 || idMotivo === 19) {
      const req = ["TipoPago", "FechaPago", "MontoPago", "BancoPago", "TipoCuentaPago", "NumeroCuentaPago"];
      return req.every(k => form.datosEspecificos?.[k] && form.datosEspecificos[k].toString().trim() !== "");
    }
    if (idMotivo === 13) {
      const req = ["fechaCorte", "correoEnvio"];
      return req.every(k => form.datosEspecificos?.[k] && form.datosEspecificos[k].toString().trim() !== "");
    }
    if (idMotivo === 35) {
      return !!form.datosEspecificos?.MotivoTerminacion && form.datosEspecificos.MotivoTerminacion.trim() !== "";
    }
    return true;
  };

  const getDocumentosFaltantes = () => {
    if (!documentos?.length) return [];
    return documentos
      .filter(d => !d.archivo)
      .map(d => d.tipoDocumentoNombre);
  };
  const hayDocumentosFaltantes = getDocumentosFaltantes().length > 0;

  const renderCamposEspecificos = () => {
    if (!initialData) return null;
    const idMotivo = initialData.idMotivo;
    const disabledAll = continuar;

    if (idMotivo === 19 || idMotivo === 18) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormGroup label="Tipo de Pago">
            <select
              className={`w-full border rounded-md p-2 bg-white text-sm ${disabledAll ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
              value={form.datosEspecificos.TipoPago ?? ""}
              onChange={e => handleDatosChange("TipoPago", Number(e.target.value))}
              required
              disabled={disabledAll}
            >
              <option value="" hidden>Seleccionar tipo de pago...</option>
              {TIPO_PAGO_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </FormGroup>
          <DateInput
            label="Fecha de Pago"
            value={form.datosEspecificos.FechaPago ?? ""}
            onChange={e => handleDatosChange("FechaPago", e.target.value)}
            disabled={disabledAll}
          />
          <FormGroup label="Monto de Pago">
            <div className="relative">
              <span className="absolute left-2 top-2 text-gray-400 text-lg">$</span>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className={`pl-7 ${disabledAll ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
                value={form.datosEspecificos.MontoPago ?? ""}
                onChange={e => handleDatosChange("MontoPago", e.target.value)}
                required
                disabled={disabledAll}
              />
            </div>
          </FormGroup>
          <FormGroup label="Banco">
            <select
              className={`w-full border rounded-md p-2 bg-white text-sm ${disabledAll ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
              value={form.datosEspecificos.BancoPago ?? ""}
              onChange={e => handleDatosChange("BancoPago", Number(e.target.value))}
              required
              disabled={disabledAll}
            >
              <option value="" hidden>Seleccionar banco...</option>
              {bancos?.map(b => (
                <option key={b.idBanco} value={b.idBanco}>{b.bancoNombre}</option>
              ))}
            </select>
          </FormGroup>
          <FormGroup label="Tipo de Cuenta">
            <select
              className={`w-full border rounded-md p-2 bg-white text-sm ${disabledAll ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
              value={form.datosEspecificos.TipoCuentaPago ?? ""}
              onChange={e => handleDatosChange("TipoCuentaPago", Number(e.target.value))}
              required
              disabled={disabledAll}
            >
              <option value="" hidden>Seleccionar tipo de cuenta...</option>
              {tiposCuenta?.map(tc => (
                <option key={tc.idTipoCuenta} value={tc.idTipoCuenta}>{tc.nombre || tc.descripcion || "Tipo de cuenta"}</option>
              ))}
            </select>
          </FormGroup>
          <FormGroup label="Número de Cuenta">
            <Input
              type="text"
              placeholder="Ej: 123456789"
              className={disabledAll ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}
              value={form.datosEspecificos.NumeroCuentaPago ?? ""}
              onChange={e => handleDatosChange("NumeroCuentaPago", e.target.value)}
              required
              disabled={disabledAll}
            />
          </FormGroup>
        </div>
      );
    }
    if (idMotivo === 13) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormGroup label="Fecha de Corte">
            <select
              className={`w-full border rounded-md p-2 bg-white text-sm ${continuar ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
              value={form.datosEspecificos.fechaCorte ?? ""}
              onChange={e => handleDatosChange("fechaCorte", Number(e.target.value))}
              required
              disabled={continuar}
            >
              <option value="" hidden>Seleccionar fecha de corte...</option>
              {FECHA_CORTE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </FormGroup>
          <FormGroup label="Correo de Envío">
            <Input
              type="email"
              placeholder="correo@ejemplo.com"
              className={continuar ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}
              value={form.datosEspecificos.correoEnvio ?? ""}
              onChange={e => handleDatosChange("correoEnvio", e.target.value)}
              required
              disabled={continuar}
            />
          </FormGroup>
        </div>
      );
    }
    if (idMotivo === 35) {
      return (
        <FormGroup label="Motivo de Terminación">
          <Input
            type="text"
            placeholder="Describe el motivo de terminación"
            className={continuar ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}
            value={form.datosEspecificos.MotivoTerminacion ?? ""}
            onChange={e => handleDatosChange("MotivoTerminacion", e.target.value)}
            required
            disabled={continuar}
          />
        </FormGroup>
      );
    }
    return null;
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (continuar && !datosEspecificosLlenos()) {
      toast.warning("Debes completar todos los campos requeridos antes de continuar el flujo.");
      return;
    }
    if (continuar && hayDocumentosFaltantes) {
      toast.warning("Debes cargar todos los documentos requeridos antes de continuar el flujo.");
      return;
    }
    setGuardando(true);
    try {
      const payload = {
        descripcion: form.descripcion,
        continuarCaso: continuar,
        estado: continuar ? "Cerrado" : form.estado,
        idUsuarioModificacion: userId,
        idUsuarioPropietario: userId,
        datosEspecificos: JSON.stringify(form.datosEspecificos)
      };
      await updateCaso(initialData.idCaso, payload);
      toast.success("Caso actualizado correctamente");
      reloadCaso();
    } catch (error) {
      toast.error(`Error al actualizar caso: ${error.message ?? error}`);
    } finally {
      setGuardando(false);
    }
  };

  // Modal de confirmación para continuar flujo
  const handleSwitchContinuar = () => {
    if (!continuar) {
      if (!datosEspecificosLlenos()) {
        toast.warning("Debes completar todos los campos requeridos antes de continuar el flujo.");
        return;
      }
      if (hayDocumentosFaltantes) {
        toast.warning("Debes cargar todos los documentos requeridos antes de continuar el flujo.");
        return;
      }
      setModalAdvertencia(true);
    }
  };

const handleConfirmarContinuarFlujo = async () => {
  setModalAdvertencia(false);
  setGuardando(true);
  try {
    const payload = {
      descripcion: form.descripcion,
      continuarCaso: true,
      estado: "Cerrado",
      idUsuarioModificacion: userId,
      idUsuarioPropietario: userId,
      datosEspecificos: JSON.stringify(form.datosEspecificos)
    };
    // 1. Actualiza el Caso normalmente
    await updateCaso(initialData.idCaso, payload);
    toast.success("Caso actualizado correctamente");

    // 2. Ejecuta el flujo (SP) para continuar
    const resFlujo = await ejecutarFlujoCaso(initialData.idCaso);
    if (!resFlujo.success) {
      toast.error("Error al continuar flujo: " + (resFlujo.message || "Error desconocido"));
    } else {
      toast.success("Flujo continuado correctamente");
    }

    setContinuar(true);
    await reloadCaso();

  } catch (error) {
    toast.error(`Error al continuar flujo: ${error.message ?? error}`);
  } finally {
    setGuardando(false);
  }
};

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case "Iniciado": return "bg-blue-100 text-blue-700";
      case "Cerrado": return "bg-gray-300 text-gray-700";
      default: return "bg-yellow-100 text-yellow-700";
    }
  };

  const soloLectura = continuar || (initialData && initialData.estado === "Cerrado");

  // Columnas: agrega botón OJO si está en soloLectura, si no el botón editar default
  const columnasDocs = [
    { key: "idDocumento", label: "ID" },
    { key: "tipoDocumentoNombre", label: "Tipo de Documento" },
    { key: "motivoNombre", label: "Motivo" },
    { key: "documentoNombre", label: "Nombre" },
  ];
  if (soloLectura) {
    columnasDocs.push({
      key: "ver",
      label: "Ver",
      render: (_, row) => (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="text-primary hover:bg-violet-100"
          onClick={() => {
            setDocumentoId(row.idDocumento);
            setSoloVerAdjunto(true);
            setIsDialogOpen(true);
          }}
          title="Ver"
        >
          <Eye size={18} />
        </Button>
      )
    });
  }

    // ---- 3. AQUI VA EL LOADER (justo antes del render principal) ----
  if (loadingCaso || loadingDocs || !initialData) {
    return <GlassLoader visible message="Cargando caso..." />;
  }


  return (
    <div className="relative">
      {soloLectura && (
        <div className="w-full flex items-center px-6 py-2 bg-gray-50 border-b border-gray-300 shadow-sm mb-2 z-50" style={{ position: "sticky", top: 0 }}>
          <Lock className="text-gray-700 w-5 h-5 mr-2" />
          <span className="font-semibold text-gray-700 text-sm">
            Solo lectura: estado de este registro: <span className="text-violet-700">{initialData.estado === "Cerrado" || continuar ? "Cerrado" : initialData.estado}</span>
          </span>
        </div>
      )}

      <div className="p-6 md:p-10 max-w-6xl mx-auto bg-white">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {initialData.numeroCaso} - {motivo?.nombre || initialData.motivoNombre}
          </h1>
          <span className={`ml-3 px-3 py-1 text-xs font-semibold rounded-full ${getEstadoBadge(continuar ? "Cerrado" : initialData.estado)}`}>
            {continuar ? "Cerrado" : initialData.estado}
          </span>
        </div>
        <div className="flex flex-wrap text-xs text-gray-700 mb-6 border-b pb-2 gap-8">
          <span><b>Cliente:</b> {initialData.nombreCliente}</span>
          {initialData.idInversion && inversionNombre && (
            <span><b>Inversión:</b> {inversionNombre}</span>
          )}
          <span>
            <b>Creado:</b> {initialData.fechaCreacion ? new Date(initialData.fechaCreacion).toLocaleString("es-EC") : "-"}
          </span>
          <span>
            <b>Owner:</b> {initialData.nombreUsuarioPropietario || "-"}
          </span>
        </div>
        <form
          onSubmit={handleGuardar}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start"
        >
          <section className="border rounded-xl p-6 shadow-sm mb-0 flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">General</h2>
            {initialData.idInversion && MOTIVOS_REQUIEREN_INVERSION.includes(initialData.idMotivo) ? (
              <FormGroup label="Producto de inversión">
                <Input value={inversionNombre} disabled className="bg-gray-100 text-gray-500 font-medium" style={{ fontWeight: 500 }} />
              </FormGroup>
            ) : null}
            <FormGroup label="Motivo">
              <Input value={motivo?.nombre || initialData.motivoNombre} disabled className="bg-gray-100 text-gray-500 font-medium" style={{ fontWeight: 500 }} />
            </FormGroup>
            <FormGroup label="Descripción">
              <textarea
                className={`w-full border border-gray-300 rounded-lg p-2 text-sm ${continuar ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
                value={form.descripcion || ""}
                onChange={e => setForm(prev => ({ ...prev, descripcion: e.target.value }))}
                rows={3}
                required
                disabled={continuar}
              />
            </FormGroup>
            {renderCamposEspecificos()}
          </section>
          <div className="flex flex-col gap-6 w-full">
            <section className="border rounded-xl p-6 shadow-sm flex flex-col gap-6">
              {hayDocumentosFaltantes && (
                <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 p-3 rounded mb-4 flex flex-col gap-2">
                  <b>Faltan documentos por cargar:</b>
                  <ul className="list-disc pl-6">
                    {getDocumentosFaltantes().map((nombre, idx) => (
                      <li key={idx}>{nombre}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <Label className="font-medium text-gray-700 text-sm mb-1 block">Estado actual</Label>
                <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getEstadoBadge(continuar ? "Cerrado" : initialData.estado)}`}>
                  {continuar ? "Cerrado" : initialData.estado}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <Label className="font-medium text-gray-700 text-base">¿Continuar flujo?</Label>
                <Switch
                  checked={continuar}
                  onCheckedChange={handleSwitchContinuar}
                  disabled={continuar || guardando}
                  className="data-[state=checked]:bg-violet-600 border data-[state=checked]:border-violet-600 data-[state=unchecked]:border-gray-300 data-[state=unchecked]:bg-gray-200 h-6 w-11 rounded-full relative transition-colors duration-200"
                />
              </div>
              <div className="flex gap-4 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/casos/vista")}
                  className="px-6"
                  disabled={guardando}
                >
                  Regresar
                </Button>
                <Button
                  type="submit"
                  className="bg-violet-600 hover:bg-violet-700 text-white px-8"
                  disabled={continuar || guardando}
                >
                  {guardando ? <span className="animate-spin mr-2">⏳</span> : null}
                  Actualizar Caso
                </Button>
              </div>
            </section>
            <section className="border border-gray-300 rounded-xl p-6 shadow-sm mt-0">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Documentos Adjuntos</h2>
              <TablaCustom2
                columns={columnasDocs}
                data={documentos}
                mostrarEditar={!soloLectura}
                mostrarAgregarNuevo={false}
                mostrarEliminar={false}
                onEditarClick={(item) => {
                  setDocumentoId(item.idDocumento);
                  setSoloVerAdjunto(soloLectura); // Si está bloqueado, siempre es solo ver
                  setIsDialogOpen(true);
                }}
              />
            </section>
          </div>
        </form>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adjunto</DialogTitle>
              <DialogDescription>
                {soloLectura ? "Visualización de archivo adjunto" : "Editar archivo"}
              </DialogDescription>
            </DialogHeader>
            {/* <- Aquí va la magia */}
            <AdjuntoForm
              documentoId={documentoId}
              readOnly={soloVerAdjunto}
              onClose={() => {
                setIsDialogOpen(false);
                if (initialData?.idCaso) cargarDocumentos(initialData.idCaso);
              }}
            />
          </DialogContent>
        </Dialog>
        {modalAdvertencia && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
            <div className="bg-white p-7 rounded-xl shadow-lg max-w-sm w-full border">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="w-6 h-6 text-yellow-500" />
                <span className="font-bold text-lg text-gray-800">¿Estás seguro?</span>
              </div>
              <p className="text-gray-700 mb-4">
                Si continúas con el flujo, este caso se bloqueará y no podrá ser editado.<br />
                <b>¿Deseas continuar?</b>
              </p>
              <div className="flex justify-end gap-4 mt-5">
                <Button variant="outline" onClick={() => setModalAdvertencia(false)}>Cancelar</Button>
                <Button
                  className="bg-violet-600 text-white"
                  onClick={handleConfirmarContinuarFlujo}
                  disabled={guardando}
                >
                  {guardando ? <span className="animate-spin mr-2">⏳</span> : null}
                  Sí, continuar flujo
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FormGroup({ label, children }) {
  return (
    <div className="space-y-1.5 relative">
      <Label className="font-medium text-gray-700 text-sm">{label}</Label>
      {children}
    </div>
  );
}
