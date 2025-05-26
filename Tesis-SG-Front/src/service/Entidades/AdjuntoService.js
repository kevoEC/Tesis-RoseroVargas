// src/services/ProspectoService.js
import { API_BASE_URL } from "@/config";

// Función auxiliar para manejar respuestas de la API
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Error en la solicitud");
  }
  return await response.json();
};

// Función para obtener el token actual desde localStorage
const getAuthHeaders = () => {
  const token = JSON.parse(localStorage.getItem("user"))?.token;
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// 🟢 GET: Listar todos los prospectos
export const getAdjuntos = async (id) => {
  const res = await fetch(
    `${API_BASE_URL}/Documento/entidad?tipoEntidad=SolicitudInversion&idEntidad=${id}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return handleResponse(res);
};

// 🔵 GET: Obtener prospecto por ID
export const getAdjuntoById = async (id) => {
  const res = await fetch(
    `${API_BASE_URL}/vista/documento/filtrar?por=IdDocumento&id=${id}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return handleResponse(res);
};

// 🟡 POST: Crear nuevo prospecto
export const createAdjunto = async (data) => {
  const res = await fetch(`${API_BASE_URL}/Prospecto`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

// 🟠 PUT: Actualizar prospecto existente
export const updateAdjunto = async (id, data) => {
  const res = await fetch(`${API_BASE_URL}/Documento/${id}/archivo`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const generateallAdjunto = async (data) => {
  const res = await fetch(`${API_BASE_URL}/Documento/motivo`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const deleteallAdjunto = async (id, data) => {
  const res = await fetch(
    `${API_BASE_URL}/Documento/motivo/32?idSolicitudInversion=${id}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );
  return handleResponse(res);
};

// ✅ GET: Adjuntos por solicitud y motivo
export const getAdjuntosPorMotivo = async (idSolicitudInversion, idMotivo = 32) => {
  const res = await fetch(
    `${API_BASE_URL}/documento/por-solicitud-y-motivo?idSolicitudInversion=${idSolicitudInversion}&idMotivo=${idMotivo}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return handleResponse(res);
};

