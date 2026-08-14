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

function loadFromElementSrc(src) {
  return new Promise((resolve) => {
    const img = new Image();
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

async function fetchBlobCors(url) {
  const res = await fetch(url, { mode: "cors", credentials: "omit" });
  if (!res.ok) return null;
  const blob = await res.blob();
  if (blobParecePaginaWeb(blob)) return null;
  return blob;
}

/**
 * Carrega imagem para desenhar em canvas sem contaminar (precisa CORS ou mesma origem).
 * URL S3 pública funciona no CSS, mas o canvas exige ACAO — em dev cai no proxy Vite.
 */
export async function loadCanvasImage(src) {
  if (!src) return null;

  if (src.startsWith("data:") || src.startsWith("blob:")) {
    return loadFromElementSrc(src);
  }

  const absolute = new URL(src, window.location.href).href;
  const tentativas = [absolute];
  if (import.meta.env.DEV && isS3HttpUrl(absolute)) {
    tentativas.push(`/__s3-image?url=${encodeURIComponent(absolute)}`);
  }

  for (const url of tentativas) {
    try {
      const blob = await fetchBlobCors(url);
      if (!blob) continue;
      const img = await bitmapFromBlob(blob);
      if (img) return img;
    } catch {
      // tenta a próxima origem (proxy local)
    }
  }

  return null;
}
