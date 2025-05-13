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

export const getCatalogoBancos = async () => {
  const res = await fetch(`${API_BASE_URL}/Banco`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const getCatalogoTiposCuenta = async () => {
  const res = await fetch(`${API_BASE_URL}/TipoCuenta`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};
