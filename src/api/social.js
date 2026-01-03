import axios from "axios";

const baseURL = "/api/social";

const socialApi = axios.create({ baseURL });

socialApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default socialApi;