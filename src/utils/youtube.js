/**
 * Aceita URL do YouTube (watch, youtu.be, embed, shorts, live) ou o id de 11 caracteres.
 * Devolve o id e uma URL canônica de watch.
 */
export function extrairVideoYoutube(valor) {
  const bruto = String(valor || "").trim();
  if (!bruto) return null;

  if (/^[\w-]{11}$/.test(bruto)) {
    return { id: bruto, url: `https://www.youtube.com/watch?v=${bruto}` };
  }

  const deTexto = bruto.match(
    /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?.*v=|embed\/|shorts\/|live\/))([\w-]{11})/,
  );
  if (deTexto) {
    return { id: deTexto[1], url: `https://www.youtube.com/watch?v=${deTexto[1]}` };
  }

  try {
    const url = new URL(bruto);
    const host = url.hostname.replace(/^www\./, "");
    if (host !== "youtu.be" && !host.endsWith("youtube.com") && host !== "youtube-nocookie.com") {
      return null;
    }
  } catch {
    return null;
  }

  return null;
}

export function thumbYoutube(videoId, qualidade = "maxresdefault") {
  return `https://i.ytimg.com/vi/${videoId}/${qualidade}.jpg`;
}
