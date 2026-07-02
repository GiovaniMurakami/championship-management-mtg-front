/** Sons pré-definidos para tocar ao iniciar uma nova rodada (arquivos em public/sounds). */
export const CUSTOM_ROUND_SOUND_ID = "custom";

export const ROUND_SOUND_PRESETS = [
  { id: "none", label: "Sem som", emoji: "🔇", url: "" },
  { id: "falha-comica", label: "Falha cômica", emoji: "💥", url: "/sounds/falha-comica.mp3" },
  { id: "buzina-festa", label: "Buzina de festa", emoji: "📯", url: "/sounds/buzina-festa.mp3" },
  { id: "notificacao", label: "Notificação misteriosa", emoji: "📱", url: "/sounds/notificacao.mp3" },
  { id: "sirene-meme", label: "Sirene meme", emoji: "🚨", url: "/sounds/sirene-meme.mp3" },
  { id: "plim-comico", label: "Plim!", emoji: "🛎️", url: "/sounds/plim-comico.mp3" },
  { id: "slide-assobio", label: "Assovio deslizante", emoji: "😮‍💨", url: "/sounds/slide-assobio.mp3" },
];

export function resolveRoundSoundSelection(url) {
  const normalized = String(url ?? "").trim();
  if (!normalized) return "none";

  const preset = ROUND_SOUND_PRESETS.find((item) => item.url === normalized);
  if (preset) return preset.id;

  if (typeof window !== "undefined") {
    try {
      const pathname = new URL(normalized, window.location.origin).pathname;
      const byPath = ROUND_SOUND_PRESETS.find((item) => item.url && item.url === pathname);
      if (byPath) return byPath.id;
    } catch {
      // URL inválida — trata como personalizada
    }
  }

  return CUSTOM_ROUND_SOUND_ID;
}

export function findRoundSoundPreset(id) {
  return ROUND_SOUND_PRESETS.find((item) => item.id === id);
}

export function normalizeRoundSoundUrl(url) {
  const trimmed = String(url ?? "").trim();
  if (!trimmed) return "";

  const preset = ROUND_SOUND_PRESETS.find((item) => item.url === trimmed);
  if (preset) return preset.url;

  if (typeof window !== "undefined") {
    try {
      const pathname = new URL(trimmed, window.location.origin).pathname;
      const byPath = ROUND_SOUND_PRESETS.find((item) => item.url && item.url === pathname);
      if (byPath) return byPath.url;
    } catch {
      // mantém URL personalizada como está
    }
  }

  return trimmed;
}
