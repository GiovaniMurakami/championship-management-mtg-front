import { describe, expect, it } from "vitest";
import {
  CUSTOM_ROUND_SOUND_ID,
  findRoundSoundPreset,
  normalizeRoundSoundUrl,
  resolveRoundSoundSelection,
} from "../constants/roundSounds";

describe("roundSounds", () => {
  it("resolve vazio como sem som", () => {
    expect(resolveRoundSoundSelection("")).toBe("none");
    expect(resolveRoundSoundSelection(null)).toBe("none");
  });

  it("resolve preset conhecido pelo url local", () => {
    const falha = findRoundSoundPreset("falha-comica");
    expect(resolveRoundSoundSelection(falha.url)).toBe("falha-comica");
  });

  it("resolve url absoluta do mesmo preset pelo pathname", () => {
    const falha = findRoundSoundPreset("falha-comica");
    expect(resolveRoundSoundSelection(`http://localhost:5173${falha.url}`)).toBe("falha-comica");
  });

  it("normaliza url absoluta para caminho local do preset", () => {
    const falha = findRoundSoundPreset("falha-comica");
    expect(normalizeRoundSoundUrl(`https://app.example.com${falha.url}`)).toBe(falha.url);
  });

  it("resolve url desconhecida como personalizada", () => {
    expect(resolveRoundSoundSelection("https://example.com/meu-som.mp3")).toBe(CUSTOM_ROUND_SOUND_ID);
  });
});
