import httpClient from "./httpClient";
import { LOGIN_REQUEST_TIMEOUT_MS } from "../constants/auth";
import { clampLimite, clampOffset } from "../utils/pagination";
import {
  normalizeListarDecksResponse,
  normalizeListarTorneiosResponse,
} from "./apiNormalizers";

const optionalAuthConfig = (token) =>
  token ? { headers: { Authorization: `Bearer ${token}` } } : {};

/**
 * @typedef {object} RankingTimeEntry
 * @property {number|null} posicao
 * @property {{ id?: string|number, nome?: string }|null} time
 * @property {number} vitorias
 * @property {number} derrotas
 * @property {number} empates
 * @property {number} pontos
 */

const mapRankingTimeEntry = (timeRanking) => ({
  ...timeRanking,
  posicao: timeRanking?.posicao ?? null,
  time: timeRanking?.time ?? (timeRanking?.nome || timeRanking?.timeId
    ? {
        id: timeRanking?.timeId ?? timeRanking?.id,
        nome: timeRanking?.nome ?? "—",
      }
    : null),
  vitorias: timeRanking?.vitorias ?? 0,
  derrotas: timeRanking?.derrotas ?? 0,
  empates: timeRanking?.empates ?? 0,
  pontos: timeRanking?.pontos ?? 0,
});

export const normalizeLigaRankingResponse = (payload) => {
  const source = payload?.ranking ?? payload ?? {};
  const rankingTimes = Array.isArray(source.rankingTimes)
    ? source.rankingTimes
    : Array.isArray(source.times)
      ? source.times
      : [];

  return {
    ...source,
    rankingJogadores: source.rankingJogadores ?? source.jogadores ?? source.players ?? [],
    rankingDecks: source.rankingDecks ?? source.decks ?? [],
    rankingCartas: source.rankingCartas ?? source.cartas ?? source.cards ?? [],
    rankingTimes: rankingTimes.map(mapRankingTimeEntry),
    totalTimes: source.totalTimes ?? rankingTimes.length,
  };
};

// Autenticação
export const loginUsuario = (payload) =>
  httpClient.post("/usuario/login", payload, { timeout: LOGIN_REQUEST_TIMEOUT_MS });

export const cadastrarUsuario = (payload) =>
  httpClient.post("/usuario/cadastrar", payload, { timeout: LOGIN_REQUEST_TIMEOUT_MS });

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

export const listarDecks = async (token, params) => {
  const data = await httpClient.get("/deck/listar", {
    ...optionalAuthConfig(token),
    params: buildDeckListQuery(params),
  });
  return normalizeListarDecksResponse(data);
};

// Usuário
export const atualizarUsuario = (payload, token) =>
  httpClient.put("/usuario/atualizar", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const excluirConta = (payload, token) =>
  httpClient.delete("/usuario/conta", {
    headers: { Authorization: `Bearer ${token}` },
    data: payload,
  });

export const listarUsuarios = (token, params = {}) =>
  httpClient.get("/usuario/listar", {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });

export const buscarPerfilPublico = (usuarioId) =>
  httpClient.get(`/usuario/${usuarioId}/perfil`);

export const alterarBloqueioTorneios = (usuarioId, payload, token) =>
  httpClient.put(`/usuario/${usuarioId}/bloqueio-torneios`, payload, {
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

const buildDeckListQuery = (params = {}) => {
  const queryParams = {};
  if (params.usuarioId) queryParams.usuarioId = params.usuarioId;
  if (params.formato) queryParams.formato = params.formato;
  if (params.nome) queryParams.nome = params.nome;
  if (params.jogador) queryParams.jogador = params.jogador;
  if (params.criadoApos) queryParams.criadoApos = params.criadoApos;
  if (params.criadoAntes) queryParams.criadoAntes = params.criadoAntes;
  if (params.limite != null) queryParams.limite = clampLimite(params.limite);
  if (params.offset != null) queryParams.offset = clampOffset(params.offset);
  return queryParams;
};

const buildTorneioListQuery = (params) => {
  if (!params) return "";

  if (params instanceof URLSearchParams) {
    return params.toString();
  }

  const queryParams = new URLSearchParams();
  if (params.dataInicio) queryParams.set("dataInicio", params.dataInicio);
  if (params.dataFim) queryParams.set("dataFim", params.dataFim);
  if (params.status) queryParams.set("status", params.status);
  if (params.nome) queryParams.set("nome", params.nome);
  if (params.limite != null) queryParams.set("limite", String(clampLimite(params.limite)));
  if (params.offset != null) queryParams.set("offset", String(clampOffset(params.offset)));
  return queryParams.toString();
};

export const listarTorneios = async (token, params) => {
  const query = buildTorneioListQuery(params);
  const data = await httpClient.get(`/torneio/listar${query ? `?${query}` : ""}`, {
    ...optionalAuthConfig(token),
  });
  return normalizeListarTorneiosResponse(data);
};

export const buscarTorneio = (torneioId, token) =>
  httpClient.get(`/torneio/${torneioId}`, optionalAuthConfig(token));

export const inscreverTorneio = (torneioId, token, payload = {}) =>
  httpClient.post(`/torneio/${torneioId}/inscrever`, payload, {
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

export const contestarResultado = (partidaId, token, observacao) =>
  httpClient.post(
    `/torneio/partida/${partidaId}/contestar`,
    observacao ? { observacao } : {},
    { headers: { Authorization: `Bearer ${token}` } },
  );

export const ajustarResultado = (partidaId, payload, token) =>
  httpClient.put(`/torneio/partida/${partidaId}/ajustar`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const gerarLinkIngresso = (torneioId, token) =>
  httpClient.post(`/torneio/${torneioId}/gerar-link-ingresso`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const ingressarComToken = (tokenIngresso, authToken, deckId) =>
  httpClient.post(`/torneio/ingressar/${tokenIngresso}`, deckId ? { deckId } : {}, {
    headers: { Authorization: `Bearer ${authToken}` },
  });

export const proximaRodada = (torneioId, token) =>
  httpClient.post(`/torneio/${torneioId}/proxima-rodada`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const ajustarTotalRodadas = (torneioId, totalRodadas, token) =>
  httpClient.put(`/torneio/${torneioId}/total-rodadas`, { totalRodadas }, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const encerrarTorneio = (torneioId, token) =>
  httpClient.post(`/torneio/${torneioId}/encerrar`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const refazerRodada = (torneioId, token) =>
  httpClient.post(`/torneio/${torneioId}/refazer-rodada`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const dropJogador = (torneioId, jogadorId, token) =>
  httpClient.post(`/torneio/${torneioId}/drop`, jogadorId ? { jogadorId } : {}, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const dropJogadoresSemDeck = (torneioId, token) =>
  httpClient.post(`/torneio/${torneioId}/drop/sem-deck`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const dropJogadoresSemCheckin = (torneioId, token) =>
  httpClient.post(`/torneio/${torneioId}/drop/sem-checkin`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const undropJogador = (torneioId, jogadorId, token) =>
  httpClient.post(`/torneio/${torneioId}/undrop`, jogadorId ? { jogadorId } : {}, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getStandings = (torneioId, token) =>
  httpClient.get(`/torneio/${torneioId}/standings`, optionalAuthConfig(token));

export const listarPartidasTorneio = (torneioId, token, options = {}) => {
  const params = {};
  if (options.rodada != null) {
    const rodada = Number(options.rodada);
    if (Number.isInteger(rodada) && rodada >= 1) {
      params.rodada = rodada;
    }
  }

  return httpClient.get(`/torneio/${torneioId}/partidas`, {
    ...optionalAuthConfig(token),
    params: Object.keys(params).length > 0 ? params : undefined,
  });
};

export const buscarMeuHistorico = (torneioId, token) =>
  httpClient.get(`/torneio/${torneioId}/meu-historico`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const buscarDeck = (deckId, token) =>
  httpClient.get(`/deck/${deckId}`, optionalAuthConfig(token));

export const atualizarTorneio = (torneioId, payload, token) =>
  httpClient.put(`/torneio/${torneioId}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deletarTorneio = (torneioId, token) =>
  httpClient.delete(`/torneio/${torneioId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const definirAnfitriaoTorneio = (torneioId, anfitriaoId, token) =>
  httpClient.put(`/torneio/${torneioId}/anfitriao`, { anfitriaoId }, {
    headers: { Authorization: `Bearer ${token}` },
  });

// Ligas
export const criarLiga = (payload, token) =>
  httpClient.post("/liga/criar", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const listarLigas = (token, params) =>
  httpClient.get("/liga/listar", {
    ...optionalAuthConfig(token),
    params,
  });

export const buscarLiga = (ligaId, token) =>
  httpClient.get(`/liga/${ligaId}`, optionalAuthConfig(token));

export const atualizarLiga = (ligaId, payload, token) =>
  httpClient.put(`/liga/${ligaId}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deletarLiga = (ligaId, token) =>
  httpClient.delete(`/liga/${ligaId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getRankingLiga = async (ligaId, token, options = {}) => {
  const params = {
    limiteCartas: options.limiteCartas ?? 50,
    limiteDecks: options.limiteDecks ?? 50,
  };
  if (options.limiteJogadores != null) params.limiteJogadores = options.limiteJogadores;
  if (options.limiteTimes != null) params.limiteTimes = options.limiteTimes;

  const response = await httpClient.get(`/liga/${ligaId}/ranking`, {
    ...optionalAuthConfig(token),
    params,
  });

  return normalizeLigaRankingResponse(response);
};

export const buscarMetagame = (params) =>
  httpClient.get("/metagame", { params });

export const buscarArquetipoMetagame = (formato, slug, params) =>
  httpClient.get(`/metagame/${encodeURIComponent(formato)}/${encodeURIComponent(slug)}`, { params });

// Times
export const criarTime = (payload, token) =>
  httpClient.post("/time/criar", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const listarTimes = (token, params) =>
  httpClient.get("/time/listar", {
    ...optionalAuthConfig(token),
    params,
  });

export const buscarTime = (timeId, token) =>
  httpClient.get(`/time/${timeId}`, optionalAuthConfig(token));

export const atualizarTime = (timeId, payload, token) =>
  httpClient.put(`/time/${timeId}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deletarTime = (timeId, token) =>
  httpClient.delete(`/time/${timeId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const entrarNoTime = (timeId, token) =>
  httpClient.post(`/time/${timeId}/entrar`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const sairDoTime = (timeId, token) =>
  httpClient.post(`/time/${timeId}/sair`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const gerarConviteTime = (timeId, token) =>
  httpClient.post(`/time/${timeId}/gerar-convite`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const entrarPorConvite = (conviteToken, token) =>
  httpClient.post("/time/entrar-por-convite", { conviteToken }, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const solicitarEntradaTime = (timeId, token) =>
  httpClient.post(`/time/${timeId}/solicitar`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const aprovarSolicitacao = (timeId, usuarioId, token) =>
  httpClient.post(`/time/${timeId}/aprovar/${usuarioId}`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const rejeitarSolicitacao = (timeId, usuarioId, token) =>
  httpClient.post(`/time/${timeId}/rejeitar/${usuarioId}`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getRankingTimesLiga = (ligaId, token) =>
  httpClient.get(`/liga/${ligaId}/ranking-times`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const confirmarResultadoPartida = (partidaId, token) =>
  httpClient.post(`/torneio/partida/${partidaId}/confirmar`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const editarMesaPartida = (partidaId, mesa, token) =>
  httpClient.patch(`/torneio/partida/${partidaId}/mesa`, { mesa }, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const editarPareamentosRodada = (torneioId, rodada, payload, token) =>
  httpClient.put(`/torneio/${torneioId}/rodada/${rodada}/pareamentos`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const inscreverTardio = (torneioId, token, payload = {}) =>
  httpClient.post(`/torneio/${torneioId}/inscrever-tarde`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

// Site
export const buscarEstatisticasSite = () =>
  httpClient.get("/site/estatisticas");

export const buscarAnuncios = () =>
  httpClient.get("/site/anuncios");

export const buscarAnunciosAdmin = (token) =>
  httpClient.get("/site/anuncios/admin", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const salvarAnuncios = (anuncios, token) =>
  httpClient.put("/site/anuncios", { anuncios }, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const registrarCliqueAnuncio = (anuncioId) =>
  httpClient.post(`/site/anuncios/${encodeURIComponent(anuncioId)}/clique`, {});

// Posts
export const listarPosts = (token, params = {}) => httpClient.get("/post", { ...optionalAuthConfig(token), params });
export const buscarPost = (postId, token) => httpClient.get(`/post/${encodeURIComponent(postId)}`, optionalAuthConfig(token));
export const criarPost = (payload, token) => httpClient.post("/post", payload, { headers: { Authorization: `Bearer ${token}` } });
export const editarPost = (postId, payload, token) => httpClient.put(`/post/${encodeURIComponent(postId)}`, payload, { headers: { Authorization: `Bearer ${token}` } });
export const comentarPost = (postId, texto, token) => httpClient.post(`/post/${encodeURIComponent(postId)}/comentario`, { texto }, { headers: { Authorization: `Bearer ${token}` } });
export const curtirPost = (postId, token) => httpClient.post(`/post/${encodeURIComponent(postId)}/curtida`, {}, { headers: { Authorization: `Bearer ${token}` } });
export const descurtirPost = (postId, token) => httpClient.delete(`/post/${encodeURIComponent(postId)}/curtida`, { headers: { Authorization: `Bearer ${token}` } });
export const excluirPost = (postId, token) => httpClient.delete(`/post/${encodeURIComponent(postId)}`, { headers: { Authorization: `Bearer ${token}` } });

// Story fundos (admin)
export const listarStoryFundos = (token) =>
  httpClient.get("/story-fundo", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const cadastrarStoryFundo = (payload, token) =>
  httpClient.post("/story-fundo", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const excluirStoryFundo = (id, token) =>
  httpClient.delete(`/story-fundo/${encodeURIComponent(id)}`, {
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
    xhr.withCredentials = false;
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
        const expired = xhr.status === 400 || xhr.status === 403;
        reject(
          Object.assign(new Error(`S3 upload falhou: ${xhr.status}`), {
            code: expired ? "s3-upload-expired" : "s3-upload-failed",
            s3Status: xhr.status,
            status: xhr.status,
          }),
        );
      }
    };
    xhr.onerror = () => reject(Object.assign(new Error("Erro de CORS ao enviar para o S3"), { code: "s3-upload-cors" }));
    xhr.send(file);
  });
