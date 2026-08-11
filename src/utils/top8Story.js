import { TOP8_BACKGROUND_URL } from "../constants/top8";
import { formatBrasiliaDate } from "./brasiliaTime";

export function resolveTop8BackgroundUrl(storyFundoUrl) {
  const custom = String(storyFundoUrl || "").trim();
  return custom || TOP8_BACKGROUND_URL;
}

/** Só a data (sem hora) em pt-BR / Brasília — usada no story Top 8. */
export function formatTop8StoryDate(horario) {
  if (!horario) return "";
  const formatted = formatBrasiliaDate(horario);
  return formatted === "—" ? "" : formatted;
}
