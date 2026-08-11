/**
 * Conta e corta texto por grafemas (emoji/bandeiras contam como 1),
 * evitando partir pares de indicadores regionais no meio.
 */
export function segmentGraphemes(text) {
  const value = String(text ?? "");
  if (typeof Intl !== "undefined" && typeof Intl.Segmenter === "function") {
    const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    return Array.from(segmenter.segment(value), (part) => part.segment);
  }
  return Array.from(value);
}

export function graphemeLength(text) {
  return segmentGraphemes(text).length;
}

export function truncateGraphemes(text, maxLength) {
  const graphemes = segmentGraphemes(text);
  if (graphemes.length <= maxLength) {
    return { text: graphemes.join(""), truncated: false };
  }
  return {
    text: `${graphemes.slice(0, maxLength).join("").trimEnd()}...`,
    truncated: true,
  };
}
