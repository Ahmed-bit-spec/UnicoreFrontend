import axios from "axios";

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_URL ?? "/api/v1";
const normalizedBaseUrl = (() => {
    const url = String(rawBaseUrl).trim();
    if (!url) return "/api/v1";
    const cleaned = url.replace(/\/+$/u, "");
    if (/^https?:\/\//u.test(cleaned)) {
        return `${cleaned}/api/v1`;
    }
    if (cleaned.startsWith("/")) {
        return cleaned.includes("/api/v1") ? cleaned : `${cleaned}/api/v1`;
    }
    return `/${cleaned}`;
})();

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

        if (status === 401 && !originalRequest._retry && !isRefreshRequest) {
            originalRequest._retry = true;

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    subscribeTokenRefresh(resolve, reject);
                }).then(() => api(originalRequest));
            }

            isRefreshing = true;
            try {
                await axios.post("/api/v1/auth/refresh-token", {}, { withCredentials: true });
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
