import { API_BASE_URL } from "@/config";

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Error en el registro");
  return data;
};

export const registroParcial = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/Usuario/registro-parcial`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
};


export const validarCorreoToken = async (token) => {
  const response = await fetch(`${API_BASE_URL}/usuario/validar-correo?token=${token}`);
  const data = await response.json();

  // No lances error aquí, deja que el frontend maneje todos los casos
  return data;
};


// Enviar código de verificación por SMS
export const enviarCodigoTelefono = async ({ idUsuario, numero, extension }) => {
  const res = await fetch(`${API_BASE_URL}/usuario/enviar-codigo-telefono`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idUsuario, numero, extension }),
  });

  return await res.json();
};

// Validar el código ingresado
export const validarCodigoTelefono = async ({ idUsuario, codigo }) => {
  const res = await fetch(`${API_BASE_URL}/usuario/validar-telefono`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idUsuario, codigo }),
  });

  return await res.json();
};


