import httpClient from "./httpClient";

export const listarTimes = (token) =>
    httpClient.get("/time/listar", token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);

export const buscarTime = (id, token) =>
    httpClient.get(`/time/${id}`, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);

export const criarTime = (payload, token) =>
    httpClient.post("/time/criar", payload, { headers: { Authorization: `Bearer ${token}` } });

export const atualizarTime = (id, payload, token) =>
    httpClient.put(`/time/${id}`, payload, { headers: { Authorization: `Bearer ${token}` } });

export const deletarTime = (id, token) =>
    httpClient.delete(`/time/${id}`, { headers: { Authorization: `Bearer ${token}` } });

export const adicionarMembro = (id, payload, token) =>
    httpClient.post(`/time/${id}/membro`, payload, { headers: { Authorization: `Bearer ${token}` } });

export const removerMembro = (id, membroId, token) =>
    httpClient.delete(`/time/${id}/membro/${membroId}`, { headers: { Authorization: `Bearer ${token}` } });
