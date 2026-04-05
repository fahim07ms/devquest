import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Don't retry for auth endpoints (login, register, refresh)
        const isAuthEndpoint = originalRequest.url?.includes('/auth/login') ||
            originalRequest.url?.includes('/auth/register') ||
            originalRequest.url?.includes('/auth/refresh');

        // Only attempt refresh if:
        // 1. Status is 401
        // 2. Haven't already retried
        // 3. Not an auth endpoint
        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
            originalRequest._retry = true;

            try {
                await api.get("/auth/refresh");
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed, let the error propagate
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;