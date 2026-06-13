import { normalizeId } from "./normalizeId";
import { getMatchPlayerId, isByeMatch } from "./matchDisplay";

export function hasPlayerConfirmedResult(partida, playerNumber) {
  const playerId = normalizeId(getMatchPlayerId(partida, playerNumber));
  if (!playerId || !Array.isArray(partida?.confirmadoPor)) return false;

  return partida.confirmadoPor.some((confirmedId) => normalizeId(confirmedId) === playerId);
}

export function getMatchConfirmationSummary(partida) {
  if (isByeMatch(partida)) {
    return { count: 0, total: 0, fullyConfirmed: true };
  }

  const count = [1, 2].filter((playerNumber) => hasPlayerConfirmedResult(partida, playerNumber)).length;
  return { count, total: 2, fullyConfirmed: count >= 2 };
}
