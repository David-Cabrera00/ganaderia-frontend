import api from "./api";

export const obtenerAlertas = async () => {
  const response = await api.get("/alerts");
  return response.data;
};

// export const atenderAlerta = async (id) => {
//   const response = await api.put(`/alerts/${id}/atender`);
//   return response.data;
// };