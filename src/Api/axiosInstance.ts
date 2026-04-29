import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:8080",
});

// Add token to every request automatically
axiosInstance.interceptors.request.use((config) => {
    const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 — redirect to login
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.clear();
            sessionStorage.clear();
            window.location.replace("/");
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;