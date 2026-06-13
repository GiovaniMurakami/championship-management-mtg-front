import { normalizeId } from "./normalizeId";

export function getMatchPlayerId(partida, playerNumber) {
  return playerNumber === 1
    ? partida?.jogador1Id || partida?.jogador1?.id
    : partida?.jogador2Id || partida?.jogador2?.id;
}

export function getMatchPlayerName(partida, playerNumber) {
  if (playerNumber === 2 && !getMatchPlayerId(partida, 2)) return "BYE";

  return playerNumber === 1
    ? partida?.jogador1Nome || partida?.jogador1?.nome || partida?.jogador1?.username || "Jogador 1"
    : partida?.jogador2Nome || partida?.jogador2?.nome || partida?.jogador2?.username || "Jogador 2";
}

export function getMatchPlayerNick(partida, playerNumber) {
  return playerNumber === 1
    ? partida?.jogador1NickMTGO || partida?.jogador1?.nickMTGO || null
    : partida?.jogador2NickMTGO || partida?.jogador2?.nickMTGO || null;
}

export function getMatchSeat(partida, usuarioId) {
  const uid = normalizeId(usuarioId);
  if (!uid) return null;
  if (normalizeId(getMatchPlayerId(partida, 1)) === uid) return 1;
  if (normalizeId(getMatchPlayerId(partida, 2)) === uid) return 2;
  return null;
}

export function isByeMatch(partida) {
  return !getMatchPlayerId(partida, 2);
}

export function getMatchScore(partida) {
  return {
    player1: partida?.vitoriasJogador1 ?? 0,
    player2: partida?.vitoriasJogador2 ?? 0,
  };
}

export function getDisplaySides(partida, usuarioId) {
  const seat = getMatchSeat(partida, usuarioId);
  const leftSeat = seat === 2 ? 1 : 1;
  const rightSeat = seat === 2 ? 2 : 2;

  return {
    seat,
    left: {
      seat: leftSeat,
      id: getMatchPlayerId(partida, leftSeat),
      name: getMatchPlayerName(partida, leftSeat),
      nick: getMatchPlayerNick(partida, leftSeat),
      isMe: seat === leftSeat,
    },
    right: {
      seat: rightSeat,
      id: getMatchPlayerId(partida, rightSeat),
      name: getMatchPlayerName(partida, rightSeat),
      nick: getMatchPlayerNick(partida, rightSeat),
      isMe: seat === rightSeat,
    },
  };
}
