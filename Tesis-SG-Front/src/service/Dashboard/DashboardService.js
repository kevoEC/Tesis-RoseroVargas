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

// Prospectos
export const getDashboardProspectosEstadisticas = async () => {
  const res = await fetch(`${API_BASE_URL}/dashboard/prospectos/estadisticas`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

// Solicitudes
export const getDashboardSolicitudesEstadisticas = async () => {
  const res = await fetch(`${API_BASE_URL}/dashboard/solicitudes/estadisticas`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

// Tareas
export const getDashboardTareasEstadisticas = async () => {
  const res = await fetch(`${API_BASE_URL}/dashboard/tareas/estadisticas`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

// Clientes
export const getDashboardClientesEstadisticas = async () => {
  const res = await fetch(`${API_BASE_URL}/dashboard/clientes/estadisticas`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

// Inversiones
export const getDashboardInversionesEstadisticas = async () => {
  const res = await fetch(`${API_BASE_URL}/dashboard/inversiones/estadisticas`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

// Pagos y Casos
export const getDashboardPagosCasosEstadisticas = async () => {
  const res = await fetch(`${API_BASE_URL}/dashboard/pagos-casos/estadisticas`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};
