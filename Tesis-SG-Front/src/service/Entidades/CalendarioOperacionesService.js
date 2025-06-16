// services/Entidades/CalendarioOperacionesService.js
import { API_BASE_URL } from "@/config";

const handleResponse = async (res) => {
  if (!res.ok) throw new Error((await res.text()) || "Error");
  return await res.json();
};

export const getCalendariosOperaciones = async () => {
  const token = JSON.parse(localStorage.getItem("user"))?.token;
  const res = await fetch(`${API_BASE_URL}/CalendarioOperaciones`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await handleResponse(res);
};

export const getCalendarioOperacionesById = async (id) => {
  const token = JSON.parse(localStorage.getItem("user"))?.token;
  const res = await fetch(`${API_BASE_URL}/CalendarioOperaciones/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await handleResponse(res);
};

export const createCalendarioOperaciones = async (data) => {
  const token = JSON.parse(localStorage.getItem("user"))?.token;
  const res = await fetch(`${API_BASE_URL}/CalendarioOperaciones`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return await handleResponse(res);
};

export const updateCalendarioOperaciones = async (id, data) => {
  const token = JSON.parse(localStorage.getItem("user"))?.token;
  const res = await fetch(`${API_BASE_URL}/CalendarioOperaciones/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return await handleResponse(res);
};

export const deleteCalendarioOperaciones = async (id) => {
  const token = JSON.parse(localStorage.getItem("user"))?.token;
  const res = await fetch(`${API_BASE_URL}/CalendarioOperaciones/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return await handleResponse(res);
};
