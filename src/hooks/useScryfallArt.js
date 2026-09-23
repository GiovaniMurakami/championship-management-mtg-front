import { useCallback, useEffect, useRef, useState } from "react";
import { buscarCartaPorId, buscarCartaPorNome } from "../services/scryfallApi";
import { isScryfallId } from "../utils/scryfallId";

export function useScryfallArt(nomeCarta, { enabled = true } = {}) {
  const [attempt, setAttempt] = useState(0);
  const attempts = useRef({ key: nomeCarta, count: 0 });
  const retry = useCallback(() => {
    if (attempts.current.key !== nomeCarta) attempts.current = { key: nomeCarta, count: 0 };
    if (attempts.current.count >= 2) return;
    attempts.current.count++;
    setAttempt(value => value + 1);
  }, [nomeCarta]);
  const [cache, setCache] = useState({ key: "", imagem: "", colors: [], nome: "", set: "" });

  useEffect(() => {
    if (!nomeCarta || !enabled) return undefined;
    let cancelled = false;
    let timer;
    const carregar = isScryfallId(nomeCarta) ? buscarCartaPorId : buscarCartaPorNome;
    carregar(nomeCarta)
      .then((carta) => {
        if (!cancelled) {
          if (!carta) timer = setTimeout(retry, 1000);
          setCache({
            key: nomeCarta,
            imagem: (attempt > 0 ? carta?.imagem || carta?.artCrop : carta?.artCrop || carta?.imagem) || "",
            colors: Array.isArray(carta?.colors) ? carta.colors : [],
            nome: carta?.nome || "",
            set: carta?.set || "",
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCache({ key: nomeCarta, imagem: "", colors: [], nome: "", set: "" });
          timer = setTimeout(retry, 1000);
        }
      });
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [nomeCarta, enabled, attempt, retry]);

  if (!nomeCarta || !enabled || cache.key !== nomeCarta) {
    return { imagem: "", colors: [], nome: "", set: "", retry };
  }
  return { imagem: cache.imagem, colors: cache.colors, nome: cache.nome, set: cache.set, retry };
}
