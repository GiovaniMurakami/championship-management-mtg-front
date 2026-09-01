export function slugifyDeckName(name = "") {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ç/gi, "c").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function deckPath(deck, { view = false } = {}) {
  const id = String(deck?.id || "");
  const slug = slugifyDeckName(deck?.nome) || "deck";
  return `/editar-deck/${id.slice(0, 5)}-${slug}${view ? "?modo=visualizar" : ""}`;
}
