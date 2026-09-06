/** Formata apenas a exibição; preserva o restante do nome oficial. */
export function formatCardName(name) {
  return String(name ?? "").trim().replace(/(^|\s)(\p{L})/gu, (_, space, letter) => space + letter.toLocaleUpperCase());
}
