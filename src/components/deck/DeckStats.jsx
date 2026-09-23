import { useMemo } from "react";
import { Tooltip } from "../ui/Tooltip";
import { isLandType } from "../../utils/cardTypeGroup";

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

      // Tipos de carta — terrenos (inclusive artefato) contam só como terreno
      const typeLine = card.typeLine || "";
      const matchedTypes = [];

      if (isLandType(typeLine)) {
        matchedTypes.push("Terreno");
      } else {
        if (typeLine.includes("Creature")) matchedTypes.push("Criatura");
        if (typeLine.includes("Instant")) matchedTypes.push("Instant");
        if (typeLine.includes("Sorcery")) matchedTypes.push("Sorcery");
        if (typeLine.includes("Enchantment")) matchedTypes.push("Encantamento");
        if (typeLine.includes("Artifact")) matchedTypes.push("Artefato");
        if (typeLine.includes("Planeswalker")) matchedTypes.push("Planeswalker");
      }

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
      <div className="flex flex-col gap-4 border border-line rounded-lg p-4 bg-white/[0.01] w-full">
        <h3 className="text-[1.1rem] m-0 text-text-main">📊 Estatísticas do Deck</h3>
        <p className="text-text-soft text-[0.9rem] text-center m-0">Adicione cartas ao deck para ver estatísticas</p>
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
    <div className="flex flex-col gap-4 border border-line rounded-lg p-4 bg-white/[0.01] w-full">
      <h3 className="text-[1.1rem] m-0 text-text-main">📊 Estatísticas do Deck</h3>

      {/* Curva de Mana */}
      <div className="mb-6">
        <h4 className="text-[0.95rem] text-text-soft mb-2 mt-0">Curva de Mana</h4>
        {/* ds-curve-chart: flex items-end gap-[0.3rem] h-[148px], responsive h-[120px] */}
        <div className="flex items-end gap-[0.3rem] h-[148px] max-[600px]:h-[120px]">
          {curveBuckets.map((cmc) => {
            const count = stats.manaCurve[cmc] || 0;
            const heightPercent = (count / maxCurveCount) * 100;

            return (
              /* ds-curve-col: flex-1 flex flex-col items-center gap-[0.35rem] min-w-[30px], responsive min-w-[24px] */
              <div key={cmc} className="flex-1 flex flex-col items-center gap-[0.35rem] min-w-[30px] max-[600px]:min-w-[24px]">
                {/* ds-curve-count / ds-curve-count.ds-zero */}
                <span
                  className={`text-[0.7rem] font-bold text-text-main leading-none${count === 0 ? " font-normal opacity-45" : ""}`}
                >
                  {count}
                </span>
                {/* ds-curve-bar-bg: w-full h-[108px] bg-white/[0.05] rounded border border-white/[0.08] relative overflow-hidden, responsive h-[80px] */}
                <Tooltip content={`${cmc} mana: ${count} cartas`} focusable={false} className="w-full">
                  <div className="w-full h-[108px] max-[600px]:h-[80px] bg-white/[0.05] rounded border border-white/[0.08] relative overflow-hidden">
                    {/* ds-curve-bar-fill: absolute left-0 right-0 bottom-0 bg-gradient-to-t from-[#6f23b3] to-[#a74fff] transition-[height] duration-[280ms] ease */}
                    <div
                      className="absolute left-0 right-0 bottom-0 bg-gradient-to-t from-[#0d7a6e] via-[#6f23b3] to-[#a74fff] transition-[height] duration-[280ms] ease-[ease]"
                      style={{
                        height: `${Math.max(0, Math.round(heightPercent))}%`,
                        minHeight: count > 0 ? "4px" : "0",
                      }}
                    />
                  </div>
                </Tooltip>
                {/* ds-curve-label: text-[0.75rem] opacity-70 */}
                <span className="text-[0.75rem] opacity-70">{cmc}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Distribuição de Cores */}
      <div className="mb-6">
        <h4 className="text-[0.95rem] text-text-soft mb-2 mt-0">Distribuição de Cores</h4>
        {/* ds-color-list: grid gap-[0.4rem] */}
        <div className="grid gap-[0.4rem]">
          {Object.entries(stats.colorDistribution)
            .filter(([, count]) => count > 0)
            .sort(([, a], [, b]) => b - a)
            .map(([color, count]) => {
              const percent = ((count / stats.totalCards) * 100).toFixed(1);
              return (
                /* ds-color-row: flex items-center gap-[0.5rem] */
                <div key={color} className="flex items-center gap-[0.5rem]">
                  {/* ds-color-identity: flex items-center gap-[0.45rem] w-[90px] shrink-0 */}
                  <div className="flex items-center gap-[0.45rem] w-[90px] shrink-0">
                    {/* ds-mana-symbol: w-[22px] h-[22px] shrink-0 */}
                    <img
                      src={manaSymbols[color]}
                      alt={colorNames[color]}
                      className="w-[22px] h-[22px] shrink-0"
                    />
                    {/* ds-color-name: text-[0.82rem] text-text-soft whitespace-nowrap */}
                    <span className="text-[0.82rem] text-text-soft whitespace-nowrap">{colorNames[color]}</span>
                  </div>
                  {/* ds-color-bar-wrapper: flex-1 flex items-center gap-[0.5rem] */}
                  <div className="flex-1 flex items-center gap-[0.5rem]">
                    {/* ds-color-bar-bg: flex-1 h-[20px] bg-white/[0.05] rounded overflow-hidden relative */}
                    <div className="flex-1 h-[20px] bg-white/[0.05] rounded overflow-hidden relative">
                      {/* ds-color-bar-fill: h-full transition-[width] duration-300 ease */}
                      <div
                        className="h-full transition-[width] duration-300 ease-[ease]"
                        style={{ width: `${percent}%`, background: colorColors[color] }}
                      />
                    </div>
                    {/* ds-color-label: text-[0.8rem] min-w-[60px] text-right */}
                    <span className="text-[0.8rem] min-w-[60px] text-right">
                      {count} ({percent}%)
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Tipos de Carta — ds-section-last has mb-0 */}
      <div className="mb-0">
        <h4 className="text-[0.95rem] text-text-soft mb-2 mt-0">Tipos de Carta</h4>
        {/* ds-type-list: grid gap-[0.4rem] */}
        <div className="grid gap-[0.4rem]">
          {Object.entries(stats.typeDistribution)
            .sort(([, a], [, b]) => b - a)
            .map(([type, count]) => {
              const percent = ((count / stats.totalCards) * 100).toFixed(1);
              return (
                /* ds-type-row: flex justify-between items-center px-[0.5rem] py-[0.3rem] bg-[rgba(167,79,255,0.08)] rounded-md border border-[rgba(167,79,255,0.2)] */
                <div
                  key={type}
                  className="flex justify-between items-center px-[0.5rem] py-[0.3rem] bg-[rgba(44,207,180,0.06)] rounded-md border border-[rgba(44,207,180,0.18)]"
                >
                  {/* ds-type-name: text-[0.85rem] font-medium */}
                  <span className="text-[0.85rem] font-medium">{type}</span>
                  {/* ds-type-value: text-[0.8rem] opacity-80 */}
                  <span className="text-[0.8rem] opacity-80">{count} ({percent}%)</span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
