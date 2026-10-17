import { LANDING_SEO, defaultOgImageUrl } from "../constants/seo";
import { usePageTitle } from "./usePageTitle";

/**
 * Aplica title + description + og:image + canonical da landing.
 * @param {keyof typeof LANDING_SEO} key
 * @param {{ image?: string }} [options]
 */
export function useLandingSeo(key, { image } = {}) {
  const meta = LANDING_SEO[key];
  usePageTitle(meta?.pageTitle, {
    seo: true,
    description: meta?.description || "",
    path: meta?.path || "/",
    image: image || defaultOgImageUrl(),
  });
}
