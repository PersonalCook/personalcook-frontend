import axios from "axios";

const baseURL = "/api/user";

const userApi = axios.create({ baseURL });

userApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default userApi;