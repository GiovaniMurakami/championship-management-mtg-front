import { cadastrarFotoGaleria, obterPresignedUrl, uploadParaS3 } from "../services/backendApi";

/** Concorrência padrão: paralelo sem saturar o navegador (limite típico ~6 por host). */
export const GALERIA_UPLOAD_CONCURRENCY = 10;

export const ACCEPTED_GALERIA_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
export const MAX_GALERIA_IMAGE_SIZE = 8 * 1024 * 1024;
export const GALERIA_MAX_EDGE = 2560;
export const GALERIA_TARGET_BYTES = 1.5 * 1024 * 1024;
export const GALERIA_INITIAL_QUALITY = 0.84;
export const GALERIA_MIN_QUALITY = 0.55;

const UPLOAD_MESSAGES = {
  "invalid-file-type": "Arquivo inválido. Envie uma imagem JPEG, PNG, GIF ou WebP.",
  "file-too-large": "Arquivo acima do limite de 8 MB.",
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

/**
 * Converte a imagem para WebP, redimensionando o maior lado até GALERIA_MAX_EDGE.
 */
export async function otimizarFotoGaleriaParaWebp(file) {
  if (!file || typeof document === "undefined") {
    throw createUploadError("optimize-failed");
  }

  const img = await loadImageElement(file);
  const srcW = img.naturalWidth || img.width;
  const srcH = img.naturalHeight || img.height;
  if (!srcW || !srcH) {
    throw createUploadError("optimize-failed");
  }

  const scale = Math.min(1, GALERIA_MAX_EDGE / Math.max(srcW, srcH));
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

  let quality = GALERIA_INITIAL_QUALITY;
  let blob = await canvasToBlob(canvas, "image/webp", quality);

  while (blob.size > GALERIA_TARGET_BYTES && quality > GALERIA_MIN_QUALITY) {
    quality = Math.max(GALERIA_MIN_QUALITY, quality - 0.08);
    blob = await canvasToBlob(canvas, "image/webp", quality);
  }

  if (blob.size > MAX_GALERIA_IMAGE_SIZE) {
    throw createUploadError("file-too-large");
  }

  const baseName = String(file.name || "foto").replace(/\.[^.]+$/, "") || "foto";
  return new File([blob], `${baseName}.webp`, {
    type: "image/webp",
    lastModified: Date.now(),
  });
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

/**
 * Otimiza para WebP e envia ao S3. Retorna a URL pública.
 */
export async function uploadFotoGaleria(file, token, onProgress) {
  const validationError = validateGaleriaImageFile(file);
  if (validationError) throw validationError;

  const fileParaUpload = await otimizarFotoGaleriaParaWebp(file);
  const initialUpload = await requestPresignedUrl(fileParaUpload, token);

  try {
    await uploadParaS3(initialUpload.uploadUrl, fileParaUpload, onProgress);
    return initialUpload.urlPublica;
  } catch (error) {
    if (error?.code === "s3-upload-expired") {
      const retryUpload = await requestPresignedUrl(fileParaUpload, token);
      await uploadParaS3(retryUpload.uploadUrl, fileParaUpload, onProgress);
      return retryUpload.urlPublica;
    }
    throw normalizeUploadError(error, "upload");
  }
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
      const url = await uploadFotoGaleria(arquivo, token);
      const titulo = String(arquivo.name || "").replace(/\.[^.]+$/, "").slice(0, 200);
      await cadastrarFotoGaleria({ url, titulo }, token);
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
