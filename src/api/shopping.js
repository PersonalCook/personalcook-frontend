import axios from "axios";

const baseURL = import.meta.env.VITE_API_SHOPPING_URL || "http://localhost:8004";

const shoppingApi = axios.create({ baseURL });

shoppingApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default shoppingApi;