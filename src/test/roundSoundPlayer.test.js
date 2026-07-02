import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { playRoundSound, stopRoundSound } from "../utils/roundSoundPlayer";

describe("roundSoundPlayer", () => {
  beforeEach(() => {
    stopRoundSound();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    stopRoundSound();
  });

  it("ignora url vazia", async () => {
    await expect(playRoundSound("")).resolves.toBe(false);
    await expect(playRoundSound("   ")).resolves.toBe(false);
  });

  it("tenta reproduzir audio com url valida", async () => {
    const playMock = vi.fn().mockResolvedValue(undefined);
    const addEventListener = vi.fn((event, handler) => {
      if (event === "canplaythrough") handler();
    });

    class MockAudio {
      constructor() {
        this.volume = 1;
        this.preload = "";
        this.currentTime = 0;
      }

      addEventListener = addEventListener;
      removeEventListener = vi.fn();
      load = vi.fn();
      play = playMock;
      pause = vi.fn();
    }

    vi.stubGlobal("Audio", MockAudio);

    await expect(playRoundSound("/sounds/falha-comica.mp3")).resolves.toBe(true);
    expect(playMock).toHaveBeenCalled();
  });
});
