import { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  updateAdjunto,
  getAdjuntoById,
  descargarAdjunto,
} from "@/service/Entidades/AdjuntoService";
import { Save, Download, Eye, FileText, FileX, RefreshCw } from "lucide-react";

export default function AdjuntoForm({
  documentoId,
  onClose,
  readOnly = false,
}) {
  const [archivoBase64, setArchivoBase64] = useState("");
  const [tipoArchivo, setTipoArchivo] = useState(""); // "pdf", "docx" o ""
  const [newFile, setNewFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [observaciones, setObservaciones] = useState("Subido por el cliente");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastApiResponse, setLastApiResponse] = useState(null);
  const fileInputRef = useRef();

  // Carga de datos al abrir o recargar
  const cargarAdjunto = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAdjuntoById(documentoId);
      setLastApiResponse(res[0]); // Debug

      const contenidoRaw = res[0]?.base64Contenido || res[0]?.archivo || "";
      // Normalizar para que archivoBase64 solo contenga la cadena pura sin el prefijo data:
      const contenido = contenidoRaw.startsWith("data:")
        ? contenidoRaw.split(",")[1]
        : contenidoRaw;

      setFileName(res[0]?.documentoNombre || "");
      if (contenido) {
        setArchivoBase64(contenido);
        setTipoArchivo(detectarTipoArchivo(contenido));
      } else {
        setArchivoBase64("");
        setTipoArchivo("");
      }
      setObservaciones(res[0]?.observaciones || "Subido por el cliente");
    } catch (e) {
      setError("Error al cargar el archivo." + (e.message || ""));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarAdjunto();
    // eslint-disable-next-line
  }, [documentoId]);

  // Detecta tipo de archivo por base64
  const detectarTipoArchivo = (base64) => {
    const encabezado = base64.slice(0, 10);
    if (encabezado.startsWith("JVBERi0")) return "pdf";
    if (encabezado.startsWith("UEsD")) return "docx";
    return "";
  };

  // Validación al seleccionar archivo
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (
      file.type !== "application/pdf" &&
      file.type !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      setError("Solo se permite PDF o DOCX.");
      fileInputRef.current.value = "";
      return;
    }
    if (file.size > 1024 * 1024) {
      setError("El archivo debe ser de máximo 1MB.");
      fileInputRef.current.value = "";
      return;
    }
    setError("");
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      const fullBase64 = reader.result; // EJ: "data:application/pdf;base64,JVBERi0x..."
      const base64Puro = fullBase64.split(",")[1];
      setNewFile(base64Puro); // para enviar al backend
      setArchivoBase64(base64Puro); // solo la parte base64 pura para preview
      setTipoArchivo(detectarTipoArchivo(base64Puro));
    };
    reader.readAsDataURL(file);
  };

  // Guardar archivo adjunto
  const handleSaveFile = async () => {
    if (!newFile) {
      setError("Selecciona un archivo para continuar");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payload = {
        base64Contenido: newFile,
        observaciones,
      };
      const res = await updateAdjunto(documentoId, payload);
      if (res.success) {
        toast.success("Archivo guardado correctamente");
        await cargarAdjunto(); // recargar para mantener todo consistente
        setNewFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        onClose?.();
      } else {
        toast.error("Error al guardar el archivo");
      }
    } catch {
      toast.error("Ocurrió un error al guardar");
    } finally {
      setLoading(false);
    }
  };

  // Descargar archivo
  const handleDescargarArchivo = async () => {
    try {
      const blob = await descargarAdjunto(documentoId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const filename =
        fileName || `documento_${documentoId}.${tipoArchivo || "docx"}`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toast.error("No se pudo descargar el archivo");
    }
  };

  return (
    <div className="space-y-6 p-2 md:p-4">
      <div className="flex items-center gap-2 mb-2">
        <FileText className="text-primary w-5 h-5" />
        <h2 className="text-xl md:text-2xl font-semibold">Adjunto</h2>
        {readOnly && (
          <span className="ml-2 px-2 py-0.5 bg-gray-100 border text-xs rounded text-gray-700 flex items-center gap-1">
            <Eye className="w-4 h-4 inline" /> Solo lectura
          </span>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-200 text-red-700 px-3 py-2 rounded text-sm flex items-center gap-2">
          <FileX className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Vista previa */}
      <div className="rounded border bg-gray-50 p-2 md:p-4 flex flex-col items-center w-full">
        {tipoArchivo === "pdf" ? (
          <iframe
            src={`data:application/pdf;base64,${archivoBase64}`}
            title="Vista previa del documento"
            className="w-full min-h-[400px] max-h-[600px] border border-gray-200 rounded-md shadow"
          />
        ) : tipoArchivo === "docx" ? (
          <div className="flex flex-col items-center gap-3 w-full">
            <div className="flex items-center gap-2">
              <FileText className="w-8 h-8 text-blue-600" />
              <span className="text-base font-medium">{fileName || "Archivo Word"}</span>
            </div>
            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleDescargarArchivo}
              disabled={loading}
            >
              <Download className="w-4 h-4" />
              Descargar archivo
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 w-full py-6">
            <p className="text-gray-500 text-sm text-center">
              {lastApiResponse
                ? lastApiResponse.archivo || lastApiResponse.base64Contenido
                  ? "El documento no puede ser previsualizado aquí, pero puedes intentar descargarlo."
                  : "Aún no se ha generado o cargado ningún archivo para este documento.<br/>Si acabas de generarlo, intenta recargar."
                : "No hay archivo cargado."}
            </p>
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-gray-500"
              onClick={cargarAdjunto}
              disabled={loading}
              title="Recargar adjunto"
            >
              <RefreshCw className="w-4 h-4" /> Recargar
            </Button>
            {lastApiResponse?.archivo && (
              <Button
                type="button"
                variant="outline"
                className="flex items-center gap-2"
                onClick={handleDescargarArchivo}
                disabled={loading}
              >
                <Download className="w-4 h-4" />
                Descargar archivo
              </Button>
            )}
          </div>
        )}
      </div>

      {!readOnly && (
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Seleccionar archivo <span className="text-xs text-gray-500">(PDF o DOCX, máx. 1MB)</span>
            </Label>
            <Input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              className="cursor-pointer file:text-sm file:font-medium file:bg-primary file:text-white file:border-0 file:px-4 file:py-2 file:rounded-md"
              disabled={loading || readOnly}
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700">Observaciones</Label>
            <Input
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Subido por el cliente"
              disabled={readOnly}
            />
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={handleSaveFile}
              disabled={loading || !newFile || readOnly}
              className="bg-primary text-white hover:bg-primary/80 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? "Guardando..." : "Guardar Adjunto"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
