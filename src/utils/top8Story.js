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
