export function slugifyArtigoTitulo(titulo = "") {
  return String(titulo)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ç/gi, "c")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function artigoPath(artigo, { editar = false } = {}) {
  const id = String(artigo?.id || "");
  const slug = slugifyArtigoTitulo(artigo?.titulo) || "artigo";
  const base = `/artigos/${id.slice(0, 5)}-${slug}`;
  return editar ? `${base}/editar` : base;
}

export function textoQuantidadeComentarios(total) {
  const quantidade = Number(total) || 0;
  return `${quantidade} ${quantidade === 1 ? "comentário" : "comentários"}`;
}
