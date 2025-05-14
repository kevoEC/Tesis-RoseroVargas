import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  getTipoClienteById,
  createTipoCliente,
  updateTipoCliente,
} from "@/service/Catalogos/TipoClienteService";
import { ArrowLeft } from "lucide-react";

export default function TipoClienteForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [tipoCliente, setTipoCliente] = useState("");

  // Obtener ID del usuario logueado desde localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const idUsuario = user?.usuario?.idUsuario;

  useEffect(() => {
    if (isEdit) {
      (async () => {
        try {
          const data = await getTipoClienteById(id);
          setTipoCliente(data.nombreTipoCliente);
        } catch (err) {
          console.error("Error al cargar tipo de cliente:", err);
        }
      })();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        idTipoCliente: isEdit ? parseInt(id, 10) : 0,
        nombreTipoCliente: tipoCliente,
        ...(isEdit
          ? { idUsuarioModificacion: idUsuario }
          : { idUsuarioCreacion: idUsuario }),
      };

      if (isEdit) {
        await updateTipoCliente(payload);
        toast.success("Tipo Cliente actualizado correctamente");
      } else {
        await createTipoCliente(payload);
        toast.success("Tipo Cliente creado correctamente");
      }

      navigate("/catalogo/tipocliente/vista");
    } catch (err) {
      console.error("Error al guardar tipo de cliente:", err);
      toast.error("Error al guardar el tipo de cliente");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="link"
          onClick={() => navigate("/catalogo/tipocliente/vista")}
          className="text-blue-600 px-0"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Volver a Tipo Cliente
        </Button>
        <h1 className="text-2xl font-bold text-gray-800">
          {isEdit ? "Editar Tipo Cliente" : "Crear Tipo Cliente"}
        </h1>
      </div>

      <Card className="shadow-lg border border-gray-200 rounded-2xl">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="font-medium text-gray-700">Descripción</Label>
              <Input
                placeholder="Ej: Regular"
                value={tipoCliente}
                onChange={(e) => setTipoCliente(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Guardar Tipo Cliente
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
