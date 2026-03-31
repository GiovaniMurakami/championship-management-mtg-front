import { useState } from "react";
import axios from "axios";
import httpClient from "../services/httpClient";
import { AUTH_STORAGE_KEY } from "../constants/auth";

export function useUpload() {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);

    const uploadFile = async (file, uploadType = "general") => {
        setUploading(true);
        setProgress(0);
        setError(null);

        try {
            const payload = {
                fileName: file.name,
                contentType: file.type,
                tipo: uploadType,
            };

            // include Authorization token when requesting presigned URL
            const savedAuth = JSON.parse(window.localStorage.getItem(AUTH_STORAGE_KEY) || "{}");
            const token = savedAuth.token;

            const data = await httpClient.post("/upload/presigned-url", payload, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);

            const uploadUrl = data?.uploadUrl || data?.url || data?.upload_url;
            const fileUrl = data?.fileUrl || data?.file_url || data?.publicUrl || data?.public_url;

            if (!uploadUrl) throw new Error("No upload URL returned from server");

            await axios.put(uploadUrl, file, {
                headers: { "Content-Type": file.type },
                onUploadProgress: (evt) => {
                    if (evt.total) setProgress(Math.round((evt.loaded * 100) / evt.total));
                },
            });

            setProgress(100);
            setUploading(false);

            // If server returned a public file URL use it, otherwise derive from uploadUrl
            const finalUrl = fileUrl || uploadUrl.split("?")[0];
            return { fileUrl: finalUrl };
        } catch (err) {
            setError(err?.message || "Upload failed");
            setUploading(false);
            throw err;
        }
    };

    return { uploadFile, uploading, progress, error, setError, setProgress };
}
