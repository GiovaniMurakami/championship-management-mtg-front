import { getApiBaseUrl } from "./apiBaseUrl";

const S3_HOST = /(^|\.)s3([.-][a-z0-9-]+)?\.amazonaws\.com$/i;

export function isS3HttpUrl(src) {
  try {
    const { protocol, hostname } = new URL(src);
    if (protocol !== "https:" && protocol !== "http:") return false;
    return S3_HOST.test(hostname);
  } catch {
    return false;
  }
}

export function blobParecePaginaWeb(blob) {
  const type = String(blob?.type || "").toLowerCase();
  if (!type) return false;
  if (type.startsWith("image/")) return false;
  return type.includes("html") || type === "application/xml" || type === "text/xml";
}

export function buildS3ImageProxyUrl(absoluteS3Url) {
  if (import.meta.env.DEV) {
    return `/__s3-image?url=${encodeURIComponent(absoluteS3Url)}`;
  }
  const base = String(getApiBaseUrl() || "").replace(/\/$/, "");
  if (!base) return null;
  return `${base}/imagem/proxy?url=${encodeURIComponent(absoluteS3Url)}`;
}

function loadFromElementSrc(src, { crossOrigin } = {}) {
  return new Promise((resolve) => {
    const img = new Image();
    if (crossOrigin) img.crossOrigin = crossOrigin;
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function bitmapFromBlob(blob) {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(blob);
    } catch {
      // alguns jpegs do S3 falham no ImageBitmap; Image + blob URL funciona
    }
  }
  // não revogar o object URL: o canvas ainda usa a imagem no drawImage
  return loadFromElementSrc(URL.createObjectURL(blob));
}

function isApiImageProxyUrl(url) {
  return url.includes("/imagem/proxy?") || url.includes("/__s3-image?");
}

async function fetchBlobCors(url) {
  const headers = {};
  // Accept custom só no proxy da API (binaryMediaTypes). Em S3 direto isso
  // força preflight e, com resposta cacheada sem ACAO, o browser bloqueia.
  if (isApiImageProxyUrl(url)) {
    headers.Accept = "image/jpeg,image/png,image/webp,image/gif,application/octet-stream";
  }

  const res = await fetch(url, {
    mode: "cors",
    credentials: "omit",
    cache: "no-store",
    headers,
  });
  if (!res.ok) return null;
  const blob = await res.blob();
  if (blobParecePaginaWeb(blob)) return null;
  return blob;
}

/**
 * Carrega imagem para desenhar em canvas sem contaminar (precisa CORS ou mesma origem).
 * URL S3 pública funciona no CSS, mas o canvas exige ACAO.
 * Em prod: prioriza GET /imagem/proxy (evita CORS intermitente do S3).
 * Em dev: proxy Vite /__s3-image.
 */
export async function loadCanvasImage(src) {
  if (!src) return null;

  if (src.startsWith("data:") || src.startsWith("blob:")) {
    return loadFromElementSrc(src);
  }

  const absolute = new URL(src, window.location.href).href;
  const tentativas = [];

  if (isS3HttpUrl(absolute)) {
    const proxyUrl = buildS3ImageProxyUrl(absolute);
    if (proxyUrl) tentativas.push(proxyUrl);
    // S3 direto só como fallback (CSS ok; fetch costuma falhar por CORS/cache)
    tentativas.push(absolute);
  } else {
    tentativas.push(absolute);
  }

  for (const url of tentativas) {
    try {
      const blob = await fetchBlobCors(url);
      if (!blob) continue;
      const img = await bitmapFromBlob(blob);
      if (img) return img;
    } catch {
      // tenta a próxima origem
    }
  }

  if (/^https?:/i.test(absolute)) {
    const viaImg = await loadFromElementSrc(absolute, { crossOrigin: "anonymous" });
    if (viaImg) return viaImg;
  }

  return null;
}
