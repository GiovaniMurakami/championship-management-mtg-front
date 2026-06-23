import axios from "axios";
import { AUTH_STORAGE_KEY } from "../constants/auth";
import { extractValidationMessages, formatApiErrorMessage } from "../utils/apiError";

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

/** Deduplica GETs idênticos em voo (ex.: React StrictMode em dev). */
const inflightGetRequests = new Map();

function buildGetDedupeKey(url, config = {}) {
  const params = config.params;
  let paramsKey = "";
  if (params instanceof URLSearchParams) {
    paramsKey = params.toString();
  } else if (params && typeof params === "object") {
    paramsKey = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join("&");
  }
  const auth = config.headers?.Authorization || "";
  return `GET|${url}|${paramsKey}|${auth}`;
}

const rawGet = httpClient.get.bind(httpClient);
httpClient.get = (url, config = {}) => {
  const key = buildGetDedupeKey(url, config);
  const existing = inflightGetRequests.get(key);
  if (existing) return existing;

  const promise = rawGet(url, config).finally(() => {
    inflightGetRequests.delete(key);
  });
  inflightGetRequests.set(key, promise);
  return promise;
};

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

const decodeJwtPayload = (token) => {
  const [, rawPayload] = token.split(".");
  if (!rawPayload) return null;

  const base64 = rawPayload.replace(/-/g, "+").replace(/_/g, "/");
  const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  return JSON.parse(atob(paddedBase64));
};

const getTokenExpiry = (token) => {
  try {
    const payload = decodeJwtPayload(token);
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
};

const doRefresh = async () => {
  let savedAuth = {};
  try {
    savedAuth = JSON.parse(window.localStorage.getItem(AUTH_STORAGE_KEY) || "{}");
  } catch {
    throw new Error("no_refresh_token");
  }
  const currentRefreshToken = savedAuth.refreshToken;
  if (!currentRefreshToken || typeof currentRefreshToken !== "string") throw new Error("no_refresh_token");
  const data = await httpClient.post("/usuario/refresh-token", { refreshToken: currentRefreshToken });
  const newToken = data?.token;
  const newRefreshToken = data?.refreshToken;
  if (!newToken || typeof newToken !== "string") throw new Error("invalid_refresh_response");
  const updatedAuth = { ...savedAuth, token: newToken, refreshToken: newRefreshToken ?? currentRefreshToken };
  try {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedAuth));
  } catch {
    // localStorage cheio — ignora, token em memória ainda válido
  }
  window.dispatchEvent(new CustomEvent("auth:tokenRefreshed", { detail: { token: newToken } }));
  return newToken;
};

// Interceptor de request: refresh preventivo se o token expira em < 5 min
httpClient.interceptors.request.use(
  async (config) => {
    const isRefreshEndpoint = config.url?.includes("/usuario/refresh-token");
    if (isRefreshEndpoint) return config;

    const authHeader = config.headers?.Authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) return config;

    const token = authHeader.replace("Bearer ", "");
    const expiresAt = getTokenExpiry(token);
    if (!expiresAt) return config;

    const fiveMinutes = 5 * 60 * 1000;
    const now = Date.now();
    const isExpiringSoon = expiresAt - now < fiveMinutes && expiresAt > now;

    if (!isExpiringSoon) return config;

    if (isRefreshing) {
      const newToken = await new Promise((resolve, reject) => {
        pendingRequests.push({ resolve, reject });
      });
      config.headers["Authorization"] = `Bearer ${newToken}`;
      return config;
    }

    isRefreshing = true;
    try {
      const newToken = await doRefresh();
      notifyPending(newToken);
      config.headers["Authorization"] = `Bearer ${newToken}`;
      return config;
    } catch {
      rejectPending(new Error("Sessão expirada."));
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      window.dispatchEvent(new CustomEvent("auth:logout"));
      throw new Error("Sessão expirada. Faça login novamente.");
    } finally {
      isRefreshing = false;
    }
  },
  (error) => Promise.reject(error),
);

httpClient.interceptors.response.use(
  (response) => {
    const requestId = response.headers?.["x-request-id"];
    if (
      requestId
      && import.meta.env.DEV
      && response.data
      && typeof response.data === "object"
      && !Array.isArray(response.data)
    ) {
      response.data._requestId = requestId;
    }
    return response.data;
  },
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
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
          return httpClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await doRefresh();

        notifyPending(newToken);

        originalRequest.headers = originalRequest.headers ?? {};
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

    // Global 429 rate-limit handling
    if (error.response?.status === 429) {
      const msg429 = error.response?.data?.mensagem || error.response?.data?.message || "Muitas requisições. Aguarde um momento e tente novamente.";
      window.dispatchEvent(new CustomEvent("auth:rateLimited", { detail: { message: msg429 } }));
      throw new Error(msg429);
    }

    // Handle validation errors (erros[] / errors[] — strings or Zod objects)
    const validationMessages = extractValidationMessages(error.response?.data);
    if (validationMessages.length > 0) {
      const normalizedError = new Error(validationMessages.join("; "));
      normalizedError.status = error.response?.status;
      normalizedError.validationErrors = validationMessages;
      normalizedError.responseData = error.response?.data;
      normalizedError.requestId = error.response?.headers?.["x-request-id"];
      normalizedError.originalError = error;
      throw normalizedError;
    }

    const message = formatApiErrorMessage(error.response?.data, error.message || "Falha na requisição");
    const normalizedError = new Error(message);
    normalizedError.status = error.response?.status;
    normalizedError.responseData = error.response?.data;
    normalizedError.requestId = error.response?.headers?.["x-request-id"];
    normalizedError.originalError = error;
    throw normalizedError;
  },
);

export default httpClient;
