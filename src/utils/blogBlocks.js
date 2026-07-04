import { decodeBlogHtmlForDisplay, isBlogContentEmpty } from "./blogEditor";
import {
  blocksToBlogMarkup,
  blogMarkupInlineToEditorHtml,
  blogMarkupToBlockData,
  isBlogMarkup,
} from "./blogMarkup";

let blockIdCounter = 0;

export function createBlockId(prefix = "block") {
  blockIdCounter += 1;
  return `${prefix}-${Date.now()}-${blockIdCounter}`;
}

export function createParagraphBlock(html = "") {
  return { id: createBlockId("p"), type: "paragraph", html };
}

export function createHeadingBlock(html = "") {
  return { id: createBlockId("h"), type: "heading", html };
}

export function createListBlock(items = [""]) {
  return {
    id: createBlockId("ul"),
    type: "list",
    items: items.length ? items : [""],
  };
}

export function createImageBlock(url, alt = "", card = false) {
  return {
    id: createBlockId("img"),
    type: "image",
    url: String(url || ""),
    alt: String(alt || ""),
    card: Boolean(card),
  };
}

export function createDefaultBlocks() {
  return [createParagraphBlock("")];
}

function escapeHtmlText(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function attachBlockIds(blockData) {
  return blockData.map((block) => {
    if (block.type === "paragraph") {
      return createParagraphBlock(block.html);
    }
    if (block.type === "heading") {
      return createHeadingBlock(block.html);
    }
    if (block.type === "list") {
      return createListBlock(block.items);
    }
    if (block.type === "image") {
      return createImageBlock(block.url, block.alt, block.card);
    }
    return createParagraphBlock("");
  });
}

function parseLegacyElementToBlocks(element, blocks) {
  const tag = element.tagName?.toLowerCase();
  if (!tag) return;

  if (tag === "p") {
    const img = element.querySelector("img");
    if (img?.getAttribute("src")) {
      blocks.push(createImageBlock(
        img.getAttribute("src"),
        img.getAttribute("alt") || "",
        img.classList.contains("blog-card-image"),
      ));
      return;
    }

    const html = element.innerHTML.trim();
    if (html) blocks.push(createParagraphBlock(html));
    return;
  }

  if (tag === "h2" || tag === "h3") {
    const html = element.innerHTML.trim();
    if (html) blocks.push(createHeadingBlock(html));
    return;
  }

  if (tag === "ul" || tag === "ol") {
    const items = [...element.querySelectorAll(":scope > li")].map((li) => li.innerHTML.trim());
    if (items.length) blocks.push(createListBlock(items));
    return;
  }

  if (tag === "img" && element.getAttribute("src")) {
    blocks.push(createImageBlock(
      element.getAttribute("src"),
      element.getAttribute("alt") || "",
      element.classList.contains("blog-card-image"),
    ));
    return;
  }

  if (tag === "div") {
    const html = element.innerHTML.trim();
    if (html) blocks.push(createParagraphBlock(html));
  }
}

function legacyHtmlToBlocks(html) {
  if (typeof DOMParser === "undefined") {
    return [createParagraphBlock(html.replace(/<[^>]+>/g, " ").trim())];
  }

  const doc = new DOMParser().parseFromString(html, "text/html");
  const blocks = [];

  doc.body.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) blocks.push(createParagraphBlock(escapeHtmlText(text)));
      return;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      parseLegacyElementToBlocks(node, blocks);
    }
  });

  return blocks.length ? blocks : createDefaultBlocks();
}

/** Salva no backend com tags customizadas: titulo, paragrafo, negrito, imagem, etc. */
export function blocksToHtml(blocks = []) {
  return blocksToBlogMarkup(blocks);
}

export function htmlToBlocks(html) {
  const decoded = decodeBlogHtmlForDisplay(html);
  if (!decoded || isBlogContentEmpty(decoded)) {
    return createDefaultBlocks();
  }

  if (isBlogMarkup(decoded)) {
    const blockData = blogMarkupToBlockData(decoded);
    return blockData.length ? attachBlockIds(blockData) : createDefaultBlocks();
  }

  return legacyHtmlToBlocks(decoded);
}

export function updateBlock(blocks, blockId, updater) {
  return blocks.map((block) => {
    if (block.id !== blockId) return block;
    return typeof updater === "function" ? updater(block) : { ...block, ...updater };
  });
}

export function insertBlockAfter(blocks, blockId, newBlock) {
  const index = blocks.findIndex((block) => block.id === blockId);
  if (index === -1) {
    return [...blocks, newBlock];
  }

  const next = [...blocks];
  next.splice(index + 1, 0, newBlock);
  return next;
}

export function removeBlock(blocks, blockId) {
  const next = blocks.filter((block) => block.id !== blockId);
  return next.length ? next : createDefaultBlocks();
}

export function moveBlock(blocks, blockId, direction) {
  const index = blocks.findIndex((block) => block.id === blockId);
  if (index === -1) return blocks;

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= blocks.length) return blocks;

  const next = [...blocks];
  const [item] = next.splice(index, 1);
  next.splice(targetIndex, 0, item);
  return next;
}

/** Lê parágrafos/títulos do DOM e mescla no array de blocos (para save). */
export function mergeTextBlocksFromDom(blocks, textBlockRefs = new Map()) {
  let nextBlocks = blocks;

  textBlockRefs.forEach((elementRef, blockId) => {
    const editor = elementRef?.current;
    if (!editor) return;

    const block = nextBlocks.find((item) => item.id === blockId);
    if (block?.type !== "paragraph" && block?.type !== "heading") return;

    nextBlocks = updateBlock(nextBlocks, blockId, { html: editor.innerHTML });
  });

  return nextBlocks;
}

export function blocksToSaveMarkup(blocks, textBlockRefs = new Map()) {
  return blocksToHtml(mergeTextBlocksFromDom(blocks, textBlockRefs));
}

export { blogMarkupInlineToEditorHtml, isBlogMarkup };
