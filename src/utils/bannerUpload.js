import { obterPresignedUrl, uploadParaS3 } from "../services/backendApi";

export const ACCEPTED_BANNER_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
export const MAX_BANNER_IMAGE_SIZE = 5 * 1024 * 1024;

/** Dimensão alvo para preview Open Graph (WhatsApp/Facebook/etc.). */
export const OG_BANNER_MAX_WIDTH = 1200;
export const OG_BANNER_MAX_HEIGHT = 630;
/** WhatsApp costuma dropar imagens acima de ~300–600 KB. */
export const OG_BANNER_TARGET_BYTES = 300 * 1024;
export const OG_BANNER_MIN_QUALITY = 0.45;
export const OG_BANNER_INITIAL_QUALITY = 0.82;

const UPLOAD_MESSAGES = {
    "invalid-file-type": "Arquivo inválido. Envie uma imagem JPEG, PNG, GIF ou WebP.",
    "file-too-large": "Arquivo acima do limite de 5 MB.",
    "presigned-url-error": "Não foi possível gerar a URL de upload da imagem.",
    "s3-upload-cors": "O navegador bloqueou o envio da imagem para o armazenamento. Verifique sua conexão e tente novamente.",
    "s3-upload-expired": "A URL assinada do upload expirou. Gere um novo upload e tente novamente.",
    "s3-upload-failed": "Falha ao enviar a imagem para o armazenamento.",
    "optimize-failed": "Não foi possível otimizar a imagem para compartilhamento. Tente outro arquivo.",
};

const createUploadError = (code, fallbackMessage, extra = {}) => {
    const error = new Error(fallbackMessage || UPLOAD_MESSAGES[code] || "Falha ao enviar imagem.");
    error.code = code;
    error.userMessage = UPLOAD_MESSAGES[code] || fallbackMessage || error.message;
    return Object.assign(error, extra);
};

export function validateBannerImageFile(file) {
    if (!file) {
        return null;
    }

    if (!ACCEPTED_BANNER_IMAGE_TYPES.includes(file.type)) {
        return createUploadError("invalid-file-type");
    }

    if (file.size > MAX_BANNER_IMAGE_SIZE) {
        return createUploadError("file-too-large");
    }

    return null;
}

/**
 * Calcula dimensões que cabem em maxW×maxH sem esticar.
 */
export function calcularDimensoesOg(width, height, maxW = OG_BANNER_MAX_WIDTH, maxH = OG_BANNER_MAX_HEIGHT) {
    const w = Number(width) || 0;
    const h = Number(height) || 0;
    if (w <= 0 || h <= 0) {
        return { width: maxW, height: maxH };
    }
    const scale = Math.min(1, maxW / w, maxH / h);
    return {
        width: Math.max(1, Math.round(w * scale)),
        height: Math.max(1, Math.round(h * scale)),
    };
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
 * Redimensiona e comprime para JPEG adequado a og:image (share em redes sociais).
 * Se a otimização falhar, devolve o arquivo original (upload ainda funciona).
 */
export async function otimizarBannerParaUpload(file) {
    if (!file || typeof document === "undefined") {
        return file;
    }

    // Já é JPEG pequeno o bastante — evita reprocessar desnecessariamente.
    if (file.type === "image/jpeg" && file.size <= OG_BANNER_TARGET_BYTES) {
        return file;
    }

    try {
        const img = await loadImageElement(file);
        const { width, height } = calcularDimensoesOg(img.naturalWidth || img.width, img.naturalHeight || img.height);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            return file;
        }

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        let quality = OG_BANNER_INITIAL_QUALITY;
        let blob = await canvasToBlob(canvas, "image/jpeg", quality);

        while (blob.size > OG_BANNER_TARGET_BYTES && quality > OG_BANNER_MIN_QUALITY) {
            quality = Math.max(OG_BANNER_MIN_QUALITY, quality - 0.1);
            blob = await canvasToBlob(canvas, "image/jpeg", quality);
        }

        const baseName = String(file.name || "banner").replace(/\.[^.]+$/, "") || "banner";
        return new File([blob], `${baseName}.jpg`, {
            type: "image/jpeg",
            lastModified: Date.now(),
        });
    } catch {
        return file;
    }
}

function normalizeUploadError(error, stage) {
    if (error?.code && UPLOAD_MESSAGES[error.code]) {
        error.userMessage = error.userMessage || UPLOAD_MESSAGES[error.code];
        return error;
    }

    const status = Number(error?.status || error?.response?.status || error?.s3Status || 0);
    const rawMessage = String(error?.message || "");
    const message = rawMessage.toLowerCase();

    if (status === 413 || message.includes("5 mb") || message.includes("muito grande") || message.includes("tamanho") || message.includes("size")) {
        return createUploadError("file-too-large", rawMessage, { cause: error, status });
    }

    if (status === 415 || message.includes("formato") || message.includes("content-type") || message.includes("mime") || message.includes("tipo de arquivo")) {
        return createUploadError("invalid-file-type", rawMessage, { cause: error, status });
    }

    if (stage === "presign") {
        return createUploadError("presigned-url-error", rawMessage, { cause: error, status });
    }

    return createUploadError("s3-upload-failed", rawMessage, { cause: error, status });
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

export async function uploadBannerImage(file, token, onProgress, options = {}) {
    const { optimize = true } = options;
    const validationError = validateBannerImageFile(file);

    if (validationError) {
        throw validationError;
    }

    const fileParaUpload = optimize ? await otimizarBannerParaUpload(file) : file;
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

/** Upload de fundo do story Top 8 (mantém proporção; sem crop OG 1200×630). */
export async function uploadStoryFundoImage(file, token, onProgress) {
    return uploadBannerImage(file, token, onProgress, { optimize: false });
}
