import { useEffect, useState } from "react";
import { buscarEstatisticasSite } from "../services/backendApi";

const FALLBACK_STATS = {
  torneiosRealizados: 0,
  jogadoresAtivos: 0,
  premiacaoTix: 0,
  premiacaoPlayerPoints: 0,
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
          premiacaoTix: data?.premiacaoTix ?? 0,
          premiacaoPlayerPoints: data?.premiacaoPlayerPoints ?? 0,
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
  return value.toLocaleString("pt-BR", {
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  });
}
