import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  getTipoSolicitudById,
  createTipoSolicitud,
  updateTipoSolicitud,
} from "@/service/Catalogos/TipoSolicitudService";
import { ArrowLeft } from "lucide-react";

export default function TipoSolicitudForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [tipoSolicitud, setTipoSolicitud] = useState("");

  // Obtener ID del usuario logueado desde localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const idUsuario = user?.usuario?.idUsuario;

  useEffect(() => {
    if (isEdit) {
      (async () => {
        try {
          const data = await getTipoSolicitudById(id);
          setTipoSolicitud(data.nombreTipoDeSolicitud);
        } catch (err) {
          console.error("Error al cargar tipo de solicitud:", err);
        }
      })();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        idTipoSolicitud: isEdit ? parseInt(id, 10) : 0,
        nombreTipoDeSolicitud: tipoSolicitud,
        ...(isEdit
          ? { idUsuarioModificacion: idUsuario }
          : { idUsuarioCreacion: idUsuario }),
      };

      if (isEdit) {
        await updateTipoSolicitud(payload);
        toast.success("Tipo Solicitud actualizada correctamente");
      } else {
        await createTipoSolicitud(payload);
        toast.success("Tipo Solicitud creada correctamente");
      }

      navigate("/catalogo/tiposolicitud/vista");
    } catch (err) {
      console.error("Error al guardar tipo de solicitud:", err);
      toast.error("Error al guardar el tipo de solicitud");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="link"
          onClick={() => navigate("/catalogo/tiposolicitud/vista")}
          className="text-blue-600 px-0"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Volver a Tipo Solicitud
        </Button>
        <h1 className="text-2xl font-bold text-gray-800">
          {isEdit ? "Editar Tipo Solicitud" : "Crear Tipo Solicitud"}
        </h1>
      </div>

      <Card className="shadow-lg border border-gray-200 rounded-2xl">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="font-medium text-gray-700">Descripción</Label>
              <Input
                placeholder="Ej: Quito"
                value={tipoSolicitud}
                onChange={(e) => setTipoSolicitud(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Guardar Tipo Solicitud
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
