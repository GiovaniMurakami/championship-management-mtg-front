import httpClient from "./httpClient";

// Autenticação
export const loginUsuario = (payload) =>
  httpClient.post("/usuario/login", payload);

export const cadastrarUsuario = (payload) =>
  httpClient.post("/usuario/cadastrar", payload);

export const solicitarResetSenha = (email) =>
  httpClient.post("/usuario/reset-senha/solicitar", { email });

export const confirmarResetSenha = (token, novaSenha) =>
  httpClient.post("/usuario/reset-senha/confirmar", { token, novaSenha });

export const refreshToken = (refreshTokenValue) =>
  httpClient.post("/usuario/refresh-token", { refreshToken: refreshTokenValue });

export const logoutUsuario = (token) =>
  httpClient.post("/usuario/logout", {}, {
    headers: { Authorization: `Bearer ${token}` },
  });

// Decks
export const cadastrarDeck = (payload, token) =>
  httpClient.post("/deck/cadastrar", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const listarDecks = (token, usuarioId) =>
  httpClient.get("/deck/listar", {
    headers: { Authorization: `Bearer ${token}` },
    params: usuarioId ? { usuarioId } : undefined,
  });

// Usuário
export const atualizarUsuario = (payload, token) =>
  httpClient.put("/usuario/atualizar", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

// Atualizar Deck
export const atualizarDeck = (deckId, payload, token) =>
  httpClient.put(`/deck/${deckId}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

// Deletar Deck
export const deletarDeck = (deckId, token) =>
  httpClient.delete(`/deck/${deckId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
// Torneios
export const criarTorneio = (payload, token) =>
  httpClient.post("/torneio/criar", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const listarTorneios = (token) =>
  httpClient.get("/torneio/listar", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const buscarTorneio = (torneioId, token) =>
  httpClient.get(`/torneio/${torneioId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const inscreverTorneio = (torneioId, token) =>
  httpClient.post(`/torneio/${torneioId}/inscrever`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const escolherDeckTorneio = (torneioId, deckId, token) =>
  httpClient.post(`/torneio/${torneioId}/deck`, { deckId }, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const checkinTorneio = (torneioId, token) =>
  httpClient.post(`/torneio/${torneioId}/checkin`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const iniciarTorneio = (torneioId, token) =>
  httpClient.post(`/torneio/${torneioId}/iniciar`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const registrarResultado = (partidaId, payload, token) =>
  httpClient.post(`/torneio/partida/${partidaId}/resultado`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const contestarResultado = (partidaId, token) =>
  httpClient.post(`/torneio/partida/${partidaId}/contestar`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const proximaRodada = (torneioId, token) =>
  httpClient.post(`/torneio/${torneioId}/proxima-rodada`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const dropJogador = (torneioId, jogadorId, token) =>
  httpClient.post(`/torneio/${torneioId}/drop`, jogadorId ? { jogadorId } : {}, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getStandings = (torneioId, token) =>
  httpClient.get(`/torneio/${torneioId}/standings`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const listarPartidasTorneio = (torneioId, token) =>
  httpClient.get(`/torneio/${torneioId}/partidas`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const buscarDeck = (deckId, token) =>
  httpClient.get(`/deck/${deckId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const atualizarTorneio = (torneioId, payload, token) =>
  httpClient.put(`/torneio/${torneioId}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deletarTorneio = (torneioId, token) =>
  httpClient.delete(`/torneio/${torneioId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

// Ligas
export const criarLiga = (payload, token) =>
  httpClient.post("/liga/criar", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const listarLigas = (token) =>
  httpClient.get("/liga/listar", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const buscarLiga = (ligaId, token) =>
  httpClient.get(`/liga/${ligaId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const atualizarLiga = (ligaId, payload, token) =>
  httpClient.put(`/liga/${ligaId}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deletarLiga = (ligaId, token) =>
  httpClient.delete(`/liga/${ligaId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getRankingLiga = (ligaId, token) =>
  httpClient.get(`/liga/${ligaId}/ranking`, {
    headers: { Authorization: `Bearer ${token}` },
  });

// Imagens
export const obterPresignedUrl = (payload, token) =>
  httpClient.post("/imagem/upload-url", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

/**
 * Faz PUT direto para o S3 via presigned URL.
 * onProgress(percent: number) é chamado durante o envio.
 * Retorna uma Promise que resolve quando o upload conclui.
 */
export const uploadParaS3 = (uploadUrl, file, onProgress) =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(Object.assign(new Error(`S3 upload falhou: ${xhr.status}`), { s3Status: xhr.status }));
      }
    };
    xhr.onerror = () => reject(new Error("Erro de rede ao enviar para o S3"));
    xhr.send(file);
  });