import api from "./api";

export const obtenerCollares = async () => {
  const response = await api.get("/collars");
  return response.data;
};

export const crearCollar = async (collar) => {
  const response = await api.post("/collars", collar);
  return response.data;
};