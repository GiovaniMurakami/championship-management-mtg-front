// ?inline → data URL no JS (evita /assets/*.jpeg no Amplify cair no fallback SPA / cache HTML).
import top8Background from "../assets/top8/fundoTop8.jpeg?inline";

/** Fundo do story Top8 como data URL (mesma origem no canvas; sem CORS/S3). */
export const TOP8_BACKGROUND_URL = top8Background;
