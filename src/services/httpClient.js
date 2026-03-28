import axios from "axios";
import { AUTH_STORAGE_KEY } from "../constants/auth";

// Resolver URL base automaticamente
const getBaseURL = () => {
  const environment = import.meta.env.VITE_ENVIRONMENT || "development";
  const useLocalhost = import.meta.env.VITE_USE_LOCALHOST === "true";

  if (useLocalhost) {
    return import.meta.env.VITE_BACKEND_DEV_URL || "http://localhost:3000";
  }

  if (environment === "production") {
    return import.meta.env.VITE_BACKEND_PROD_URL || "http://localhost:3000";
  }

  return import.meta.env.VITE_BACKEND_DEV_URL || "http://localhost:3000";
};

const httpClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
});

let isRefreshing = false;
let pendingRequests = [];

const notifyPending = (newToken) => {
  pendingRequests.forEach(({ resolve }) => resolve(newToken));
  pendingRequests = [];
};

const rejectPending = (error) => {
  pendingRequests.forEach(({ reject }) => reject(error));
  pendingRequests = [];
};

httpClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    const is401 = error.response?.status === 401;
    const isRefreshEndpoint = originalRequest.url?.includes("/usuario/refresh-token");
    const isLoginEndpoint = originalRequest.url?.includes("/usuario/login");

    if (is401 && !originalRequest._retry && !isRefreshEndpoint && !isLoginEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingRequests.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
          return httpClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const savedAuth = JSON.parse(window.localStorage.getItem(AUTH_STORAGE_KEY) || "{}");
        const currentToken = savedAuth.token;

        if (!currentToken) throw new Error("no_token");

        const data = await httpClient.post(
          "/usuario/refresh-token",
          {},
          { headers: { Authorization: `Bearer ${currentToken}` } },
        );

        const newToken = data.token;
        const updatedAuth = { ...savedAuth, token: newToken };
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedAuth));

        notifyPending(newToken);

        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return httpClient(originalRequest);
      } catch {
        rejectPending(new Error("Sessão expirada."));
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
        window.dispatchEvent(new CustomEvent("auth:logout"));
        throw new Error("Sessão expirada. Faça login novamente.");
      } finally {
        isRefreshing = false;
      }
    }

    const message =
      error.response?.data?.mensagem ||
      error.response?.data?.message ||
      error.message ||
      "Falha na requisição";
    throw new Error(message);
  },
);

export default httpClient;
