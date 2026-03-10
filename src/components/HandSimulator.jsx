import { useState } from "react";

export function HandSimulator({ mainDeck }) {
  const [hand, setHand] = useState([]);
  const [showHand, setShowHand] = useState(false);

  const drawHand = () => {
    if (!mainDeck || mainDeck.length === 0) {
      return;
    }

    // Criar um array expandido com todas as cartas considerando quantidades
    const expandedDeck = [];
    mainDeck.forEach((card) => {
      for (let i = 0; i < card.quantidade; i++) {
        expandedDeck.push(card);
      }
    });

    if (expandedDeck.length < 7) {
      return;
    }

    // Embaralhar o deck usando algoritmo Fisher-Yates
    const shuffled = [...expandedDeck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Pegar as 7 primeiras cartas
    const drawnHand = shuffled.slice(0, 7);
    setHand(drawnHand);
    setShowHand(true);
  };

  const mulligan = () => {
    drawHand();
  };

  const closeHand = () => {
    setShowHand(false);
    setHand([]);
  };

  const totalCards = mainDeck?.reduce(
    (sum, card) => sum + (card.quantidade || 0),
    0
  );

  return (
    <div
      style={{
        border: "1px solid var(--line)",
        borderRadius: "0.8rem",
        padding: "1rem",
        background: "rgba(255, 255, 255, 0.01)",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.75rem",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "1.1rem" }}>🎴 Mão Inicial</h3>
        <span style={{ fontSize: "0.85rem", opacity: 0.7 }}>
          {totalCards} cartas no deck
        </span>
      </div>

      {!showHand ? (
        <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
          <p
            style={{
              margin: "0 0 1rem",
              color: "var(--text-soft)",
              fontSize: "0.9rem",
            }}
          >
            Simule uma mão inicial de 7 cartas aleatórias do seu deck
          </p>
          <button
            className="btn primary"
            type="button"
            onClick={drawHand}
            disabled={!mainDeck || mainDeck.length === 0 || totalCards < 7}
            style={{
              opacity: !mainDeck || mainDeck.length === 0 || totalCards < 7 ? 0.5 : 1,
              cursor:
                !mainDeck || mainDeck.length === 0 || totalCards < 7
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            Comprar Mão Inicial
          </button>
        </div>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-end",
              gap: "0",
              marginBottom: "1rem",
              minHeight: "210px",
              padding: "1rem 0.5rem 0.5rem",
              overflowX: "auto",
              overflowY: "hidden",
            }}
          >
            {hand.map((card, index) => (
              <div
                key={`${card.nome}-${index}`}
                style={{
                  position: "relative",
                  width: "96px",
                  height: "134px",
                  borderRadius: "0.4rem",
                  overflow: "hidden",
                  border: "1px solid var(--line)",
                  background: "rgba(0, 0, 0, 0.3)",
                  marginLeft: index === 0 ? "0" : "-16px",
                  transform: `translateY(${Math.abs(3 - index) * 9}px) rotate(${(index - 3) * 3}deg)`,
                  transformOrigin: "bottom center",
                  boxShadow: "0 6px 16px rgba(0, 0, 0, 0.35)",
                  zIndex: index + 1,
                  transition: "transform 180ms ease",
                  flexShrink: 0,
                }}
                title={card.nome}
              >
                {card.imagem ? (
                  <img
                    src={card.imagem}
                    alt={card.nome}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      padding: "0.25rem",
                      fontSize: "0.7rem",
                      textAlign: "center",
                      wordBreak: "break-word",
                    }}
                  >
                    {card.nome}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              className="btn secondary"
              type="button"
              onClick={mulligan}
              style={{ flex: 1 }}
            >
              ⟳ Mulligan
            </button>
            <button
              className="btn ghost"
              type="button"
              onClick={closeHand}
              style={{ flex: 1 }}
            >
              Fechar
            </button>
          </div>
        </>
      )}
    </div>
  );
}
