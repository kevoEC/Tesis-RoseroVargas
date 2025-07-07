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

export const getProductos = async () => {
  const res = await fetch(`${API_BASE_URL}/Producto`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const getProductoById = async (id) => {
  const res = await fetch(`${API_BASE_URL}/Producto/${id}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const createProducto = async (data) => {
  const res = await fetch(`${API_BASE_URL}/Producto`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const updateProducto = async (id, data) => {
  const res = await fetch(`${API_BASE_URL}/Producto/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const deleteProducto = async (id) => {
  const res = await fetch(`${API_BASE_URL}/Producto/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

// Vista con joins (para dashboard/listado legible)
export const getProductosVista = async () => {
  const res = await fetch(`${API_BASE_URL}/Producto/vista`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};


// Obtiene un producto (con joins/nombres de catálogos) por ID desde la vista
export const getProductoByIdVista = async (id) => {
  const res = await fetch(`${API_BASE_URL}/Producto/vista/${id}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};
