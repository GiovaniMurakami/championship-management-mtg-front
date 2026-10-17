import { useEffect, useState } from "react";
import { FormFeedback } from "../ui/FormFeedback";
import { Switch } from "../ui/Switch";
import { Spinner } from "../ui/Spinner";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../context/ToastContext";
import { buscarSlidesHomeAdmin, salvarSlidesHome } from "../../services/backendApi";
import { uploadBannerImage, validateBannerImageFile } from "../../utils/bannerUpload";
import { BTN_PRIMARY, BTN_SECONDARY, BTN_DANGER, MODAL_INPUT_CLASS, FORM_LABEL_CLASS } from "../../styles/uiClasses";

function slideVazio(ordem = 0) {
  return {
    id: undefined,
    imagemUrl: "",
    titulo: "",
    texto: "",
    ctaTexto: "",
    ctaUrl: "",
    ativo: true,
    ordem,
  };
}

/** Formulário de slides da home — reutilizado no dashboard e no modal da landing. */
export function SlidesHomeEditor({ onSaved, showHeader = false }) {
  const { token, isAdmin } = useAuth();
  const { addToast } = useToast();

  const [slides, setSlides] = useState([slideVazio(0)]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;
    setLoading(true);
    buscarSlidesHomeAdmin(token)
      .then((data) => {
        if (cancelled) return;
        const lista = Array.isArray(data?.slides) ? data.slides : [];
        setSlides(lista.length > 0 ? lista.map((s, i) => ({
          id: s.id,
          imagemUrl: s.imagemUrl || "",
          titulo: s.titulo || "",
          texto: s.texto || "",
          ctaTexto: s.ctaTexto || "",
          ctaUrl: s.ctaUrl || "",
          ativo: s.ativo !== false,
          ordem: Number.isFinite(s.ordem) ? s.ordem : i,
        })) : [slideVazio(0)]);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Não foi possível carregar os slides.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [token]);

  const atualizar = (index, patch) => {
    setSlides((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const handleUpload = async (index, file) => {
    const validationError = validateBannerImageFile(file, { isAdmin });
    if (validationError) {
      setError(validationError.userMessage || validationError.message);
      return;
    }
    setUploadingIndex(index);
    setError("");
    try {
      const url = await uploadBannerImage(file, token, undefined, { isAdmin, profile: "foto" });
      atualizar(index, { imagemUrl: url });
      setMessage("Imagem enviada.");
    } catch (err) {
      setError(err.userMessage || err.message || "Falha ao enviar imagem.");
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!token) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const payload = slides.map((s, index) => ({
        id: s.id,
        imagemUrl: s.imagemUrl.trim(),
        titulo: s.titulo.trim(),
        texto: s.texto.trim(),
        ctaTexto: s.ctaTexto.trim(),
        ctaUrl: s.ctaUrl.trim(),
        ativo: Boolean(s.ativo),
        ordem: index,
      }));
      const response = await salvarSlidesHome(payload, token);
      const lista = Array.isArray(response?.slides) ? response.slides : [];
      const next = lista.map((s, i) => ({
        id: s.id,
        imagemUrl: s.imagemUrl || "",
        titulo: s.titulo || "",
        texto: s.texto || "",
        ctaTexto: s.ctaTexto || "",
        ctaUrl: s.ctaUrl || "",
        ativo: s.ativo !== false,
        ordem: Number.isFinite(s.ordem) ? s.ordem : i,
      }));
      setSlides(next);
      setMessage("Slides da home salvos.");
      addToast("Slides da home atualizados.", { type: "success" });
      onSaved?.(response);
    } catch (err) {
      setError(err.message || "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-10"><Spinner /></div>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      {showHeader ? (
        <header>
          <h2 className="m-0 text-lg font-bold text-text-main">Slides da home</h2>
          <p className="m-0 mt-1 text-sm text-text-soft">Carrossel hero. Ordem = sequência do carrossel.</p>
        </header>
      ) : null}

      <div className="flex justify-end">
        <button
          type="button"
          className={BTN_SECONDARY}
          onClick={() => setSlides((prev) => [...prev, slideVazio(prev.length)])}
        >
          + Adicionar slide
        </button>
      </div>

      {slides.map((slide, index) => {
        const uploading = uploadingIndex === index;
        return (
          <div
            key={slide.id || `novo-${index}`}
            className="grid gap-4 rounded-2xl border border-line-soft bg-surface/60 p-4 lg:grid-cols-[1.1fr_0.9fr]"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <h3 className="m-0 text-base font-bold text-text-main">Slide {index + 1}</h3>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={Boolean(slide.ativo)}
                    onCheckedChange={(checked) => atualizar(index, { ativo: checked })}
                    label={slide.ativo ? "Ativo" : "Inativo"}
                  />
                  {slides.length > 1 ? (
                    <button
                      type="button"
                      className={BTN_DANGER}
                      onClick={() => setSlides((prev) => prev.filter((_, i) => i !== index))}
                    >
                      Remover
                    </button>
                  ) : null}
                </div>
              </div>

              {[
                ["titulo", "Título", "text"],
                ["texto", "Texto", "text"],
                ["ctaTexto", "Texto do botão", "text"],
                ["ctaUrl", "URL do botão", "url"],
                ["imagemUrl", "URL da imagem", "url"],
              ].map(([field, label, type]) => (
                <div key={field}>
                  <label className={FORM_LABEL_CLASS} htmlFor={`slide-${field}-${index}`}>{label}</label>
                  <div className={field === "imagemUrl" ? "flex flex-wrap gap-2" : ""}>
                    <input
                      id={`slide-${field}-${index}`}
                      type={type}
                      value={slide[field]}
                      onChange={(e) => atualizar(index, { [field]: e.target.value })}
                      className={`${MODAL_INPUT_CLASS} ${field === "imagemUrl" ? "min-w-0 flex-1" : ""}`}
                    />
                    {field === "imagemUrl" ? (
                      <>
                        <label
                          htmlFor={`upload-slide-${index}`}
                          className={`${BTN_SECONDARY} inline-flex cursor-pointer items-center px-3 ${uploading ? "pointer-events-none opacity-60" : ""}`}
                        >
                          {uploading ? "Enviando…" : "Upload"}
                        </label>
                        <input
                          id={`upload-slide-${index}`}
                          type="file"
                          accept="image/jpeg,image/png,image/gif,image/webp"
                          className="hidden"
                          disabled={uploading}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            e.target.value = "";
                            if (file) handleUpload(index, file);
                          }}
                        />
                      </>
                    ) : null}
                  </div>
                  {field === "imagemUrl" ? (
                    <p className="m-0 mt-1.5 text-[0.75rem] text-text-muted">
                      Ideal: 1920 × 800 px (proporção ~12:5, full-bleed do hero).
                    </p>
                  ) : null}
                </div>
              ))}
            </div>

            <div>
              <h4 className="m-0 mb-2 text-sm font-bold text-text-main">Preview</h4>
              {slide.imagemUrl ? (
                <div
                  className="relative h-40 overflow-hidden rounded-xl border border-line bg-cover bg-center"
                  style={{ backgroundImage: `url(${slide.imagemUrl})` }}
                >
                  <div className="absolute inset-0 bg-black/45" />
                  <div className="relative z-10 flex h-full flex-col justify-end p-3 text-white">
                    <p className="m-0 font-bold text-sm">{slide.titulo || "Título"}</p>
                    {slide.texto ? <p className="m-0 mt-1 text-xs line-clamp-2">{slide.texto}</p> : null}
                  </div>
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-line text-sm text-text-muted">
                  Sem imagem
                </div>
              )}
            </div>
          </div>
        );
      })}

      {message ? <FormFeedback message={message} /> : null}
      {error ? <FormFeedback message={error} variant="error" /> : null}

      <div className="flex justify-end sticky bottom-0 bg-surface/95 py-2">
        <button type="submit" className={BTN_PRIMARY} disabled={saving || uploadingIndex !== null}>
          {saving ? "Salvando..." : "Salvar slides"}
        </button>
      </div>
    </form>
  );
}
