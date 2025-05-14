import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CatalogoView from "@/components/shared/CatalogoView";
import {
  getTipoSolicitud,
  deleteTipoSolicitud,
} from "@/service/Catalogos/TipoSolicitudService";

export default function TipoSolicitud() {
  const [tipoSolicitud, setTipoSolicitud] = useState([]);
  const navigate = useNavigate();

  const fetchTipoSolicitud = async () => {
    try {
      const data = await getTipoSolicitud();
      setTipoSolicitud(data);
    } catch (err) {
      console.error("Error al cargar tipos de solicitud:", err);
    }
  };

  useEffect(() => {
    fetchTipoSolicitud();
  }, []);

  const handleEditar = (item) => {
    navigate(`/catalogo/tiposolicitud/editar/${item.idTipoDeSolicitud}`);
  };

  const handleEliminar = async (item) => {
    try {
      await deleteTipoSolicitud(item.idTipoDeSolicitud);
      setTipoSolicitud((prev) =>
        prev.filter((t) => t.idTipoDeSolicitud !== item.idTipoDeSolicitud)
      );
    } catch (err) {
      console.error("Error al eliminar tipo de solicitud:", err);
    }
  };

  return (
    <CatalogoView
      titulo="Tipos de Solicitud"
      entidad="catalogo/tiposolicitud"
      ruta="catalogo/tiposolicitud"
      data={tipoSolicitud}
      columnas={{
        idTipoDeSolicitud: "ID",
        nombreTipoDeSolicitud: "Nombre",
      }}
      onEditar={handleEditar}
      onEliminar={handleEliminar}
    />
  );
}
