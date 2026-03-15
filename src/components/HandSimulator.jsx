import { useState } from "react";

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
    <div className="hs-container">
      <div className="hs-header">
        <h3 className="hs-title">🎴 Mão Inicial</h3>
        <span className="hs-count">{totalCards} cartas no deck</span>
      </div>

      {!showHand ? (
        <div className="hs-cta">
          <p className="hs-cta-text">
            Simule uma mão inicial de 7 cartas aleatórias do seu deck
          </p>
          <button
            className="btn primary"
            type="button"
            onClick={drawHand}
            disabled={isDisabled}
          >
            Comprar Mão Inicial
          </button>
        </div>
      ) : (
        <>
          <div className="hs-hand-area">
            <div className="hs-hand-fan">
              {hand.map((card, index) => (
                <div
                  key={`${card.nome}-${index}`}
                  className="hs-card"
                  style={{
                    marginLeft: index === 0 ? "0" : "-20px",
                    transform: `translateY(${Math.abs(3 - index) * 9 - 12}px) rotate(${(index - 3) * 3}deg)`,
                    zIndex: index + 1,
                  }}
                  title={card.nome}
                >
                  {card.imagem ? (
                    <img src={card.imagem} alt={card.nome} className="hs-card-img" />
                  ) : (
                    <div className="hs-card-name">{card.nome}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="hs-actions">
            <button className="btn secondary" type="button" onClick={drawHand}>
              ⟳ Mulligan
            </button>
            <button className="btn ghost" type="button" onClick={closeHand}>
              Fechar
            </button>
          </div>
        </>
      )}
    </div>
  );
}
