const ABLY_PRESTART_MS = 15 * 60 * 1000;

function parseHorarioMs(horario) {
  if (!horario) return NaN;
  const ms = new Date(horario).getTime();
  return Number.isFinite(ms) ? ms : NaN;
}

/**
 * Ably só na janela: 15 min antes do horário até o torneio finalizar.
 * Em andamento entra sempre; finalizado nunca.
 */
export function isTournamentAblyWindowOpen(torneio, now = Date.now()) {
  if (!torneio || torneio.status === "finalizado") return false;
  if (torneio.status === "em_andamento") return true;

  const startMs = parseHorarioMs(torneio.horario);
  if (!Number.isFinite(startMs)) return false;
  return now >= startMs - ABLY_PRESTART_MS;
}

export function msUntilTournamentAblyWindow(torneio, now = Date.now()) {
  if (isTournamentAblyWindowOpen(torneio, now)) return 0;
  if (!torneio || torneio.status === "finalizado") return null;

  const startMs = parseHorarioMs(torneio.horario);
  if (!Number.isFinite(startMs)) return null;
  return Math.max(0, startMs - ABLY_PRESTART_MS - now);
}

export function earliestMsUntilAblyWindow(torneios, now = Date.now()) {
  let soonest = null;
  for (const torneio of torneios || []) {
    const wait = msUntilTournamentAblyWindow(torneio, now);
    if (wait == null || wait === 0) continue;
    if (soonest == null || wait < soonest) soonest = wait;
  }
  return soonest;
}
