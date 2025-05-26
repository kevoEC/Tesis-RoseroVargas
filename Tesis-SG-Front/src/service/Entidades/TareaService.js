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

// ✅ POST: Finalizar solicitud y generar tareas
export const finalizarSolicitudYGenerarTareas = async (idSolicitudInversion) => {
  const res = await fetch(`${API_BASE_URL}/SolicitudInversion/finalizar`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      idSolicitudInversion: Number(idSolicitudInversion),
    }),
  });
  return handleResponse(res);
};


// GET: Tareas por solicitud de inversión
export const getTareasPorSolicitud = async (idSolicitudInversion) => {
  const res = await fetch(`${API_BASE_URL}/Tarea/por-solicitud/${idSolicitudInversion}`, {
    headers: getAuthHeaders(),
  });
  const json = await handleResponse(res);
  return json.data;
};

export const getTareasPorRol = async (idRol) => {
  const res = await fetch(`${API_BASE_URL}/tarea/por-rol/${idRol}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error("Error al obtener tareas por rol");
  const data = await res.json();
  return data;
};


// GET: Documentos filtrados por idSolicitud e idMotivo
export const getDocumentosPorSolicitudYMotivo = async (idSolicitudInversion, idMotivo) => {
  const res = await fetch(
    `${API_BASE_URL}/documento/por-solicitud-y-motivo?idSolicitudInversion=${idSolicitudInversion}&idMotivo=${idMotivo}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || "Error al obtener documentos");
  }

  const json = await res.json();
  return json.data || [];
};
