import axios from "axios";
import { resolveApiBaseUrl } from "./baseUrl.js";

const explicitBaseUrl = import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_URL ?? "https://api.unicores.site/api/v1";
const normalizedBaseUrl = resolveApiBaseUrl(explicitBaseUrl);

axios.defaults.baseURL = normalizedBaseUrl;
axios.defaults.withCredentials = true;
window.API_BASE_URL = normalizedBaseUrl;

const api = axios.create({
    baseURL: normalizedBaseUrl,
    withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (resolve, reject) => {
    refreshSubscribers.push({ resolve, reject });
};

const onRefreshed = () => {
    refreshSubscribers.forEach(({ resolve }) => resolve());
    refreshSubscribers = [];
};

const onRefreshFailed = (error) => {
    refreshSubscribers.forEach(({ reject }) => reject(error));
    refreshSubscribers = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;
        const isRefreshRequest = originalRequest?.url?.includes("/auth/refresh-token");
        const isAuthRequest =
            /\/auth\/(login|logout|refresh-token)/i.test(
                originalRequest?.url || ""
            );
        if (status === 401 && !originalRequest?._retry && !isRefreshRequest && !isAuthRequest) {
            originalRequest._retry = true;

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    subscribeTokenRefresh(resolve, reject);
                }).then(() => api(originalRequest));
            }

            isRefreshing = true;
            try {
                await api.post("/auth/refresh-token", {}, { withCredentials: true });
                onRefreshed();
                return api(originalRequest);
            } catch (refreshError) {
                onRefreshFailed(refreshError);
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
