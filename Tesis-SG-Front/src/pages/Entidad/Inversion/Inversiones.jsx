import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TablaCustom2 from "@/components/shared/TablaCustom2";
import GlassLoader from "@/components/ui/GlassLoader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  getInversiones,
  getInversionesPorPropietario,
} from "@/service/Entidades/InversionService";
import { FaChartLine } from "react-icons/fa"; // Ícono para inversiones

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
  "Externo": 9,
};

export default function Inversiones() {
  const navigate = useNavigate();
  const [inversiones, setInversiones] = useState([]);
  const [loading, setLoading] = useState(true);

  const obtenerInfoUsuario = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const nombreRol = user?.roles?.[0];
    const idRol = ROLES_MAP[nombreRol] || null;
    const idUsuario = user?.id;
    return { idRol, idUsuario };
  };

  const cargarInversiones = async () => {
    try {
      const { idRol, idUsuario } = obtenerInfoUsuario();
      if (!idRol) {
        toast.error("No se pudo determinar el rol del usuario.");
        return;
      }

      let data = [];
      if (idRol === 2 || idRol === 9) {
        // Solo ve las inversiones de las que es propietario
        data = await getInversionesPorPropietario(idUsuario);
      } else {
        // Puede ver todas las inversiones
        data = await getInversiones();
      }
      setInversiones(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Error al cargar inversiones: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarInversiones();
  }, []);

  const handleEditar = (item) => {
    navigate(`/inversiones/editar/${item.idInversion}`);
  };

  const columnas = [
    {
      key: "idInversion",
      label: "",
      render: (value) => (
        <div className="flex items-center justify-center group relative text-gray-500">
          <FaChartLine className="w-5 h-5" />
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 text-xs text-white bg-zinc-800 px-2 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 whitespace-nowrap">
            ID: {value}
          </span>
        </div>
      ),
    },
    { key: "inversionNombre", label: "Nombre" },
    { key: "nombreCompletoCliente", label: "Cliente" },
    {
      key: "capital",
      label: "Capital",
      render: (v) =>
        v !== undefined && v !== null
          ? `$${Number(v).toLocaleString("es-EC", { minimumFractionDigits: 2 })}`
          : "-",
    },
    { key: "plazo", label: "Plazo (meses)" },
    {
      key: "tasa",
      label: "Tasa",
      render: (v) =>
        v !== undefined && v !== null ? `${Number(v).toFixed(2)}%` : "-",
    },
    {
      key: "fechaCreacion",
      label: "Fecha Creación",
      render: (v) =>
        v ? new Date(v).toLocaleDateString("es-EC") : "",
    },
    {
      key: "terminada",
      label: "Estado",
      render: (v) =>
        v ? (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
            Finalizada
          </span>
        ) : (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
            Vigente
          </span>
        ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-full relative">
      <GlassLoader visible={loading} message="Cargando inversiones..." />
      <Card className="w-full border border-muted rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.12)]">
        <CardHeader>
          <CardTitle className="text-3xl flex items-center gap-3">
            <FaChartLine className="text-blue-700" /> Lista de Inversiones
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 overflow-x-auto">
          <TablaCustom2
            columns={columnas}
            data={inversiones}
            mostrarEditar={true}
            mostrarEliminar={false}
            mostrarAgregarNuevo={false}
            onEditarClick={handleEditar}
          />
        </CardContent>
      </Card>
    </div>
  );
}
