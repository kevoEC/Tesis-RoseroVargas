// src/service/Entidades/AdendumService.js

import { API_BASE_URL } from "@/config";

// Auxiliar: manejar respuesta de fetch
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Error en la solicitud");
  }
  return await response.json();
};

// Auxiliar: obtener headers con Bearer Token
const getAuthHeaders = () => {
  const token = JSON.parse(localStorage.getItem("user"))?.token;
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// 🔵 GET: Obtener detalle de Adendum por ID
export const getAdendumById = async (idAdendum) => {
  const res = await fetch(`${API_BASE_URL}/adendum/${idAdendum}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

// 🔵 GET: Obtener lista de Adendums por Inversión
export const getAdendumsPorInversion = async (idInversion) => {
  const res = await fetch(`${API_BASE_URL}/adendum/por-inversion/${idInversion}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

// 🔵 GET: Obtener documentos por Adendum
export const getDocumentosPorAdendum = async (idAdendum) => {
  const res = await fetch(`${API_BASE_URL}/adendum/por-adendum/${idAdendum}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

// 🟢 POST: Crear nuevo Adendum
export const crearAdendum = async (data) => {
  const res = await fetch(`${API_BASE_URL}/adendum`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

// 🟢 POST: Continuar flujo de Adendum (activar)
export const continuarFlujoAdendum = async (idAdendum, idUsuario) => {
  const res = await fetch(`${API_BASE_URL}/adendum/${idAdendum}/continuar-flujo?idUsuario=${idUsuario}`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

// 🟢 POST: Generar documentos de Adendum
export const generarDocumentosAdendum = async (idAdendum, idUsuario) => {
  const res = await fetch(`${API_BASE_URL}/adendum/${idAdendum}/generar-documentos?idUsuario=${idUsuario}`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

// 🟣 PUT: Actualizar Adendum
export const actualizarAdendum = async (data) => {
  const res = await fetch(`${API_BASE_URL}/adendum`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

// 🟣 PUT: Actualizar incremento
export const actualizarIncremento = async (data) => {
  const res = await fetch(`${API_BASE_URL}/adendum/set-incremento`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

// 🟢 POST: Crear incremento (proyección incremento)
export const crearIncrementoProyeccion = async (data) => {
  const res = await fetch(`${API_BASE_URL}/proyeccion/incremento`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

// 🔵 GET: Obtener cronograma por proyección
export const getCronogramaPorProyeccion = async (idProyeccion) => {
  const res = await fetch(`${API_BASE_URL}/Proyeccion/${idProyeccion}/cronograma`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};
