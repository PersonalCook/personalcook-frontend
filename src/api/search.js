import axios from "axios";

const baseURL = import.meta.env.VITE_API_SEARCH_URL || "http://localhost:8003";

const searchApi = axios.create({ baseURL });

searchApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default searchApi;