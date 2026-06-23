/** @typedef {"bronze" | "prata" | "ouro" | "foguete"} RankTier */

/** @type {Record<RankTier, { label: string, color: string, icon: string, isRocket?: boolean }>} */
export const RANK_META = {
  bronze: { label: "Bronze", color: "#CD7F32", icon: "🥉" },
  prata: { label: "Prata", color: "#C0C0C0", icon: "🥈" },
  ouro: { label: "Ouro", color: "#FFD700", icon: "🥇" },
  foguete: { label: "Foguete", color: "#a855f7", icon: "🚀", isRocket: true },
};

export const RANK_TIERS = /** @type {RankTier[]} */ (["bronze", "prata", "ouro", "foguete"]);

export const RANK_TOOLTIP_TEXT =
  "Perder para jogador de rank menor custa mais pontos. Vitórias contra ranks maiores valem mais.";
