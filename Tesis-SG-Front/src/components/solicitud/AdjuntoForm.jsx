import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateAdjunto, getAdjuntoById } from "@/service/Entidades/AdjuntoService";
import { Save } from "lucide-react";

export default function AdjuntoForm({ documentoId, onClose }) {
  const [archivoBase64, setArchivoBase64] = useState("");
  const [newFile, setNewFile] = useState(null);
  const [observaciones, setObservaciones] = useState("Subido por el cliente");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Cargar PDF inicial
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getAdjuntoById(documentoId);
        setArchivoBase64(res[0]?.base64Contenido || res[0]?.archivo || "");
      } catch {
        setError("Error al cargar el archivo.");
      } finally {
        setLoading(false);
      }
    })();
  }, [documentoId]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1];
      setNewFile(base64);
    };
    reader.readAsDataURL(file);
  };

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
        setArchivoBase64(newFile);
        setNewFile(null);
        onClose?.(); // Cierra modal si se pasa prop
      } else {
        toast.error("Error al guardar el archivo");
      }
    } catch {
      toast.error("Ocurrió un error al guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Adjunto</h2>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {archivoBase64 && !loading ? (
        <iframe
          src={`data:application/pdf;base64,${archivoBase64}`}
          title="Vista previa del documento"
          className="w-full h-[500px] border border-gray-300 rounded-md"
        />
      ) : !loading && (
        <p className="text-gray-500">No hay archivo cargado.</p>
      )}

      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium text-gray-700">Seleccionar archivo</Label>
          <Input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="cursor-pointer file:text-sm file:font-medium file:bg-primary file:text-white file:border-0 file:px-4 file:py-2 file:rounded-md"
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700">Observaciones</Label>
          <Input
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Subido por el cliente"
          />
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSaveFile}
            disabled={loading || !newFile}
            className="bg-primary text-white hover:bg-primary/80 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {loading ? "Guardando..." : "Guardar Adjunto"}
          </Button>
        </div>
      </div>
    </div>
  );
}
