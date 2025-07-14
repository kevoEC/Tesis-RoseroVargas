import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GlassLoader from "@/components/ui/GlassLoader";
import TablaCustom2 from "@/components/shared/TablaCustom2";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Lock, Eye, FilePlus2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import AdjuntoForm from "@/components/solicitud/AdjuntoForm";

// --- SERVICES
import {
  getAdendumById,
  actualizarIncremento,
  crearIncrementoProyeccion,
  getDocumentosPorAdendum,
  generarDocumentosAdendum,
  continuarFlujoAdendum,
} from "@/service/Entidades/AdendumService";
import { getCronogramaByProyeccionId } from "@/service/Entidades/ProyeccionService";

const ESTADO_LABEL = {
  1: { txt: "Creado", color: "bg-blue-100 text-blue-700" },
  2: { txt: "Conciliación", color: "bg-yellow-100 text-yellow-700" },
  3: { txt: "Finalizado", color: "bg-green-100 text-green-700" },
  4: { txt: "Proyectado", color: "bg-purple-100 text-purple-700" },
};

function EstadoPill({ estado }) {
  const data = ESTADO_LABEL[estado] || { txt: "Desconocido", color: "bg-gray-200 text-gray-500" };
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full ${data.color}`}>
      {data.txt}
      {[3, 4].includes(estado) && <Lock className="inline w-4 h-4 ml-1" />}
    </span>
  );
}

export default function Adendum() {
  const { idAdendum } = useParams();
  const navigate = useNavigate();
  const { user, roles } = useAuth();
  const userId = user?.id;

  // Estados principales
  const [adendum, setAdendum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cronogramaOriginal, setCronogramaOriginal] = useState([]);
  const [cronogramaIncremento, setCronogramaIncremento] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [documentos, setDocumentos] = useState([]);

  // Adjuntos
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [documentoId, setDocumentoId] = useState(null);
  const [soloVerAdjunto, setSoloVerAdjunto] = useState(false);

  // Generar Incremento y flujo
  const [modalIncremento, setModalIncremento] = useState(false);
  const [generandoIncremento, setGenerandoIncremento] = useState(false);
  const [modalConfirmarFlujo, setModalConfirmarFlujo] = useState(false);
  const [generandoFlujo, setGenerandoFlujo] = useState(false);

  // Generar documentos
  const [generandoDocs, setGenerandoDocs] = useState(false);

  useEffect(() => {
    cargarAdendum();
    // eslint-disable-next-line
  }, [idAdendum]);

  const cargarAdendum = async () => {
    setLoading(true);
    try {
      const res = await getAdendumById(idAdendum);
      if (!res?.success) throw new Error("No se pudo obtener Adendum");
      setAdendum(res.adendum);

      // Cronograma Original
      if (res.adendum?.idProyeccionOriginal) {
        const cron = await getCronogramaByProyeccionId(res.adendum.idProyeccionOriginal);
        setCronogramaOriginal(Array.isArray(cron?.cronograma) ? cron.cronograma : []);
      } else {
        setCronogramaOriginal([]);
      }
      // Cronograma Incremento (solo si ya hay incremento)
      if (res.adendum?.idProyeccionIncremento) {
        const cronInc = await getCronogramaByProyeccionId(res.adendum.idProyeccionIncremento);
        setCronogramaIncremento(Array.isArray(cronInc?.cronograma) ? cronInc.cronograma : []);
      } else {
        setCronogramaIncremento([]);
      }
      // Adjuntos
      await cargarDocumentos(res.adendum.idAdendum);
    } catch (e) {
      toast.error("Error al cargar Adendum: " + (e.message || e));
      setAdendum(null);
      setCronogramaOriginal([]);
      setCronogramaIncremento([]);
      setDocumentos([]);
    } finally {
      setLoading(false);
    }
  };

  const cargarDocumentos = async (id) => {
    setLoadingDocs(true);
    try {
      const res = await getDocumentosPorAdendum(id);
      if (!res.success) throw new Error("Error al obtener documentos");
      setDocumentos(Array.isArray(res.documentos) ? res.documentos : []);
    } catch (e) {
      toast.error("Error al cargar documentos: " + (e.message || e));
      setDocumentos([]);
    } finally {
      setLoadingDocs(false);
    }
  };

  // Permisos de edición para documentos específicos y roles
  const puedeEditarDocumento = (doc) => {
    if (!doc) return false;
    const nombrePermitido = "Conciliación comprobante de abono (Adendum)";
    const rolesPermitidos = ["Administrador", "Analista financiero"];
    // Solo si es el documento específico Y rol permitido -> editar
    if (doc.documentoNombre === nombrePermitido && roles.some(r => rolesPermitidos.includes(r))) {
      return true;
    }
    // Para todos los demás documentos, mientras el adendum no esté finalizado (3), permitir edición
    if (adendum?.estado !== 3) {
      return true;
    }
    // En estado 3, bloqueo total excepto solo ver
    return false;
  };

  // ¿Se puede generar documentos? Solo si estado es 4 (Proyectado)
  const puedeGenerarDocumentos = adendum?.estado === 4;

  // ¿Se puede confirmar incremento? Debe tener al menos un documento con archivoBase64 != null
  const documentosConArchivo = documentos.some(doc => doc.archivoBase64 !== null);
  const puedeConfirmarIncremento = documentosConArchivo && adendum?.estado === 4;

  // Handler para generar documentos
  const handleGenerarDocumentos = async () => {
    if (!puedeGenerarDocumentos) return;
    setGenerandoDocs(true);
    try {
      const res = await generarDocumentosAdendum(adendum.idAdendum, userId);
      if (!res.success) throw new Error(res.message || "Error al generar documentos");
      toast.success("Documentos generados correctamente");
      await cargarDocumentos(adendum.idAdendum);
      // El estado cambia a 2 (Conciliación), así que recargar Adendum para actualizar estado
      await cargarAdendum();
    } catch (e) {
      toast.error("Error al generar documentos: " + (e.message || e));
    } finally {
      setGenerandoDocs(false);
    }
  };

  // Handler para confirmar incremento (continuar flujo)
  const handleConfirmarIncremento = async () => {
    setModalConfirmarFlujo(false);
    setGenerandoFlujo(true);
    try {
      const res = await continuarFlujoAdendum(adendum.idAdendum, userId);
      if (!res.success) throw new Error(res.message || "Error al continuar flujo");
      toast.success("Adendum actualizado y flujo continuado correctamente");
      await cargarAdendum();
      await cargarDocumentos(adendum.idAdendum);
    } catch (e) {
      toast.error("Error al confirmar incremento: " + (e.message || e));
    } finally {
      setGenerandoFlujo(false);
    }
  };

  // Botón generar incremento (existente)
  const puedeGenerarIncremento = adendum && !adendum.idProyeccionIncremento && adendum.estado !== 3;

  const handleGenerarIncremento = async () => {
    setGenerandoIncremento(true);
    try {
      const respInc = await crearIncrementoProyeccion({
        idProyeccionOriginal: adendum.idProyeccionOriginal,
        periodoIncremento: adendum.periodoIncremento,
        montoIncremento: adendum.montoIncremento,
        idUsuario: userId
      });
      if (!respInc.success) throw new Error(respInc.message || "No se pudo crear incremento");

      const respAdendum = await actualizarIncremento({
        idAdendum: adendum.idAdendum,
        idProyeccionIncremento: respInc.proyeccion.idProyeccion,
        idCronogramaProyeccionIncremento: respInc.cronograma?.[0]?.idCronogramaProyeccion ?? respInc.idProyeccion,
        idUsuarioModificacion: userId
      });
      if (!respAdendum.success) throw new Error("No se pudo actualizar Adendum con el incremento");

      toast.success("¡Incremento realizado y Adendum actualizado!");
      setModalIncremento(false);
      await cargarAdendum();
    } catch (e) {
      toast.error("Error al realizar incremento: " + (e.message || e));
    } finally {
      setGenerandoIncremento(false);
    }
  };

  // Tabla columnas documentos con botón según estado y rol
  const columnasDocs = [
    { key: "idDocumento", label: "ID" },
    { key: "idTipoDocumento", label: "ID Tipo" },
    { key: "documentoNombre", label: "Nombre" },
    {
      key: "acciones",
      label: "Acciones",
      render: (_, doc) => {
        const soloLectura = adendum.estado === 3;
        const editable = puedeEditarDocumento(doc);
        if (soloLectura) {
          // Solo ver
          return (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="text-primary hover:bg-violet-100"
              onClick={() => {
                setDocumentoId(doc.idDocumento);
                setSoloVerAdjunto(true);
                setIsDialogOpen(true);
              }}
              title="Ver documento"
            >
              <Eye size={18} />
            </Button>
          );
        } else {
          // Si puede editar, botón editar, si no, solo ver
          return (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="text-primary hover:bg-violet-100"
              onClick={() => {
                setDocumentoId(doc.idDocumento);
                setSoloVerAdjunto(!editable);
                setIsDialogOpen(true);
              }}
              title={editable ? "Editar documento" : "Ver documento"}
              disabled={adendum.estado === 3} // bloqueo extra si ya finalizado
            >
              <Eye size={18} />
            </Button>
          );
        }
      }
    }
  ];

  if (loading || !adendum) {
    return <GlassLoader visible message="Cargando Adendum..." />;
  }

  return (
    <div className="relative">
      {[3, 4].includes(adendum.estado) && (
        <div
          className="w-full flex items-center px-6 py-2 bg-gray-50 border-b border-gray-300 shadow-sm mb-2 z-50"
          style={{ position: "sticky", top: 0 }}
        >
          <Lock className="text-gray-700 w-5 h-5 mr-2" />
          <span className="font-semibold text-gray-700 text-sm">
            {adendum.estado === 3
              ? "Este Adendum está cerrado y es de solo lectura."
              : "Este Adendum está proyectado y bloqueado."}
          </span>
        </div>
      )}

      <div className="p-6 md:p-10 max-w-6xl mx-auto bg-white">
        {/* CABECERA CON BOTÓN REGRESAR */}
        <div className="flex flex-wrap items-center gap-2 mb-4 justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate(-1)} className="px-4 py-1">
              Regresar
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{adendum.nombreAdendum}</h1>
            <EstadoPill estado={adendum.estado} />
          </div>
        </div>
        <div className="flex flex-wrap text-xs text-gray-700 mb-6 border-b pb-2 gap-8">
          <span>
            <b>Creado:</b> {adendum.fechaCreacion ? new Date(adendum.fechaCreacion).toLocaleString("es-EC") : "-"}
          </span>
          <span><b>Owner:</b> {adendum.idUsuarioPropietario || "-"}</span>
        </div>

        {/* FORMULARIO GENERAL */}
        <section className="border rounded-xl p-6 shadow-sm mb-6 flex flex-col gap-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <FormGroup label="Monto de Incremento">
              <input
                type="number"
                value={adendum.montoIncremento}
                disabled
                className="bg-gray-100 text-gray-700 font-medium"
              />
            </FormGroup>
            <FormGroup label="Periodo de Incremento">
              <input
                type="number"
                value={adendum.periodoIncremento}
                disabled
                className="bg-gray-100 text-gray-700 font-medium"
              />
            </FormGroup>
            <FormGroup label="Estado">
              <EstadoPill estado={adendum.estado} />
            </FormGroup>
          </div>

          {/* BOTONES GENERAR DOCUMENTOS Y CONFIRMAR INCREMENTO */}
          <div className="mt-4 flex gap-4 justify-end">
            {puedeGenerarDocumentos && (
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                onClick={handleGenerarDocumentos}
                disabled={generandoDocs || documentos.length > 0 || adendum.estado === 3}
                title={
                  documentos.length > 0
                    ? "Ya hay documentos generados"
                    : adendum.estado === 3
                    ? "Adendum cerrado. No puede generar documentos"
                    : ""
                }
              >
                {generandoDocs ? <span className="animate-spin mr-2">⏳</span> : <FilePlus2 className="mr-2" />}
                Generar Documentos
              </Button>
            )}
            {puedeConfirmarIncremento && (
              <Button
                className="bg-green-600 hover:bg-green-700 text-white px-6"
                onClick={() => setModalConfirmarFlujo(true)}
                disabled={generandoFlujo || adendum.estado === 3}
                title={adendum.estado === 3 ? "Adendum cerrado. No puede confirmar incremento" : ""}
              >
                {generandoFlujo ? <span className="animate-spin mr-2">⏳</span> : <CheckCircle className="mr-2" />}
                Confirmar Incremento
              </Button>
            )}
          </div>
        </section>

        {/* CRONOGRAMAS */}
        <section className="border rounded-xl p-6 shadow-sm mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Cronograma proyección inicial</h2>
          <TablaCustom2
            columns={getCronogramaCols()}
            data={Array.isArray(cronogramaOriginal) ? cronogramaOriginal : []}
            mostrarEditar={false}
            mostrarAgregarNuevo={false}
            mostrarEliminar={false}
          />
        </section>

        <section className="border rounded-xl p-6 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-lg font-bold text-gray-800">Cronograma proyección de incremento</h2>
            {!adendum.idProyeccionIncremento && (
              <Lock className="w-5 h-5 text-gray-400" title="Bloqueado hasta generar incremento" />
            )}
          </div>
          {adendum.idProyeccionIncremento ? (
            <TablaCustom2
              columns={getCronogramaCols()}
              data={Array.isArray(cronogramaIncremento) ? cronogramaIncremento : []}
              mostrarEditar={false}
              mostrarAgregarNuevo={false}
              mostrarEliminar={false}
            />
          ) : (
            <div className="bg-gray-100 rounded-xl py-8 px-4 text-center text-gray-600 flex flex-col items-center gap-2">
              <Lock className="w-8 h-8 mb-1 text-gray-400" />
              <span>
                Proyección de incremento aún no generada. Para realizar el incremento pulsa el botón "Generar incremento".
              </span>
              {puedeGenerarIncremento && (
                <Button
                  className="mt-3 bg-violet-600 hover:bg-violet-700 text-white px-8"
                  onClick={() => setModalIncremento(true)}
                  disabled={generandoIncremento || adendum.estado === 3}
                  title={adendum.estado === 3 ? "Adendum cerrado. No puede generar incremento" : ""}
                >
                  <FilePlus2 className="mr-2" /> Generar incremento
                </Button>
              )}
            </div>
          )}
        </section>

        {/* DOCUMENTOS ADJUNTOS */}
        <section className="border rounded-xl p-6 shadow-sm mt-0 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Documentos Adjuntos</h2>
          <TablaCustom2
            columns={columnasDocs}
            data={Array.isArray(documentos) ? documentos : []}
            mostrarEditar={false}
            mostrarAgregarNuevo={false}
            mostrarEliminar={false}
            loading={loadingDocs}
            onEditarClick={(item) => {
              setDocumentoId(item.idDocumento);
              // Si estado 3 solo ver, si no depende permiso y doc
              if (adendum.estado === 3) {
                setSoloVerAdjunto(true);
              } else {
                setSoloVerAdjunto(!puedeEditarDocumento(item));
              }
              setIsDialogOpen(true);
            }}
          />
        </section>

        {/* MODAL CONFIRMAR INCREMENTO */}
        {modalConfirmarFlujo && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-sm w-full border">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="text-gray-700 w-5 h-5" />
                <span className="font-bold text-lg text-gray-800">¿Estás seguro de finalizar el Adendum?</span>
              </div>
              <p className="text-gray-700 mb-4">
                Esta acción modificará la inversión de forma permanente y no podrá deshacerse.
                <br />
                <b>¿Deseas continuar?</b>
              </p>
              <div className="flex justify-end gap-4 mt-5">
                <Button variant="outline" onClick={() => setModalConfirmarFlujo(false)}>Cancelar</Button>
                <Button
                  className="bg-green-600 text-white"
                  onClick={handleConfirmarIncremento}
                  disabled={generandoFlujo}
                >
                  {generandoFlujo ? <span className="animate-spin mr-2">⏳</span> : null}
                  Sí, finalizar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* DIALOGO VER/EDITAR ADJUNTO */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adjunto</DialogTitle>
              <DialogDescription>
                {soloVerAdjunto ? "Visualización de archivo adjunto" : "Editar archivo"}
              </DialogDescription>
            </DialogHeader>
            <AdjuntoForm
              documentoId={documentoId}
              readOnly={soloVerAdjunto}
              onClose={() => {
                setIsDialogOpen(false);
                if (adendum?.idAdendum) cargarDocumentos(adendum.idAdendum);
              }}
            />
          </DialogContent>
        </Dialog>

        {/* MODAL GENERAR INCREMENTO */}
        {modalIncremento && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-sm w-full border">
              <div className="flex items-center gap-2 mb-3">
                <FilePlus2 className="w-7 h-7 text-violet-600" />
                <span className="font-bold text-lg text-gray-800">¿Estás seguro de generar el incremento?</span>
              </div>
              <p className="text-gray-700 mb-4">
                Una vez generado el incremento no podrás editar el monto ni el periodo.<br />
                <b>¿Deseas continuar?</b>
              </p>
              <div className="flex justify-end gap-4 mt-5">
                <Button variant="outline" onClick={() => setModalIncremento(false)}>Cancelar</Button>
                <Button
                  className="bg-violet-600 text-white"
                  onClick={handleGenerarIncremento}
                  disabled={generandoIncremento}
                >
                  {generandoIncremento ? <span className="animate-spin mr-2">⏳</span> : <CheckCircle className="w-4 h-4 mr-1" />}
                  Sí, generar incremento
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Columnas Cronograma Proyección ---
function getCronogramaCols() {
  return [
    { key: "periodo", label: "Periodo" },
    {
      key: "fechaInicial",
      label: "Fecha Inicial",
      render: (val) => (val ? new Date(val).toLocaleDateString() : "-"),
    },
    {
      key: "fechaVencimiento",
      label: "Fecha Vencimiento",
      render: (val) => (val ? new Date(val).toLocaleDateString() : "-"),
    },
    {
      key: "capital",
      label: "Capital",
      render: (val) => val?.toLocaleString("es-EC", { minimumFractionDigits: 2 }) ?? "0.00",
    },
    {
      key: "aporteAdicional",
      label: "Aporte Adic.",
      render: (val) => val?.toLocaleString("es-EC", { minimumFractionDigits: 2 }) ?? "0.00",
    },
    {
      key: "tasa",
      label: "Tasa (%)",
      render: (val) => (val?.toFixed(4) ?? "-"),
    },
    {
      key: "rentabilidad",
      label: "Rentab.",
      render: (val) => val?.toLocaleString("es-EC", { minimumFractionDigits: 2 }) ?? "0.00",
    },
    {
      key: "rentaPeriodo",
      label: "Renta Periodo",
      render: (val) => val?.toLocaleString("es-EC", { minimumFractionDigits: 2 }) ?? "0.00",
    },
    {
      key: "costoOperativo",
      label: "Costo Oper.",
      render: (val) => val?.toLocaleString("es-EC", { minimumFractionDigits: 2 }) ?? "0.00",
    },
    {
      key: "montoPagar",
      label: "Monto Pagar",
      render: (val) => val?.toLocaleString("es-EC", { minimumFractionDigits: 2 }) ?? "0.00",
    },
  ];
}

function FormGroup({ label, children }) {
  return (
    <div className="space-y-1.5 relative">
      <Label className="font-medium text-gray-700 text-sm">{label}</Label>
      {children}
    </div>
  );
}
