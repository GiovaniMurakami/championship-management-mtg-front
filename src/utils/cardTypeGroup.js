const TYPE_GROUPS = [
  "Creature",
  "Planeswalker",
  "Battle",
  "Instant",
  "Sorcery",
  "Enchantment",
  "Artifact",
];

export function isLandType(typeLine) {
  return Boolean(typeLine && typeLine.includes("Land"));
}

export function getCardTypeGroup(typeLine) {
  if (!typeLine) return "Other";
  if (isLandType(typeLine)) return "Land";
  return TYPE_GROUPS.find((type) => typeLine.includes(type)) || "Other";
}
