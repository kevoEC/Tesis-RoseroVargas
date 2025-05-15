import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, } from "@/components/ui/select";
import TablaCustom2 from "../shared/TablaCustom2";
import { getReferenciasPorSolicitud, crearReferencia, editarReferencia, eliminarReferencia, } from "@/service/Entidades/ReferenciasService";
import { getTipoReferencia } from "@/service/Catalogos/TipoReferenciaService";
import { getSolicitudById, updateSolicitud, } from "@/service/Entidades/SolicitudService";
import { Toaster } from "../ui/sonner";
import { toast } from "sonner";
import { getCatalogoEtnia, getCatalogoNacionalidad, getCatalogoProfesion } from "@/service/Catalogos/DatosGeneralesService";

export default function DatosGenerales() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  /* --- Estado para datos generales --- */
  const [loadingGeneral, setLoadingGeneral] = useState(true);
  const [catalogoEtnia, setCatalogoEtnia] = useState([]);
  const [catalogoNacionalidad, setCatalogoNacionalidad] = useState([]);
  const [catalogoProfesion, setCatalogoProfesion] = useState([]);
  const [solicitudData, setSolicitudData] = useState(null);
  const [datosGenerales, setDatosGenerales] = useState({
    fechaNacimiento: "",
    genero: "",
    estadoCivil: "",
    nivelAcademico: "",
    numeroCargasFamiliares: "",
    nacionalidad: "",
    profesion: "",
    etnia: "",
    paisNacimiento: "",
    provinciaNacimiento: "",
    ciudadNacimiento: "",
  });

  /* 🇨🇴 Carga inicial de datos generales */
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getSolicitudById(id);
        const data = res.data[0];
        setSolicitudData(data);
        const dg = data.datosGenerales;
        setDatosGenerales({
          fechaNacimiento: dg.fechaNacimiento
          ? dg.fechaNacimiento.split("T")[0]
          : "",
          genero: dg.idGenero?.toString() || "",
          estadoCivil: dg.idEstadoCivil?.toString() || "",
          nivelAcademico: dg.idNivelAcademico?.toString() || "",
          numeroCargasFamiliares: dg.numeroCargasFamiliares?.toString() || "",
          nacionalidad: dg.idNacionalidad || "",
          profesion: dg.idProfesion || "",
          etnia: dg.idEtnia || "",
          paisNacimiento: "", // UI field; no viene de API
          provinciaNacimiento: "", // UI field; no viene de API
          ciudadNacimiento: "", // UI field; no viene de API
        });
        const [etnias, nacionalidades, profesiones] = await Promise.all([
          getCatalogoEtnia(),
          getCatalogoNacionalidad(),
          getCatalogoProfesion(),
        ]);

        setCatalogoEtnia(etnias);
        setCatalogoNacionalidad(nacionalidades);
        setCatalogoProfesion(profesiones);

      } catch (err) {
        toast.error("Error al cargar datos generales: " + err.message);
      } finally {
        setLoadingGeneral(false);
      }
    };
    fetch();
  }, [id]);

  /* 🔄 Guardar datos generales */
  const handleSaveGeneral = async () => {
    if (!solicitudData) return;
    setLoadingGeneral(true);
    try {
      const payload = {
        ...solicitudData,
        datosGenerales: {
          ...solicitudData.datosGenerales,
          fechaNacimiento: datosGenerales.fechaNacimiento,
          idGenero: parseInt(datosGenerales.genero) || null,
          idEstadoCivil: parseInt(datosGenerales.estadoCivil) || null,
          idNivelAcademico: parseInt(datosGenerales.nivelAcademico) || null,
          numeroCargasFamiliares:
            parseInt(datosGenerales.numeroCargasFamiliares) || 0,
          idNacionalidad: datosGenerales.nacionalidad,
          idProfesion: datosGenerales.profesion,
          idEtnia: datosGenerales.etnia,
          // no hay campos de nacimiento en API, sólo en UI
        },
      };
      const res = await updateSolicitud(id, payload);
      res.success
        ? toast.success("Datos generales actualizados.")
        : toast.error("Error al actualizar datos generales.");
    } catch (err) {
      toast.error("Error al guardar datos generales: " + err.message);
    } finally {
      setLoadingGeneral(false);
    }
  };

  /* 📝 Catálogo y datos de referencias */
  const [tiposReferencia, setTiposReferencia] = useState([]);
  const [referencias, setReferencias] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [nuevoDato, setNuevoDato] = useState({
    idSolicitudInversion: Number(id),
    idTipoReferencia: "",
    nombre: "",
    direccion: "",
    telefonoCelular: "",
    fechaCreacion: new Date().toISOString(),
    idUsuarioPropietario: user.idUsuario,
  });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [referenciaEditando, setReferenciaEditando] = useState(null);

  useEffect(() => {
    const fetchRefs = async () => {
      try {
        const data = await getReferenciasPorSolicitud(id);
        setReferencias(data);
      } catch (err) {
        console.error(err);
      }
    };
    const fetchTipos = async () => {
      try {
        const t = await getTipoReferencia();
        setTiposReferencia(t);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRefs();
    fetchTipos();
  }, [id]);

  const handleAbrirFormulario = () => {
    setModoEdicion(false);
    setNuevoDato({
      idSolicitudInversion: Number(id),
      idTipoReferencia: "",
      nombre: "",
      direccion: "",
      telefonoCelular: "",
      fechaCreacion: new Date().toISOString(),
      idUsuarioPropietario: user.idUsuario,
    });
    setModalAbierto(true);
  };

  const handleEditar = (item) => {
    setNuevoDato({
      idReferencia: item.idReferencia,
      idSolicitudInversion: Number(id),
      idTipoReferencia: item.idTipoReferencia,
      nombre: item.nombreReferencia,
      direccion: item.direccion,
      telefonoCelular: item.telefonoCelular,
      telefonoFijo: item.telefonoFijo || "",
      fechaCreacion: item.fechaCreacion,
      idUsuarioPropietario: user.idUsuario,
    });
    setModoEdicion(true);
    setModalAbierto(true);
  };

  const handleEliminar = async (item) => {
    if (!window.confirm(`¿Eliminar "${item.nombreReferencia}"?`)) return;
    try {
      await eliminarReferencia(item.idReferencia);
      toast.success("Referencia eliminada");
      const data = await getReferenciasPorSolicitud(id);
      setReferencias(data);
    } catch (err) {
      toast.error("No se pudo eliminar la referencia");
    }
  };

  const columnas = [
    {
      key: "idReferencia",
      label: "ID Referencia",
      render: (v) => <div className="text-end font-semibold">{v}</div>,
    },
    { key: "nombreReferencia", label: "Nombre Referencia" },
    { key: "nombreTipoReferencia", label: "Tipo Referencia" },
    { key: "telefonoCelular", label: "Teléfono Celular" },
    { key: "direccion", label: "Dirección" },
    { key: "fechaCreacion", label: "Fecha de Creación" },
  ];

  // 🚧 Esperando carga inicial de datos generales
  if (loadingGeneral) return <p>Cargando datos generales...</p>;

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-xl font-semibold text-gray-800">Datos generales</h2>

      {/* 📝 Formulario de datos generales */}
      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Botón para guardar datos generales */}
          <div className="flex justify-end">
            <Button
              onClick={handleSaveGeneral}
              disabled={loadingGeneral}
              className="bg-primary text-gray-200 hover:text-white hover:bg-primary/80 hover:shadow-md"
            >
              {loadingGeneral ? "Guardando..." : "Guardar Datos Generales"}
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FormGroup label="Fecha de nacimiento">
              <Input
                type="date"
                value={datosGenerales.fechaNacimiento}
                onChange={(e) =>
                  setDatosGenerales({
                    ...datosGenerales,
                    fechaNacimiento: e.target.value,
                  })
                }
              />
            </FormGroup>

            <FormGroup label="Género">
              <Select
                value={datosGenerales.genero}
                onValueChange={(v) =>
                  setDatosGenerales({ ...datosGenerales, genero: v })
                }
              >
                <SelectTrigger className="bg-white border border-gray-700">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="1">Masculino</SelectItem>
                  <SelectItem value="2">Femenino</SelectItem>
                  <SelectItem value="3">Otro</SelectItem>
                </SelectContent>
              </Select>
            </FormGroup>

            <FormGroup label="Estado civil">
              <Select
                value={datosGenerales.estadoCivil}
                onValueChange={(v) =>
                  setDatosGenerales({ ...datosGenerales, estadoCivil: v })
                }
              >
                <SelectTrigger className="bg-white border border-gray-700">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="1">Soltero</SelectItem>
                  <SelectItem value="2">Casado</SelectItem>
                  <SelectItem value="3">Divorciado</SelectItem>
                </SelectContent>
              </Select>
            </FormGroup>

            <FormGroup label="Nivel académico">
              <Select
                value={datosGenerales.nivelAcademico}
                onValueChange={(v) =>
                  setDatosGenerales({ ...datosGenerales, nivelAcademico: v })
                }
              >
                <SelectTrigger className="bg-white border border-gray-700">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="1">Primaria</SelectItem>
                  <SelectItem value="2">Secundaria</SelectItem>
                  <SelectItem value="3">Universitaria</SelectItem>
                </SelectContent>
              </Select>
            </FormGroup>

            <FormGroup label="Nacionalidad">
              <Select
                value={datosGenerales.nacionalidad}
                onValueChange={(v) =>
                  setDatosGenerales({ ...datosGenerales, nacionalidad: v })
                }
              >
                <SelectTrigger className="bg-white border border-gray-700">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {catalogoNacionalidad.map((item) => (
                    <SelectItem key={item.idNacionalidad} value={item.idNacionalidad}>
                      {item.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormGroup>


            <FormGroup label="Profesión">
              <Select
                value={datosGenerales.profesion}
                onValueChange={(v) =>
                  setDatosGenerales({ ...datosGenerales, profesion: v })
                }
              >
                <SelectTrigger className="bg-white border border-gray-700">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {catalogoProfesion.map((item) => (
                    <SelectItem key={item.idProfesion} value={item.idProfesion}>
                      {item.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormGroup>


            <FormGroup label="Etnia">
              <Select
                value={datosGenerales.etnia}
                onValueChange={(v) =>
                  setDatosGenerales({ ...datosGenerales, etnia: v })
                }
              >
                <SelectTrigger className="bg-white border border-gray-700">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {catalogoEtnia.map((item) => (
                    <SelectItem key={item.idEtnia} value={item.idEtnia}>
                      {item.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormGroup>

          </div>
        </CardContent>
      </Card>

      {/* 📇 Tabla de referencias */}

      <div>
        <Card>
          <CardContent>
            <TablaCustom2
              columns={columnas}
              data={referencias}
              mostrarEditar={true}
              mostrarAgregarNuevo={true}
              mostrarEliminar={true}
              onAgregarNuevoClick={handleAbrirFormulario}
              onEditarClick={handleEditar}
              onEliminarClick={handleEliminar}
            />
          </CardContent>
        </Card>
      </div>
      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modoEdicion ? "Editar referencia" : "Agregar nueva referencia"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormGroup label="Nombre">
              <Input
                value={nuevoDato.nombre}
                onChange={(e) =>
                  setNuevoDato({ ...nuevoDato, nombre: e.target.value })
                }
              />
            </FormGroup>

            <FormGroup label="Dirección">
              <Input
                value={nuevoDato.direccion}
                onChange={(e) =>
                  setNuevoDato({ ...nuevoDato, direccion: e.target.value })
                }
              />
            </FormGroup>

            <FormGroup label="Teléfono Celular">
              <Input
                value={nuevoDato.telefonoCelular}
                onChange={(e) =>
                  setNuevoDato({
                    ...nuevoDato,
                    telefonoCelular: e.target.value,
                  })
                }
              />
            </FormGroup>

            <FormGroup label="Tipo de Referencia">
              <Select
                value={nuevoDato.idTipoReferencia?.toString()}
                onValueChange={(value) =>
                  setNuevoDato({
                    ...nuevoDato,
                    idTipoReferencia: Number(value),
                  })
                }
              >
                <SelectTrigger className="bg-white border border-gray-700">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {tiposReferencia.map((tipo) => (
                    <SelectItem
                      key={tipo.idTipoReferencia}
                      value={tipo.idTipoReferencia.toString()}
                    >
                      {tipo.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormGroup>
          </div>

          <DialogFooter className="pt-4">
            <Button
              className="text-gray-300 hover:text-white"
              onClick={async () => {
                const datosAEnviar = {
                  ...nuevoDato,
                  fechaCreacion: new Date().toISOString(),
                };
                try {
                  if (modoEdicion) {
                    await editarReferencia(
                      nuevoDato.idReferencia,
                      datosAEnviar
                    );
                    toast.success("Referencia actualizada", {
                      description: `Se actualizó ${nuevoDato.nombre}`,
                    });
                  } else {
                    await crearReferencia(datosAEnviar);
                    toast.success("Referencia creada", {
                      description: `Se agregó ${nuevoDato.nombre}`,
                    });
                  }
                  const dataActualizada = await getReferenciasPorSolicitud(id);
                  setReferencias(dataActualizada);
                  setModalAbierto(false);
                  setModoEdicion(false);
                  setNuevoDato({
                    idSolicitudInversion: Number(id),
                    idTipoReferencia: "",
                    nombre: "",
                    direccion: "",
                    telefonoCelular: "",
                    fechaCreacion: new Date().toISOString(),
                    idUsuarioPropietario: user.idUsuario,
                  });
                } catch (error) {
                  console.error("Error al guardar referencia:", error);
                  toast.error("No se pudo guardar la referencia.");
                }
              }}
            >
              {modoEdicion ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* 📇 Tabla de referencias fin */}
      <Toaster />
    </div>
  );
}

function FormGroup({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      {children}
    </div>
  );
}
