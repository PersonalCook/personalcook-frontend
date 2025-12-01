import axios from "axios";

const recipeApi = axios.create({
  baseURL: "http://localhost:8001",
});

recipeApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default recipeApi;