import api from "./api";

export const obtenerGeocercas = async () => {
  const response = await api.get("/geofences");
  return response.data;
};

export const crearGeocerca = async (geocerca) => {
  const response = await api.post("/geofences", geocerca);
  return response.data;
};