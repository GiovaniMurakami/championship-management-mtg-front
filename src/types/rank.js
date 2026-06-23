/**
 * @typedef {"bronze" | "prata" | "ouro" | "foguete"} RankTier
 *
 * @typedef {object} ResumoRank
 * @property {number} pontosRank
 * @property {RankTier} rank
 * @property {RankTier | null} proximoRank
 * @property {number | null} pontosParaProximoRank
 *
 * @typedef {object} RankPartida
 * @property {string} partidaId
 * @property {string} vencedorId
 * @property {string} perdedorId
 * @property {number} deltaVencedor
 * @property {number} deltaPerdedor
 * @property {RankTier} rankVencedorAntes
 * @property {RankTier} rankPerdedorAntes
 * @property {RankTier} rankVencedorDepois
 * @property {RankTier} rankPerdedorDepois
 * @property {number} pontosVencedorDepois
 * @property {number} pontosPerdedorDepois
 *
 * @typedef {object} UsuarioComRank
 * @property {string} id
 * @property {string} nome
 * @property {number} [pontosRank]
 * @property {RankTier} [rank]
 * @property {RankTier | null} [proximoRank]
 * @property {number | null} [pontosParaProximoRank]
 * @property {number} [posicao]
 */

export {};
