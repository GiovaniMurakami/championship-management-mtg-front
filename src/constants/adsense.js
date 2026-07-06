export const ADSENSE_CLIENT = "ca-pub-7954449480469462";
export const ADSENSE_PUBLISHER_ID = "pub-7954449480469462";
export const DEFAULT_ADSENSE_HOST = "app.tiagofuguete.com.br";

/** Cada unidade usa um slot distinto — reutilizar slot na mesma pagina impede o segundo anuncio. */
export const ADSENSE_UNITS = {
  topBanner: {
    slot: "7521736447",
    format: "auto",
    fullWidthResponsive: true,
  },
  inArticle: {
    slot: "2769325376",
    layout: "in-article",
    format: "fluid",
  },
  bottomBanner: {
    slot: "8904290240",
    format: "auto",
    fullWidthResponsive: true,
  },
};

export function getConfiguredAdSenseHost() {
  const appUrl = import.meta.env.VITE_APP_URL;
  if (!appUrl) return DEFAULT_ADSENSE_HOST;

  try {
    return new URL(appUrl).hostname;
  } catch {
    return DEFAULT_ADSENSE_HOST;
  }
}

export function isAdSenseEnabled() {
  if (import.meta.env.VITE_ADSENSE_ENABLED === "false") return false;
  if (typeof window === "undefined") return false;

  if (import.meta.env.PROD && window.location.hostname !== getConfiguredAdSenseHost()) {
    return false;
  }

  return true;
}
