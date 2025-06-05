/* eslint-disable no-unused-vars */
// service/Entidades/InversionService.js
import { API_BASE_URL } from "@/config";

const handleResponse = async (res) => {
  if (!res.ok) throw new Error((await res.text()) || "Error");
  return await res.json();
};

export const getInversionById = async (id) => {
  const token = JSON.parse(localStorage.getItem("user"))?.token;
  const res = await fetch(`${API_BASE_URL}/Inversion/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await handleResponse(res);
};

export const getInversiones = async () => {
  const token = JSON.parse(localStorage.getItem("user"))?.token;
  const res = await fetch(`${API_BASE_URL}/Inversion`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await handleResponse(res);
};

export const getInversionesPorPropietario = async (idUsuario) => {
  const token = JSON.parse(localStorage.getItem("user"))?.token;
  const res = await fetch(
    `${API_BASE_URL}/Inversion/por-propietario/${idUsuario}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return await handleResponse(res);
};

export async function getAdendumsByInversionId(id) {
  // ...implementa fetch a /api/documento/adendums-por-inversion/{id}
}

export async function getInversionesPorClienteId(id) {
  // ...implementa fetch a /api/documento/documentos-por-inversion/{id}
}
