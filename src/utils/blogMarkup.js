import { decodeBlogHtmlForDisplay } from "./blogEditor";

const BLOG_MARKUP_TAGS = /<(titulo|paragrafo|negrito|italico|link|imagem|lista|item)\b/i;

export function isBlogMarkup(content) {
  return BLOG_MARKUP_TAGS.test(String(content || ""));
}

function escapeBlogText(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeBlogAttr(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function serializeChildren(node) {
  return [...node.childNodes].map((child) => serializeNodeToBlogMarkup(child)).join("");
}

function serializeNodeToBlogMarkup(node) {
  if (!node) return "";

  if (node.nodeType === Node.TEXT_NODE) {
    return escapeBlogText(node.textContent);
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }

  const tag = node.tagName.toLowerCase();

  if (tag === "strong" || tag === "b") {
    return `<negrito>${serializeChildren(node)}</negrito>`;
  }

  if (tag === "em" || tag === "i") {
    return `<italico>${serializeChildren(node)}</italico>`;
  }

  if (tag === "a") {
    const href = escapeBlogAttr(node.getAttribute("href") || "");
    return `<link href="${href}">${serializeChildren(node)}</link>`;
  }

  if (tag === "br") {
    return "";
  }

  if (tag === "negrito" || tag === "italico" || tag === "link") {
    if (tag === "link") {
      const href = escapeBlogAttr(node.getAttribute("href") || "");
      return `<link href="${href}">${serializeChildren(node)}</link>`;
    }
    return `<${tag}>${serializeChildren(node)}</${tag}>`;
  }

  return serializeChildren(node);
}

export function editorInlineHtmlToBlogMarkup(html) {
  const value = String(html || "").trim();
  if (!value) return "";

  if (typeof DOMParser === "undefined") {
    return escapeBlogText(value.replace(/<[^>]+>/g, ""));
  }

  const doc = new DOMParser().parseFromString(`<div>${value}</div>`, "text/html");
  return serializeNodeToBlogMarkup(doc.body.firstElementChild);
}

function serializeChildrenToEditorHtml(node) {
  return [...node.childNodes].map((child) => serializeNodeToEditorHtml(child)).join("");
}

function serializeNodeToEditorHtml(node) {
  if (!node) return "";

  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent || "";
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }

  const tag = node.tagName.toLowerCase();

  if (tag === "negrito" || tag === "strong" || tag === "b") {
    return `<strong>${serializeChildrenToEditorHtml(node)}</strong>`;
  }

  if (tag === "italico" || tag === "em" || tag === "i") {
    return `<em>${serializeChildrenToEditorHtml(node)}</em>`;
  }

  if (tag === "link" || tag === "a") {
    const href = node.getAttribute("href") || "";
    return `<a href="${href}">${serializeChildrenToEditorHtml(node)}</a>`;
  }

  if (tag === "br") {
    return "<br>";
  }

  return serializeChildrenToEditorHtml(node);
}

export function blogMarkupInlineToEditorHtml(markup) {
  const value = String(markup || "").trim();
  if (!value) return "";

  if (typeof DOMParser === "undefined") {
    return value;
  }

  const doc = new DOMParser().parseFromString(`<div>${value}</div>`, "text/html");
  return serializeChildrenToEditorHtml(doc.body.firstElementChild);
}

export function blocksToBlogMarkup(blocks = []) {
  const parts = [];

  blocks.forEach((block) => {
    if (block.type === "paragraph") {
      const inner = editorInlineHtmlToBlogMarkup(block.html);
      if (inner) parts.push(`<paragrafo>${inner}</paragrafo>`);
      return;
    }

    if (block.type === "heading") {
      const inner = editorInlineHtmlToBlogMarkup(block.html);
      if (inner) parts.push(`<titulo>${inner}</titulo>`);
      return;
    }

    if (block.type === "list") {
      const items = (block.items || [])
        .map((item) => editorInlineHtmlToBlogMarkup(item))
        .filter(Boolean)
        .map((item) => `<item>${item}</item>`)
        .join("");
      if (items) parts.push(`<lista>${items}</lista>`);
      return;
    }

    if (block.type === "image" && block.url) {
      const carta = block.card ? ' carta="true"' : "";
      parts.push(
        `<imagem url="${escapeBlogAttr(block.url)}" alt="${escapeBlogAttr(block.alt)}"${carta} />`,
      );
    }
  });

  return parts.join("");
}

function parseBlogElementToBlocks(element, blocks) {
  const tag = element.tagName?.toLowerCase();
  if (!tag) return;

  if (tag === "paragrafo") {
    const inner = element.innerHTML.trim();
    if (inner) blocks.push({ type: "paragraph", html: blogMarkupInlineToEditorHtml(inner) });
    return;
  }

  if (tag === "titulo") {
    const inner = element.innerHTML.trim();
    if (inner) blocks.push({ type: "heading", html: blogMarkupInlineToEditorHtml(inner) });
    return;
  }

  if (tag === "lista") {
    const items = [...element.querySelectorAll(":scope > item, :scope > ITEM")].map((item) =>
      blogMarkupInlineToEditorHtml(item.innerHTML.trim()),
    );
    if (items.length) blocks.push({ type: "list", items });
    return;
  }

  if (tag === "imagem") {
    const url = element.getAttribute("url") || element.getAttribute("src") || "";
    if (!url) return;
    blocks.push({
      type: "image",
      url,
      alt: element.getAttribute("alt") || "",
      card: element.getAttribute("carta") === "true",
    });
  }
}

export function blogMarkupToBlockData(markup) {
  const decoded = decodeBlogHtmlForDisplay(markup);
  if (!decoded || !isBlogMarkup(decoded)) return [];

  if (typeof DOMParser === "undefined") {
    return [];
  }

  const doc = new DOMParser().parseFromString(`<div id="blog-root">${decoded}</div>`, "text/html");
  const root = doc.getElementById("blog-root");
  if (!root) return [];

  const blocks = [];

  root.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) blocks.push({ type: "paragraph", html: text });
      return;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      parseBlogElementToBlocks(node, blocks);
    }
  });

  return blocks;
}

function serializeNodeToDisplayHtml(node) {
  if (!node) return "";

  if (node.nodeType === Node.TEXT_NODE) {
    return escapeBlogText(node.textContent);
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }

  const tag = node.tagName.toLowerCase();
  const children = serializeChildrenToDisplayHtml(node);

  if (tag === "titulo") {
    return `<h2>${children}</h2>`;
  }

  if (tag === "paragrafo") {
    return `<p>${children}</p>`;
  }

  if (tag === "negrito") {
    return `<strong>${children}</strong>`;
  }

  if (tag === "italico") {
    return `<em>${children}</em>`;
  }

  if (tag === "link") {
    const href = escapeBlogAttr(node.getAttribute("href") || "");
    return `<a href="${href}" target="_blank" rel="noopener noreferrer">${children}</a>`;
  }

  if (tag === "lista") {
    return `<ul>${children}</ul>`;
  }

  if (tag === "item") {
    return `<li>${children}</li>`;
  }

  if (tag === "imagem") {
    const url = escapeBlogAttr(node.getAttribute("url") || node.getAttribute("src") || "");
    const alt = escapeBlogAttr(node.getAttribute("alt") || "");
    const isCard = node.getAttribute("carta") === "true";
    const className = isCard ? ' class="blog-card-image"' : "";
    return `<p><img src="${url}" alt="${alt}"${className} loading="lazy" /></p>`;
  }

  return children;
}

function serializeChildrenToDisplayHtml(node) {
  return [...node.childNodes].map((child) => serializeNodeToDisplayHtml(child)).join("");
}

export function blogMarkupToDisplayHtml(markup) {
  const decoded = decodeBlogHtmlForDisplay(markup);
  if (!decoded) return "";

  if (!isBlogMarkup(decoded)) {
    return decoded;
  }

  if (typeof DOMParser === "undefined") {
    return decoded;
  }

  const doc = new DOMParser().parseFromString(`<div id="blog-root">${decoded}</div>`, "text/html");
  const root = doc.getElementById("blog-root");
  if (!root) return decoded;

  return serializeChildrenToDisplayHtml(root);
}
