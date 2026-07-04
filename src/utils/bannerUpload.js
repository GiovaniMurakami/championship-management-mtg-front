import { obterPresignedUrl, uploadParaS3 } from "../services/backendApi";

export const ACCEPTED_BANNER_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
export const MAX_BANNER_IMAGE_SIZE = 5 * 1024 * 1024;

const UPLOAD_MESSAGES = {
    "invalid-file-type": "Arquivo inválido. Envie uma imagem JPEG, PNG, GIF ou WebP.",
    "file-too-large": "Arquivo acima do limite de 5 MB.",
    "presigned-url-error": "Não foi possível gerar a URL de upload da imagem.",
    "s3-upload-cors": "O navegador bloqueou o envio da imagem para o armazenamento. Verifique sua conexão e tente novamente.",
    "s3-upload-expired": "A URL assinada do upload expirou. Gere um novo upload e tente novamente.",
    "s3-upload-failed": "Falha ao enviar a imagem para o armazenamento.",
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

export async function uploadBannerImage(file, token, onProgress) {
    const validationError = validateBannerImageFile(file);

    if (validationError) {
        throw validationError;
    }

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

function buildRemoteImageFileName(sourceLabel, extension = "jpg") {
    const base = String(sourceLabel || "imagem")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase()
        .slice(0, 60) || "imagem";

    return `${base}.${extension}`;
}

function resolveImageExtension(contentType, imageUrl) {
    if (contentType?.includes("png")) return "png";
    if (contentType?.includes("webp")) return "webp";
    if (contentType?.includes("gif")) return "gif";
    if (imageUrl?.includes(".png")) return "png";
    if (imageUrl?.includes(".webp")) return "webp";
    return "jpg";
}

async function fetchRemoteImageBlob(imageUrl) {
    try {
        const response = await fetch(imageUrl, { mode: "cors" });
        if (response.ok) {
            return response.blob();
        }
    } catch {
        // tenta fallback via canvas abaixo
    }

    return new Promise((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = "anonymous";
        image.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            canvas.getContext("2d")?.drawImage(image, 0, 0);
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                        return;
                    }
                    reject(createUploadError("s3-upload-failed", "Não foi possível processar a imagem remota."));
                },
                "image/jpeg",
                0.92,
            );
        };
        image.onerror = () => {
            reject(createUploadError("s3-upload-failed", "Não foi possível baixar a imagem remota."));
        };
        image.src = imageUrl;
    });
}

export async function uploadImageFromUrl(imageUrl, token, onProgress, sourceLabel = "imagem") {
    const url = String(imageUrl || "").trim();
    if (!url) {
        throw createUploadError("s3-upload-failed", "URL da imagem inválida.");
    }

    onProgress?.(5);
    const blob = await fetchRemoteImageBlob(url);
    onProgress?.(35);

    const contentType = blob.type && blob.type.startsWith("image/")
        ? blob.type
        : "image/jpeg";

    if (!ACCEPTED_BANNER_IMAGE_TYPES.includes(contentType)) {
        throw createUploadError("invalid-file-type");
    }

    if (blob.size > MAX_BANNER_IMAGE_SIZE) {
        throw createUploadError("file-too-large");
    }

    const extension = resolveImageExtension(contentType, url);
    const file = new File(
        [blob],
        buildRemoteImageFileName(sourceLabel, extension),
        { type: contentType },
    );

    return uploadBannerImage(file, token, (progress) => {
        if (typeof onProgress !== "function") return;
        const normalized = 35 + Math.round(progress * 0.65);
        onProgress(Math.min(normalized, 100));
    });
}
