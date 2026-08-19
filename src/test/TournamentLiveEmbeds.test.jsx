import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TournamentLiveEmbeds } from "../components/tournament/TournamentLiveEmbeds";

describe("TournamentLiveEmbeds", () => {
  it("renderiza youtube e twitch lado a lado, ambos mutados", () => {
    const { container } = render(
      <TournamentLiveEmbeds
        linkLive="https://youtube.com/watch?v=abc123XYZ"
        twitchParent="localhost"
      />,
    );

    const youtube = screen.getByTitle("Live YouTube");
    const twitch = screen.getByTitle("Live Twitch");

    expect(youtube.getAttribute("src")).toContain("youtube.com/embed/abc123XYZ");
    expect(youtube.getAttribute("src")).toContain("mute=1");
    expect(twitch.getAttribute("src")).toContain("channel=tiagofuguete");
    expect(twitch.getAttribute("src")).toContain("muted=true");
    expect(container.firstChild.className).toContain("md:grid-cols-2");
  });

  it("sem live do youtube mostra so a twitch", () => {
    const { container } = render(
      <TournamentLiveEmbeds twitchParent="localhost" />,
    );

    expect(screen.queryByTitle("Live YouTube")).toBeNull();
    expect(screen.getByTitle("Live Twitch").getAttribute("src")).toContain("channel=tiagofuguete");
    expect(container.firstChild.className).not.toContain("md:grid-cols-2");
  });
});
