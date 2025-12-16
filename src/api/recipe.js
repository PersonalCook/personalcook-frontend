import axios from "axios";

const baseURL = import.meta.env.VITE_API_RECIPE_URL || "http://localhost:8001";

const recipeApi = axios.create({ baseURL });

recipeApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default recipeApi;