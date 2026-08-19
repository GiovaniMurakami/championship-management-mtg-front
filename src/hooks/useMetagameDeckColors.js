import { useEffect, useState } from "react";
import { buscarCartasPorNome } from "../services/scryfallApi";
import { coresDoDeck, nomesCartasParaCores } from "../utils/deckColors";

const LISTA_VAZIA = [];

export function useMetagameDeckColors(arquetipos, formato) {
  const lista = Array.isArray(arquetipos) ? arquetipos : LISTA_VAZIA;
  const chave = lista
    .map((arquetipo) => `${arquetipo.slug}:${nomesCartasParaCores(arquetipo, formato).join(",")}`)
    .join("|");

  const iniciais = {};
  for (const arquetipo of lista) {
    iniciais[arquetipo.slug] = coresDoDeck(nomesCartasParaCores(arquetipo, formato), []);
  }

  const [resolvidas, setResolvidas] = useState({ chave: "", cores: {} });

  useEffect(() => {
    const nomesPorSlug = new Map(
      lista.map((arquetipo) => [arquetipo.slug, nomesCartasParaCores(arquetipo, formato)]),
    );
    const nomes = [...new Set([...nomesPorSlug.values()].flat())];
    if (nomes.length === 0) return undefined;

    let cancelled = false;
    buscarCartasPorNome(nomes, { fallbackIndividual: false })
      .then((cartas) => {
        if (cancelled) return;
        const indexadas = nomes
          .map((nome, index) => (cartas[index] ? { ...cartas[index], nomePedido: nome } : null))
          .filter(Boolean);
        const next = {};
        for (const [slug, nomesCartas] of nomesPorSlug) {
          next[slug] = coresDoDeck(nomesCartas, indexadas);
        }
        setResolvidas({ chave, cores: next });
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [chave, formato, lista]);

  return resolvidas.chave === chave ? resolvidas.cores : iniciais;
}
