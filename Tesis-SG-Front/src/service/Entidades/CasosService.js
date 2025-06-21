import { API_BASE_URL } from "@/config";

// Utilidad para manejar las respuestas de fetch
const handleResponse = async (res) => {
  if (!res.ok) throw new Error((await res.text()) || "Error");
  return await res.json();
};

const getToken = () => JSON.parse(localStorage.getItem("user"))?.token;

// 1. Lista todos los casos
export const getCasos = async () => {
  const res = await fetch(`${API_BASE_URL}/Casos`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return await handleResponse(res);
};

// 2. Trae un caso por ID
export const getCasoById = async (id) => {
  const res = await fetch(`${API_BASE_URL}/Casos/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return await handleResponse(res);
};

// 3. Casos filtrados por cliente
export const getCasosPorCliente = async (idCliente) => {
  const res = await fetch(`${API_BASE_URL}/Casos/por-cliente/${idCliente}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return await handleResponse(res);
};

// 4. Casos filtrados por inversión
export const getCasosPorInversion = async (idInversion) => {
  const res = await fetch(
    `${API_BASE_URL}/Casos/por-inversion/${idInversion}`,
    {
      headers: { Authorization: `Bearer ${getToken()}` },
    }
  );
  return await handleResponse(res);
};

// 5. Casos filtrados por pago
export const getCasosPorPago = async (idPago) => {
  const res = await fetch(`${API_BASE_URL}/Casos/por-pago/${idPago}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return await handleResponse(res);
};

// 6. Crea un nuevo caso (POST)
export const createCaso = async (data) => {
  const res = await fetch(`${API_BASE_URL}/Casos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });
  return await handleResponse(res);
};

// 7. Actualiza un caso (PUT)
export const updateCaso = async (id, data) => {
  const res = await fetch(`${API_BASE_URL}/Casos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });
  return await handleResponse(res);
};

// 8. Ejecuta flujo del caso por motivo (POST)
export const ejecutarFlujoCaso = async (id) => {
  const res = await fetch(`${API_BASE_URL}/Casos/${id}/continuar`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return await handleResponse(res);
};

// 9. Rollback masivo de casos de pago (POST)
export const rollbackPagos = async (data) => {
  const res = await fetch(`${API_BASE_URL}/Casos/rollback-pagos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });
  return await handleResponse(res);
};

// 10. Elimina un caso por ID (DELETE)
export const deleteCaso = async (id) => {
  const res = await fetch(`${API_BASE_URL}/Casos/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  // Algunos deletes pueden devolver vacío, por eso chequea si hay contenido
  if (res.status === 204) return { success: true };
  return await handleResponse(res);
};
