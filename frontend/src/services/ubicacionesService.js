import api from "./api";

export const obtenerUbicacionesPorVaca = async (cowId) => {
  const response = await api.get(`/locations/cow/${cowId}`);
  return response.data;
};

export const obtenerUltimaUbicacion = async (cowId) => {
  const response = await api.get(`/locations/cow/${cowId}/last`);
  return response.data;
};

export const crearUbicacion = async (ubicacion) => {
  const response = await api.post("/locations", ubicacion);
  return response.data;
};