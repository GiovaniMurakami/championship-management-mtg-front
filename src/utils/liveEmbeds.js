export const DEFAULT_TWITCH_CHANNEL = "tiagofuguete";

const YOUTUBE_ID_RE = /(?:youtube\.com\/(?:watch\?v=|embed\/|live\/)|youtu\.be\/)([\w-]+)/i;
const TWITCH_CHANNEL_RE = /(?:twitch\.tv\/)([\w]+)/i;
const TWITCH_RESERVED = new Set(["videos", "directory", "downloads", "p", "settings"]);

export function parseYouTubeVideoId(url) {
  if (!url) return null;
  return url.match(YOUTUBE_ID_RE)?.[1] ?? null;
}

export function parseTwitchChannel(url) {
  if (!url) return null;
  const channel = url.match(TWITCH_CHANNEL_RE)?.[1];
  if (!channel || TWITCH_RESERVED.has(channel.toLowerCase())) return null;
  return channel;
}

export function getLiveEmbeds(linkLive, {
  twitchParent = "localhost",
  youtubeOrigin,
} = {}) {
  const youtubeVideoId = parseYouTubeVideoId(linkLive);
  const twitchFromLink = parseTwitchChannel(linkLive);

  const youtubeSrc = youtubeVideoId
    ? (() => {
        const params = new URLSearchParams({ autoplay: "1", mute: "1" });
        if (youtubeOrigin) params.set("origin", youtubeOrigin);
        return `https://www.youtube.com/embed/${youtubeVideoId}?${params.toString()}`;
      })()
    : null;

  const twitchChannel = twitchFromLink || DEFAULT_TWITCH_CHANNEL;
  const twitchSrc = `https://player.twitch.tv/?channel=${encodeURIComponent(twitchChannel)}&parent=${encodeURIComponent(twitchParent)}&muted=true`;

  return { youtubeSrc, twitchSrc };
}
