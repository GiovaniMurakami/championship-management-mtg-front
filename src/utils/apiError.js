/**
 * Extracts validation messages from API error payloads.
 * Backend may return `erros` or `errors` as string[] or Zod-like objects.
 */
export function extractValidationMessages(payload) {
  const raw = payload?.erros ?? payload?.errors;
  if (!Array.isArray(raw) || raw.length === 0) return [];

  return raw.map((entry) => {
    if (typeof entry === "string") return entry;
    if (entry && typeof entry === "object") {
      return entry.message || entry.msg || entry.path?.join?.(".") || JSON.stringify(entry);
    }
    return String(entry);
  }).filter(Boolean);
}

/** Builds a user-facing message from an API error payload. */
export function formatApiErrorMessage(payload, fallback = "Falha na requisição") {
  const validation = extractValidationMessages(payload);
  if (validation.length > 0) return validation.join("; ");
  return payload?.mensagem || payload?.message || fallback;
}
