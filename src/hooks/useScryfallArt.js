import { useEffect, useState } from "react";
import { buscarCartaPorNome } from "../services/scryfallApi";

export function useScryfallArt(nomeCarta) {
  const [cache, setCache] = useState({ key: "", imagem: "", colors: [] });

  useEffect(() => {
    if (!nomeCarta) return undefined;
    let cancelled = false;
    buscarCartaPorNome(nomeCarta)
      .then((carta) => {
        if (!cancelled) {
          setCache({
            key: nomeCarta,
            imagem: carta?.artCrop || carta?.imagem || "",
            colors: Array.isArray(carta?.colors) ? carta.colors : [],
          });
        }
      })
      .catch(() => {
        if (!cancelled) setCache({ key: nomeCarta, imagem: "", colors: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [nomeCarta]);

  if (!nomeCarta || cache.key !== nomeCarta) {
    return { imagem: "", colors: [] };
  }
  return { imagem: cache.imagem, colors: cache.colors };
}
