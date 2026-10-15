import { obterPresignedUrl, uploadParaS3 } from "../services/backendApi";

export const ACCEPTED_BANNER_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
/** Limite do arquivo original para usuário comum. */
export const MAX_BANNER_IMAGE_SIZE = 5 * 1024 * 1024;
/**
 * Teto de segurança no navegador para admin (originais grandes).
 * O arquivo enviado ao S3 continua otimizado e bem menor.
 */
export const MAX_BANNER_IMAGE_SIZE_ADMIN = 50 * 1024 * 1024;

/** Dimensão alvo para preview Open Graph (WhatsApp/Facebook/etc.). */
export const OG_BANNER_MAX_WIDTH = 1200;
export const OG_BANNER_MAX_HEIGHT = 630;
/** WhatsApp costuma dropar imagens acima de ~300–600 KB. */
export const OG_BANNER_TARGET_BYTES = 300 * 1024;
export const OG_BANNER_MIN_QUALITY = 0.45;
export const OG_BANNER_INITIAL_QUALITY = 0.82;

/** Perfil “foto” (posts/story/admin): mais resolução, ainda comprimida. */
export const FOTO_MAX_EDGE = 2560;
export const FOTO_TARGET_BYTES = 1.5 * 1024 * 1024;
export const FOTO_MIN_QUALITY = 0.55;
export const FOTO_INITIAL_QUALITY = 0.84;

const UPLOAD_MESSAGES = {
    "invalid-file-type": "Arquivo inválido. Envie uma imagem JPEG, PNG, GIF ou WebP.",
    "file-too-large": "Arquivo acima do limite de 5 MB.",
    "file-too-large-admin": "Arquivo acima do limite de 50 MB.",
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

export function validateBannerImageFile(file, options = {}) {
    const { isAdmin = false } = options;
    if (!file) {
        return null;
    }

    if (!ACCEPTED_BANNER_IMAGE_TYPES.includes(file.type)) {
        return createUploadError("invalid-file-type");
    }

    const maxBytes = isAdmin ? MAX_BANNER_IMAGE_SIZE_ADMIN : MAX_BANNER_IMAGE_SIZE;
    if (file.size > maxBytes) {
        return createUploadError(isAdmin ? "file-too-large-admin" : "file-too-large");
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
 * Redimensiona e comprime para JPEG.
 * - perfil padrão / crop: adequado a og:image
 * - perfil `foto`: maior lado até FOTO_MAX_EDGE, alvo ~1.5 MB
 * Se a otimização falhar, devolve o arquivo original (upload ainda funciona se couber no limite).
 */
export async function otimizarBannerParaUpload(file, options = {}) {
    if (!file || typeof document === "undefined") {
        return file;
    }

    const {
        crop = false,
        profile = "og",
        targetWidth = profile === "foto" ? FOTO_MAX_EDGE : OG_BANNER_MAX_WIDTH,
        targetHeight = profile === "foto" ? FOTO_MAX_EDGE : OG_BANNER_MAX_HEIGHT,
        targetBytes = profile === "foto" ? FOTO_TARGET_BYTES : OG_BANNER_TARGET_BYTES,
        minQuality = profile === "foto" ? FOTO_MIN_QUALITY : OG_BANNER_MIN_QUALITY,
        initialQuality = profile === "foto" ? FOTO_INITIAL_QUALITY : OG_BANNER_INITIAL_QUALITY,
    } = options;

    // Já é JPEG pequeno o bastante — evita reprocessar desnecessariamente (exceto crop).
    if (!crop && file.type === "image/jpeg" && file.size <= targetBytes) {
        return file;
    }

    try {
        const img = await loadImageElement(file);
        const srcW = img.naturalWidth || img.width;
        const srcH = img.naturalHeight || img.height;

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            return file;
        }

        if (crop) {
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const scale = Math.max(targetWidth / srcW, targetHeight / srcH);
            const drawW = srcW * scale;
            const drawH = srcH * scale;
            const dx = (targetWidth - drawW) / 2;
            const dy = (targetHeight - drawH) / 2;
            ctx.fillStyle = "#0e091c";
            ctx.fillRect(0, 0, targetWidth, targetHeight);
            ctx.drawImage(img, dx, dy, drawW, drawH);
        } else if (profile === "foto") {
            const scale = Math.min(1, targetWidth / Math.max(srcW, srcH), targetHeight / Math.max(srcW, srcH));
            const width = Math.max(1, Math.round(srcW * scale));
            const height = Math.max(1, Math.round(srcH * scale));
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
        } else {
            const { width, height } = calcularDimensoesOg(srcW, srcH, targetWidth, targetHeight);
            canvas.width = width;
            canvas.height = height;
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
        }

        let quality = initialQuality;
        let blob = await canvasToBlob(canvas, "image/jpeg", quality);

        while (blob.size > targetBytes && quality > minQuality) {
            quality = Math.max(minQuality, quality - 0.1);
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

    if (status === 413 || message.includes("mb") || message.includes("muito grande") || message.includes("tamanho") || message.includes("size")) {
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
    const {
        optimize = true,
        crop = false,
        targetWidth,
        targetHeight,
        profile,
        isAdmin = false,
    } = options;
    const validationError = validateBannerImageFile(file, { isAdmin });

    if (validationError) {
        throw validationError;
    }

    // Admin com arquivo grande: sempre otimiza (mesmo se o caller passou optimize:false).
    const precisaOtimizarPorTamanho = isAdmin && file.size > MAX_BANNER_IMAGE_SIZE;
    const deveOtimizar = optimize || precisaOtimizarPorTamanho;
    const perfilEfetivo = profile || (precisaOtimizarPorTamanho && !crop ? "foto" : "og");

    const fileParaUpload = deveOtimizar
        ? await otimizarBannerParaUpload(file, {
            crop,
            profile: perfilEfetivo,
            targetWidth,
            targetHeight,
        })
        : file;

    const limitePosOtimizacao = isAdmin ? MAX_BANNER_IMAGE_SIZE_ADMIN : MAX_BANNER_IMAGE_SIZE;
    // API admin aceita até 25 MB; usuários 5 MB.
    const limiteApi = isAdmin ? 25 * 1024 * 1024 : MAX_BANNER_IMAGE_SIZE;
    if (fileParaUpload.size > Math.min(limitePosOtimizacao, limiteApi)) {
        throw createUploadError(
            isAdmin ? "file-too-large-admin" : "file-too-large",
            "A imagem otimizada ainda excede o limite permitido. Tente outra foto.",
        );
    }

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

/** Upload de fundo do story Top 8 (mantém proporção; perfil foto quando admin/grande). */
export async function uploadStoryFundoImage(file, token, onProgress, options = {}) {
    const { isAdmin = false } = options;
    return uploadBannerImage(file, token, onProgress, {
        optimize: true,
        profile: "foto",
        isAdmin,
    });
}
