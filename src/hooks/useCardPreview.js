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
    const nome = typeof card === "string" ? card : card?.nome;

    if (card?.imagem && !isScryfallId(nome)) {
      seqRef.current += 1;
      setPreviewCard(card);
      return;
    }

    if (!nome) {
      seqRef.current += 1;
      setPreviewCard(null);
      return;
    }

    const seq = ++seqRef.current;
    const carregar = isScryfallId(nome) ? buscarCartaPorId : buscarCartaPorNome;
    if (card?.imagem) setPreviewCard({ imagem: card.imagem, nome: "" });
    carregar(nome)
      .then((carta) => {
        if (seq !== seqRef.current) return;
        const imagem = carta?.imagem || card?.imagem;
        if (imagem) {
          setPreviewCard({ nome: carta?.nome || "", imagem });
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
