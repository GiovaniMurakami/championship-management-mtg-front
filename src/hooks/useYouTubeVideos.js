import { useState, useEffect } from "react";

// Fallback: usado quando VITE_YOUTUBE_API_KEY / VITE_YOUTUBE_CHANNEL_ID não estão configurados
const FALLBACK_VIDEOS = [
    { id: "VXm317-GQ40", title: "[PAUPER] White Weenie VS Rakdos Madness - Fuguete League 268" },
    { id: "7qaPRoWEPi0", title: "[PAUPER] BW GlintBlade VS Rakdos Madness - Pauper Royale 285" },
    { id: "mLOEL6uW3WQ", title: "[PAUPER] Fog Tron VS Hot Dog - Fuguete Champ 284 (FINAL)" },
    { id: "ZVxvEowYqrs", title: "[PAUPER] Fog Tron VS BG Pestilencia - Fuguete Champ 284" },
    { id: "fjXPiBiwnG8", title: "[PAUPER] White Weenie VS Mono Red Rally - Tropical Pauper 276 (FINAL)" },
    { id: "JbGKPM49KVk", title: "[PAUPER] UW Familiar VS Mono U Terror - Tropical Pauper 276" },
];

/**
 * Busca os vídeos mais recentes do canal no YouTube Data API v3.
 *
 * Configuração via variáveis de ambiente Vite:
 *   VITE_YOUTUBE_CHANNEL_ID  — ID do canal (ex: UCxxxxxxxxxxxxxxxxxxxxxxxx)
 *   VITE_YOUTUBE_API_KEY     — Chave da API do Google Cloud (restringida ao domínio)
 *
 * Se qualquer uma estiver ausente, retorna os vídeos hardcoded como fallback.
 */
export function useYouTubeVideos(maxResults = 6) {
    const channelId = import.meta.env.VITE_YOUTUBE_CHANNEL_ID;
    const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

    const [videos, setVideos] = useState(FALLBACK_VIDEOS.slice(0, maxResults));
    // Inicia como true apenas quando temos config — evita setState síncrono no effect
    const [loading, setLoading] = useState(!!(channelId && apiKey));

    useEffect(() => {
        if (!channelId || !apiKey) return;

        const ctrl = new AbortController();
        fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${encodeURIComponent(channelId)}&maxResults=${maxResults}&order=date&type=video&key=${encodeURIComponent(apiKey)}`,
            { signal: ctrl.signal },
        )
            .then((r) => {
                if (!r.ok) throw new Error(`YouTube API ${r.status}`);
                return r.json();
            })
            .then((data) => {
                if (data.items?.length) {
                    setVideos(
                        data.items.map((item) => ({
                            id: item.id.videoId,
                            title: item.snippet.title,
                            thumbnail: item.snippet.thumbnails?.high?.url ?? null,
                        })),
                    );
                }
            })
            .catch(() => {
                /* silently keep fallback */
            })
            .finally(() => setLoading(false));

        return () => ctrl.abort();
    }, [channelId, apiKey, maxResults]);

    return { videos, loading };
}
