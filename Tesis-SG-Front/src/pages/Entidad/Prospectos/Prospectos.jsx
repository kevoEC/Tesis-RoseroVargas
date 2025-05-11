import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EntidadView from "@/components/shared/VistaEntidad";
import { getProspectos, deleteProspecto } from "@/service/Entidades/ProspectoService";
import TablaCustom2 from "@/components/shared/TablaCustom2";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import ProspectoForm from "./ProspectoForm";


export default function Prospectos() {
  const navigate = useNavigate();

  const [prospectos, setProspectos] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  /*Cargar los datos al montar el componente*/
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getProspectos(); // Ejecutar función async
        setProspectos(data);
      } catch (error) {
        console.error("Error al cargar prospectos:", error);
      }
    };

    fetchData();
  }, []);

  // 🟡 Editar
  const handleEditar = (item) => {
    navigate(`/prospectos/editar/${item.idProspecto}`);
  };

  // 🔴 Eliminar
  const handleEliminar = async (item) => {
    try {
      await deleteProspecto(item.idProspecto);
      // Si usas refetch dentro de VistaEntidad, lo puedes llamar aquí después
    } catch (err) {
      console.error("Error al eliminar prospecto:", err);
    }
  };
  const handleDesactivar = async (item) => {


  }

  const handleAbrirFormulario = () => {
    setIsDialogOpen(true);
  };
  const handleCerrarDialog = () => {
    setIsDialogOpen(false);
  };

  const columnas = [
    {
      key: 'idProspecto',
      label: 'Prospecto',
      render: (value) => (
        <div className="text-end font-semibold text-gray-800">
          {value}
        </div>
      ),
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (value) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${value ? 'bg-green-100 text-green-700' : 'bg-yellow-200 text-yellow-700'
            }`}
        >
          {value ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    { key: 'nombres', label: 'Nombres' },
    { key: 'apellidoPaterno', label: 'Apellido Pat' },
    { key: 'apellidoMaterno', label: 'Apellido Mat' },
    { key: 'tipoIdentificacion', label: 'Tipo ID' },
    { key: 'telefonoCelular', label: 'Núm. Celular' },
    { key: 'correoElectronico', label: 'Correo' },
    { key: 'nombreOrigen', label: 'Origen' },
    { key: 'productoInteres', label: 'Producto de Interés' },
    { key: 'agencia', label: 'Agencia' },

  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-full">
      {/* <div>
      <EntidadView
        titulo="Prospectos"
        entidad="prospecto"       // 🔗 Para el backend (API)
        ruta="prospectos"         // 🌐 Para el frontend (rutas reales)
        columnas={{
          nombres: "Nombres",
          apellidoPaterno: "Apellido Paterno",
          apellidoMaterno: "Apellido Materno",
          telefonoCelular: "Teléfono Celular",
          correoElectronico: "Correo Electrónico",
          estado: "Estado",
        }}
        onEditar={handleEditar}
        onEliminar={handleEliminar}
      />
      </div> */}

      <Card className="w-full border border-muted rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.12)]">
        <CardHeader>
          <CardTitle className="text-3xl">Lista de Prospectos</CardTitle>
        </CardHeader>
        <CardContent className="p-6 overflow-x-auto">
          <TablaCustom2
            columns={columnas}
            data={prospectos}
            mostrarEditar={true}
            mostrarAgregarNuevo={true}
            mostrarEliminar={true}
            onAgregarNuevoClick={handleAbrirFormulario}
            onEditarClick={handleEditar}
            onEliminarClick={handleEliminar}
          />
        </CardContent>
      </Card>
      {/* Dialog para el formulario */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} className="min-w-3xl">
        <DialogContent className="min-w-3xl">
          <DialogHeader>
            <DialogTitle>Agregar Prospecto</DialogTitle>
            <DialogDescription>Completa la información del nuevo prospecto</DialogDescription>
          </DialogHeader>
          <ProspectoForm onClose={handleCerrarDialog} />
        </DialogContent>
      </Dialog>

    </div>

  );
}
