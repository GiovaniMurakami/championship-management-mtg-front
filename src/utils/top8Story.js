import { TOP8_BACKGROUND_URL } from "../constants/top8";
import { formatBrasiliaDate } from "./brasiliaTime";
import { loadCanvasImage } from "./loadCanvasImage";

export function resolveTop8BackgroundUrl(storyFundoUrl) {
  const custom = String(storyFundoUrl || "").trim();
  return custom || TOP8_BACKGROUND_URL;
}

/** Carrega fundo do story; se o custom falhar, cai no padrão embutido. */
export async function loadTop8BackgroundImage(storyFundoUrl) {
  const primary = resolveTop8BackgroundUrl(storyFundoUrl);
  const img = await loadCanvasImage(primary);
  if (img) return img;
  if (primary !== TOP8_BACKGROUND_URL) {
    return loadCanvasImage(TOP8_BACKGROUND_URL);
  }
  return null;
}

/** Só a data (sem hora) em pt-BR / Brasília — usada no story Top 8. */
export function formatTop8StoryDate(horario) {
  if (!horario) return "";
  const formatted = formatBrasiliaDate(horario);
  return formatted === "—" ? "" : formatted;
}

/** "15/08/2026 · 36 jogadores" — uma linha, acima do 1º. */
export function formatTop8StoryHeadline(horario, playerCount) {
  const dateLabel = formatTop8StoryDate(horario);
  const n = Number(playerCount);
  const countLabel = Number.isFinite(n) && n > 0
    ? `${n} ${n === 1 ? "jogador" : "jogadores"}`
    : "";
  return [dateLabel, countLabel].filter(Boolean).join(" · ");
}
export function getTop8StoryTextTheme(textoRodape = "escuro") {
  return textoRodape === "escuro"
    ? {
        color: "#1f1633",
        shadowColor: "rgba(255,255,255,0.72)",
        previewClass: "text-[#1f1633] drop-shadow-[0_1px_2px_rgba(255,255,255,0.85)]",
      }
    : {
        color: "#c4b5fd",
        shadowColor: "rgba(0,0,0,0.7)",
        previewClass: "text-[#c4b5fd] drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]",
      };
}

export function formatTop8StoryRecord(player) {
  const vitorias = Number(player?.vitoriasPartida ?? player?.vitorias ?? 0);
  const derrotas = Number(player?.derrotasPartida ?? player?.derrotas ?? 0);
  return `${vitorias}-${derrotas}`;
}

/** Folga extra abaixo do nome para descendentes (g, j, p, q, y). */
export const TOP8_STORY_NAME_DESCENT = 0.32;
export const TOP8_STORY_DECK_ASCENT = 0.78;

/**
 * Baselines (px a partir do topo do card) para nome e deck no canvas.
 * Garante que descendentes do nick não encostem no arquétipo.
 */
export function top8StoryNameDeckLayout(cardH, nameFs, deckFs) {
  const h = Math.max(1, Number(cardH) || 1);
  const nf = Math.max(1, Number(nameFs) || 1);
  const df = Math.max(1, Number(deckFs) || 1);
  const nameDescent = nf * TOP8_STORY_NAME_DESCENT;
  const deckAscent = df * TOP8_STORY_DECK_ASCENT;
  const gap = Math.max(8, h * 0.06);
  let nameY = h * 0.38;
  let deckY = nameY + nameDescent + gap + deckAscent;
  const maxDeckY = h * 0.88;
  if (deckY > maxDeckY) {
    deckY = maxDeckY;
    nameY = Math.max(h * 0.28, deckY - deckAscent - gap - nameDescent);
  }
  return { nameY, deckY };
}
