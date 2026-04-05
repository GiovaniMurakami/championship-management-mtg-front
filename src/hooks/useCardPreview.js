import { useState, useCallback } from "react";

export function useCardPreview() {
  const [previewCard, setPreviewCard] = useState(null);

  const openCardPreview = useCallback((card) => {
    if (!card?.imagem) {
      setPreviewCard(null);
      return;
    }
    setPreviewCard(card);
  }, []);

  const closeCardPreview = useCallback(() => {
    setPreviewCard(null);
  }, []);

  return {
    previewCard,
    openCardPreview,
    closeCardPreview,
  };
}
