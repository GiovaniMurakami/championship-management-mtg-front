import { normalizeId } from "./normalizeId";

export function getMatchPlayerId(partida, playerNumber) {
  return playerNumber === 1
    ? partida?.jogador1Id || partida?.jogador1?.id
    : partida?.jogador2Id || partida?.jogador2?.id;
}

export function isByeMatch(partida) {
  return !getMatchPlayerId(partida, 2);
}

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
