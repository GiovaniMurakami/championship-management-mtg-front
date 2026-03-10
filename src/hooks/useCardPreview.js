import { useState } from "react";

export function useCardPreview() {
  const [previewCard, setPreviewCard] = useState(null);

  const openCardPreview = (card) => {
    if (!card?.imagem) {
      setPreviewCard(null);
      return;
    }
    setPreviewCard(card);
  };

  const closeCardPreview = () => {
    setPreviewCard(null);
  };

  return {
    previewCard,
    openCardPreview,
    closeCardPreview,
  };
}
