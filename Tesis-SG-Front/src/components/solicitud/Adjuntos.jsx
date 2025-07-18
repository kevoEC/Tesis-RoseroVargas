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
import { Save, Eye, FileText, Download } from "lucide-react";
import GlassLoader from "@/components/ui/GlassLoader";

// Plantillas con icono y descripción personalizada
const PLANTILLAS = [
  {
    nombre: "Conozca a su Cliente",
    url: "https://drive.google.com/file/d/1MJPmOmEEL8D_NiKFwv2xmI-f0kItRGjY/view?usp=sharing",
    icon: <FileText className="w-6 h-6 mx-auto text-primary" />,
  },
  {
    nombre: "Tratamiento de Datos Personales",
    url: "https://drive.google.com/file/d/1J38gOr_pGhzNlZk7CJjBAXehhtmDGLRW/view?usp=sharing",
    icon: <FileText className="w-6 h-6 mx-auto text-sky-700" />,
  },
];

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
  const [bloquearTodo, setBloquearTodo] = useState(false);
  const [readOnly, setReadOnly] = useState(false);

  // Carga todo, y detecta fase para bloquear
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

      // Bloquear todo si faseProceso !== 1
      const bloqueado = solicitudRes.data[0]?.faseProceso !== 1;
      setBloquearTodo(bloqueado);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleEditar = (item, soloVer = false) => {
    setDocumentoId(item.idDocumento);
    setReadOnly(soloVer);
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
      toast.error("Error al generar documentos." + err.message);
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

  // --- Columnas: ojo solo en modo solo-ver ---
  const columnas = [
    {
      key: "idDocumento",
      label: "",
      render: (value, row) => {
        if (bloquearTodo) {
          return (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="text-primary hover:bg-violet-100"
              onClick={() => handleEditar(row, true)}
              title="Ver"
            >
              <Eye size={18} />
            </Button>
          );
        }
        // Mostrar icono documento con tooltip id
        return (
          <div
            className="flex items-center justify-center group relative text-gray-500 cursor-default"
            title={`ID: ${value}`}
          >
            <FileText className="w-5 h-5" />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 text-xs text-white bg-zinc-800 px-2 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
              ID: {value}
            </span>
          </div>
        );
      },
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

      <h2 className="text-xl font-semibold text-gray-800">Adjuntos</h2>
      {bloquearTodo && (
        <div className="w-full flex items-center px-6 py-2 mb-4 rounded-xl bg-yellow-100 border border-yellow-300 text-yellow-800 font-semibold">
          <span>No se permite editar adjuntos en esta fase.</span>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={handleGuardar}
          className="bg-primary text-white flex items-center gap-2 hover:bg-primary/80"
          disabled={bloquearTodo || loadingGuardar || loadingAll || loadingInitial}
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
            disabled={bloquearTodo || formData.confirmaCargaDocumentosCorrectos}
          />

          <FormCheckbox
            label="¿Ver documentos requeridos?"
            checked={formData.verDocumentosRequeridos}
            onChange={() => !bloquearTodo && setOpenAlert(true)}
            disabled={bloquearTodo || formData.confirmaCargaDocumentosCorrectos}
          />

          <FormCheckbox
            label="¿Confirma que cargó todos los documentos?"
            checked={formData.confirmaCargaDocumentosCorrectos}
            onChange={(checked) =>
              !bloquearTodo && setFormData({ ...formData, confirmaCargaDocumentosCorrectos: checked })
            }
            disabled={bloquearTodo}
          />
        </div>
      </Card>

      {/* Tabla de documentos */}
      <Card className="border border-muted shadow">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Lista de Adjuntos</CardTitle>
          {/* Botones de plantillas */}
          <div className="flex gap-3">
            {PLANTILLAS.map((plantilla) => (
              <a
                key={plantilla.nombre}
                href={plantilla.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center px-3 py-2 rounded-lg border border-primary/30 hover:bg-primary/10 transition"
                title={`Descargar: ${plantilla.nombre}`}
              >
                {plantilla.icon}
                <span className="text-xs font-medium text-gray-700 text-center mt-1">{plantilla.nombre}</span>
                <span className="flex items-center gap-1 text-primary text-[11px] font-semibold mt-0.5">
                  <Download className="w-3 h-3" />
                  Descargar
                </span>
              </a>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <TablaCustom2
            columns={columnas}
            data={documentos}
            mostrarEditar={!bloquearTodo}
            mostrarAgregarNuevo={false}
            mostrarEliminar={false}
            onEditarClick={(item) => handleEditar(item, false)}
          />
        </CardContent>
      </Card>

      {/* Modal edición individual */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjunto</DialogTitle>
            <DialogDescription>
              {readOnly ? "Visualización de archivo adjunto" : "Editar archivo"}
            </DialogDescription>
          </DialogHeader>
          <AdjuntoForm
            documentoId={documentoId}
            readOnly={readOnly}
            onClose={() => setIsDialogOpen(false)}
          />
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
            <AlertDialogAction
              onClick={bloquearTodo ? undefined : handleConfirmGenerate}
              disabled={bloquearTodo}
            >
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
