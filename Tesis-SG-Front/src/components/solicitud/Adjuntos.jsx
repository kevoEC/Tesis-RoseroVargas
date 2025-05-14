import { useEffect, useState } from "react";
import {
  getAdjuntos,
  deleteallAdjunto,
  generateallAdjunto,
} from "@/service/Entidades/AdjuntoService";
import TablaCustom2 from "@/components/shared/TablaCustom2";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import AdjuntoForm from "./AdjuntoForm";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Adjuntos({ id }) {
  const [documentos, setDocumentos] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [documentoId, setDocumentoId] = useState(null);
  const [loadingAll, setLoadingAll] = useState(false);

  // Extraemos fetchData para poder reutilizarlo
  const fetchData = async () => {
    try {
      const data = await getAdjuntos(id);
      setDocumentos(data.documentos);
    } catch (error) {
      console.error("Error al cargar documentos:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleEditar = (item) => {
    setDocumentoId(item.idDocumento);
    setIsDialogOpen(true);
  };

  const handleGenerateAll = async () => {
    setLoadingAll(true);
    try {
      // Primero borramos todos
      await deleteallAdjunto(id);
      // Luego generamos todos con el body requerido
      await generateallAdjunto({
        idMotivo: 32,
        idSolicitudInversion: Number(id),
      });
      toast.success("Adjuntos regenerados correctamente");
      await fetchData();
    } catch (err) {
      console.error("Error en regenerar adjuntos:", err);
      toast.error("No se pudieron regenerar los adjuntos");
    } finally {
      setLoadingAll(false);
    }
  };

  const columnas = [
    {
      key: "idDocumento",
      label: "IdDocumento",
      render: (value) => (
        <div className="text-end font-semibold text-gray-800">{value}</div>
      ),
    },
    { key: "tipoDocumentoNombre", label: "Nombres" },
  ];

  return (
    <div>
      <Card className="border border-muted rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.12)]">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Lista de Adjuntos</CardTitle>
          <Button
            onClick={handleGenerateAll}
            disabled={loadingAll}
            className="bg-green-600 hover:bg-green-700 text-white text-sm"
          >
            {loadingAll ? "Procesando..." : "Generar Documentos"}
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <TablaCustom2
            columns={columnas}
            data={documentos}
            mostrarEditar={true}
            mostrarAgregarNuevo={false}
            mostrarEliminar={false}
            onEditarClick={handleEditar}
          />
        </CardContent>
      </Card>

      <Dialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        className="min-w-3xl"
      >
        <DialogContent className="min-w-3xl">
          <DialogHeader>
            <DialogTitle>Adjunto</DialogTitle>
            <DialogDescription>
              Completa la información del adjunto
            </DialogDescription>
          </DialogHeader>
          <AdjuntoForm
            documentoId={documentoId}
            onClose={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
