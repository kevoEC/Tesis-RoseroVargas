/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { mapIdentificacionToUpdate } from "@/utils/mappers";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import TablaCustom2 from "../shared/TablaCustom2";
import GlassLoader from "@/components/ui/GlassLoader";
import {
  getReferenciasPorSolicitud,
  crearReferencia,
  editarReferencia,
  eliminarReferencia,
} from "@/service/Entidades/ReferenciasService";
import { getTipoReferencia } from "@/service/Catalogos/TipoReferenciaService";
import {
  getSolicitudById,
  updateSolicitud,
} from "@/service/Entidades/SolicitudService";
import { toast } from "sonner";
import {
  getCatalogoEtnia,
  getCatalogoNacionalidad,
  getCatalogoProfesion,
} from "@/service/Catalogos/DatosGeneralesService";

import { FaInfoCircle } from "react-icons/fa";

export default function DatosGenerales() {
  const { user } = useAuth();
  const { id } = useParams();

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

  // Estado para errores de validación
  const [errores, setErrores] = useState({});

  // FASE PROCESO: Bloqueo total si faseProceso !== 1
  const [bloquearTodo, setBloquearTodo] = useState(false);

  /* 🇨🇴 Carga inicial de datos generales */
  useEffect(() => {
    const fetch = async () => {
      setLoadingGeneral(true);
      try {
        const res = await getSolicitudById(id);
        const data = res.data[0];
        setSolicitudData(data);

        // Bloquear todo si faseProceso !== 1 (Oportunidad lograda)
        setBloquearTodo(data.faseProceso !== 1);

        const dg = data.datosGenerales || {};
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
          paisNacimiento: "",
          provinciaNacimiento: "",
          ciudadNacimiento: "",
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

  // Referencias
  const [tiposReferencia, setTiposReferencia] = useState([]);
  const [referencias, setReferencias] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

  // Nuevo dato para el formulario de referencia
  const [nuevoDato, setNuevoDato] = useState({
    idSolicitudInversion: Number(id),
    idTipoReferencia: "",
    nombre: "",
    direccion: "",
    telefonoCelular: "",
    fechaCreacion: new Date().toISOString(),
    idUsuarioPropietario: user?.idUsuario,
  });

  // Validaciones internas para referencia antes de guardar
  const validarReferencia = () => {
    if (!nuevoDato.nombre || nuevoDato.nombre.trim() === "") {
      toast.error("El campo Nombre es obligatorio.");
      return false;
    }
    if (!nuevoDato.direccion || nuevoDato.direccion.trim() === "") {
      toast.error("El campo Dirección es obligatorio.");
      return false;
    }
    if (!nuevoDato.telefonoCelular || nuevoDato.telefonoCelular.trim() === "") {
      toast.error("El campo Teléfono Celular es obligatorio.");
      return false;
    }
    if (!nuevoDato.idTipoReferencia) {
      toast.error("Debes seleccionar un Tipo de Referencia.");
      return false;
    }
    return true;
  };

  useEffect(() => {
    const fetchRefs = async () => {
      try {
        const data = await getReferenciasPorSolicitud(id);
        setReferencias(data || []);
      } catch (err) {
        setReferencias([]);
      }
    };
    const fetchTipos = async () => {
      try {
        const t = await getTipoReferencia();
        setTiposReferencia(t);
      } catch (err) {
        setTiposReferencia([]);
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
      idUsuarioPropietario: user?.idUsuario,
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
      idUsuarioPropietario: user?.idUsuario,
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
      setReferencias(data || []);
    } catch (err) {
      toast.error("No se pudo eliminar la referencia");
    }
  };

  // Validación campos obligatorios del formulario datos generales
  const validarCampos = () => {
    const nuevosErrores = {};

    if (!datosGenerales.fechaNacimiento) {
      nuevosErrores.fechaNacimiento = "Fecha de nacimiento es obligatoria";
    }
    if (!datosGenerales.genero) {
      nuevosErrores.genero = "Género es obligatorio";
    }
    if (!datosGenerales.estadoCivil) {
      nuevosErrores.estadoCivil = "Estado civil es obligatorio";
    }
    if (!datosGenerales.nivelAcademico) {
      nuevosErrores.nivelAcademico = "Nivel académico es obligatorio";
    }
    if (!datosGenerales.nacionalidad) {
      nuevosErrores.nacionalidad = "Nacionalidad es obligatoria";
    }
    if (!datosGenerales.profesion) {
      nuevosErrores.profesion = "Profesión es obligatoria";
    }
    if (!datosGenerales.etnia) {
      nuevosErrores.etnia = "Etnia es obligatoria";
    }

    setErrores(nuevosErrores);

    // Si no hay errores, retorna true
    return Object.keys(nuevosErrores).length === 0;
  };

  // -- Guardar datos generales
  const handleSaveGeneral = async () => {
    if (!solicitudData) return;
    if (bloquearTodo) return;

    if (referencias.length === 0) {
      toast.error("Debes agregar al menos una referencia antes de guardar.");
      return;
    }

    if (!validarCampos()) {
      toast.error("Por favor completa todos los campos obligatorios antes de guardar.");
      return;
    }

    setLoadingGeneral(true);
    try {
      const payload = {
        ...solicitudData,
        identificacion: mapIdentificacionToUpdate(solicitudData.identificacion),
        datosGenerales: {
          ...solicitudData.datosGenerales,
          fechaNacimiento: datosGenerales.fechaNacimiento,
          idGenero: parseInt(datosGenerales.genero) || null,
          idEstadoCivil: parseInt(datosGenerales.estadoCivil) || null,
          idNivelAcademico: parseInt(datosGenerales.nivelAcademico) || null,
          numeroCargasFamiliares: parseInt(datosGenerales.numeroCargasFamiliares) || 0,
          idNacionalidad: datosGenerales.nacionalidad,
          idProfesion: datosGenerales.profesion,
          idEtnia: datosGenerales.etnia,
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

  // Guardar referencia (crear o editar)
  const handleGuardarReferencia = async () => {
    if (bloquearTodo) return;

    if (!validarReferencia()) return;

    const datosAEnviar = {
      ...nuevoDato,
      fechaCreacion: new Date().toISOString(),
    };

    try {
      if (modoEdicion) {
        await editarReferencia(nuevoDato.idReferencia, datosAEnviar);
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
        idUsuarioPropietario: user?.idUsuario,
      });
    } catch (error) {
      toast.error("No se pudo guardar la referencia.");
    }
  };

  // Columnas para referencias con icono en lugar de ID texto
  const columnas = [
    {
      key: "idReferencia",
      label: "",
      render: (v) => (
        <span
          title={`ID Referencia: ${v}`}
          className="flex justify-center cursor-default text-gray-600 hover:text-gray-900"
        >
          <FaInfoCircle size={18} />
        </span>
      ),
    },
    { key: "nombreReferencia", label: "Nombre Referencia" },
    { key: "nombreTipoReferencia", label: "Tipo Referencia" },
    { key: "telefonoCelular", label: "Teléfono Celular" },
    { key: "direccion", label: "Dirección" },
    { key: "fechaCreacion", label: "Fecha de Creación" },
  ];

  return (
    <div className="space-y-6 p-6 relative">
      <GlassLoader visible={loadingGeneral} message="Cargando datos generales..." />
      <h2 className="text-xl font-semibold text-gray-800">Datos generales</h2>
      {bloquearTodo && (
        <div className="w-full flex items-center px-6 py-2 mb-4 rounded-xl bg-yellow-100 border border-yellow-300 text-yellow-800 font-semibold">
          <span>No se permite editar datos generales en esta fase.</span>
        </div>
      )}

      {/* 📝 Formulario de datos generales */}
      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Botón para guardar datos generales */}
          <div className="flex justify-end">
            <Button
              onClick={handleSaveGeneral}
              disabled={bloquearTodo}
              className="bg-primary text-gray-200 hover:text-white hover:bg-primary/80 hover:shadow-md"
            >
              Guardar Datos Generales
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FormGroup label="Fecha de nacimiento" error={errores.fechaNacimiento}>
              <Input
                type="date"
                value={datosGenerales.fechaNacimiento}
                onChange={(e) =>
                  setDatosGenerales({
                    ...datosGenerales,
                    fechaNacimiento: e.target.value,
                  })
                }
                disabled={bloquearTodo}
                aria-invalid={!!errores.fechaNacimiento}
              />
            </FormGroup>
            <FormGroup label="Género" error={errores.genero}>
              <Select
                value={datosGenerales.genero}
                onValueChange={(v) =>
                  setDatosGenerales({ ...datosGenerales, genero: v })
                }
                disabled={bloquearTodo}
                aria-invalid={!!errores.genero}
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
            <FormGroup label="Estado civil" error={errores.estadoCivil}>
              <Select
                value={datosGenerales.estadoCivil}
                onValueChange={(v) =>
                  setDatosGenerales({ ...datosGenerales, estadoCivil: v })
                }
                disabled={bloquearTodo}
                aria-invalid={!!errores.estadoCivil}
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
            <FormGroup label="Nivel académico" error={errores.nivelAcademico}>
              <Select
                value={datosGenerales.nivelAcademico}
                onValueChange={(v) =>
                  setDatosGenerales({ ...datosGenerales, nivelAcademico: v })
                }
                disabled={bloquearTodo}
                aria-invalid={!!errores.nivelAcademico}
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
            <FormGroup label="Nacionalidad" error={errores.nacionalidad}>
              <Select
                value={datosGenerales.nacionalidad}
                onValueChange={(v) =>
                  setDatosGenerales({ ...datosGenerales, nacionalidad: v })
                }
                disabled={bloquearTodo}
                aria-invalid={!!errores.nacionalidad}
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
            <FormGroup label="Profesión" error={errores.profesion}>
              <Select
                value={datosGenerales.profesion}
                onValueChange={(v) =>
                  setDatosGenerales({ ...datosGenerales, profesion: v })
                }
                disabled={bloquearTodo}
                aria-invalid={!!errores.profesion}
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
            <FormGroup label="Etnia" error={errores.etnia}>
              <Select
                value={datosGenerales.etnia}
                onValueChange={(v) =>
                  setDatosGenerales({ ...datosGenerales, etnia: v })
                }
                disabled={bloquearTodo}
                aria-invalid={!!errores.etnia}
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
      <Card>
        <CardContent>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Referencias personales y comerciales</h3>
          <TablaCustom2
            columns={columnas}
            data={referencias}
            mostrarEditar={!bloquearTodo}
            mostrarAgregarNuevo={!bloquearTodo}
            mostrarEliminar={!bloquearTodo}
            onAgregarNuevoClick={handleAbrirFormulario}
            onEditarClick={handleEditar}
            onEliminarClick={handleEliminar}
          />
        </CardContent>
      </Card>

      {/* Modal formulario referencia */}
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
                disabled={bloquearTodo}
              />
            </FormGroup>
            <FormGroup label="Dirección">
              <Input
                value={nuevoDato.direccion}
                onChange={(e) =>
                  setNuevoDato({ ...nuevoDato, direccion: e.target.value })
                }
                disabled={bloquearTodo}
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
                disabled={bloquearTodo}
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
                disabled={bloquearTodo}
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
              onClick={handleGuardarReferencia}
              disabled={bloquearTodo}
            >
              {modoEdicion ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// FormGroup helper con visualización de error
function FormGroup({ label, children, error }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
        {label} {error && <span className="text-red-600 text-xs italic">{error}</span>}
      </Label>
      {children}
    </div>
  );
}
