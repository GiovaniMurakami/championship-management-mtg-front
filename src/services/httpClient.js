import axios from "axios";

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL?.trim() || "http://localhost:3000",
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
