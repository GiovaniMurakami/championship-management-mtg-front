import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  buscarTorneio,
  getStandings,
  listarPartidasTorneio,
  listarTimes,
} from "../services/backendApi";

export const tournamentQueryKeys = {
  root: ["tournament"],
  detail: (torneioId) => [...tournamentQueryKeys.root, torneioId, "detail"],
  standings: (torneioId) => [...tournamentQueryKeys.root, torneioId, "standings"],
  matches: (torneioId) => [...tournamentQueryKeys.root, torneioId, "matches"],
  teams: ["teams", "list"],
};

export function normalizeStandingsPayload(data) {
  const rawStandings = data?.standings || data?.participantes || data?.players || [];
  return rawStandings.map((player) =>
    "checkInRodada" in player && !("checkinRodada" in player)
      ? { ...player, checkinRodada: player.checkInRodada }
      : player
  );
}

/** Campos de torneio que a API de standings pode devolver — merge seletivo (não espalha o payload inteiro). */
export function pickTorneioFieldsFromStandings(data) {
  if (!data || typeof data !== "object") return {};
  const patch = {};
  if (data.rodadaIniciadaEm !== undefined) patch.rodadaIniciadaEm = data.rodadaIniciadaEm;
  if (data.rodadaAtual !== undefined) patch.rodadaAtual = data.rodadaAtual;
  if (data.totalRodadas !== undefined) patch.totalRodadas = data.totalRodadas;
  if (data.status !== undefined) patch.status = data.status;
  if (data.totalInscritos !== undefined) patch.totalInscritos = data.totalInscritos;
  if (data.emCorte !== undefined) patch.emCorte = data.emCorte;
  if (data.nome !== undefined) patch.nome = data.nome;
  if (data.torneioNome !== undefined) patch.nome = data.torneioNome;
  return patch;
}

export function normalizeMatchesPayload(data) {
  return data?.partidas || data?.matches || data?.rodadaAtualPartidas || [];
}

export function useTournamentQueries({ torneioId, token, enabled = true }) {
  const canFetch = Boolean(enabled && torneioId);

  const tournamentQuery = useQuery({
    queryKey: [...tournamentQueryKeys.detail(torneioId), Boolean(token)],
    queryFn: () => buscarTorneio(torneioId, token),
    enabled: canFetch,
  });
  const resolvedId = tournamentQuery.data?.id;

  const standingsQuery = useQuery({
    queryKey: [...tournamentQueryKeys.standings(resolvedId), Boolean(token)],
    queryFn: () => getStandings(resolvedId, token),
    enabled: Boolean(canFetch && resolvedId),
  });

  const matchesQuery = useQuery({
    queryKey: [...tournamentQueryKeys.matches(resolvedId), Boolean(token)],
    queryFn: () => listarPartidasTorneio(resolvedId, token),
    enabled: Boolean(canFetch && resolvedId),
  });

  const teamsQuery = useQuery({
    queryKey: [...tournamentQueryKeys.teams, Boolean(token)],
    queryFn: async () => {
      const data = await listarTimes(token);
      return data?.times || data || [];
    },
    enabled: canFetch && tournamentQuery.data?.liga?.tipo === "times",
  });

  return {
    tournamentQuery,
    standingsQuery,
    matchesQuery,
    teamsQuery,
  };
}

export function useInvalidateTournament(torneioId) {
  const queryClient = useQueryClient();

  return {
    invalidateTournament: () => queryClient.invalidateQueries({ queryKey: tournamentQueryKeys.detail(torneioId) }),
    invalidateStandings: () => queryClient.invalidateQueries({ queryKey: tournamentQueryKeys.standings(torneioId) }),
    invalidateMatches: () => queryClient.invalidateQueries({ queryKey: tournamentQueryKeys.matches(torneioId) }),
    invalidateAllTournament: () => queryClient.invalidateQueries({ queryKey: ["tournament", torneioId] }),
    setTournamentData: (updater) => queryClient.setQueryData(tournamentQueryKeys.detail(torneioId), updater),
    setStandingsData: (updater) => queryClient.setQueryData(tournamentQueryKeys.standings(torneioId), updater),
    setMatchesData: (updater) => queryClient.setQueryData(tournamentQueryKeys.matches(torneioId), updater),
  };
}
