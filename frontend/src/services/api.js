import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;

if (!baseURL) {
  console.error("Falta definir VITE_API_URL en el archivo .env");
}

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json"
  }
});

export default api;