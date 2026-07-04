export function getEditorEmptyHtml() {
  return "<p><br></p>";
}

export function isBlogContentEmpty(html) {
  const value = String(html || "").trim();
  if (!value) return true;
  if (/<imagem\b/i.test(value)) return false;
  if (/<img\b/i.test(value)) return false;
  const text = value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length === 0;
}

export function normalizeBlogHtml(html) {
  return String(html || "").trim();
}

export function decodeBlogHtmlForDisplay(html) {
  const value = normalizeBlogHtml(html);
  if (!value) return "";
  if (!/&lt;\/?[a-z]/i.test(value)) return value;

  if (typeof document === "undefined") {
    return value
      .replace(/&amp;/g, "\u0000AMP\u0000")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\u0000AMP\u0000/g, "&");
  }

  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
}

export function prepareBlogHtmlForSave(html) {
  return normalizeBlogHtml(decodeBlogHtmlForDisplay(html));
}

/**
 * Insere HTML no editor via DOM (execCommand insertHTML costuma remover <img>).
 */
export function insertBlogHtmlIntoEditor(editor, html, savedRange = null) {
  if (!editor || typeof document === "undefined") return "";

  editor.focus();
  const selection = window.getSelection();
  if (!selection) return editor.innerHTML;

  if (savedRange) {
    try {
      selection.removeAllRanges();
      selection.addRange(savedRange);
    } catch {
      // seleção pode expirar entre interações
    }
  }

  let range;
  if (
    selection.rangeCount > 0
    && editor.contains(selection.getRangeAt(0).commonAncestorContainer)
  ) {
    range = selection.getRangeAt(0);
  } else {
    range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  range.deleteContents();

  const container = document.createElement("div");
  container.innerHTML = html;
  const nodes = [...container.childNodes];

  nodes.forEach((node) => {
    range.insertNode(node);
    range.setStartAfter(node);
    range.collapse(true);
  });

  selection.removeAllRanges();
  selection.addRange(range);

  return editor.innerHTML;
}

function escapeHtmlAttr(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function buildBlogCardImageHtml(imageUrl, altText) {
  const safeUrl = escapeHtmlAttr(imageUrl);
  const safeAlt = escapeHtmlAttr(altText);
  return `<p><img src="${safeUrl}" alt="${safeAlt}" class="blog-card-image" /></p><p><br></p>`;
}

export function buildBlogImageHtml(imageUrl, altText = "") {
  const safeUrl = escapeHtmlAttr(imageUrl);
  const safeAlt = escapeHtmlAttr(altText);
  return `<p><img src="${safeUrl}" alt="${safeAlt}" /></p><p><br></p>`;
}
