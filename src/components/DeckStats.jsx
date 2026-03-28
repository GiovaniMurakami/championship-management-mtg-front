import { useMemo } from "react";

export function DeckStats({ mainDeck }) {
  const stats = useMemo(() => {
    if (!mainDeck || mainDeck.length === 0) {
      return null;
    }

    // Calcular curva de mana
    const manaCurve = {};
    const colorDistribution = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 };
    const typeDistribution = {};
    let totalCards = 0;

    mainDeck.forEach((card) => {
      const quantity = card.quantidade || 0;
      totalCards += quantity;

      // Curva de mana
      const manaValue = Number.isFinite(card.cmc) ? card.cmc : Number(card.cmc) || 0;
      const cmcKey = manaValue >= 7 ? "7+" : Math.floor(manaValue).toString();
      manaCurve[cmcKey] = (manaCurve[cmcKey] || 0) + quantity;

      // Distribuição de cores
      const cardColors = card.colors || card.colorIdentity || [];
      if (cardColors.length > 0) {
        cardColors.forEach((color) => {
          colorDistribution[color] = (colorDistribution[color] || 0) + quantity;
        });
      } else {
        colorDistribution.C += quantity; // Incolor
      }

      // Tipos de carta
      const typeLine = card.typeLine || "";
      const matchedTypes = [];

      if (typeLine.includes("Creature")) matchedTypes.push("Criatura");
      if (typeLine.includes("Instant")) matchedTypes.push("Instant");
      if (typeLine.includes("Sorcery")) matchedTypes.push("Sorcery");
      if (typeLine.includes("Enchantment")) matchedTypes.push("Encantamento");
      if (typeLine.includes("Artifact")) matchedTypes.push("Artefato");
      if (typeLine.includes("Planeswalker")) matchedTypes.push("Planeswalker");
      if (typeLine.includes("Land")) matchedTypes.push("Terreno");

      if (matchedTypes.length === 0) {
        matchedTypes.push("Outro");
      }

      matchedTypes.forEach((type) => {
        typeDistribution[type] = (typeDistribution[type] || 0) + quantity;
      });
    });

    return { manaCurve, colorDistribution, typeDistribution, totalCards };
  }, [mainDeck]);

  if (!stats) {
    return (
      <div className="ds-container">
        <h3 className="ds-title">📊 Estatísticas do Deck</h3>
        <p className="ds-empty">Adicione cartas ao deck para ver estatísticas</p>
      </div>
    );
  }

  const colorNames = {
    W: "Branco", U: "Azul", B: "Preto",
    R: "Vermelho", G: "Verde", C: "Incolor",
  };

  const colorColors = {
    W: "#f5e97a", U: "#3b82f6", B: "#a855f7",
    R: "#ef4444", G: "#22c55e", C: "#94a3b8",
  };

  const manaSymbols = {
    W: "https://svgs.scryfall.io/card-symbols/W.svg",
    U: "https://svgs.scryfall.io/card-symbols/U.svg",
    B: "https://svgs.scryfall.io/card-symbols/B.svg",
    R: "https://svgs.scryfall.io/card-symbols/R.svg",
    G: "https://svgs.scryfall.io/card-symbols/G.svg",
    C: "https://svgs.scryfall.io/card-symbols/C.svg",
  };

  const curveBuckets = ["0", "1", "2", "3", "4", "5", "6", "7+"];
  const maxCurveCount = Math.max(
    1,
    ...curveBuckets.map((bucket) => stats.manaCurve[bucket] || 0),
  );

  return (
    <div className="ds-container">
      <h3 className="ds-title">📊 Estatísticas do Deck</h3>

      {/* Curva de Mana */}
      <div className="ds-section">
        <h4 className="ds-section-title">Curva de Mana</h4>
        <div className="ds-curve-chart">
          {curveBuckets.map((cmc) => {
            const count = stats.manaCurve[cmc] || 0;
            const heightPercent = (count / maxCurveCount) * 100;

            return (
              <div key={cmc} className="ds-curve-col">
                <span className={`ds-curve-count${count === 0 ? " ds-zero" : ""}`}>
                  {count}
                </span>
                <div className="ds-curve-bar-bg" title={`${cmc} mana: ${count} cartas`}>
                  <div
                    className="ds-curve-bar-fill"
                    style={{
                      height: `${Math.max(0, Math.round(heightPercent))}%`,
                      minHeight: count > 0 ? "4px" : "0",
                    }}
                  />
                </div>
                <span className="ds-curve-label">{cmc}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Distribuição de Cores */}
      <div className="ds-section">
        <h4 className="ds-section-title">Distribuição de Cores</h4>
        <div className="ds-color-list">
          {Object.entries(stats.colorDistribution)
            .filter(([, count]) => count > 0)
            .sort(([, a], [, b]) => b - a)
            .map(([color, count]) => {
              const percent = ((count / stats.totalCards) * 100).toFixed(1);
              return (
                <div key={color} className="ds-color-row">
                  <div className="ds-color-identity">
                    <img
                      src={manaSymbols[color]}
                      alt={colorNames[color]}
                      className="ds-mana-symbol"
                    />
                    <span className="ds-color-name">{colorNames[color]}</span>
                  </div>
                  <div className="ds-color-bar-wrapper">
                    <div className="ds-color-bar-bg">
                      <div
                        className="ds-color-bar-fill"
                        style={{ width: `${percent}%`, background: colorColors[color] }}
                      />
                    </div>
                    <span className="ds-color-label">
                      {count} ({percent}%)
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Tipos de Carta */}
      <div className="ds-section ds-section-last">
        <h4 className="ds-section-title">Tipos de Carta</h4>
        <div className="ds-type-list">
          {Object.entries(stats.typeDistribution)
            .sort(([, a], [, b]) => b - a)
            .map(([type, count]) => {
              const percent = ((count / stats.totalCards) * 100).toFixed(1);
              return (
                <div key={type} className="ds-type-row">
                  <span className="ds-type-name">{type}</span>
                  <span className="ds-type-value">{count} ({percent}%)</span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
