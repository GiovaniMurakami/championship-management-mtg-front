import { useRef, useState } from "react";
import { uploadBannerImage, validateBannerImageFile } from "../../utils/bannerUpload";
import { BTN_SECONDARY } from "../../styles/uiClasses";

export function BlogCoverImageField({
  value,
  onChange,
  token,
  disabled = false,
}) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");

  const previewUrl = value || "";

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !token) return;

    const validationError = validateBannerImageFile(file);
    if (validationError) {
      setError(validationError.userMessage || validationError.message);
      return;
    }

    setError("");
    setUploading(true);
    setUploadProgress(0);

    try {
      const imageUrl = await uploadBannerImage(file, token, setUploadProgress);
      onChange?.(imageUrl);
    } catch (uploadError) {
      setError(uploadError?.userMessage || uploadError?.message || "Falha ao enviar imagem de capa.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className={`${BTN_SECONDARY} text-sm`}
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
        >
          {uploading ? `Enviando capa ${uploadProgress}%` : previewUrl ? "Trocar imagem de capa" : "Enviar imagem de capa"}
        </button>
        {previewUrl ? (
          <button
            type="button"
            className="text-sm font-semibold text-[#f87171] hover:text-[#fca5a5]"
            onClick={() => onChange?.("")}
            disabled={disabled || uploading}
          >
            Remover capa
          </button>
        ) : null}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {previewUrl ? (
        <img
          src={previewUrl}
          alt="Prévia da capa"
          className="max-h-56 w-full rounded-xl object-cover"
        />
      ) : (
        <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-[rgba(217,180,255,0.18)] bg-[rgba(167,79,255,0.05)] text-sm text-[#8f82ad]">
          Nenhuma imagem de capa selecionada
        </div>
      )}

      {error ? <p className="m-0 text-sm text-[#fca5a5]">{error}</p> : null}
    </div>
  );
}
