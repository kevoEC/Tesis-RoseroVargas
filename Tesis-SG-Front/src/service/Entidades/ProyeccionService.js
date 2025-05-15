import { API_BASE_URL } from "@/config";

const getAuthHeaders = () => {
  const token = JSON.parse(localStorage.getItem("user"))?.token;
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const handleResponse = async (res) => {
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Error en la solicitud");
  }
  return await res.json();
};

// 🔍 Obtener proyecciones por solicitud
export const getProyeccionesPorSolicitud = async (idSolicitud) => {
  const res = await fetch(
    `${API_BASE_URL}/Proyeccion/solicitud/${idSolicitud}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return handleResponse(res);
};

// 🟢 Crear nueva proyección
export const crearProyeccion = async (data) => {
  const res = await fetch(`${API_BASE_URL}/Proyeccion`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

// 🟠 Actualizar proyección existente
export const actualizarProyeccion = async (id, data) => {
  const res = await fetch(`${API_BASE_URL}/Proyeccion/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

// 📆 Obtener cronograma por ID de proyección
export const getCronogramaByProyeccionId = async (idProyeccion) => {
  const res = await fetch(
    `${API_BASE_URL}/Proyeccion/${idProyeccion}/cronograma`,
    {
      headers: getAuthHeaders(),
    }
  );
  return handleResponse(res);
};

//Obtener la configuracion de 1 producto
export const getConfiguracionByProductoId = async (idProducto) => {
  const res = await fetch(
    `${API_BASE_URL}/Producto/${idProducto}/configuraciones`,
    {
      headers: getAuthHeaders(),
    }
  );
  return handleResponse(res);
};


//Obtener la configuracion de 1 producto
export const getSolicitudById = async (idProducto) => {
  const res = await fetch(
    `${API_BASE_URL}/vista/solicitudinversion/filtrarDTO?por=solicitud&id=${idProducto}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return handleResponse(res);
};
