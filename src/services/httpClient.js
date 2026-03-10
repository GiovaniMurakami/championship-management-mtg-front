import axios from "axios";

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

// Interceptador de resposta para padronizar tratamento de erros
httpClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.mensagem ||
      error.response?.data?.message ||
      error.message ||
      "Falha na requisição";
    throw new Error(message);
  },
);

export default httpClient;
