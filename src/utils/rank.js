import { RANK_META, RANK_TIERS } from "../constants/rank";

/**
 * @typedef {import("../constants/rank").RankTier} RankTier
 * @typedef {{
 *   pontosRank?: number,
 *   rank?: RankTier,
 *   proximoRank?: RankTier | null,
 *   pontosParaProximoRank?: number | null,
 * }} ResumoRank
 */

/** @param {unknown} tier */
export function normalizeRankTier(tier) {
  if (typeof tier !== "string") return null;
  const key = tier.toLowerCase();
  return RANK_TIERS.includes(/** @type {RankTier} */ (key)) ? /** @type {RankTier} */ (key) : null;
}

/** @param {unknown} source */
export function extractResumoRank(source) {
  if (!source || typeof source !== "object") return null;
  const rank = normalizeRankTier(source.rank);
  if (!rank) return null;
  return {
    pontosRank: Number.isFinite(source.pontosRank) ? source.pontosRank : 0,
    rank,
    proximoRank: source.proximoRank == null ? null : normalizeRankTier(source.proximoRank),
    pontosParaProximoRank: source.pontosParaProximoRank == null
      ? null
      : Number(source.pontosParaProximoRank),
  };
}

/** @param {RankTier | null | undefined} tier */
export function getRankMeta(tier) {
  const normalized = normalizeRankTier(tier);
  if (!normalized) return null;
  return { tier: normalized, ...RANK_META[normalized] };
}

/**
 * @param {ResumoRank | null | undefined} resumo
 * @returns {{ percent: number, label: string, isMax: boolean }}
 */
export function getRankProgress(resumo) {
  if (!resumo?.rank) {
    return { percent: 0, label: "", isMax: false };
  }

  const isMax = resumo.rank === "foguete" || resumo.proximoRank == null;
  if (isMax) {
    return {
      percent: 100,
      label: "Rank máximo alcançado",
      isMax: true,
    };
  }

  const needed = Number(resumo.pontosParaProximoRank);
  const current = Number(resumo.pontosRank) || 0;
  if (!Number.isFinite(needed) || needed <= 0) {
    const nextMeta = getRankMeta(resumo.proximoRank);
    return {
      percent: 0,
      label: nextMeta ? `Próximo: ${nextMeta.label}` : "",
      isMax: false,
    };
  }

  const percent = Math.min(100, Math.max(0, Math.round((current / needed) * 100)));
  const nextMeta = getRankMeta(resumo.proximoRank);
  return {
    percent,
    label: nextMeta ? `${current} / ${needed} pts para ${nextMeta.label}` : `${current} / ${needed} pts`,
    isMax: false,
  };
}

/** @param {number} delta */
export function formatRankDelta(delta) {
  const value = Number(delta);
  if (!Number.isFinite(value)) return "0 pts";
  return value > 0 ? `+${value} pts` : `${value} pts`;
}

/** @param {object} rank */
export function wasPromoted(rank, usuarioId) {
  if (!rank || !usuarioId) return false;
  const uid = String(usuarioId);
  if (String(rank.vencedorId) === uid) {
    return rank.rankVencedorDepois !== rank.rankVencedorAntes;
  }
  if (String(rank.perdedorId) === uid) {
    return rank.rankPerdedorDepois !== rank.rankPerdedorAntes;
  }
  return false;
}

/**
 * @param {object} rankPayload
 * @param {string|number} usuarioId
 * @returns {ResumoRank | null}
 */
export function resumoRankFromPartida(rankPayload, usuarioId) {
  if (!rankPayload || !usuarioId) return null;
  const uid = String(usuarioId);
  if (String(rankPayload.vencedorId) === uid) {
    return {
      pontosRank: rankPayload.pontosVencedorDepois,
      rank: normalizeRankTier(rankPayload.rankVencedorDepois),
    };
  }
  if (String(rankPayload.perdedorId) === uid) {
    return {
      pontosRank: rankPayload.pontosPerdedorDepois,
      rank: normalizeRankTier(rankPayload.rankPerdedorDepois),
    };
  }
  return null;
}

/**
 * Builds toast message for match rank changes.
 * @param {object} rankPayload
 * @param {string|number} usuarioId
 */
export function buildRankResultMessage(rankPayload, usuarioId) {
  if (!rankPayload || !usuarioId) return null;
  const uid = String(usuarioId);

  if (String(rankPayload.vencedorId) === uid) {
    const promoted = rankPayload.rankVencedorDepois !== rankPayload.rankVencedorAntes;
    const delta = formatRankDelta(rankPayload.deltaVencedor);
    const rankMeta = getRankMeta(rankPayload.rankVencedorDepois);
    if (promoted && rankMeta) {
      return `${delta} — promovido para ${rankMeta.label}!`;
    }
    return delta;
  }

  if (String(rankPayload.perdedorId) === uid) {
    return formatRankDelta(rankPayload.deltaPerdedor);
  }

  return null;
}

/**
 * @param {object} rankPayload
 * @param {string|number} usuarioId
 * @returns {RankTier | null}
 */
export function getPromotionTier(rankPayload, usuarioId) {
  if (!rankPayload || !usuarioId) return null;
  const uid = String(usuarioId);
  if (String(rankPayload.vencedorId) === uid
    && rankPayload.rankVencedorDepois !== rankPayload.rankVencedorAntes) {
    return normalizeRankTier(rankPayload.rankVencedorDepois);
  }
  return null;
}

/**
 * Applies rank feedback after a match result (toast, user patch, promotion).
 */
export function applyRankFromMatch(rankPayload, usuarioId, handlers = {}) {
  if (!rankPayload || !usuarioId) return;

  const { patchUsuarioRank, addToast, onPromotion } = handlers;
  const message = buildRankResultMessage(rankPayload, usuarioId);

  if (message && addToast) {
    const uid = String(usuarioId);
    const isLoser = String(rankPayload.perdedorId) === uid;
    addToast(message, {
      type: isLoser && Number(rankPayload.deltaPerdedor) < 0 ? "warning" : "success",
      duration: 6000,
    });
  }

  const partial = resumoRankFromPartida(rankPayload, usuarioId);
  if (partial?.rank && patchUsuarioRank) {
    patchUsuarioRank(partial);
  }

  const promoTier = getPromotionTier(rankPayload, usuarioId);
  if (promoTier && onPromotion) {
    onPromotion(promoTier);
  }
}
