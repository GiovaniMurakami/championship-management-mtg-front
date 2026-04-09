/**
 * Normalizes any value to a comparable string.
 * Returns "" for null/undefined so comparisons work predictably.
 */
export const normalizeId = (v) => (v === undefined || v === null ? "" : String(v));
