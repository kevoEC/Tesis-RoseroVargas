// src/service/Entidades/PagosService.js

import { API_BASE_URL } from "@/config";

// Utilidad para manejar la respuesta
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Error en la solicitud");
  }
  return await response.json();
};

// Headers con autenticación
const getAuthHeaders = () => {
  const token = JSON.parse(localStorage.getItem("user"))?.token;
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

/** =============================
 *           ENDPOINTS PAGOS
 *  =============================
 */

// 🔵 GET: Obtener todos los pagos
export const getPagos = async () => {
  const res = await fetch(`${API_BASE_URL}/Pagos`, {
    headers: getAuthHeaders(),
  });
  const data = await handleResponse(res);
  return Array.isArray(data) ? data : data?.data || [];
};

// 🔵 GET: Obtener pago por ID
export const getPagoById = async (id) => {
  const res = await fetch(`${API_BASE_URL}/Pagos/${id}`, {
    headers: getAuthHeaders(),
  });
  const data = await handleResponse(res);
  return Array.isArray(data) ? data[0] : data?.data || data;
};

// 🔵 GET: Obtener pagos por calendario
export const getPagosPorCalendario = async (idCalendario) => {
  const res = await fetch(`${API_BASE_URL}/Pagos/por-calendario/${idCalendario}`, {
    headers: getAuthHeaders(),
  });
  const data = await handleResponse(res);
  return Array.isArray(data) ? data : data?.data || [];
};

// 🟢 POST: Crear nuevo pago
export const crearPago = async (payload) => {
  const res = await fetch(`${API_BASE_URL}/Pagos`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

// 🟡 PUT: Actualizar pago
export const updatePago = async (idPago, payload) => {
  const res = await fetch(`${API_BASE_URL}/Pagos/${idPago}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

// 🔴 DELETE: Eliminar pago
export const deletePago = async (idPago) => {
  const res = await fetch(`${API_BASE_URL}/Pagos/${idPago}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

// 🟣 POST: Generar pagos automáticos por calendario (SP)
export const generarPagosPorCalendario = async ({ idCalendario, idPago, idUsuario }) => {
  const res = await fetch(`${API_BASE_URL}/Pagos/generar-por-calendario`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ idCalendario, idPago, idUsuario }),
  });
  return handleResponse(res);
};

// GET: Casos por pago
export const getCasosPorPago = async (idPago) => {
  const res = await fetch(`${API_BASE_URL}/Casos/por-pago/${idPago}`, {
    headers: getAuthHeaders(),
  });
  const data = await handleResponse(res);
  return Array.isArray(data) ? data : data?.data || [];
};


