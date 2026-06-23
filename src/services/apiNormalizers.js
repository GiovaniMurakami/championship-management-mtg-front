/**
 * @typedef {object} ListarDecksResponse
 * @property {object[]} decks
 * @property {number} total
 * @property {number} limite
 * @property {number} offset
 */

/**
 * @typedef {object} ListarTorneiosResponse
 * @property {object[]} torneios
 * @property {number} total
 * @property {number} limite
 * @property {number} offset
 */

/**
 * @typedef {object} BuscarDeckResponse
 * @property {string} id
 * @property {string} nome
 * @property {string} formato
 * @property {number} [visualizacoes]
 * @property {object[]} [maindeck]
 * @property {object[]} [sideboard]
 */

/**
 * @typedef {object} ApiErrorPayload
 * @property {string} [mensagem]
 * @property {string[]} [erros]
 * @property {string[]} [errors]
 */

/** @param {unknown} data @returns {ListarDecksResponse} */
export function normalizeListarDecksResponse(data) {
  const decks = data?.decks ?? (Array.isArray(data) ? data : []);
  return {
    decks,
    total: Number.isFinite(data?.total) ? data.total : decks.length,
    limite: Number.isFinite(data?.limite) ? data.limite : 20,
    offset: Number.isFinite(data?.offset) ? data.offset : 0,
  };
}

/** @param {unknown} data @returns {ListarTorneiosResponse} */
export function normalizeListarTorneiosResponse(data) {
  const torneios = data?.torneios ?? (Array.isArray(data) ? data : []);
  return {
    torneios,
    total: Number.isFinite(data?.total) ? data.total : torneios.length,
    limite: Number.isFinite(data?.limite) ? data.limite : 20,
    offset: Number.isFinite(data?.offset) ? data.offset : 0,
  };
}

/** @param {unknown} data */
export function normalizeRankingGlobalResponse(data) {
  const jogadores = data?.jogadores ?? data?.usuarios ?? data?.ranking ?? [];
  const list = Array.isArray(jogadores) ? jogadores : [];
  return {
    jogadores: list,
    total: Number.isFinite(data?.total) ? data.total : list.length,
    limite: Number.isFinite(data?.limite) ? data.limite : 20,
    offset: Number.isFinite(data?.offset) ? data.offset : 0,
  };
}
