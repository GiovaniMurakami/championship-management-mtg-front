import React, { useState, useRef, useEffect } from "react";
import { useUpload } from "../../hooks";

export function ImageUploader({ value, onChange, uploadType = "general", accept = "image/*", label = "Imagem" }) {
    const { uploadFile, uploading, progress, error } = useUpload();
    const [localPreview, setLocalPreview] = useState(null);
    const inputRef = useRef(null);

    useEffect(() => {
        return () => {
            if (localPreview) URL.revokeObjectURL(localPreview);
        };
    }, [localPreview]);

    const handleFile = async (file) => {
        if (!file) return;
        const preview = URL.createObjectURL(file);
        setLocalPreview(preview);
        try {
            const { fileUrl } = await uploadFile(file, uploadType);
            if (onChange) onChange(fileUrl);
        } catch (err) {
            // already handled in hook; keep local preview so user can retry
            console.error(err);
        }
    };

    const onInputChange = (e) => {
        const f = e.target.files && e.target.files[0];
        handleFile(f);
    };

    const onDrop = (e) => {
        e.preventDefault();
        const f = e.dataTransfer?.files?.[0];
        handleFile(f);
    };

    const openFile = () => inputRef.current?.click();

    const previewSrc = localPreview || value || null;

    return (
        <label className="grid gap-2">
            <span className="text-[#beafd7] text-[0.95rem]">{label}</span>
            <div
                onClick={openFile}
                onDrop={onDrop}
                onDragOver={(e) => e.preventDefault()}
                className="flex items-center justify-center w-full h-28 border rounded-lg cursor-pointer bg-white/[0.02] border-[rgba(217,180,255,0.12)] overflow-hidden"
            >
                {previewSrc ? (
                    <img src={previewSrc} alt="preview" className="object-contain w-full h-full" />
                ) : (
                    <div className="text-center text-sm text-[#beafd7]">Arraste ou clique para enviar</div>
                )}
            </div>
            <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={onInputChange} />
            {uploading && (
                <div className="text-sm text-[#beafd7]">Enviando... {progress}%</div>
            )}
            {error && (
                <div className="text-sm text-red-400">Erro no upload: {error}</div>
            )}
        </label>
    );
}

export default ImageUploader;
