import { getLiveEmbeds } from "../../utils/liveEmbeds";

const IFRAME_CLASS = "block w-full h-full border-none";
const FRAME_WRAP = "aspect-video min-h-[180px]";

export function TournamentLiveEmbeds({
  linkLive,
  twitchParent = typeof window !== "undefined" ? window.location.hostname : "localhost",
}) {
  const { youtubeSrc, twitchSrc } = getLiveEmbeds(linkLive, { twitchParent });
  if (!youtubeSrc && !twitchSrc) return null;

  const both = Boolean(youtubeSrc && twitchSrc);

  return (
    <div
      className={`w-full bg-black border-b-2 border-[rgba(145,71,255,0.4)] overflow-hidden mt-2 ${
        both ? "grid grid-cols-1 md:grid-cols-2" : ""
      }`}
    >
      {youtubeSrc && (
        <div className={FRAME_WRAP}>
          <iframe
            src={youtubeSrc}
            title="Live YouTube"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className={IFRAME_CLASS}
          />
        </div>
      )}
      {twitchSrc && (
        <div className={FRAME_WRAP}>
          <iframe
            src={twitchSrc}
            title="Live Twitch"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className={IFRAME_CLASS}
          />
        </div>
      )}
    </div>
  );
}
