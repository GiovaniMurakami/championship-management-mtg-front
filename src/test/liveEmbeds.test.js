import { describe, expect, it } from "vitest";
import { getLiveEmbeds } from "../utils/liveEmbeds";

describe("getLiveEmbeds", () => {
  it("mostra youtube do linkLive e twitch padrao, ambos mutados", () => {
    const result = getLiveEmbeds("https://youtube.com/watch?v=abc123XYZ", {
      twitchParent: "localhost",
    });

    expect(result.youtubeSrc).toContain("youtube.com/embed/abc123XYZ");
    expect(result.youtubeSrc).toContain("mute=1");
    expect(result.twitchSrc).toContain("channel=tiagofuguete");
    expect(result.twitchSrc).toContain("muted=true");
    expect(result.twitchSrc).toContain("parent=localhost");
  });

  it("aceita url youtube.com/live e youtu.be", () => {
    expect(getLiveEmbeds("https://youtube.com/live/liveId99", { twitchParent: "app.test" }).youtubeSrc)
      .toContain("embed/liveId99");
    expect(getLiveEmbeds("https://youtu.be/shortId01", { twitchParent: "app.test" }).youtubeSrc)
      .toContain("embed/shortId01");
  });

  it("usa canal twitch do linkLive quando nao ha youtube", () => {
    const result = getLiveEmbeds("https://twitch.tv/outrocanal", {
      twitchParent: "app.example.com",
    });

    expect(result.youtubeSrc).toBeNull();
    expect(result.twitchSrc).toContain("channel=outrocanal");
    expect(result.twitchSrc).toContain("parent=app.example.com");
    expect(result.twitchSrc).toContain("muted=true");
  });

  it("sem live do youtube nao inclui o player do youtube", () => {
    const result = getLiveEmbeds("", {
      twitchParent: "localhost",
    });

    expect(result.youtubeSrc).toBeNull();
    expect(result.twitchSrc).toContain("channel=tiagofuguete");
  });
});
