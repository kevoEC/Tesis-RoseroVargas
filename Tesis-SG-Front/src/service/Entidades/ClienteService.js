import { API_BASE_URL } from "@/config";

// Utilidad para manejar la respuesta
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Error en la solicitud");
  }
  return await response.json();
};

const getAuthHeaders = () => {
  const token = JSON.parse(localStorage.getItem("user"))?.token;
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// ✅ GET: Todos los clientes
export const getClientes = async () => {
  const res = await fetch(`${API_BASE_URL}/cliente`, {
    headers: getAuthHeaders(),
  });
  return await handleResponse(res);
};

// ✅ GET: Clientes por propietario
export const getClientesPorPropietario = async (idUsuarioPropietario) => {
  const res = await fetch(
    `${API_BASE_URL}/cliente/por-propietario/${idUsuarioPropietario}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return await handleResponse(res);
};

// ✅ GET: Cliente por ID
export const getClienteById = async (idCliente) => {
  const res = await fetch(`${API_BASE_URL}/cliente/${idCliente}`, {
    headers: getAuthHeaders(),
  });
  return await handleResponse(res);
};

// ✅ PUT: Actualizar cliente
export const updateCliente = async (idCliente, payload) => {
  const res = await fetch(`${API_BASE_URL}/cliente/${idCliente}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return await handleResponse(res);
};

// ✅ GET: Inversiones por Cliente
export const getInversionesPorCliente = async (idCliente) => {
  const res = await fetch(
    `${API_BASE_URL}/inversion/por-cliente/${idCliente}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return await handleResponse(res);
};
