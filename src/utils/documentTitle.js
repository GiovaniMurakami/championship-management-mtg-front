import { SITE_TITLE, formatPageTitle } from "../constants/pageTitles";
import { getWordpressEmbedOrigins } from "./externalNavigation";

function notifyParentPageTitle(title) {
  if (window.parent === window) return;

  const origins = getWordpressEmbedOrigins();
  if (origins.size === 0) return;

  const message = {
    type: "APP_PAGE_TITLE_CHANGED",
    source: "championship-management-mtg-front",
    title,
  };

  origins.forEach((origin) => {
    window.parent.postMessage(message, origin);
  });
}

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
  notifyParentPageTitle(formattedTitle);

  if (!seo) return;

  setMetaAttribute('meta[property="og:title"]', "content", formattedTitle);
  setMetaAttribute('meta[name="twitter:title"]', "content", formattedTitle);
  setMetaAttribute('meta[property="og:image"]', "content", image || "");
  setMetaAttribute('meta[name="twitter:image"]', "content", image || "");
}

export function resetDocumentTitle({ seo = false } = {}) {
  document.title = SITE_TITLE;
  notifyParentPageTitle(SITE_TITLE);

  if (!seo) return;

  setMetaAttribute('meta[property="og:title"]', "content", SITE_TITLE);
  setMetaAttribute('meta[name="twitter:title"]', "content", SITE_TITLE);
  setMetaAttribute('meta[property="og:image"]', "content", "");
  setMetaAttribute('meta[name="twitter:image"]', "content", "");
}
