import { useEffect, useState } from "react";
import { buscarCartaPorId, buscarCartaPorNome } from "../services/scryfallApi";
import { isScryfallId } from "../utils/scryfallId";

export function useScryfallArt(nomeCarta, { enabled = true } = {}) {
  const [cache, setCache] = useState({ key: "", imagem: "", colors: [], nome: "", set: "" });

  useEffect(() => {
    if (!nomeCarta || !enabled) return undefined;
    let cancelled = false;
    const carregar = isScryfallId(nomeCarta) ? buscarCartaPorId : buscarCartaPorNome;
    carregar(nomeCarta)
      .then((carta) => {
        if (!cancelled) {
          setCache({
            key: nomeCarta,
            imagem: carta?.artCrop || carta?.imagem || "",
            colors: Array.isArray(carta?.colors) ? carta.colors : [],
            nome: carta?.nome || "",
            set: carta?.set || "",
          });
        }
      })
      .catch(() => {
        if (!cancelled) setCache({ key: nomeCarta, imagem: "", colors: [], nome: "", set: "" });
      });
    return () => {
      cancelled = true;
    };
  }, [nomeCarta, enabled]);

  if (!nomeCarta || !enabled || cache.key !== nomeCarta) {
    return { imagem: "", colors: [], nome: "", set: "" };
  }
  return { imagem: cache.imagem, colors: cache.colors, nome: cache.nome, set: cache.set };
}
