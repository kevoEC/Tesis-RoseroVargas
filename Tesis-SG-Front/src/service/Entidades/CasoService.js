/* eslint-disable no-unused-vars */
// service/Entidades/InversionService.js
import { API_BASE_URL } from "@/config";

const handleResponse = async (res) => {
  if (!res.ok) throw new Error((await res.text()) || "Error");
  return await res.json();
};

export async function getCasosPorClienteId(id) {
  // ...implementa fetch a /api/documento/documentos-por-inversion/{id}
}
