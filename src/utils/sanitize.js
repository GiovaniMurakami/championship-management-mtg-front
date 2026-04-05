/**
 * Strips HTML tags and trims whitespace from user text inputs.
 * Defense-in-depth: backend should also sanitize, but this prevents
 * accidental script injection from reaching the API.
 */
export function sanitizeText(value) {
    if (typeof value !== "string") return value;
    return value.replace(/<[^>]*>/g, "").trim();
}
