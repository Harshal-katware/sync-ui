import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080",
});

// ✅ Har request mein automatically JWT token lagega
axiosInstance.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;