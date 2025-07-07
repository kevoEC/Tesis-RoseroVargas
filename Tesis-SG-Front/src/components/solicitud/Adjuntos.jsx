import { useEffect, useState } from "react";
import { mapIdentificacionToUpdate } from "@/utils/mappers";
import {
  getAdjuntosPorMotivo,
  deleteallAdjunto,
  generateallAdjunto,
} from "@/service/Entidades/AdjuntoService";
import { getSolicitudById, updateSolicitud } from "@/service/Entidades/SolicitudService";
import { getModoFirma } from "@/service/Catalogos/FirmaService";
import TablaCustom2 from "@/components/shared/TablaCustom2";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import AdjuntoForm from "./AdjuntoForm";
import { Save } from "lucide-react";
import GlassLoader from "@/components/ui/GlassLoader";

export default function Adjuntos({ id }) {
  const [documentos, setDocumentos] = useState([]);
  const [solicitudData, setSolicitudData] = useState(null);
  const [formData, setFormData] = useState({
    idModoFirma: "1",
    verDocumentosRequeridos: false,
    confirmaCargaDocumentosCorrectos: false,
  });
  const [modoFirmaCatalogo, setModoFirmaCatalogo] = useState([]);
  const [loadingAll, setLoadingAll] = useState(false);
  const [loadingGuardar, setLoadingGuardar] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [documentoId, setDocumentoId] = useState(null);
  const [loadingInitial, setLoadingInitial] = useState(true);

  const fetchData = async () => {
    setLoadingInitial(true);
    try {
      const [docRes, solicitudRes, firmaRes] = await Promise.all([
        getAdjuntosPorMotivo(id, 32),
        getSolicitudById(id),
        getModoFirma(),
      ]);
      setDocumentos(docRes.data || []);
      setSolicitudData(solicitudRes.data[0]);

      const adj = solicitudRes.data[0]?.adjuntos || {};
      setFormData({
        idModoFirma: adj.idModoFirma || "1",
        verDocumentosRequeridos: adj.verDocumentosRequeridos || false,
        confirmaCargaDocumentosCorrectos: adj.confirmaCargaDocumentosCorrectos || false,
      });

      setModoFirmaCatalogo(firmaRes || []);
    } catch (err) {
      toast.error("Error al cargar adjuntos: " + err.message);
    } finally {
      setLoadingInitial(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleEditar = (item) => {
    setDocumentoId(item.idDocumento);
    setIsDialogOpen(true);
  };

  const handleConfirmGenerate = async () => {
    setOpenAlert(false);
    setLoadingAll(true);
    try {
      await deleteallAdjunto(id);
      await generateallAdjunto({ idMotivo: 32, idSolicitudInversion: Number(id) });
      setFormData((prev) => ({ ...prev, verDocumentosRequeridos: true }));
      await fetchData();
      toast.success("Documentos generados.");
    } catch (err) {
      toast.error("Error al generar documentos.");
    } finally {
      setLoadingAll(false);
    }
  };

  const handleGuardar = async () => {
    setLoadingGuardar(true);
    try {
      const payload = {
        ...solicitudData,
        identificacion: mapIdentificacionToUpdate(solicitudData.identificacion),
        adjuntos: formData,
      };
      const res = await updateSolicitud(id, payload);
      res.success
        ? toast.success("Sección documental guardada con exito.")
        : toast.error("Error al guardar.");
    } catch (err) {
      toast.error("Error: " + err.message);
    } finally {
      setLoadingGuardar(false);
    }
  };

  const columnas = [
    {
      key: "idDocumento",
      label: "",
      render: (value) => (
        <div className="flex items-center justify-center group relative text-gray-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6M5 4v16h14V4H5zm2 2h10v12H7V6z" />
          </svg>
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 text-xs text-white bg-zinc-800 px-2 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 whitespace-nowrap">
            ID: {value}
          </span>
        </div>
      ),
    },
    { key: "tipoDocumentoNombre", label: "Tipo de Documento" },
    { key: "motivoNombre", label: "Motivo" },
  ];

  return (
    <div className="space-y-6 relative">
      <GlassLoader
        visible={loadingInitial || loadingAll || loadingGuardar}
        message={
          loadingInitial
            ? "Cargando datos..."
            : loadingAll
            ? "Generando documentos..."
            : loadingGuardar
            ? "Guardando..."
            : ""
        }
      />

      <div className="flex justify-end">
        <Button
          onClick={handleGuardar}
          className="bg-primary text-white flex items-center gap-2 hover:bg-primary/80"
          disabled={loadingGuardar || loadingAll || loadingInitial}
        >
          <Save className="w-4 h-4" /> Guardar
        </Button>
      </div>
      {/* Panel superior de configuración */}
      <Card className="p-6 border border-muted space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FormSelect
            label="Modo de Firma"
            options={modoFirmaCatalogo}
            value={formData.idModoFirma}
            onChange={(v) => setFormData({ ...formData, idModoFirma: v })}
            disabled={formData.confirmaCargaDocumentosCorrectos}
          />

          <FormCheckbox
            label="¿Ver documentos requeridos?"
            checked={formData.verDocumentosRequeridos}
            onChange={() => setOpenAlert(true)}
            disabled={formData.confirmaCargaDocumentosCorrectos}
          />

          <FormCheckbox
            label="¿Confirma que cargó todos los documentos?"
            checked={formData.confirmaCargaDocumentosCorrectos}
            onChange={(checked) =>
              setFormData({ ...formData, confirmaCargaDocumentosCorrectos: checked })
            }
          />
        </div>
      </Card>

      {/* Tabla de documentos */}
      <Card className="border border-muted shadow">
        <CardHeader>
          <CardTitle>Lista de Adjuntos</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <TablaCustom2
            columns={columnas}
            data={documentos}
            mostrarEditar
            mostrarAgregarNuevo={false}
            mostrarEliminar={false}
            onEditarClick={handleEditar}
          />
        </CardContent>
      </Card>

      {/* Modal edición individual */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjunto</DialogTitle>
            <DialogDescription>Editar archivo</DialogDescription>
          </DialogHeader>
          <AdjuntoForm documentoId={documentoId} onClose={() => setIsDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Confirmación generación */}
      <AlertDialog open={openAlert} onOpenChange={setOpenAlert}>
        <AlertDialogContent className="bg-white text-gray-900 border border-gray-300">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Deseas generar todos los documentos requeridos?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmGenerate}>
              Sí, generar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Reutilizables
function FormSelect({ label, options, value, onChange, disabled }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      <Select value={value ? String(value) : ""} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="bg-white border border-gray-700">
          <SelectValue placeholder="Seleccionar..." />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {options.map((opt) => (
            <SelectItem key={opt.idModoFirma} value={String(opt.idModoFirma)}>
              {opt.nombreModoFirma}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function FormCheckbox({ label, checked, onChange, disabled }) {
  return (
    <div className="flex items-center gap-3">
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
        className={`
          peer h-6 w-11 shrink-0 cursor-pointer items-center rounded-full
          border transition-colors duration-200 ease-in-out
          ${checked ? "bg-primary border-primary" : "bg-white border-gray-400"}
        `}
      />
      <Label className="text-sm text-gray-700 font-medium">{label}</Label>
    </div>
  );
}
