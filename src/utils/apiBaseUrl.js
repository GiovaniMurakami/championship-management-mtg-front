/** Base URL da API (mesma regra do httpClient), sem side effects. */
export function getApiBaseUrl() {
  const environment = import.meta.env.VITE_ENVIRONMENT || "development";
  const useLocalhost = import.meta.env.VITE_USE_LOCALHOST === "true";

  if (useLocalhost) {
    return import.meta.env.VITE_BACKEND_DEV_URL || "http://localhost:3000";
  }

  if (environment === "production") {
    return import.meta.env.VITE_BACKEND_PROD_URL || "http://localhost:3000";
  }

  return import.meta.env.VITE_BACKEND_DEV_URL || "http://localhost:3000";
}
