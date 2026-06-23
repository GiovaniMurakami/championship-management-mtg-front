const DEFAULT_LIMITE = 20;
const MIN_LIMITE = 1;
const MAX_LIMITE = 100;

/** Clamps list page size to API range 1–100 (default 20). */
export function clampLimite(value, fallback = DEFAULT_LIMITE) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(MAX_LIMITE, Math.max(MIN_LIMITE, Math.trunc(parsed)));
}

/** Clamps list offset to API minimum 0. */
export function clampOffset(value, fallback = 0) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return Math.trunc(parsed);
}
