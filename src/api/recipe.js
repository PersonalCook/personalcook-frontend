import axios from "axios";

const baseURL = "/api/recipe";

const recipeApi = axios.create({ baseURL });

recipeApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default recipeApi;