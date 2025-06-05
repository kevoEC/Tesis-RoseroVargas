import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TablaCustom2 from "@/components/shared/TablaCustom2";
import GlassLoader from "@/components/ui/GlassLoader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { getClientes, getClientesPorPropietario } from "@/service/Entidades/ClienteService";
import { User } from "lucide-react"; 

// Mapeo de nombre de rol a ID
const ROLES_MAP = {
  "Administrador": 1,
  "Asesor Comercial": 2,
  "Asesor Legal": 3,
  "Analista de riesgos": 4,
  "Analista de emisión": 5,
  "Analista financiero": 6,
  "Gerencia Comercial": 7,
  "Gerencia": 8,
  "Externo": 9
};

export default function Clientes() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  const obtenerInfoUsuario = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const nombreRol = user?.roles?.[0];
    const idRol = ROLES_MAP[nombreRol] || null;
    const idUsuario = user?.id;
    return { idRol, idUsuario };
  };

  const cargarClientes = async () => {
    try {
      const { idRol, idUsuario } = obtenerInfoUsuario();
      if (!idRol) {
        toast.error("No se pudo determinar el rol del usuario.");
        return;
      }

      let data = [];
      if (idRol === 2 || idRol === 9) {
        // Solo ve los de los que es propietario
        data = await getClientesPorPropietario(idUsuario);
      } else {
        // Puede ver todos los clientes
        data = await getClientes();
      }
      setClientes(data);
    } catch (error) {
      toast.error("Error al cargar clientes: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  const handleEditar = (item) => {
    navigate(`/clientes/editar/${item.idCliente}`);
  };


  const columnas = [
    {
      key: "idCliente",
      label: "",
      render: (value) => (
        <div className="flex items-center justify-center group relative text-gray-500">
          <User className="w-5 h-5" />
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 text-xs text-white bg-zinc-800 px-2 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 whitespace-nowrap">
            ID: {value}
          </span>
        </div>
      )
    },
    { key: "numeroDocumento", label: "Documento" },
    { key: "nombres", label: "Nombres" },
    { key: "apellidoPaterno", label: "Apellido Paterno" },
    { key: "apellidoMaterno", label: "Apellido Materno" },
    { key: "correoElectronico", label: "Correo" },
    { key: "telefonoCelular", label: "Celular" },
    { key: "fechaCreacion", label: "Fecha Creación", render: (v) => v ? new Date(v).toLocaleDateString() : "" }
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-full relative">
      <GlassLoader visible={loading} message="Cargando clientes..." />
      <Card className="w-full border border-muted rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.12)]">
        <CardHeader>
          <CardTitle className="text-3xl flex items-center gap-3">
            <User className="text-blue-700" /> Lista de Clientes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 overflow-x-auto">
          <TablaCustom2
            columns={columnas}
            data={clientes}
            mostrarEditar={true}
            mostrarEliminar={false}  // Eliminación desactivada
            mostrarAgregarNuevo={false}
            onEditarClick={handleEditar}
            // No onEliminarClick
          />
        </CardContent>
      </Card>
    </div>
  );
}
