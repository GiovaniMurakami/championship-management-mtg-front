import { useState, useCallback, useRef } from "react";
import { buscarCartaPorId, buscarCartaPorNome } from "../services/scryfallApi";
import { isScryfallId } from "../utils/scryfallId";

export function useCardPreview() {
  const [previewCard, setPreviewCard] = useState(null);
  const seqRef = useRef(0);

  const closeCardPreview = useCallback(() => {
    seqRef.current += 1;
    setPreviewCard(null);
  }, []);

  const openCardPreview = useCallback((card) => {
    if (card?.imagem) {
      seqRef.current += 1;
      setPreviewCard(card);
      return;
    }

    const nome = typeof card === "string" ? card : card?.nome;
    if (!nome) {
      seqRef.current += 1;
      setPreviewCard(null);
      return;
    }

    const seq = ++seqRef.current;
    const carregar = isScryfallId(nome) ? buscarCartaPorId : buscarCartaPorNome;
    carregar(nome)
      .then((carta) => {
        if (seq !== seqRef.current) return;
        if (carta?.imagem) {
          setPreviewCard({ nome: carta.nome, imagem: carta.imagem });
        }
      })
      .catch(() => {
        if (seq !== seqRef.current) return;
        setPreviewCard(null);
      });
  }, []);

  return {
    previewCard,
    openCardPreview,
    closeCardPreview,
  };
}
