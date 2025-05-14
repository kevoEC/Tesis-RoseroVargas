import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CatalogoView from "@/components/shared/CatalogoView";
import {
  getTipoCliente,
  deleteTipoCliente,
} from "@/service/Catalogos/TipoClienteService";

export default function TipoCliente() {
  const [tipoClientes, setTipoClientes] = useState([]);
  const navigate = useNavigate();

  const fetchTipoClientes = async () => {
    try {
      const data = await getTipoCliente();
      setTipoClientes(data);
    } catch (err) {
      console.error("Error al cargar tipos de cliente:", err);
    }
  };

  useEffect(() => {
    fetchTipoClientes();
  }, []);

  const handleEditar = (item) => {
    navigate(`/catalogo/tipocliente/editar/${item.idTipoCliente}`);
  };

  const handleEliminar = async (item) => {
    try {
      await deleteTipoCliente(item.idTipoCliente);
      setTipoClientes((prev) =>
        prev.filter((t) => t.idTipoCliente !== item.idTipoCliente)
      );
    } catch (err) {
      console.error("Error al eliminar tipo de cliente:", err);
    }
  };

  return (
    <CatalogoView
      titulo="Tipos de Cliente"
      entidad="catalogo/tipocliente"
      ruta="catalogo/tipocliente"
      data={tipoClientes}
      columnas={{
        idTipoCliente: "ID",
        nombreTipoCliente: "Nombre",
      }}
      onEditar={handleEditar}
      onEliminar={handleEliminar}
    />
  );
}
