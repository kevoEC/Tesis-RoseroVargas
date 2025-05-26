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
