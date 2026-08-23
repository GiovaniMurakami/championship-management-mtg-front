export function CardPreviewModal({ card }) {
  if (!card) {
    return null;
  }

  return (
    <div
      className="fixed right-6 bottom-6 z-[70] w-fit max-w-[calc(100vw-2rem)] border border-[rgba(199,149,255,0.5)] rounded-2xl bg-[rgba(12,8,24,0.95)] shadow-[0_16px_40px_rgba(3,2,8,0.6)] p-3 pointer-events-none animate-[slide-up_300ms_cubic-bezier(0.34,1.56,0.64,1)] max-[640px]:hidden"
      aria-hidden="true"
    >
      <img
        src={card.imagem}
        alt={card.nome}
        className="w-[clamp(180px,22vw,230px)] max-w-full aspect-[63/88] object-cover rounded-lg"
      />
      <p className="mt-[0.65rem] mb-0 text-[#efe6ff] font-semibold text-center max-w-[clamp(180px,22vw,230px)]">
        {card.nome}
      </p>
    </div>
  );
}
