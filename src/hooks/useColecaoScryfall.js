import { useEffect, useState } from "react";
import { buscarCartasPorNome } from "../services/scryfallApi";

/**
 * Uma consulta /cards/collection (lotes de 75) para todos os nomes.
 * Sem fallback carta a carta: isso é o que deixa a tela pingando.
 */
export function useColecaoScryfall(nomes = []) {
  const unicos = [...new Set(nomes.map((nome) => String(nome || "").trim()).filter(Boolean))];
  const chave = unicos.join("\u0000");
  const [estado, setEstado] = useState({ chave: "", cartas: new Map() });

  useEffect(() => {
    if (!chave) {
      setEstado({ chave: "", cartas: new Map() });
      return undefined;
    }

    const lista = chave.split("\u0000");
    let cancelled = false;
    buscarCartasPorNome(lista, { fallbackIndividual: false })
      .then((cartas) => {
        if (cancelled) return;
        const mapa = new Map();
        const listaCartas = Array.isArray(cartas) ? cartas : [];
        lista.forEach((nome, index) => {
          const carta = listaCartas[index];
          if (carta) mapa.set(nome.toLowerCase(), carta);
        });
        setEstado({ chave, cartas: mapa });
      })
      .catch(() => {
        if (!cancelled) setEstado({ chave, cartas: new Map() });
      });

    return () => {
      cancelled = true;
    };
  }, [chave]);

  return estado.chave === chave ? estado.cartas : new Map();
}
