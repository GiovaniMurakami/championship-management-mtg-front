import { useEffect, useState } from "react";
import { buscarCartasPorNome } from "../services/scryfallApi";
import { chaveNomeCarta, enrichCardsByName, nomesDasListas } from "../utils/deckTypeGroups";

function enriquecerLista(lista, porNome) {
  if (!lista) return lista;
  return {
    ...lista,
    maindeck: enrichCardsByName(lista.maindeck, porNome),
    sideboard: enrichCardsByName(lista.sideboard, porNome),
    commander: enrichCardsByName(lista.commander, porNome),
  };
}

export function useResolvedMetagameListas(listas) {
  const origem = Array.isArray(listas) ? listas : [];
  const nomes = nomesDasListas(origem);
  const chave = `${origem.map((lista) => `${lista.deckId}:${lista.torneioId}`).join(",")}:${nomes.join("|")}`;
  const [resolvidas, setResolvidas] = useState({ chave: "", listas: origem });

  useEffect(() => {
    if (nomes.length === 0) {
      setResolvidas({ chave, listas: origem });
      return undefined;
    }

    let cancelled = false;
    buscarCartasPorNome(nomes, { fallbackIndividual: false })
      .then((cartas) => {
        if (cancelled) return;
        const porNome = new Map();
        nomes.forEach((nome, index) => {
          if (cartas[index]) porNome.set(chaveNomeCarta(nome), cartas[index]);
        });
        setResolvidas({
          chave,
          listas: origem.map((lista) => enriquecerLista(lista, porNome)),
        });
      })
      .catch(() => {
        if (!cancelled) setResolvidas({ chave, listas: origem });
      });

    return () => {
      cancelled = true;
    };
    // origem e nomes derivam da chave
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave]);

  return resolvidas.chave === chave ? resolvidas.listas : origem;
}
