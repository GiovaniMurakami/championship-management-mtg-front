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
      const cmc = Math.min(card.cmc || 0, 7); // Agrupar 7+ juntos
      const cmcKey = cmc === 7 && card.cmc > 7 ? "7+" : cmc.toString();
      manaCurve[cmcKey] = (manaCurve[cmcKey] || 0) + quantity;

      // Distribuição de cores
      if (card.colors && card.colors.length > 0) {
        card.colors.forEach((color) => {
          colorDistribution[color] = (colorDistribution[color] || 0) + quantity;
        });
      } else {
        colorDistribution.C += quantity; // Incolor
      }

      // Tipos de carta (uma carta pode contar para varios tipos)
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

    return {
      manaCurve,
      colorDistribution,
      typeDistribution,
      totalCards,
    };
  }, [mainDeck]);

  if (!stats) {
    return (
      <div
        style={{
          border: "1px solid var(--line)",
          borderRadius: "0.8rem",
          padding: "1rem",
          background: "rgba(255, 255, 255, 0.01)",
          textAlign: "center",
        }}
      >
        <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.1rem" }}>
          📊 Estatísticas do Deck
        </h3>
        <p style={{ margin: 0, color: "var(--text-soft)", fontSize: "0.9rem" }}>
          Adicione cartas ao deck para ver estatísticas
        </p>
      </div>
    );
  }

  const colorNames = {
    W: "Branco",
    U: "Azul",
    B: "Preto",
    R: "Vermelho",
    G: "Verde",
    C: "Incolor",
  };

  const colorColors = {
    W: "#f0e68c",
    U: "#0e68ab",
    B: "#150b00",
    R: "#d32029",
    G: "#00733e",
    C: "#ccc",
  };

  const curveBuckets = ["0", "1", "2", "3", "4", "5", "6", "7+"];
  const maxCurveCount = Math.max(
    1,
    ...curveBuckets.map((bucket) => stats.manaCurve[bucket] || 0),
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
      <h3 style={{ margin: "0 0 1rem", fontSize: "1.1rem" }}>
        📊 Estatísticas do Deck
      </h3>

      {/* Curva de Mana */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h4
          style={{
            margin: "0 0 0.5rem",
            fontSize: "0.95rem",
            color: "var(--brand-2)",
          }}
        >
          Curva de Mana
        </h4>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: "0.3rem",
            height: "148px",
          }}
        >
          {curveBuckets.map((cmc) => {
            const count = stats.manaCurve[cmc] || 0;
            const heightPercent = (count / maxCurveCount) * 100;

            return (
              <div
                key={cmc}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.35rem",
                  minWidth: "30px",
                }}
              >
                {count > 0 ? (
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: "bold",
                      color: "var(--text-main)",
                      lineHeight: 1,
                    }}
                  >
                    {count}
                  </span>
                ) : (
                  <span style={{ fontSize: "0.7rem", opacity: 0.45, lineHeight: 1 }}>0</span>
                )}

                <div
                  style={{
                    width: "100%",
                    height: "108px",
                    background: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "0.25rem",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                  title={`${cmc} mana: ${count} cartas`}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: 0,
                      height: `${Math.max(0, Math.round(heightPercent))}%`,
                      minHeight: count > 0 ? "4px" : "0",
                      background: "linear-gradient(180deg, #a74fff, #6f23b3)",
                      transition: "height 280ms ease",
                    }}
                  />
                </div>
                <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>{cmc}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Distribuição de Cores */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h4
          style={{
            margin: "0 0 0.5rem",
            fontSize: "0.95rem",
            color: "var(--brand-2)",
          }}
        >
          Distribuição de Cores
        </h4>
        <div style={{ display: "grid", gap: "0.4rem" }}>
          {Object.entries(stats.colorDistribution)
            .filter(([_, count]) => count > 0)
            .sort(([, a], [, b]) => b - a)
            .map(([color, count]) => {
              const percent = ((count / stats.totalCards) * 100).toFixed(1);

              return (
                <div key={color} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      background: colorColors[color],
                      border: "1px solid var(--line)",
                      flexShrink: 0,
                    }}
                    title={colorNames[color]}
                  />
                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div
                      style={{
                        flex: 1,
                        height: "20px",
                        background: "rgba(255, 255, 255, 0.05)",
                        borderRadius: "0.25rem",
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          width: `${percent}%`,
                          height: "100%",
                          background: colorColors[color],
                          transition: "width 300ms ease",
                        }}
                      />
                    </div>
                    <span style={{ fontSize: "0.8rem", minWidth: "60px", textAlign: "right" }}>
                      {count} ({percent}%)
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Tipos de Carta */}
      <div>
        <h4
          style={{
            margin: "0 0 0.5rem",
            fontSize: "0.95rem",
            color: "var(--brand-2)",
          }}
        >
          Tipos de Carta
        </h4>
        <div style={{ display: "grid", gap: "0.4rem" }}>
          {Object.entries(stats.typeDistribution)
            .sort(([, a], [, b]) => b - a)
            .map(([type, count]) => {
              const percent = ((count / stats.totalCards) * 100).toFixed(1);

              return (
                <div
                  key={type}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.3rem 0.5rem",
                    background: "rgba(167, 79, 255, 0.08)",
                    borderRadius: "0.4rem",
                    border: "1px solid rgba(167, 79, 255, 0.2)",
                  }}
                >
                  <span style={{ fontSize: "0.85rem", fontWeight: "500" }}>{type}</span>
                  <span style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                    {count} ({percent}%)
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
