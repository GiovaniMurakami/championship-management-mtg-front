export function CardPreviewModal({ card }) {
  if (!card) {
    return null;
  }

  return (
    <div className="card-preview-modal" aria-hidden="true">
      <img src={card.imagem} alt={card.nome} />
      <p>{card.nome}</p>
    </div>
  );
}
