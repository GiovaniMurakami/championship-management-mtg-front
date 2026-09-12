import { useEffect, useState } from "react";
import { buscarCartasPorNome } from "../services/scryfallApi";
import {
  coresDoDeck,
  gravarIdentidadesPersistidas,
  identidadesDasCartas,
  lerIdentidadesPersistidas,
  nomesCartasParaCores,
  nomesSemIdentidade,
} from "../utils/deckColors";

const LISTA_VAZIA = [];

function coresIniciais(lista, formato, identidades) {
  const cores = {};
  for (const arquetipo of lista) {
    if (Array.isArray(arquetipo.cores)) {
      cores[arquetipo.slug] = arquetipo.cores;
      continue;
    }
    cores[arquetipo.slug] = coresDoDeck(nomesCartasParaCores(arquetipo, formato), [], identidades);
  }
  return cores;
}

export function useMetagameDeckColors(arquetipos, formato) {
  const lista = Array.isArray(arquetipos) ? arquetipos : LISTA_VAZIA;
  const chave = lista
    .map((arquetipo) => `${arquetipo.slug}:${Array.isArray(arquetipo.cores) ? arquetipo.cores.join("") : nomesCartasParaCores(arquetipo, formato).join(",")}`)
    .join("|");

  const [resolvidas, setResolvidas] = useState({ chave: "", cores: {} });

  useEffect(() => {
    const identidades = lerIdentidadesPersistidas();
    const imediatas = coresIniciais(lista, formato, identidades);
    const pendentes = lista.filter((arquetipo) => !Array.isArray(arquetipo.cores));
    if (pendentes.length === 0) {
      setResolvidas({ chave, cores: imediatas });
      return undefined;
    }

    const nomesPorSlug = new Map(
      pendentes.map((arquetipo) => [arquetipo.slug, nomesCartasParaCores(arquetipo, formato)]),
    );
    const nomesFaltando = nomesSemIdentidade([...nomesPorSlug.values()].flat(), identidades);
    if (nomesFaltando.length === 0) {
      setResolvidas({ chave, cores: imediatas });
      return undefined;
    }

    let cancelled = false;
    buscarCartasPorNome(nomesFaltando, { fallbackIndividual: false })
      .then((cartas) => {
        if (cancelled) return;
        const novas = identidadesDasCartas(
          nomesFaltando.map((nome, index) => (cartas[index] ? { ...cartas[index], nomePedido: nome } : null)),
        );
        const atualizadas = { ...identidades, ...novas };
        gravarIdentidadesPersistidas(atualizadas);
        const next = { ...imediatas };
        for (const [slug, nomesCartas] of nomesPorSlug) {
          next[slug] = coresDoDeck(nomesCartas, [], atualizadas);
        }
        setResolvidas({ chave, cores: next });
      })
      .catch(() => {
        if (!cancelled) setResolvidas({ chave, cores: imediatas });
      });

    return () => {
      cancelled = true;
    };
  }, [chave, formato]);

  const carregando = Boolean(chave) && resolvidas.chave !== chave;
  const imediatas = coresIniciais(lista, formato, resolvidas.chave === chave ? {} : lerIdentidadesPersistidas());
  return { cores: carregando ? imediatas : resolvidas.cores, carregando: carregando && lista.some((arquetipo) => !Array.isArray(arquetipo.cores)) };
}
