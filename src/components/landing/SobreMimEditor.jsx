import { useEffect, useState } from "react";
import { FormFeedback } from "../ui/FormFeedback";
import { Spinner } from "../ui/Spinner";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../context/ToastContext";
import { buscarSobreMim, salvarSobreMim } from "../../services/backendApi";
import { uploadBannerImage, validateBannerImageFile } from "../../utils/bannerUpload";
import { BTN_PRIMARY, BTN_SECONDARY, BTN_DANGER, MODAL_INPUT_CLASS, FORM_LABEL_CLASS } from "../../styles/uiClasses";

/** Formulário admin da página Sobre mim. */
export function SobreMimEditor({ onSaved }) {
  const { token, isAdmin } = useAuth();
  const { addToast } = useToast();

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    buscarSobreMim()
      .then((data) => {
        if (cancelled) return;
        setForm({
          tituloHistoria: data?.tituloHistoria || "",
          historia: data?.historia || "",
          fotoUrl: data?.fotoUrl || "",
          apoiaTitulo: data?.apoiaTitulo || "",
          apoiaTexto: data?.apoiaTexto || "",
          apoiaImagemUrl: data?.apoiaImagemUrl || "",
          apoiaUrl: data?.apoiaUrl || "",
          galeriaTitulo: data?.galeriaTitulo || "",
          galeriaUrls: Array.isArray(data?.galeriaUrls) ? data.galeriaUrls : [],
          agradecimentoTitulo: data?.agradecimentoTitulo || "",
          agradecimentoTexto: data?.agradecimentoTexto || "",
          apoiadores: data?.apoiadores || "",
        });
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || "Não foi possível carregar.");
          setForm(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const patch = (fields) => setForm((prev) => ({ ...prev, ...fields }));

  const handleUpload = async (field, file, galleryIndex = null) => {
    const validationError = validateBannerImageFile(file, { isAdmin });
    if (validationError) {
      setError(validationError.userMessage || validationError.message);
      return;
    }
    const key = galleryIndex != null ? `galeria-${galleryIndex}` : field;
    setUploading(key);
    setError("");
    try {
      const url = await uploadBannerImage(file, token, undefined, { isAdmin, profile: "foto" });
      if (galleryIndex != null) {
        setForm((prev) => {
          const next = [...(prev.galeriaUrls || [])];
          next[galleryIndex] = url;
          return { ...prev, galeriaUrls: next };
        });
      } else {
        patch({ [field]: url });
      }
      setMessage("Imagem enviada.");
    } catch (err) {
      setError(err.userMessage || err.message || "Falha ao enviar imagem.");
    } finally {
      setUploading(null);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!form) return;
    if (!token) {
      setError("Faça login como admin para salvar.");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await salvarSobreMim({
        ...form,
        galeriaUrls: (form.galeriaUrls || []).map((u) => String(u || "").trim()).filter(Boolean),
      }, token);
      setForm({
        tituloHistoria: response?.tituloHistoria || "",
        historia: response?.historia || "",
        fotoUrl: response?.fotoUrl || "",
        apoiaTitulo: response?.apoiaTitulo || "",
        apoiaTexto: response?.apoiaTexto || "",
        apoiaImagemUrl: response?.apoiaImagemUrl || "",
        apoiaUrl: response?.apoiaUrl || "",
        galeriaTitulo: response?.galeriaTitulo || "",
        galeriaUrls: Array.isArray(response?.galeriaUrls) ? response.galeriaUrls : [],
        agradecimentoTitulo: response?.agradecimentoTitulo || "",
        agradecimentoTexto: response?.agradecimentoTexto || "",
        apoiadores: response?.apoiadores || "",
      });
      setMessage("Sobre mim salvo.");
      addToast("Sobre mim atualizado.", { type: "success" });
      onSaved?.(response);
    } catch (err) {
      setError(err.message || "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) {
    return <div className="flex justify-center py-10"><Spinner /></div>;
  }

  const imageField = (id, label, field, preview, sizeHint) => (
    <div>
      <label className={FORM_LABEL_CLASS} htmlFor={id}>{label}</label>
      <div className="flex flex-wrap gap-2">
        <input
          id={id}
          value={form[field]}
          onChange={(e) => patch({ [field]: e.target.value })}
          className={`${MODAL_INPUT_CLASS} min-w-0 flex-1`}
        />
        <label
          htmlFor={`${id}-file`}
          className={`${BTN_SECONDARY} inline-flex cursor-pointer items-center px-3 ${uploading === field ? "pointer-events-none opacity-60" : ""}`}
        >
          {uploading === field ? "Enviando…" : "Upload"}
        </label>
        <input
          id={`${id}-file`}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          disabled={uploading === field}
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) handleUpload(field, file);
          }}
        />
      </div>
      {sizeHint ? (
        <p className="m-0 mt-1.5 text-[0.75rem] text-text-muted">{sizeHint}</p>
      ) : null}
      {preview && form[field] ? (
        <img src={form[field]} alt="" className="mt-2 max-h-28 rounded-lg object-cover" />
      ) : null}
    </div>
  );

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <div className="space-y-3">
        <h3 className="m-0 text-sm font-bold text-text-main">História</h3>
        <div>
          <label className={FORM_LABEL_CLASS} htmlFor="titulo-historia">Título</label>
          <input id="titulo-historia" value={form.tituloHistoria} onChange={(e) => patch({ tituloHistoria: e.target.value })} className={MODAL_INPUT_CLASS} maxLength={160} />
        </div>
        <div>
          <label className={FORM_LABEL_CLASS} htmlFor="historia">Texto</label>
          <textarea id="historia" value={form.historia} onChange={(e) => patch({ historia: e.target.value })} className={`${MODAL_INPUT_CLASS} min-h-[10rem]`} maxLength={8000} />
        </div>
        {imageField(
          "foto-url",
          "Foto de perfil",
          "fotoUrl",
          true,
          "Ideal: 800 × 1000 px (proporção 4:5, retrato).",
        )}
      </div>

      <div className="space-y-3 border-t border-line-soft pt-4">
        <h3 className="m-0 text-sm font-bold text-text-main">Apoia-se</h3>
        <div>
          <label className={FORM_LABEL_CLASS} htmlFor="apoia-titulo">Título</label>
          <input id="apoia-titulo" value={form.apoiaTitulo} onChange={(e) => patch({ apoiaTitulo: e.target.value })} className={MODAL_INPUT_CLASS} maxLength={160} />
        </div>
        <div>
          <label className={FORM_LABEL_CLASS} htmlFor="apoia-texto">Texto</label>
          <textarea id="apoia-texto" value={form.apoiaTexto} onChange={(e) => patch({ apoiaTexto: e.target.value })} className={`${MODAL_INPUT_CLASS} min-h-[4rem]`} maxLength={800} />
        </div>
        <div>
          <label className={FORM_LABEL_CLASS} htmlFor="apoia-url">Link</label>
          <input id="apoia-url" type="url" value={form.apoiaUrl} onChange={(e) => patch({ apoiaUrl: e.target.value })} className={MODAL_INPUT_CLASS} />
        </div>
        {imageField(
          "apoia-img",
          "Imagem",
          "apoiaImagemUrl",
          true,
          "Ideal: 1200 × 900 px (proporção 4:3).",
        )}
      </div>

      <div className="space-y-3 border-t border-line-soft pt-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="m-0 text-sm font-bold text-text-main">Galeria</h3>
          <button
            type="button"
            className={BTN_SECONDARY}
            onClick={() => patch({ galeriaUrls: [...(form.galeriaUrls || []), ""] })}
          >
            + Foto
          </button>
        </div>
        <div>
          <label className={FORM_LABEL_CLASS} htmlFor="galeria-titulo">Título da galeria</label>
          <input id="galeria-titulo" value={form.galeriaTitulo} onChange={(e) => patch({ galeriaTitulo: e.target.value })} className={MODAL_INPUT_CLASS} maxLength={160} />
        </div>
        {(form.galeriaUrls || []).map((url, index) => (
          <div key={`gal-${index}`} className="rounded-xl border border-line-soft p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-text-soft">Foto {index + 1}</span>
              <button
                type="button"
                className={BTN_DANGER}
                onClick={() => patch({ galeriaUrls: form.galeriaUrls.filter((_, i) => i !== index) })}
              >
                Remover
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                value={url}
                onChange={(e) => {
                  const next = [...form.galeriaUrls];
                  next[index] = e.target.value;
                  patch({ galeriaUrls: next });
                }}
                className={`${MODAL_INPUT_CLASS} min-w-0 flex-1`}
              />
              <label
                htmlFor={`galeria-file-${index}`}
                className={`${BTN_SECONDARY} inline-flex cursor-pointer items-center px-3 ${uploading === `galeria-${index}` ? "pointer-events-none opacity-60" : ""}`}
              >
                {uploading === `galeria-${index}` ? "Enviando…" : "Upload"}
              </label>
              <input
                id={`galeria-file-${index}`}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                disabled={uploading === `galeria-${index}`}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) handleUpload("galeriaUrls", file, index);
                }}
              />
            </div>
            <p className="m-0 text-[0.75rem] text-text-muted">
              Ideal: 800 × 800 px (quadrado).
            </p>
            {url ? <img src={url} alt="" className="max-h-24 rounded-lg object-cover" /> : null}
          </div>
        ))}
      </div>

      <div className="space-y-3 border-t border-line-soft pt-4">
        <h3 className="m-0 text-sm font-bold text-text-main">Agradecimento / apoiadores</h3>
        <div>
          <label className={FORM_LABEL_CLASS} htmlFor="agr-titulo">Título</label>
          <input id="agr-titulo" value={form.agradecimentoTitulo} onChange={(e) => patch({ agradecimentoTitulo: e.target.value })} className={MODAL_INPUT_CLASS} maxLength={160} />
        </div>
        <div>
          <label className={FORM_LABEL_CLASS} htmlFor="agr-texto">Texto</label>
          <input id="agr-texto" value={form.agradecimentoTexto} onChange={(e) => patch({ agradecimentoTexto: e.target.value })} className={MODAL_INPUT_CLASS} maxLength={400} />
        </div>
        <div>
          <label className={FORM_LABEL_CLASS} htmlFor="apoiadores">Apoiadores (separados por ;)</label>
          <textarea id="apoiadores" value={form.apoiadores} onChange={(e) => patch({ apoiadores: e.target.value })} className={`${MODAL_INPUT_CLASS} min-h-[6rem]`} maxLength={12000} />
        </div>
      </div>

      {message ? <FormFeedback message={message} /> : null}
      {error ? <FormFeedback message={error} variant="error" /> : null}

      <div className="flex justify-end sticky bottom-0 bg-surface/95 py-2">
        <button type="submit" className={BTN_PRIMARY} disabled={saving || uploading}>
          {saving ? "Salvando..." : "Salvar Sobre mim"}
        </button>
      </div>
    </form>
  );
}
