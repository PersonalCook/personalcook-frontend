import axios from "axios";

const baseURL = "/api/shopping";

const shoppingApi = axios.create({ baseURL });

shoppingApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default shoppingApi;