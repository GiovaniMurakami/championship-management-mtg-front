import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { uploadBannerImage } from "../../utils/bannerUpload";
import {
  blocksToSaveMarkup,
  createHeadingBlock,
  createImageBlock,
  createListBlock,
  createParagraphBlock,
  insertBlockAfter,
  mergeTextBlocksFromDom,
  moveBlock,
  removeBlock,
  updateBlock,
} from "../../utils/blogBlocks";
import { isBlogContentEmpty } from "../../utils/blogEditor";
import { BlogScryfallCardPicker } from "./BlogScryfallCardPicker";
import { BTN_PRIMARY, BTN_SECONDARY } from "../../styles/uiClasses";

const toolBtn =
  "rounded-lg border border-[rgba(217,180,255,0.18)] bg-[rgba(167,79,255,0.08)] px-3 py-2 text-sm font-semibold text-[#e8dfff] transition hover:bg-[rgba(167,79,255,0.16)] disabled:cursor-not-allowed disabled:opacity-50";

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

function TextBlockEditor({
  block,
  tagName,
  placeholder,
  onChange,
  onFocus,
  onRegisterRef,
  focused,
  disabled,
}) {
  const ref = useRef(null);

  useEffect(() => {
    onRegisterRef?.(block.id, ref);
    return () => onRegisterRef?.(block.id, null);
  }, [block.id, onRegisterRef]);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = block.html || "";
  }, [block.id]);

  const syncHtml = () => {
    if (!ref.current) return;
    onChange(ref.current.innerHTML);
  };

  return (
    <div
      className={`rounded-xl border bg-[#120b24] transition ${
        focused
          ? "border-[rgba(199,149,255,0.45)] ring-2 ring-[rgba(167,79,255,0.15)]"
          : "border-[rgba(217,180,255,0.14)]"
      }`}
    >
      <div className="border-b border-[rgba(217,180,255,0.08)] px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#8f82ad]">
        {tagName === "h2" ? "Título" : "Parágrafo"}
      </div>
      <div
        ref={ref}
        contentEditable={!disabled}
        suppressContentEditableWarning
        role="textbox"
        data-placeholder={placeholder}
        className={`blog-content min-h-16 px-4 py-3 outline-none ${
          tagName === "h2" ? "text-2xl font-bold text-[#f5edff]" : "text-base text-[#f5edff]"
        } empty:before:text-[#8f82ad] empty:before:content-[attr(data-placeholder)]`}
        onFocus={onFocus}
        onInput={syncHtml}
        onBlur={syncHtml}
      />
    </div>
  );
}

function ListBlockEditor({ block, onChange, onFocus, focused, disabled }) {
  return (
    <div
      className={`rounded-xl border bg-[#120b24] transition ${
        focused
          ? "border-[rgba(199,149,255,0.45)] ring-2 ring-[rgba(167,79,255,0.15)]"
          : "border-[rgba(217,180,255,0.14)]"
      }`}
    >
      <div className="border-b border-[rgba(217,180,255,0.08)] px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#8f82ad]">
        Lista
      </div>
      <div className="space-y-2 p-4">
        {block.items.map((item, index) => (
          <div key={`${block.id}-${index}`} className="flex gap-2">
            <span className="pt-2 text-[#8f82ad]">•</span>
            <input
              type="text"
              value={item.replace(/<[^>]+>/g, "")}
              disabled={disabled}
              onFocus={onFocus}
              onChange={(event) => {
                const items = [...block.items];
                items[index] = event.target.value;
                onChange(items);
              }}
              placeholder={`Item ${index + 1}`}
              className="w-full rounded-lg border border-[rgba(217,180,255,0.18)] bg-[#0f0a1f] px-3 py-2 text-sm text-[#f5edff] outline-none focus:border-[rgba(199,149,255,0.45)]"
            />
          </div>
        ))}
        <button
          type="button"
          className={`${BTN_SECONDARY} text-xs`}
          disabled={disabled}
          onClick={() => onChange([...block.items, ""])}
        >
          + Adicionar item
        </button>
      </div>
    </div>
  );
}

export const BlogBlockEditor = forwardRef(function BlogBlockEditor(
  { blocks, onPatchBlocks, resetKey = "new", token, disabled = false },
  ref,
) {
  const blocksPropRef = useRef(blocks);
  blocksPropRef.current = blocks;

  const textBlockRefs = useRef(new Map());
  const [focusedBlockId, setFocusedBlockId] = useState(blocks[0]?.id || null);
  const [editorError, setEditorError] = useState("");
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [showCardPicker, setShowCardPicker] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const savedRangeRef = useRef(null);
  const activeEditorRef = useRef(null);
  const imageInputRef = useRef(null);
  const linkInputRef = useRef(null);

  useEffect(() => {
    setFocusedBlockId(blocks[0]?.id || null);
  }, [resetKey]);

  const patchBlocks = useCallback((updater) => {
    onPatchBlocks?.(updater);
  }, [onPatchBlocks]);

  const patchBlocksWithDomSync = useCallback((updater) => {
    onPatchBlocks?.((current) => {
      const merged = mergeTextBlocksFromDom(current, textBlockRefs.current);
      return updater(merged);
    });
  }, [onPatchBlocks]);

  const registerTextBlockRef = useCallback((blockId, elementRef) => {
    if (!blockId) return;
    if (elementRef) {
      textBlockRefs.current.set(blockId, elementRef);
      return;
    }
    textBlockRefs.current.delete(blockId);
  }, []);

  useImperativeHandle(ref, () => ({
    collectMarkupForSave: () => blocksToSaveMarkup(blocksPropRef.current, textBlockRefs.current),
    getBlocksForSave: () => mergeTextBlocksFromDom(blocksPropRef.current, textBlockRefs.current),
  }), []);

  useEffect(() => {
    if (!showLinkForm) return;
    linkInputRef.current?.focus();
  }, [showLinkForm]);

  const getFocusedBlock = () => blocksPropRef.current.find((block) => block.id === focusedBlockId)
    || blocksPropRef.current[0];

  const rememberSelection = () => {
    savedRangeRef.current = saveSelection(activeEditorRef.current);
  };

  const applyToFocusedTextBlock = (callback) => {
    const focused = getFocusedBlock();
    if (!focused || (focused.type !== "paragraph" && focused.type !== "heading")) {
      setEditorError("Clique em um parágrafo ou título antes de aplicar formatação.");
      return;
    }

    activeEditorRef.current?.focus();
    restoreSelection(savedRangeRef.current);
    callback();
    const html = activeEditorRef.current?.innerHTML || focused.html;
    patchBlocksWithDomSync((current) => updateBlock(current, focused.id, { html }));
    savedRangeRef.current = saveSelection(activeEditorRef.current);
    setEditorError("");
  };

  const insertImageBlock = (url, alt, card = false) => {
    const imageBlock = createImageBlock(url, alt, card);
    patchBlocksWithDomSync((current) => [...current, imageBlock]);
    setFocusedBlockId(imageBlock.id);
    setEditorError("");
  };

  const handleSelectCard = (card) => {
    if (!card?.imagem) {
      setEditorError("Esta carta não possui imagem disponível.");
      return;
    }

    setEditorError("");
    insertImageBlock(card.imagem, card.nome, true);
    setShowCardPicker(false);
  };

  const handleImageSelected = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !token) return;

    setEditorError("");
    setUploadingImage(true);
    setUploadProgress(0);

    try {
      const imageUrl = await uploadBannerImage(file, token, setUploadProgress);
      insertImageBlock(imageUrl, "", false);
    } catch (error) {
      setEditorError(error?.userMessage || error?.message || "Falha ao enviar imagem.");
    } finally {
      setUploadingImage(false);
      setUploadProgress(0);
    }
  };

  const addBlock = (factory, position = "after") => {
    const newBlock = factory();

    patchBlocksWithDomSync((current) => {
      if (position === "start") {
        return [newBlock, ...current];
      }

      const focused = current.find((block) => block.id === focusedBlockId) || current[0];
      if (!focused) return [...current, newBlock];

      return insertBlockAfter(current, focused.id, newBlock);
    });

    setFocusedBlockId(newBlock.id);
  };

  const currentHtml = blocksToSaveMarkup(blocks, textBlockRefs.current);
  const blockSummary = blocks
    .map((block) => {
      if (block.type === "heading") return "título";
      if (block.type === "paragraph") return "parágrafo";
      if (block.type === "image") return block.card ? "carta MTG" : "imagem";
      if (block.type === "list") return "lista";
      return block.type;
    })
    .join(", ");

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[rgba(217,180,255,0.14)] bg-[#0f0a1f] p-4">
        <p className="mb-4 text-sm text-[#b9abd8]">
          Monte o artigo bloco a bloco. Use <strong className="text-[#f5edff]">+ Título</strong>,{" "}
          <strong className="text-[#f5edff]">+ Parágrafo</strong> e <strong className="text-[#f5edff]">Carta MTG</strong>{" "}
          como blocos separados.
        </p>

        <div className="flex flex-wrap gap-2">
          <button type="button" className={toolBtn} disabled={disabled} onClick={() => addBlock(createParagraphBlock)}>
            + Parágrafo
          </button>
          <button type="button" className={toolBtn} disabled={disabled} onClick={() => addBlock(createHeadingBlock, "start")}>
            + Título
          </button>
          <button type="button" className={toolBtn} disabled={disabled} onClick={() => addBlock(createListBlock)}>
            + Lista
          </button>
          <button
            type="button"
            className={toolBtn}
            disabled={disabled}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              rememberSelection();
              applyToFocusedTextBlock(() => runCommand("bold"));
            }}
          >
            Negrito
          </button>
          <button
            type="button"
            className={toolBtn}
            disabled={disabled}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              rememberSelection();
              applyToFocusedTextBlock(() => runCommand("italic"));
            }}
          >
            Itálico
          </button>
          <button
            type="button"
            className={toolBtn}
            disabled={disabled}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              rememberSelection();
              if (!savedRangeRef.current || savedRangeRef.current.collapsed) {
                setEditorError("Selecione o trecho de texto antes de adicionar o link.");
                return;
              }
              setShowCardPicker(false);
              setShowLinkForm(true);
            }}
          >
            Link
          </button>
          <button
            type="button"
            className={`${BTN_SECONDARY} px-3 py-2 text-sm`}
            disabled={disabled || uploadingImage}
            onClick={() => imageInputRef.current?.click()}
          >
            {uploadingImage ? `Enviando foto ${uploadProgress}%` : "Foto do computador"}
          </button>
          <button
            type="button"
            className={toolBtn}
            disabled={disabled}
            onClick={() => {
              setShowLinkForm(false);
              setShowCardPicker(true);
            }}
          >
            Carta MTG
          </button>
        </div>

        {showLinkForm ? (
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              ref={linkInputRef}
              type="url"
              value={linkUrl}
              onChange={(event) => setLinkUrl(event.target.value)}
              placeholder="https://exemplo.com"
              className="w-full flex-1 rounded-lg border border-[rgba(217,180,255,0.18)] bg-[#120b24] px-3 py-2 text-sm text-[#f5edff] outline-none focus:border-[rgba(199,149,255,0.45)]"
              onKeyDown={(event) => {
                if (event.key !== "Enter") return;
                event.preventDefault();
                const url = normalizeLinkUrl(linkUrl);
                if (!url) {
                  setEditorError("Informe um endereço válido para o link.");
                  return;
                }
                applyToFocusedTextBlock(() => runCommand("createLink", url));
                setShowLinkForm(false);
                setLinkUrl("");
              }}
            />
            <button
              type="button"
              className={`${BTN_PRIMARY} px-4 py-2 text-sm`}
              onClick={() => {
                const url = normalizeLinkUrl(linkUrl);
                if (!url) {
                  setEditorError("Informe um endereço válido para o link.");
                  return;
                }
                applyToFocusedTextBlock(() => runCommand("createLink", url));
                setShowLinkForm(false);
                setLinkUrl("");
              }}
            >
              Aplicar link
            </button>
          </div>
        ) : null}

        {showCardPicker ? (
          <BlogScryfallCardPicker
            onSelect={handleSelectCard}
            onCancel={() => setShowCardPicker(false)}
            disabled={disabled}
          />
        ) : null}

        <input
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={handleImageSelected}
        />
      </div>

      <div className="space-y-4">
        {blocks.map((block, index) => (
          <div key={block.id} className="space-y-2">
            {block.type === "paragraph" ? (
              <TextBlockEditor
                block={block}
                tagName="p"
                placeholder="Escreva um parágrafo..."
                focused={focusedBlockId === block.id}
                disabled={disabled}
                onRegisterRef={registerTextBlockRef}
                onFocus={(event) => {
                  setFocusedBlockId(block.id);
                  activeEditorRef.current = event.currentTarget;
                }}
                onChange={(html) => patchBlocks((current) => updateBlock(current, block.id, { html }))}
              />
            ) : null}

            {block.type === "heading" ? (
              <TextBlockEditor
                block={block}
                tagName="h2"
                placeholder="Escreva um título..."
                focused={focusedBlockId === block.id}
                disabled={disabled}
                onRegisterRef={registerTextBlockRef}
                onFocus={(event) => {
                  setFocusedBlockId(block.id);
                  activeEditorRef.current = event.currentTarget;
                }}
                onChange={(html) => patchBlocks((current) => updateBlock(current, block.id, { html }))}
              />
            ) : null}

            {block.type === "list" ? (
              <ListBlockEditor
                block={block}
                focused={focusedBlockId === block.id}
                disabled={disabled}
                onFocus={() => setFocusedBlockId(block.id)}
                onChange={(items) => patchBlocks((current) => updateBlock(current, block.id, { items }))}
              />
            ) : null}

            {block.type === "image" ? (
              <div
                className={`rounded-xl border bg-[#120b24] p-4 ${
                  focusedBlockId === block.id
                    ? "border-[rgba(199,149,255,0.45)]"
                    : "border-[rgba(217,180,255,0.14)]"
                }`}
                onClick={() => setFocusedBlockId(block.id)}
              >
                <div className="mb-3 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#8f82ad]">
                  Imagem {block.card ? "de carta MTG" : ""}
                </div>
                <img
                  src={block.url}
                  alt={block.alt || ""}
                  className={block.card ? "blog-card-image mx-auto block max-w-[220px] rounded-xl" : "max-h-96 max-w-full rounded-xl"}
                />
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2 px-1">
              <button
                type="button"
                className="text-xs text-[#8f82ad] hover:text-[#f5edff]"
                disabled={disabled || index === 0}
                onClick={() => patchBlocksWithDomSync((current) => moveBlock(current, block.id, "up"))}
              >
                Subir
              </button>
              <button
                type="button"
                className="text-xs text-[#8f82ad] hover:text-[#f5edff]"
                disabled={disabled || index === blocks.length - 1}
                onClick={() => patchBlocksWithDomSync((current) => moveBlock(current, block.id, "down"))}
              >
                Descer
              </button>
              <button
                type="button"
                className="text-xs text-[#f87171] hover:text-[#fca5a5]"
                disabled={disabled}
                onClick={() => patchBlocksWithDomSync((current) => removeBlock(current, block.id))}
              >
                Remover bloco
              </button>
            </div>
          </div>
        ))}
      </div>

      {editorError ? (
        <p className="m-0 text-sm text-[#fca5a5]" role="alert">
          {editorError}
        </p>
      ) : null}

      {!isBlogContentEmpty(currentHtml) ? (
        <p className="m-0 text-xs text-[#8f82ad]">
          Pronto para salvar: {blocks.length} bloco{blocks.length === 1 ? "" : "s"} ({blockSummary})
        </p>
      ) : null}
    </div>
  );
});
