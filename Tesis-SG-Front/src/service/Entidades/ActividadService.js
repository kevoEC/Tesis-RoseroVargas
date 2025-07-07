// src/service/Entidades/ActividadService.js

import { API_BASE_URL } from "@/config";

// Función auxiliar para manejar respuestas de la API
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Error en la solicitud");
  }
  return await response.json();
};

// Token bearer
const getAuthHeaders = () => {
  const token = JSON.parse(localStorage.getItem("user"))?.token;
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// 🔵 GET: Obtener actividades por IdProspecto
export const getActividadesByProspectoId = async (id) => {
  const res = await fetch(`${API_BASE_URL}/vista/actividad/filtrar?por=IdProspecto&id=${id}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

// 🟡 POST: Crear nueva actividad
export const createActividad = async (data) => {
  // Mapeo correcto a tu modelo backend
  const payload = {
    IdTipoActividad: Number(data.idTipoActividad),
    Asunto: data.asunto,
    Descripcion: data.descripcion,
    Duracion: data.duracion, // Formato "HH:mm:ss"
    Vencimiento: data.vencimiento, // Formato ISO
    IdPrioridad: Number(data.idPrioridad),
    Estado: !!data.estado, // true = finalizada
    IdProspecto: Number(data.idProspecto),
    IdUsuarioPropietario: data.idUsuarioPropietario ?? null, // si lo usas
    FechaCreacion: data.fechaCreacion ?? null,
  };
  const res = await fetch(`${API_BASE_URL}/Actividad`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

// 🟣 PUT: Actualizar actividad (REAL!)
export const updateActividad = async (idActividad, data) => {
  // Mapear solo los campos permitidos por tu modelo
  const payload = {
    IdActividad: Number(idActividad),
    IdTipoActividad: Number(data.idTipoActividad),
    Asunto: data.asunto,
    Descripcion: data.descripcion,
    Duracion: data.duracion, // "HH:mm:ss"
    Vencimiento: data.vencimiento, // fecha ISO
    IdPrioridad: Number(data.idPrioridad),
    Estado: !!data.estado, // true o false
    IdProspecto: Number(data.idProspecto),
    IdUsuarioPropietario: data.idUsuarioPropietario ?? null, // opcional
    FechaCreacion: data.fechaCreacion ?? null, // opcional
  };
  const res = await fetch(`${API_BASE_URL}/Actividad/${idActividad}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};
