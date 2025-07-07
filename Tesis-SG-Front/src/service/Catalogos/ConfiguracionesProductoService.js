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
  return res.json();
};

export const getConfiguracionesProducto = async () => {
  const res = await fetch(`${API_BASE_URL}/ConfiguracionProducto`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const getConfiguracionProductoById = async (id) => {
  const res = await fetch(`${API_BASE_URL}/ConfiguracionProducto/${id}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const getConfiguracionesPorProducto = async (idProducto) => {
  const res = await fetch(
    `${API_BASE_URL}/ConfiguracionProducto/vista/por-producto/${idProducto}`,
    { headers: getAuthHeaders() }
  );
  return handleResponse(res);
};

export const createConfiguracionProducto = async (data) => {
  const res = await fetch(`${API_BASE_URL}/ConfiguracionProducto`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const updateConfiguracionProducto = async (id, data) => {
  const res = await fetch(`${API_BASE_URL}/ConfiguracionProducto/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const deleteConfiguracionProducto = async (id) => {
  const res = await fetch(`${API_BASE_URL}/ConfiguracionProducto/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

// Vista con joins (para dashboard/listado legible)
export const getConfiguracionesProductoVista = async () => {
  const res = await fetch(`${API_BASE_URL}/ConfiguracionProducto/vista`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};


// Obtiene una configuración (con joins/nombres de catálogos) por ID desde la vista
export const getConfiguracionProductoByIdVista = async (id) => {
  const res = await fetch(`${API_BASE_URL}/ConfiguracionProducto/vista/${id}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};
