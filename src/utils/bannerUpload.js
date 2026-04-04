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
