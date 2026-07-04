import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { uploadBannerImage, uploadImageFromUrl, validateBannerImageFile } from "../../utils/bannerUpload";
import {
  buildBlogCardImageHtml,
  buildBlogImageHtml,
  decodeBlogHtmlForDisplay,
  getEditorEmptyHtml,
  insertBlogHtmlIntoEditor,
  prepareBlogHtmlForSave,
} from "../../utils/blogEditor";
import { BlogScryfallCardPicker } from "./BlogScryfallCardPicker";
import { BTN_PRIMARY, BTN_SECONDARY } from "../../styles/uiClasses";

const toolBtn =
  "rounded-lg border border-[rgba(217,180,255,0.18)] bg-[rgba(167,79,255,0.08)] px-3 py-2 text-sm font-semibold text-[#e8dfff] transition hover:bg-[rgba(167,79,255,0.16)] disabled:cursor-not-allowed disabled:opacity-50";

const toolBtnActive =
  "border-[rgba(199,149,255,0.45)] bg-[rgba(167,79,255,0.22)]";

const toolBtnMedia = `${BTN_SECONDARY} px-3 py-2 text-sm font-semibold`;

function saveSelection(container) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || !container) return null;

  const range = selection.getRangeAt(0);
  if (!container.contains(range.commonAncestorContainer)) return null;

  return range.cloneRange();
}

function restoreSelection(range) {
  if (!range) return;

  const selection = window.getSelection();
  if (!selection) return;

  selection.removeAllRanges();
  selection.addRange(range);
}

function runCommand(command, value = null) {
  document.execCommand(command, false, value);
}

function normalizeLinkUrl(value) {
  const url = String(value || "").trim();
  if (!url) return "";
  if (/^(https?:\/\/|mailto:|tel:)/i.test(url)) return url;
  return `https://${url}`;
}

function ToolbarGroup({ label, children }) {
  return (
    <div className="flex min-w-[200px] flex-1 flex-col gap-2">
      <span className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#8f82ad]">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export const BlogRichTextEditor = forwardRef(function BlogRichTextEditor(
  {
    defaultHtml = "",
    onChange,
    token,
    disabled = false,
  },
  ref,
) {
  const editorRef = useRef(null);
  const savedRangeRef = useRef(null);
  const imageInputRef = useRef(null);
  const linkInputRef = useRef(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingCard, setUploadingCard] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editorError, setEditorError] = useState("");
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [showCardPicker, setShowCardPicker] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const readHtml = () => prepareBlogHtmlForSave(editorRef.current?.innerHTML || "");

  const pushContent = () => {
    if (!editorRef.current) return;
    onChange?.(readHtml());
  };

  useImperativeHandle(ref, () => ({
    getHtml: readHtml,
  }));

  useEffect(() => {
    if (!editorRef.current) return;

    const html = decodeBlogHtmlForDisplay(defaultHtml) || getEditorEmptyHtml();
    editorRef.current.innerHTML = html;
    onChange?.(prepareBlogHtmlForSave(html));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- defaultHtml intencionalmente ignorado após mount
  }, []);

  useEffect(() => {
    if (!showLinkForm) return;
    linkInputRef.current?.focus();
  }, [showLinkForm]);

  const focusEditor = () => {
    editorRef.current?.focus();
  };

  const rememberSelection = () => {
    savedRangeRef.current = saveSelection(editorRef.current);
    return savedRangeRef.current;
  };

  const withSavedSelection = (callback) => {
    focusEditor();
    restoreSelection(savedRangeRef.current);
    callback();
    savedRangeRef.current = saveSelection(editorRef.current);
    pushContent();
  };

  const captureInsertionPoint = () => saveSelection(editorRef.current);

  const insertHtml = (html, insertionPoint = null) => {
    if (!editorRef.current) return;

    savedRangeRef.current = insertionPoint || saveSelection(editorRef.current);
    insertBlogHtmlIntoEditor(editorRef.current, html, savedRangeRef.current);
    savedRangeRef.current = saveSelection(editorRef.current);
    pushContent();
  };

  const closePanels = () => {
    setShowLinkForm(false);
    setShowCardPicker(false);
    setLinkUrl("");
  };

  const handleToolbar = (action) => {
    if (disabled || uploadingImage || uploadingCard) return;
    setEditorError("");
    rememberSelection();

    switch (action) {
      case "paragraph":
        withSavedSelection(() => runCommand("formatBlock", "<p>"));
        break;
      case "heading2":
        withSavedSelection(() => runCommand("formatBlock", "<h2>"));
        break;
      case "bold":
        withSavedSelection(() => runCommand("bold"));
        break;
      case "italic":
        withSavedSelection(() => runCommand("italic"));
        break;
      case "list":
        withSavedSelection(() => runCommand("insertUnorderedList"));
        break;
      case "link": {
        if (!savedRangeRef.current || savedRangeRef.current.collapsed) {
          setEditorError("Selecione o trecho de texto antes de adicionar o link.");
          return;
        }
        setLinkUrl("");
        setShowCardPicker(false);
        setShowLinkForm(true);
        break;
      }
      case "card":
        setShowLinkForm(false);
        setLinkUrl("");
        setShowCardPicker(true);
        break;
      case "image":
        closePanels();
        imageInputRef.current?.click();
        break;
      default:
        break;
    }
  };

  const handleApplyLink = (event) => {
    event.preventDefault();
    const url = normalizeLinkUrl(linkUrl);
    if (!url) {
      setEditorError("Informe um endereço válido para o link.");
      return;
    }

    withSavedSelection(() => runCommand("createLink", url));
    setShowLinkForm(false);
    setLinkUrl("");
  };

  const handleCancelLink = () => {
    setShowLinkForm(false);
    setLinkUrl("");
    focusEditor();
    restoreSelection(savedRangeRef.current);
  };

  const handleCancelCardPicker = () => {
    setShowCardPicker(false);
    focusEditor();
    restoreSelection(savedRangeRef.current);
  };

  const handleSelectCard = async (card) => {
    if (!token || !card?.imagem) {
      setEditorError("Não foi possível carregar a imagem da carta.");
      return;
    }

    const insertionPoint = captureInsertionPoint();
    setEditorError("");
    setUploadingCard(true);
    setUploadProgress(0);

    try {
      const s3Url = await uploadImageFromUrl(
        card.imagem,
        token,
        setUploadProgress,
        card.nome,
      );
      insertHtml(buildBlogCardImageHtml(s3Url, card.nome), insertionPoint);
      setShowCardPicker(false);
      focusEditor();
    } catch (error) {
      setEditorError(error?.userMessage || error?.message || "Falha ao enviar imagem da carta.");
    } finally {
      setUploadingCard(false);
      setUploadProgress(0);
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const text = event.clipboardData.getData("text/plain");
    runCommand("insertText", text);
    pushContent();
  };

  const handleImageSelected = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !token) return;

    const validationError = validateBannerImageFile(file);
    if (validationError) {
      setEditorError(validationError.userMessage || validationError.message);
      return;
    }

    setEditorError("");
    setUploadingImage(true);
    setUploadProgress(0);
    const insertionPoint = captureInsertionPoint();

    try {
      const imageUrl = await uploadBannerImage(file, token, setUploadProgress);
      insertHtml(buildBlogImageHtml(imageUrl), insertionPoint);
    } catch (error) {
      setEditorError(error?.userMessage || error?.message || "Falha ao enviar imagem.");
    } finally {
      setUploadingImage(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[rgba(217,180,255,0.14)] bg-[#0f0a1f] p-4">
        <p className="mb-4 text-sm text-[#b9abd8]">
          Clique na área de escrita abaixo. Para <strong className="text-[#f5edff]">negrito</strong>,{" "}
          <strong className="text-[#f5edff]">itálico</strong> ou <strong className="text-[#f5edff]">link</strong>,
          selecione o texto primeiro e depois use o botão.
        </p>

        <div className="flex flex-col gap-4 xl:flex-row xl:gap-6">
          <ToolbarGroup label="Tipo de bloco">
            <button
              type="button"
              className={toolBtn}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleToolbar("paragraph")}
              disabled={disabled}
            >
              Parágrafo
            </button>
            <button
              type="button"
              className={toolBtn}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleToolbar("heading2")}
              disabled={disabled}
            >
              Título
            </button>
            <button
              type="button"
              className={toolBtn}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleToolbar("list")}
              disabled={disabled}
            >
              Lista com marcadores
            </button>
          </ToolbarGroup>

          <ToolbarGroup label="Destaque (selecione o texto)">
            <button
              type="button"
              className={toolBtn}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleToolbar("bold")}
              disabled={disabled}
            >
              Negrito
            </button>
            <button
              type="button"
              className={toolBtn}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleToolbar("italic")}
              disabled={disabled}
            >
              Itálico
            </button>
            <button
              type="button"
              className={`${toolBtn} ${showLinkForm ? toolBtnActive : ""}`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleToolbar("link")}
              disabled={disabled}
            >
              Link
            </button>
          </ToolbarGroup>

          <ToolbarGroup label="Inserir mídia">
            <button
              type="button"
              className={toolBtnMedia}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleToolbar("image")}
              disabled={disabled || uploadingImage}
            >
              {uploadingImage ? `Enviando ${uploadProgress}%` : "Foto do computador"}
            </button>
            <button
              type="button"
              className={`${toolBtn} ${showCardPicker ? toolBtnActive : ""}`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleToolbar("card")}
              disabled={disabled || uploadingImage || uploadingCard}
            >
              {uploadingCard ? `Enviando carta ${uploadProgress}%` : "Carta MTG"}
            </button>
          </ToolbarGroup>
        </div>

        {uploadingCard ? (
          <p className="mt-3 text-sm text-[#9b8dc0]">
            Baixando a carta e enviando para o armazenamento... {uploadProgress}%
          </p>
        ) : null}

        {showCardPicker ? (
          <BlogScryfallCardPicker
            onSelect={handleSelectCard}
            onCancel={handleCancelCardPicker}
            disabled={disabled || uploadingCard}
            uploading={uploadingCard}
            uploadProgress={uploadProgress}
          />
        ) : null}

        {showLinkForm ? (
          <form
            onSubmit={handleApplyLink}
            className="mt-4 flex flex-col gap-2 border-t border-[rgba(217,180,255,0.12)] pt-4 sm:flex-row sm:items-center"
          >
            <input
              ref={linkInputRef}
              type="url"
              value={linkUrl}
              onChange={(event) => setLinkUrl(event.target.value)}
              placeholder="https://exemplo.com"
              className="w-full flex-1 rounded-lg border border-[rgba(217,180,255,0.18)] bg-[#120b24] px-3 py-2 text-sm text-[#f5edff] outline-none focus:border-[rgba(199,149,255,0.45)]"
            />
            <div className="flex gap-2">
              <button type="submit" className={`${BTN_PRIMARY} px-4 py-2 text-sm`}>
                Aplicar link
              </button>
              <button
                type="button"
                className={`${BTN_SECONDARY} px-4 py-2 text-sm`}
                onClick={handleCancelLink}
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : null}

        <input
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={handleImageSelected}
        />
      </div>

      <div
        ref={editorRef}
        contentEditable={!disabled}
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label="Conteúdo do post"
        className="blog-content min-h-[28rem] w-full rounded-xl border border-[rgba(217,180,255,0.14)] bg-[#120b24] px-5 py-5 text-base text-[#f5edff] outline-none transition focus:border-[rgba(199,149,255,0.45)] [&_img]:max-w-full"
        onInput={pushContent}
        onBlur={pushContent}
        onPaste={handlePaste}
      />

      {editorError ? (
        <p className="m-0 text-sm text-[#fca5a5]" role="alert">
          {editorError}
        </p>
      ) : null}
    </div>
  );
});
