import { useState } from "react";
import { Tooltip } from "../ui/Tooltip";

export function HandSimulator({ mainDeck }) {
  const [hand, setHand] = useState([]);
  const [showHand, setShowHand] = useState(false);

  const drawHand = () => {
    if (!mainDeck || mainDeck.length === 0) {
      return;
    }

    const expandedDeck = [];
    mainDeck.forEach((card) => {
      for (let i = 0; i < card.quantidade; i++) {
        expandedDeck.push(card);
      }
    });

    if (expandedDeck.length < 7) {
      return;
    }

    // Fisher-Yates shuffle
    const shuffled = [...expandedDeck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    setHand(shuffled.slice(0, 7));
    setShowHand(true);
  };

  const closeHand = () => {
    setShowHand(false);
    setHand([]);
  };

  const totalCards = mainDeck?.reduce(
    (sum, card) => sum + (card.quantidade || 0),
    0
  );

  const isDisabled = !mainDeck || mainDeck.length === 0 || totalCards < 7;

  return (
    /* hs-container: border border-line rounded-lg p-4 bg-white/[0.01] w-full */
    <div className="border border-line rounded-lg p-4 bg-white/[0.01] w-full">
      {/* hs-header: flex justify-between items-center mb-3 */}
      <div className="flex justify-between items-center mb-3">
        {/* hs-title: text-[1.1rem] m-0 text-text-main */}
        <h3 className="text-[1.1rem] m-0 text-text-main">🎴 Mão Inicial</h3>
        {/* hs-count: text-[0.85rem] opacity-70 */}
        <span className="text-[0.85rem] opacity-70">{totalCards} cartas no deck</span>
      </div>

      {!showHand ? (
        /* hs-cta: text-center py-6 */
        <div className="text-center py-6">
          {/* hs-cta-text: mb-4 text-text-soft text-[0.9rem] */}
          <p className="mb-4 text-text-soft text-[0.9rem]">
            Simule uma mão inicial de 7 cartas aleatórias do seu deck
          </p>
          <button
            className="border border-[rgba(199,149,255,0.6)] rounded-xl px-4 py-[0.6rem] cursor-pointer font-bold bg-gradient-to-br from-[#8e39ed] to-[#5f23b3] text-white shadow-[0_4px_12px_rgba(167,79,255,0.25)] transition-all duration-[220ms] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(167,79,255,0.4)] disabled:opacity-60 disabled:cursor-not-allowed"
            type="button"
            onClick={drawHand}
            disabled={isDisabled}
          >
            Comprar Mão Inicial
          </button>
        </div>
      ) : (
        <>
          {/* hs-hand-area: flex justify-center items-center mb-4 min-h-[245px] max-[600px]:min-h-[190px] px-1 py-2 overflow-x-auto overflow-y-hidden */}
          <div className="flex justify-center items-center mb-4 min-h-[245px] max-[600px]:min-h-[190px] px-1 py-2 overflow-x-auto overflow-y-hidden">
            {/* hs-hand-fan: flex justify-center items-end w-fit mx-auto */}
            <div className="flex justify-center items-end w-fit mx-auto">
              {hand.map((card, index) => (
                /* hs-card: relative w-[112px] max-[600px]:w-[84px] h-[156px] max-[600px]:h-[117px] rounded-md overflow-hidden border border-line bg-black/30 origin-bottom shadow-[0_6px_16px_rgba(0,0,0,0.35)] transition-transform duration-[180ms] ease shrink-0 hover:-translate-y-3 */
                <Tooltip key={`${card.nome}-${index}`} content={card.nome} focusable={false}>
                  <div
                    className="relative w-[112px] max-[600px]:w-[84px] h-[156px] max-[600px]:h-[117px] rounded-md overflow-hidden border border-line bg-black/30 origin-bottom shadow-[0_6px_16px_rgba(0,0,0,0.35)] transition-transform duration-[180ms] ease-[ease] shrink-0 hover:!-translate-y-3"
                    style={{
                      marginLeft: index === 0 ? "0" : "-20px",
                      transform: `translateY(${Math.abs(3 - index) * 9 - 12}px) rotate(${(index - 3) * 3}deg)`,
                      zIndex: index + 1,
                    }}
                  >
                    {card.imagem ? (
                      /* hs-card-img: w-full h-full object-cover */
                      <img src={card.imagem} alt={card.nome} className="w-full h-full object-cover" />
                    ) : (
                      /* hs-card-name: flex items-center justify-center h-full p-1 text-[0.7rem] text-center break-words */
                      <div className="flex items-center justify-center h-full p-1 text-[0.7rem] text-center break-words">{card.nome}</div>
                    )}
                  </div>
                </Tooltip>
              ))}
            </div>
          </div>

          {/* hs-actions: flex gap-2 — each btn gets flex-1 */}
          <div className="flex gap-2">
            <button className="flex-1 border border-line rounded-xl px-4 py-[0.6rem] cursor-pointer font-bold bg-white/[0.03] text-text-main transition-all duration-[220ms] hover:border-line-strong hover:bg-white/[0.08]" type="button" onClick={drawHand}>
              ⟳ Mulligan
            </button>
            <button className="flex-1 border border-line rounded-xl px-4 py-[0.6rem] cursor-pointer font-bold bg-transparent text-text-soft transition-all duration-[220ms] hover:border-line-strong hover:text-white hover:bg-white/[0.05]" type="button" onClick={closeHand}>
              Fechar
            </button>
          </div>
        </>
      )}
    </div>
  );
}
