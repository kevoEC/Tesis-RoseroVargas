import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUI } from "@/hooks/useUI";
import { getProyeccionesPorSolicitud } from "@/service/Entidades/ProyeccionService";
import { getAsesoresComerciales, getJustificativoTransaccion } from "@/service/Catalogos/ProyeccionService";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { FaEdit, FaTrash, FaSort, FaSortUp, FaSortDown, FaPlus, FaFileExport, FaFilePdf, FaFileCsv, FaArrowLeft, FaArrowRight, } from "react-icons/fa";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import TablaCustom2 from "../shared/TablaCustom2";

export default function Proyeccion() {
  const { id: idSolicitud } = useParams();
  const { notify } = useUI();
  const navigate = useNavigate();
  const [proyecciones, setProyecciones] = useState([]);
  const [asesores, setAsesores] = useState([]);
  const [justificativos, setJustificativos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enviarProyeccion, setEnviarProyeccion] = useState(false);
  const [aceptaCliente, setAceptaCliente] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      try {
        if (idSolicitud) {
          const res = await getProyeccionesPorSolicitud(idSolicitud);
          setProyecciones(res.proyecciones || []);
          
        }

        const asesoresData = await getAsesoresComerciales();
        setAsesores(asesoresData || []);

        const justificativosData = await getJustificativoTransaccion();
        setJustificativos(justificativosData || []);
      } catch (err) {
        notify.info("Hubo un error al obtener datos.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [idSolicitud]);
const columnas= [
  {key:"proyeccionNombre", label:"Nombre"},
  {key:"tasa", label:"Tasa (%)"},
  {key:"capital", label:"Capital"},
  {key:"fechaInicial", label:"Fecha Inicial"},
  {key:"idProducto", label:"ID de Producto"},
  {key:"idUsuarioCreacion", label:"Usuario Creador"},

];
  return (
    <div className="space-y-6 px-4 sm:px-6 py-6">
      <h2 className="text-xl font-semibold text-gray-800">Proyecciones vinculadas</h2>

      <div className="flex justify-end mb-2">
        {/* <Button
          onClick={() => navigate(`/solicitudes/editar/${idSolicitud}/proyeccion/nueva`)}
          className="bg-primary text-gray-200 hover:text-white hover:bg-primary/80 cursor-pointer flex items-center gap-2"
        >
          <FaPlus className="text-white" /> Agregar Proyección
        </Button> */}
      </div>

      {/* <Card>
        <CardContent className="space-y-6 px-4 sm:px-6 py-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tasa %</TableHead>
                  <TableHead>Capital</TableHead>
                  <TableHead>Fecha Inicial</TableHead>
                  <TableHead>ID Producto</TableHead>
                  <TableHead>Usuario Creador</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Cargando...
                    </TableCell>
                  </TableRow>
                ) : proyecciones.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No existen proyecciones para esta solicitud.
                    </TableCell>
                  </TableRow>
                ) : (
                  proyecciones.map((p) => (
                    <TableRow key={p.idProyeccion}>
                      <TableCell>{p.proyeccionNombre}</TableCell>
                      <TableCell>{p.tasa.toFixed(2)}%</TableCell>
                      <TableCell>${p.capital}</TableCell>
                      <TableCell>{new Date(p.fechaInicial).toLocaleDateString()}</TableCell>
                      <TableCell>{p.idProducto}</TableCell>
                      <TableCell>{p.idUsuarioCreacion}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card> */}
      <Card>
        <CardContent className="space-y-6 px-4 sm:px-6 py-6">
          <TablaCustom2
          columns={columnas}
          data={proyecciones}
          mostrarAgregarNuevo={true}
          onAgregarNuevoClick={() => navigate(`/solicitudes/editar/${idSolicitud}/proyeccion/nueva`)}
          mostrarEditar={false}
          mostrarEliminar={false}
          />

         
        </CardContent>
      </Card>
            
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Asesor Comercial */}
            <FormGroup label="Asesor comercial">
              <Select>
                <SelectTrigger className="bg-white border border-black">
                  <SelectValue placeholder="-Selecciona un asesor-" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {asesores.map((asesor) => (
                    <SelectItem key={asesor.idUsuario} value={asesor.idUsuario.toString()}>
                      {asesor.nombreCompleto}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormGroup>

            {/* Justificativo Transacción */}
            <FormGroup label="Justificativo de transacción">
              <Select>
                <SelectTrigger className="bg-white border border-black">
                  <SelectValue placeholder="-Selecciona un justificativo-" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {justificativos.map((item) => (
                    <SelectItem key={item.idJustificativoTransaccion} value={item.idJustificativoTransaccion.toString()}>
                      {item.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormGroup>

            <FormGroup label="Proyección seleccionada">
              <Input placeholder="---" disabled />
             
            </FormGroup>

            <FormGroup label="Origen de fondos">
              <Input placeholder="---" disabled />
            </FormGroup>

            <FormGroup label="Enviar proyección">
              <FormSwitch
                label={enviarProyeccion ? "Sí" : "No"}
                checked={enviarProyeccion}
                onChange={setEnviarProyeccion}
              />
            </FormGroup>

            <FormGroup label="Aceptación del cliente">
              <FormSwitch
                label={aceptaCliente ? "El Cliente Acepta" : "El Cliente No Acepta"}
                checked={aceptaCliente}
                onChange={setAceptaCliente}
              />
            </FormGroup>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FormGroup({ label, children }) {
  return (
    <div className="space-y-1">
      <Label className="text-sm text-gray-700 font-medium">{label}</Label>
      {children}
    </div>
  );
}


function FormSwitch({ label, checked, onChange }) {
  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Switch
          checked={checked}
          onCheckedChange={onChange}
          className={`
            peer
            inline-flex
            h-6 w-11 shrink-0
            cursor-pointer
            items-center
            rounded-full
            border
            border-gray-400
            transition-colors
            duration-200
            ease-in-out
            ${checked ? "bg-primary" : "bg-gray-300"}
          `}
        />
        {/* Círculo deslizante */}
        <span
          className={`
            pointer-events-none
            absolute
            left-0.5 top-0.5
            h-5 w-5
            transform
            rounded-full
            bg-white
            shadow
            transition-transform
            duration-200
            ease-in-out
            ${checked ? "translate-x-5" : "translate-x-0"}
          `}
        />
      </div>
      <Label className="text-sm font-light text-gray-700">{label}</Label>
    </div>
  );
}
