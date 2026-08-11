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
  timeout: 30000,
});

/** Refresh pode coincidir com cold start da Lambda — precisa de mais folga que o timeout padrão. */
const REFRESH_TIMEOUT_MS = 25000;
const REFRESH_MARGIN_MS = 5 * 60 * 1000;

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

export const getTokenExpiry = (token) => {
  try {
    const payload = decodeJwtPayload(token);
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
};

/** true se o access token já expirou ou expira dentro da margem (default 5 min). */
export const isAccessTokenExpiredOrExpiring = (token, marginMs = REFRESH_MARGIN_MS) => {
  if (!token || typeof token !== "string") return true;
  const expiresAt = getTokenExpiry(token);
  if (!expiresAt) return true;
  return expiresAt - Date.now() < marginMs;
};

const readStoredAuth = () => {
  try {
    return JSON.parse(window.localStorage.getItem(AUTH_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
};

const getErrorStatus = (error) =>
  error?.status
  ?? error?.response?.status
  ?? error?.originalError?.response?.status
  ?? null;

/** Só encerra sessão em falha definitiva de auth — não em timeout, rede ou 429. */
const isDefinitiveAuthFailure = (error) => {
  if (!error) return false;
  if (error.message === "no_refresh_token" || error.message === "invalid_refresh_response") {
    return true;
  }
  return getErrorStatus(error) === 401;
};

const forceLogout = () => {
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("auth:logout"));
};

const doRefresh = async () => {
  const savedAuth = readStoredAuth();
  const currentRefreshToken = savedAuth.refreshToken;
  if (!currentRefreshToken || typeof currentRefreshToken !== "string") {
    const err = new Error("no_refresh_token");
    err.status = 401;
    throw err;
  }

  // Outra aba pode ter renovado enquanto esta aguardava
  if (savedAuth.token && !isAccessTokenExpiredOrExpiring(savedAuth.token, 0)) {
    return savedAuth.token;
  }

  try {
    const data = await httpClient.post(
      "/usuario/refresh-token",
      { refreshToken: currentRefreshToken },
      { timeout: REFRESH_TIMEOUT_MS },
    );
    const newToken = data?.token;
    const newRefreshToken = data?.refreshToken;
    if (!newToken || typeof newToken !== "string") {
      const err = new Error("invalid_refresh_response");
      err.status = 401;
      throw err;
    }
    const updatedAuth = {
      ...savedAuth,
      token: newToken,
      refreshToken: newRefreshToken ?? currentRefreshToken,
    };
    try {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedAuth));
    } catch {
      // localStorage cheio — ignora, token em memória ainda válido
    }
    window.dispatchEvent(new CustomEvent("auth:tokenRefreshed", { detail: { token: newToken } }));
    return newToken;
  } catch (error) {
    // Corrida entre abas: outra aba pode ter consumido o refresh e gravado tokens novos
    const latest = readStoredAuth();
    if (
      latest.token
      && latest.token !== savedAuth.token
      && !isAccessTokenExpiredOrExpiring(latest.token, 0)
    ) {
      window.dispatchEvent(new CustomEvent("auth:tokenRefreshed", { detail: { token: latest.token } }));
      return latest.token;
    }
    throw error;
  }
};

/**
 * Garante um access token usable. Deduplica refreshes concorrentes.
 * @returns {Promise<string|null>} token fresco, ou null se não há sessão
 */
export const ensureFreshToken = async () => {
  const savedAuth = readStoredAuth();
  if (!savedAuth.token && !savedAuth.refreshToken) return null;

  if (savedAuth.token && !isAccessTokenExpiredOrExpiring(savedAuth.token)) {
    return savedAuth.token;
  }

  if (!savedAuth.refreshToken) {
    forceLogout();
    const err = new Error("no_refresh_token");
    err.status = 401;
    throw err;
  }

  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      pendingRequests.push({ resolve, reject });
    });
  }

  isRefreshing = true;
  window.dispatchEvent(new CustomEvent("auth:refreshStart"));
  try {
    const newToken = await doRefresh();
    notifyPending(newToken);
    return newToken;
  } catch (error) {
    rejectPending(error);
    if (isDefinitiveAuthFailure(error)) {
      forceLogout();
    }
    throw error;
  } finally {
    isRefreshing = false;
    window.dispatchEvent(new CustomEvent("auth:refreshEnd"));
  }
};

const refreshAndUpdateConfig = async (config) => {
  const newToken = await ensureFreshToken();
  if (!newToken) {
    const err = new Error("no_refresh_token");
    err.status = 401;
    throw err;
  }
  config.headers = config.headers ?? {};
  config.headers.Authorization = `Bearer ${newToken}`;
  return config;
};

// Interceptor de request: refresh preventivo se o token já expirou ou expira em < 5 min
httpClient.interceptors.request.use(
  async (config) => {
    const isRefreshEndpoint = config.url?.includes("/usuario/refresh-token");
    if (isRefreshEndpoint) return config;

    const authHeader = config.headers?.Authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) return config;

    const token = authHeader.replace("Bearer ", "");
    if (!isAccessTokenExpiredOrExpiring(token)) return config;

    try {
      return await refreshAndUpdateConfig(config);
    } catch (error) {
      if (isDefinitiveAuthFailure(error)) {
        throw new Error("Sessão expirada. Faça login novamente.");
      }
      // Erro transitório: não apaga sessão; falha só esta request
      throw error;
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
    const isRefreshEndpoint = originalRequest?.url?.includes("/usuario/refresh-token");
    const isLoginEndpoint = originalRequest?.url?.includes("/usuario/login");

    if (is401 && originalRequest && !originalRequest._retry && !isRefreshEndpoint && !isLoginEndpoint) {
      originalRequest._retry = true;

      try {
        const newToken = await ensureFreshToken();
        if (!newToken) throw new Error("no_refresh_token");
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return httpClient(originalRequest);
      } catch (refreshError) {
        if (isDefinitiveAuthFailure(refreshError)) {
          throw new Error("Sessão expirada. Faça login novamente.");
        }
        throw refreshError;
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
