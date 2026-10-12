export function slugifyTournamentName(name = "") {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ç/gi, "c").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** `{5 primeiros do id}-{slug do nome}` — mesmo padrão de `/torneios/...`. */
export function tournamentShortId(tournament) {
  const id = String(tournament?.id || "");
  if (!id) return "";
  const nome = tournament?.nome || tournament?.torneioNome || "";
  return `${id.slice(0, 5)}-${slugifyTournamentName(nome)}`;
}

export function tournamentPath(tournament) {
  return `/torneios/${tournamentShortId(tournament)}`;
}

export function metagameBreakdownPath(tournament) {
  const shortId = tournamentShortId(tournament);
  if (!shortId) return "/metagame/breakdown";
  return `/metagame/breakdown?torneioId=${encodeURIComponent(shortId)}`;
}

export const TORNEIO_SLUG_RE = /^[a-z0-9]{5}-[a-z0-9-]+$/i;
export const TORNEIO_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isTorneioIdOuSlug(valor) {
  return TORNEIO_UUID_RE.test(valor || "") || TORNEIO_SLUG_RE.test(valor || "");
}
