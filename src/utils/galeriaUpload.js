import { cadastrarFotoGaleria, obterPresignedUrl, uploadParaS3 } from "../services/backendApi";

/** Concorrência padrão: paralelo sem saturar o navegador (limite típico ~6 por host). */
export const GALERIA_UPLOAD_CONCURRENCY = 10;

export const ACCEPTED_GALERIA_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
/** Teto do arquivo original (admin); o envio ao S3 usa a versão otimizada em WebP. */
export const MAX_GALERIA_IMAGE_SIZE = 50 * 1024 * 1024;
/** Limite do arquivo otimizado (alinhado ao teto admin da API). */
export const MAX_GALERIA_UPLOAD_BYTES = 25 * 1024 * 1024;

export const GALERIA_FULL_MAX_EDGE = 2560;
export const GALERIA_FULL_TARGET_BYTES = 1.5 * 1024 * 1024;
export const GALERIA_FULL_INITIAL_QUALITY = 0.84;
export const GALERIA_FULL_MIN_QUALITY = 0.55;

export const GALERIA_THUMB_MAX_EDGE = 560;
export const GALERIA_THUMB_TARGET_BYTES = 80 * 1024;
export const GALERIA_THUMB_INITIAL_QUALITY = 0.78;
export const GALERIA_THUMB_MIN_QUALITY = 0.5;

/** @deprecated use GALERIA_FULL_* */
export const GALERIA_MAX_EDGE = GALERIA_FULL_MAX_EDGE;
/** @deprecated use GALERIA_FULL_* */
export const GALERIA_TARGET_BYTES = GALERIA_FULL_TARGET_BYTES;
/** @deprecated use GALERIA_FULL_* */
export const GALERIA_INITIAL_QUALITY = GALERIA_FULL_INITIAL_QUALITY;
/** @deprecated use GALERIA_FULL_* */
export const GALERIA_MIN_QUALITY = GALERIA_FULL_MIN_QUALITY;

const UPLOAD_MESSAGES = {
  "invalid-file-type": "Arquivo inválido. Envie uma imagem JPEG, PNG, GIF ou WebP.",
  "file-too-large": "Arquivo acima do limite de 50 MB.",
  "presigned-url-error": "Não foi possível gerar a URL de upload da imagem.",
  "s3-upload-cors": "O navegador bloqueou o envio da imagem. Verifique sua conexão e tente novamente.",
  "s3-upload-expired": "A URL assinada do upload expirou. Tente novamente.",
  "s3-upload-failed": "Falha ao enviar a imagem para o armazenamento.",
  "optimize-failed": "Não foi possível converter a imagem para WebP. Tente outro arquivo.",
};

const createUploadError = (code, fallbackMessage, extra = {}) => {
  const error = new Error(fallbackMessage || UPLOAD_MESSAGES[code] || "Falha ao enviar imagem.");
  error.code = code;
  error.userMessage = UPLOAD_MESSAGES[code] || fallbackMessage || error.message;
  return Object.assign(error, extra);
};

export function validateGaleriaImageFile(file) {
  if (!file) return null;
  if (!ACCEPTED_GALERIA_IMAGE_TYPES.includes(file.type)) {
    return createUploadError("invalid-file-type");
  }
  if (file.size > MAX_GALERIA_IMAGE_SIZE) {
    return createUploadError("file-too-large");
  }
  return null;
}

function loadImageElement(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(createUploadError("optimize-failed"));
    };
    img.src = url;
  });
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(createUploadError("optimize-failed"));
          return;
        }
        resolve(blob);
      },
      type,
      quality,
    );
  });
}

async function encodeWebpFromImage(img, { maxEdge, targetBytes, initialQuality, minQuality, suffix }) {
  const srcW = img.naturalWidth || img.width;
  const srcH = img.naturalHeight || img.height;
  if (!srcW || !srcH) {
    throw createUploadError("optimize-failed");
  }

  const scale = Math.min(1, maxEdge / Math.max(srcW, srcH));
  const width = Math.max(1, Math.round(srcW * scale));
  const height = Math.max(1, Math.round(srcH * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw createUploadError("optimize-failed");
  }
  ctx.drawImage(img, 0, 0, width, height);

  let quality = initialQuality;
  let blob = await canvasToBlob(canvas, "image/webp", quality);

  while (blob.size > targetBytes && quality > minQuality) {
    quality = Math.max(minQuality, quality - 0.08);
    blob = await canvasToBlob(canvas, "image/webp", quality);
  }

  if (blob.size > MAX_GALERIA_UPLOAD_BYTES) {
    throw createUploadError(
      "file-too-large",
      "A imagem otimizada ainda excede o limite permitido. Tente outra foto.",
    );
  }

  const baseName = String(img.__sourceName || "foto").replace(/\.[^.]+$/, "") || "foto";
  return new File([blob], `${baseName}${suffix}.webp`, {
    type: "image/webp",
    lastModified: Date.now(),
  });
}

/**
 * Gera full (até 2560px) e thumb (até 560px) em WebP a partir do arquivo original.
 * @returns {Promise<{ full: File, thumb: File }>}
 */
export async function otimizarFotoGaleriaParaWebp(file) {
  if (!file || typeof document === "undefined") {
    throw createUploadError("optimize-failed");
  }

  const img = await loadImageElement(file);
  img.__sourceName = file.name || "foto";

  const [full, thumb] = await Promise.all([
    encodeWebpFromImage(img, {
      maxEdge: GALERIA_FULL_MAX_EDGE,
      targetBytes: GALERIA_FULL_TARGET_BYTES,
      initialQuality: GALERIA_FULL_INITIAL_QUALITY,
      minQuality: GALERIA_FULL_MIN_QUALITY,
      suffix: "",
    }),
    encodeWebpFromImage(img, {
      maxEdge: GALERIA_THUMB_MAX_EDGE,
      targetBytes: GALERIA_THUMB_TARGET_BYTES,
      initialQuality: GALERIA_THUMB_INITIAL_QUALITY,
      minQuality: GALERIA_THUMB_MIN_QUALITY,
      suffix: "-thumb",
    }),
  ]);

  return { full, thumb };
}

function normalizeUploadError(error, stage) {
  if (error?.code && UPLOAD_MESSAGES[error.code]) {
    error.userMessage = error.userMessage || UPLOAD_MESSAGES[error.code];
    return error;
  }
  if (stage === "presign") {
    return createUploadError("presigned-url-error", error?.message, { cause: error });
  }
  return createUploadError("s3-upload-failed", error?.message, { cause: error });
}

async function requestPresignedUrl(file, token) {
  try {
    const response = await obterPresignedUrl(
      { contentType: file.type, tamanhoBytes: file.size },
      token,
    );
    const data = response?.data ?? response;
    if (!data?.uploadUrl || !data?.urlPublica) {
      throw createUploadError("presigned-url-error");
    }
    return data;
  } catch (error) {
    throw normalizeUploadError(error, "presign");
  }
}

async function uploadArquivoS3(file, token, onProgress) {
  const initialUpload = await requestPresignedUrl(file, token);
  try {
    await uploadParaS3(initialUpload.uploadUrl, file, onProgress);
    return initialUpload.urlPublica;
  } catch (error) {
    if (error?.code === "s3-upload-expired") {
      const retryUpload = await requestPresignedUrl(file, token);
      await uploadParaS3(retryUpload.uploadUrl, file, onProgress);
      return retryUpload.urlPublica;
    }
    throw normalizeUploadError(error, "upload");
  }
}

/**
 * Otimiza full+thumb e envia ao S3. Retorna as URLs públicas.
 * @returns {Promise<{ url: string, urlThumb: string }>}
 */
export async function uploadFotoGaleria(file, token, onProgress) {
  const validationError = validateGaleriaImageFile(file);
  if (validationError) throw validationError;

  const { full, thumb } = await otimizarFotoGaleriaParaWebp(file);
  const [url, urlThumb] = await Promise.all([
    uploadArquivoS3(full, token, onProgress),
    uploadArquivoS3(thumb, token),
  ]);
  return { url, urlThumb };
}

async function mapWithConcurrency(items, concurrency, worker) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function runWorker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await worker(items[index], index);
    }
  }

  const poolSize = Math.max(1, Math.min(concurrency, items.length || 1));
  await Promise.all(Array.from({ length: poolSize }, () => runWorker()));
  return results;
}

/**
 * Valida, otimiza, sobe e cadastra várias fotos em paralelo.
 * @param {File[]} files
 * @param {string} token
 * @param {{ concurrency?: number, onProgress?: (done: number, total: number) => void }} [options]
 * @returns {Promise<{ enviadas: number, falhas: Array<{ nome: string, erro: Error }> }>}
 */
export async function uploadFotosGaleriaEmLote(files, token, options = {}) {
  const lista = Array.from(files || []);
  const total = lista.length;
  const concurrency = options.concurrency ?? GALERIA_UPLOAD_CONCURRENCY;
  const onProgress = options.onProgress;

  for (const arquivo of lista) {
    const erro = validateGaleriaImageFile(arquivo);
    if (erro) throw erro;
  }

  let concluidas = 0;
  const falhas = [];

  await mapWithConcurrency(lista, concurrency, async (arquivo) => {
    try {
      const { url, urlThumb } = await uploadFotoGaleria(arquivo, token);
      const titulo = String(arquivo.name || "").replace(/\.[^.]+$/, "").slice(0, 200);
      await cadastrarFotoGaleria({ url, urlThumb, titulo }, token);
    } catch (error) {
      falhas.push({
        nome: arquivo.name || "foto",
        erro: error instanceof Error ? error : new Error(String(error?.message || error)),
      });
    } finally {
      concluidas += 1;
      onProgress?.(concluidas, total);
    }
  });

  return { enviadas: total - falhas.length, falhas };
}
