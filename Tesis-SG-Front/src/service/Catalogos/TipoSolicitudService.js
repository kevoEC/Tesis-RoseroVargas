// src/services/Catalogos/AgenciaService.js
import { API_BASE_URL } from "@/config";

// 🧱 Función común para manejar respuestas
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Error en la solicitud");
  }
  return await response.json();
};

// 🔐 Función para obtener headers con token
const getAuthHeaders = () => {
  const token = JSON.parse(localStorage.getItem("user"))?.token;
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// 🟢 GET: Obtener todas las agencias
export const getTipoSolicitud = async () => {
  const res = await fetch(`${API_BASE_URL}/TipoSolicitud`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

// 🔵 GET: Obtener agencia por ID
export const getTipoSolicitudById = async (id) => {
  const res = await fetch(`${API_BASE_URL}/TipoSolicitud/${id}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

// 🟡 POST: Crear nueva agencia
export const createTipoSolicitud = async (data) => {
  const res = await fetch(`${API_BASE_URL}/TipoSolicitud`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

// 🟠 PUT: Actualizar agencia
export const updateTipoSolicitud = async (data) => {
  const res = await fetch(
    `${API_BASE_URL}/TipoSolicitud/${data.idTipoSolicitud}`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }
  );
  console.log(res);
  return handleResponse(res);
};

// 🔴 DELETE: Eliminar agencia
export const deleteTipoSolicitud = async (id) => {
  const res = await fetch(`${API_BASE_URL}/TipoSolicitud/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};
