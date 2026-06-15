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

export function normalizeMatchesPayload(data) {
  return data?.partidas || data?.matches || data?.rodadaAtualPartidas || [];
}

export function useTournamentQueries({ torneioId, token, enabled = true }) {
  const canFetch = Boolean(enabled && torneioId && token);

  const tournamentQuery = useQuery({
    queryKey: tournamentQueryKeys.detail(torneioId),
    queryFn: () => buscarTorneio(torneioId, token),
    enabled: canFetch,
  });

  const standingsQuery = useQuery({
    queryKey: tournamentQueryKeys.standings(torneioId),
    queryFn: () => getStandings(torneioId, token),
    enabled: canFetch,
  });

  const matchesQuery = useQuery({
    queryKey: tournamentQueryKeys.matches(torneioId),
    queryFn: () => listarPartidasTorneio(torneioId, token),
    enabled: canFetch,
  });

  const teamsQuery = useQuery({
    queryKey: tournamentQueryKeys.teams,
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
