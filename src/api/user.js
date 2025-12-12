import axios from "axios";

const baseURL = import.meta.env.VITE_API_USER_URL || "http://api:8000";

const userApi = axios.create({ baseURL });

userApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default userApi;