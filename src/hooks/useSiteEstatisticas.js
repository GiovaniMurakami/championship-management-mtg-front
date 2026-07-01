import { useEffect, useState } from "react";
import { buscarEstatisticasSite } from "../services/backendApi";
import { TOURNAMENT_FORMATS } from "../constants/tournament";

const FALLBACK_STATS = {
  torneiosRealizados: 0,
  jogadoresAtivos: 0,
  formatosSuportados: TOURNAMENT_FORMATS.length,
};

export function useSiteEstatisticas() {
  const [stats, setStats] = useState(FALLBACK_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    buscarEstatisticasSite()
      .then((data) => {
        if (!mounted) return;
        setStats({
          torneiosRealizados: data?.torneiosRealizados ?? 0,
          jogadoresAtivos: data?.jogadoresAtivos ?? 0,
          formatosSuportados: data?.formatosSuportados ?? TOURNAMENT_FORMATS.length,
        });
      })
      .catch(() => {
        if (mounted) setStats(FALLBACK_STATS);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { stats, loading };
}

export function formatSiteStatValue(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return String(value);
}
