import axios from "axios";

const baseURL = import.meta.env.VITE_API_SOCIAL_URL || "http://localhost:8002";

const socialApi = axios.create({ baseURL });

socialApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default socialApi;