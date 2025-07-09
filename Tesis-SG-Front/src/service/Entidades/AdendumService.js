// src/service/Entidades/AdendumService.js

import { API_BASE_URL, getAuthHeaders, handleResponse } from "@/service/config"; // Ajusta ruta si tu config está en otra carpeta

// Obtener detalle de Adendum por ID
export const getAdendumById = async (idAdendum) => {
  const res = await fetch(`${API_BASE_URL}/adendum/${idAdendum}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

// Obtener lista de Adendums por Inversión
export const getAdendumsPorInversion = async (idInversion) => {
  const res = await fetch(`${API_BASE_URL}/adendum/por-inversion/${idInversion}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

// Obtener documentos por Adendum
export const getDocumentosPorAdendum = async (idAdendum) => {
  const res = await fetch(`${API_BASE_URL}/adendum/por-adendum/${idAdendum}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

// Crear Adendum (POST)
export const crearAdendum = async (payload) => {
  const res = await fetch(`${API_BASE_URL}/adendum`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

// Continuar flujo de Adendum (POST sin body)
export const continuarFlujoAdendum = async (idAdendum, idUsuario) => {
  const res = await fetch(`${API_BASE_URL}/adendum/${idAdendum}/continuar-flujo?idUsuario=${idUsuario}`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

// Generar documentos del Adendum (POST sin body)
export const generarDocumentosAdendum = async (idAdendum, idUsuario) => {
  const res = await fetch(`${API_BASE_URL}/adendum/${idAdendum}/generar-documentos?idUsuario=${idUsuario}`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

// Actualizar Adendum (PUT)
export const actualizarAdendum = async (payload) => {
  const res = await fetch(`${API_BASE_URL}/adendum`, {
    method: "PUT",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

// Actualizar incremento (PUT)
export const actualizarIncremento = async (payload) => {
  const res = await fetch(`${API_BASE_URL}/adendum/set-incremento`, {
    method: "PUT",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

// Crear incremento (POST - Proyección incremento)
export const crearIncrementoProyeccion = async (payload) => {
  const res = await fetch(`${API_BASE_URL}/proyeccion/incremento`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

// Obtener cronograma por proyección (GET)
export const getCronogramaPorProyeccion = async (idProyeccion) => {
  const res = await fetch(`${API_BASE_URL}/Proyeccion/${idProyeccion}/cronograma`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

