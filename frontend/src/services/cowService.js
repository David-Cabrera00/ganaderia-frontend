import api from "./api";

export const obtenerVacas = async () => {
  const response = await api.get("/cows");
  return response.data;
};

export const crearVaca = async (vaca) => {
  const response = await api.post("/cows", vaca);
  return response.data;
};