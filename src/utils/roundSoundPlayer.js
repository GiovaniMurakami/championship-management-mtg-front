let activeAudio = null;
let unlocked = false;

/** Áudio silencioso mínimo para desbloquear autoplay após interação do usuário. */
const SILENT_MP3 =
  "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADhAC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAA4T/L/ZpAAAAAAD/+xDEAAPAAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7EMQpg8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV";

export function isRoundSoundPlayerUnlocked() {
  return unlocked;
}

/** Chamar no primeiro clique/tecla da página para permitir som via Ably depois. */
export function unlockRoundSoundPlayer() {
  if (unlocked) return Promise.resolve(true);
  const audio = new Audio(SILENT_MP3);
  audio.volume = 0.001;
  return audio.play()
    .then(() => {
      unlocked = true;
      return true;
    })
    .catch(() => false);
}

export function stopRoundSound() {
  if (!activeAudio) return;
  activeAudio.pause();
  activeAudio.currentTime = 0;
  activeAudio = null;
}

export function playRoundSound(url) {
  const trimmed = String(url ?? "").trim();
  if (!trimmed) return Promise.resolve(false);

  stopRoundSound();

  return new Promise((resolve) => {
    const audio = new Audio(trimmed);
    audio.volume = 0.7;
    audio.preload = "auto";
    activeAudio = audio;

    const cleanup = () => {
      audio.removeEventListener("canplaythrough", onCanPlay);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("ended", onEnded);
    };

    const onEnded = () => {
      if (activeAudio === audio) activeAudio = null;
    };

    const onCanPlay = () => {
      cleanup();
      audio.addEventListener("ended", onEnded);
      audio.play()
        .then(() => resolve(true))
        .catch(() => {
          if (activeAudio === audio) activeAudio = null;
          resolve(false);
        });
    };

    const onError = () => {
      cleanup();
      if (activeAudio === audio) activeAudio = null;
      resolve(false);
    };

    audio.addEventListener("canplaythrough", onCanPlay, { once: true });
    audio.addEventListener("error", onError, { once: true });
    audio.load();
  });
}
