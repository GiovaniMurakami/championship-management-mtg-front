import { SITE_TITLE, formatPageTitle } from "../constants/pageTitles";
import { absolutePublicUrl, defaultOgImageUrl, SITE_DESCRIPTION } from "../constants/seo";

function setMetaAttribute(selector, attribute, value) {
  let element = document.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    const match = selector.match(/\[([^=\]]+)="([^"]+)"\]/);
    if (match) {
      element.setAttribute(match[1], match[2]);
    }
    document.head.appendChild(element);
  }
  element.setAttribute(attribute, value);
}

function setLinkCanonical(href) {
  let element = document.querySelector('link[rel="canonical"]');
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

/**
 * @param {string} pageTitle
 * @param {{
 *   seo?: boolean,
 *   image?: string,
 *   description?: string,
 *   path?: string,
 *   type?: string,
 * }} [options]
 */
export function applyDocumentTitle(pageTitle, {
  seo = false,
  image = "",
  description = "",
  path = "",
  type = "website",
} = {}) {
  const formattedTitle = formatPageTitle(pageTitle);
  document.title = formattedTitle;

  if (!seo) return;

  const resolvedDescription = String(description || SITE_DESCRIPTION).trim() || SITE_DESCRIPTION;
  const resolvedImage = String(image || "").trim() || defaultOgImageUrl();
  const resolvedUrl = path
    ? absolutePublicUrl(path)
    : (typeof window !== "undefined"
      ? absolutePublicUrl(`${window.location.pathname}${window.location.search}`)
      : absolutePublicUrl("/"));

  setMetaAttribute('meta[name="description"]', "content", resolvedDescription);
  setLinkCanonical(resolvedUrl);

  setMetaAttribute('meta[property="og:site_name"]', "content", SITE_TITLE);
  setMetaAttribute('meta[property="og:type"]', "content", type);
  setMetaAttribute('meta[property="og:title"]', "content", formattedTitle);
  setMetaAttribute('meta[property="og:description"]', "content", resolvedDescription);
  setMetaAttribute('meta[property="og:url"]', "content", resolvedUrl);
  setMetaAttribute('meta[property="og:image"]', "content", resolvedImage);
  setMetaAttribute('meta[property="og:image:width"]', "content", "1200");
  setMetaAttribute('meta[property="og:image:height"]', "content", "630");

  setMetaAttribute('meta[name="twitter:card"]', "content", "summary_large_image");
  setMetaAttribute('meta[name="twitter:title"]', "content", formattedTitle);
  setMetaAttribute('meta[name="twitter:description"]', "content", resolvedDescription);
  setMetaAttribute('meta[name="twitter:image"]', "content", resolvedImage);
}

export function resetDocumentTitle({ seo = false } = {}) {
  document.title = SITE_TITLE;

  if (!seo) return;

  applyDocumentTitle(SITE_TITLE, {
    seo: true,
    description: SITE_DESCRIPTION,
    path: "/",
    image: defaultOgImageUrl(),
  });
}
