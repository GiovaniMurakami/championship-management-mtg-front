import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { LandingHeader } from "../components/ui/LandingHeader";
import { Footer } from "../components";
import { BlogBlockEditor } from "../components/blog/BlogBlockEditor";
import { BlogContent } from "../components/blog/BlogContent";
import { BlogCoverImageField } from "../components/blog/BlogCoverImageField";
import { FormFeedback } from "../components/ui/FormFeedback";
import { FormField } from "../components/ui/FormField";
import { FormSection } from "../components/ui/FormSection";
import { Spinner } from "../components/ui/Spinner";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { PAGE_TITLES } from "../constants/pageTitles";
import {
  alterarPostBlog,
  buscarPostBlogAdmin,
  criarPostBlog,
} from "../services/backendApi";
import { blocksToHtml, createDefaultBlocks, htmlToBlocks } from "../utils/blogBlocks";
import { isBlogContentEmpty } from "../utils/blogEditor";
import {
  BLOG_EDITOR_CARD_CLASS,
  BTN_PRIMARY,
  BTN_SECONDARY,
  FORM_LABEL_CLASS,
} from "../styles/uiClasses";

const emptyForm = {
  titulo: "",
  slug: "",
  resumo: "",
  conteudo: "",
  imagemCapaUrl: "",
  publicado: true,
};

export function BlogEditorPage({ editMode = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { addToast } = useToast();
  const editorRef = useRef(null);
  const editorMarkupRef = useRef("");
  const loadedPostIdRef = useRef(null);
  const [form, setForm] = useState(emptyForm);
  const [editorKey, setEditorKey] = useState("new");
  const [editorBlocks, setEditorBlocks] = useState(() => createDefaultBlocks());
  const [loadingData, setLoadingData] = useState(editMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");

  usePageTitle(
    editMode ? PAGE_TITLES.editarPostBlog : PAGE_TITLES.criarPostBlog,
    { loading: editMode && loadingData },
  );

  useEffect(() => {
    if (!editMode || !token || !id) return;
    if (loadedPostIdRef.current === id) return;

    let active = true;
    setLoadingData(true);

    buscarPostBlogAdmin(id, token)
      .then((data) => {
        if (!active) return;
        const post = data.post || data;
        const conteudo = post.conteudo || "";
        const blocks = htmlToBlocks(conteudo);
        setForm({
          titulo: post.titulo || "",
          slug: post.slug || "",
          resumo: post.resumo || "",
          conteudo,
          imagemCapaUrl: post.imagemCapaUrl || "",
          publicado: post.publicado ?? true,
        });
        setEditorBlocks(blocks);
        editorMarkupRef.current = blocksToHtml(blocks);
        loadedPostIdRef.current = id;
        setEditorKey(id);
      })
      .catch(() => {
        if (!active) return;
        setError("Não foi possível carregar o post.");
      })
      .finally(() => {
        if (active) setLoadingData(false);
      });

    return () => {
      active = false;
    };
  }, [editMode, id, token]);

  const updateField = (field) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const readEditorHtml = useCallback(() => {
    const markup = editorRef.current?.collectMarkupForSave?.();
    if (markup) {
      editorMarkupRef.current = markup;
      return markup;
    }
    return blocksToHtml(editorBlocks);
  }, [editorBlocks]);

  const handlePatchBlocks = useCallback((updater) => {
    setEditorBlocks(updater);
  }, []);

  useEffect(() => {
    const html = blocksToHtml(editorBlocks);
    editorMarkupRef.current = html;
    setForm((current) => {
      if (current.conteudo === html) return current;
      return { ...current, conteudo: html };
    });
  }, [editorBlocks]);

  const handleTogglePreview = () => {
    if (!showPreview) {
      setPreviewHtml(readEditorHtml());
    }
    setShowPreview((current) => !current);
  };

  useEffect(() => {
    if (!showPreview) return;
    setPreviewHtml(readEditorHtml());
  }, [form.conteudo, showPreview]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!token || saving) return;

    const conteudo = readEditorHtml();
    const blocksForSave = editorRef.current?.getBlocksForSave?.() || editorBlocks;
    const blockCount = blocksForSave.length;

    if (blockCount < 1 || isBlogContentEmpty(conteudo)) {
      setError("Escreva o conteúdo do post antes de salvar.");
      return;
    }

    const hasHeading = blocksForSave.some((block) => block.type === "heading");
    const hasImage = blocksForSave.some((block) => block.type === "image");
    if (hasHeading && !conteudo.includes("<titulo>")) {
      setError("O título não foi incluído no conteúdo. Recarregue a página e tente novamente.");
      return;
    }
    if (hasImage && !conteudo.includes("<imagem")) {
      setError("A imagem não foi incluída no conteúdo. Recarregue a página e tente novamente.");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      titulo: form.titulo.trim(),
      slug: form.slug.trim() || undefined,
      resumo: form.resumo.trim(),
      conteudo,
      imagemCapaUrl: form.imagemCapaUrl.trim() || undefined,
      publicado: form.publicado,
    };

    try {
      if (editMode) {
        await alterarPostBlog(id, payload, token);
        addToast("Post atualizado com sucesso.", { type: "success" });
        navigate("/blog/admin");
        return;
      }

      const resultado = await criarPostBlog(payload, token);
      addToast("Post criado com sucesso.", { type: "success" });
      navigate(`/blog/admin/${resultado.post?.id || resultado.id}/editar`, { replace: true });
    } catch (err) {
      setError(err?.message || "Não foi possível salvar o post.");
    } finally {
      setSaving(false);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-[#0e091c] text-[#e8dfff]">
        <LandingHeader />
        <div className="px-4 pt-28">
          <Spinner text="Carregando editor..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e091c] text-[#e8dfff]">
      <LandingHeader />

      <section className="mx-auto w-full max-w-7xl px-4 pt-28 pb-12 sm:px-6 lg:px-8">
        <Link to="/blog/admin" className="mb-4 inline-flex text-sm text-[#c795ff] underline underline-offset-2">
          ← Voltar para gerenciamento
        </Link>

        <section className={BLOG_EDITOR_CARD_CLASS}>
          <h1 className="mb-2 text-3xl font-bold text-[#f5edff]">
            {editMode ? "Editar post" : "Novo post"}
          </h1>
          <p className="mb-8 text-[#9b8dc0]">
            Monte o artigo em blocos: parágrafos, títulos, listas e imagens. Cartas MTG usam a imagem do Scryfall; fotos próprias vão para o armazenamento.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid gap-8 xl:grid-cols-[minmax(0,340px)_1fr]">
              <FormSection title="Informações básicas" className="xl:sticky xl:top-28 xl:self-start">
                <FormField
                  id="titulo"
                  label="Título"
                  value={form.titulo}
                  onChange={updateField("titulo")}
                  required
                  size="page"
                />

                <FormField
                  id="slug"
                  label="Slug (opcional)"
                  hint="Se vazio, será gerado a partir do título."
                  value={form.slug}
                  onChange={updateField("slug")}
                  placeholder="guia-de-side-rakdos-madness"
                  size="page"
                />

                <FormField
                  id="resumo"
                  label="Resumo"
                  value={form.resumo}
                  onChange={updateField("resumo")}
                  required
                  multiline
                  rows={4}
                  size="page"
                />

                <div>
                  <span className={FORM_LABEL_CLASS}>Imagem de capa</span>
                  <BlogCoverImageField
                    value={form.imagemCapaUrl}
                    onChange={(imagemCapaUrl) => setForm((current) => ({ ...current, imagemCapaUrl }))}
                    token={token}
                    disabled={saving}
                  />
                </div>

                <label className="flex items-center gap-3 text-sm text-[#d8cff0]">
                  <input
                    type="checkbox"
                    checked={form.publicado}
                    onChange={updateField("publicado")}
                    className="h-4 w-4 accent-[#8e39ed]"
                  />
                  Publicar post
                </label>
              </FormSection>

              <FormSection title="Conteúdo do artigo">
                <BlogBlockEditor
                  ref={editorRef}
                  key={editorKey}
                  blocks={editorBlocks}
                  resetKey={editorKey}
                  onPatchBlocks={handlePatchBlocks}
                  token={token}
                  disabled={saving}
                />

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    className={`${BTN_SECONDARY} text-sm`}
                    onClick={handleTogglePreview}
                  >
                    {showPreview ? "Ocultar prévia" : "Ver prévia do artigo"}
                  </button>
                </div>

                {showPreview && !isBlogContentEmpty(previewHtml) ? (
                  <div className="mt-4 rounded-xl border border-[rgba(217,180,255,0.12)] bg-[#0b0717] p-5">
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.1em] text-[#8f82ad]">Prévia</p>
                    <BlogContent html={previewHtml} />
                  </div>
                ) : null}
              </FormSection>
            </div>

            <FormFeedback message={error} variant="error" />

            <div className="flex flex-wrap gap-3 border-t border-[rgba(217,180,255,0.1)] pt-6">
              <button type="submit" className={BTN_PRIMARY} disabled={saving}>
                {saving ? "Salvando..." : editMode ? "Salvar alterações" : "Criar post"}
              </button>
              <Link to="/blog/admin" className={`${BTN_SECONDARY} no-underline`}>
                Cancelar
              </Link>
            </div>
          </form>
        </section>
      </section>

      <Footer />
    </div>
  );
}
