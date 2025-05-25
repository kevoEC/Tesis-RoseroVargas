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

// 🟢 GET: Obtener todos asesores
export const getAsesoresComerciales = async () => {
  const res = await fetch(`${API_BASE_URL}/vista/asesorcomercial`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};
export const getJustificativoTransaccion = async () => {
  const res = await fetch(`${API_BASE_URL}/JustificativoTransaccion`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};
export const getOrigenCliente = async () => {
  const res = await fetch(`${API_BASE_URL}/OrigenCliente`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};
