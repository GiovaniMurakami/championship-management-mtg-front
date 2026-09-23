export function slugifyTournamentName(name = "") {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ç/gi, "c").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function tournamentPath(tournament) {
  const id = String(tournament?.id || "");
  return `/torneios/${id.slice(0, 5)}-${slugifyTournamentName(tournament?.nome)}`;
}
