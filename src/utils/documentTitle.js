import { SITE_TITLE, formatPageTitle } from "../constants/pageTitles";

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

export function applyDocumentTitle(pageTitle, { seo = false, image = "" } = {}) {
  const formattedTitle = formatPageTitle(pageTitle);
  document.title = formattedTitle;

  if (!seo) return;

  setMetaAttribute('meta[property="og:title"]', "content", formattedTitle);
  setMetaAttribute('meta[name="twitter:title"]', "content", formattedTitle);
  setMetaAttribute('meta[property="og:image"]', "content", image || "");
  setMetaAttribute('meta[name="twitter:image"]', "content", image || "");
}

export function resetDocumentTitle({ seo = false } = {}) {
  document.title = SITE_TITLE;

  if (!seo) return;

  setMetaAttribute('meta[property="og:title"]', "content", SITE_TITLE);
  setMetaAttribute('meta[name="twitter:title"]', "content", SITE_TITLE);
  setMetaAttribute('meta[property="og:image"]', "content", "");
  setMetaAttribute('meta[name="twitter:image"]', "content", "");
}
