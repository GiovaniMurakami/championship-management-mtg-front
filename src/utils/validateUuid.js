const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Returns true when value is a valid UUID v1–v5 string. */
export function isValidUuid(value) {
  if (value == null || typeof value !== "string") return false;
  const trimmed = value.trim();
  return trimmed.length > 0 && UUID_REGEX.test(trimmed);
}
