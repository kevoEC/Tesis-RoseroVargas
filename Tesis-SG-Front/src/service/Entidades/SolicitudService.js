import { API_BASE_URL } from "@/config";

// 👉 Reutilizamos lógica compartida
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

// Solicitudes CRUD
export const getSolicitudes = async () => {
  const res = await fetch(`${API_BASE_URL}/solicitudinversion/detalle`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const getSolicitudById = async (id) => {
  const res = await fetch(
    `${API_BASE_URL}/vista/solicitudinversion/filtrarDTO?por=solicitud&id=${id}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return handleResponse(res);
};

export const createSolicitud = async (data) => {
  const res = await fetch(`${API_BASE_URL}/SolicitudInversion/estructura`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const updateSolicitud = async (id, data) => {
  console.log("ddkjdflkjfk", data);
  const res = await fetch(
    `${API_BASE_URL}/solicitudinversion/estructura/${id}`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }
  );
  return handleResponse(res);
};

export const deleteSolicitud = async (id) => {
  const res = await fetch(`${API_BASE_URL}/SolicitudInversion/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const getSolicitudesFiltradas = async (filtro) => {
  const res = await fetch(`${API_BASE_URL}/SolicitudInversion/filtradas`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(filtro),
  });
  return handleResponse(res);
};

export const getSolicitudesByProspectoId = async (id) => {
  const res = await fetch(
    `${API_BASE_URL}/vista/solicitudinversion/filtrarDTO?por=prospecto&id=${id}`,
    {
      headers: getAuthHeaders(),
    }
  );
  const result = await handleResponse(res);
  return result.data ?? [];
};

// 🔍 VALIDACIONES

// 🟢 POST: Validación Equifax
export const validarEquifax = async (numeroDocumento) => {
  const res = await fetch(`${API_BASE_URL}/Validacion/equifax`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      tipoDocumento: "C",
      numeroDocumento: numeroDocumento,
    }),
  });
  return handleResponse(res);
};

// 🔵 POST: Validación LDS (Listas de control)
export const validarLDS = async ({
  identificacion,
  primerNombre,
  segundoNombre,
  primerApellido,
  segundoApellido,
}) => {
  const nombreCompleto = (
    (primerNombre || "") +
    " " +
    (segundoNombre || "") +
    " " +
    (primerApellido || "") +
    " " +
    (segundoApellido || "")
  )
    .trim()
    .toUpperCase();

  const res = await fetch(`${API_BASE_URL}/Validacion/lds`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      identificacion,
      primerNombre,
      segundoNombre,
      primerApellido,
      segundoApellido,
      nombreCompleto,
    }),
  });

  return handleResponse(res);
};


export const getSolicitudesByClienteId = async (idCliente) => {
  const token = JSON.parse(localStorage.getItem("user"))?.token;
  const res = await fetch(`${API_BASE_URL}/vista/solicitudinversion/filtrarDTO?por=cliente&id=${idCliente}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }
  });
  if (!res.ok) throw new Error("Error al obtener solicitudes por cliente");
  return await res.json();
};
