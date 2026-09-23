import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { criarTime, atualizarTime, buscarTime } from "../services/backendApi";
import { uploadBannerImage, validateBannerImageFile } from "../utils/bannerUpload";
import { useAuth } from "../hooks/useAuth";
import { BackButton, Button, FormFeedback, FormField, FormSection, PageShell } from "../components/ui";
import { FORM_PAGE_SHELL_CLASS, FORM_PAGE_TITLE_CLASS } from "../styles/uiClasses";
import { logError } from "../utils/logger";
import { usePageTitle } from "../hooks/usePageTitle";
import { PAGE_TITLES } from "../constants/pageTitles";

export function TimeCreatePage({ editMode = false }) {
  const { id: timeId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({ nome: "", descricao: "" });
  const [imagemFile, setImagemFile] = useState(null);
  const [imagemPreview, setImagemPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(editMode);
  const [error, setError] = useState("");

  usePageTitle(
    editMode ? (form.nome || PAGE_TITLES.editarTime) : PAGE_TITLES.criarTime,
    { loading: editMode && loadingData && !form.nome },
  );

  const loadData = useCallback(async () => {
    if (!token || !editMode || !timeId) return;
    try {
      const data = await buscarTime(timeId, token);
      const time = data.time || data;
      setForm({ nome: time.nome || "", descricao: time.descricao || "" });
      if (time.imagemUrl) setImagemPreview(time.imagemUrl);
    } catch (err) {
      logError("Erro ao carregar time:", err);
      setError("Erro ao carregar dados do time.");
    } finally {
      setLoadingData(false);
    }
  }, [token, editMode, timeId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validationError = validateBannerImageFile(file);
    if (validationError) {
      setError(validationError.userMessage);
      return;
    }
    setError("");
    setImagemFile(file);
    setImagemPreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImagemFile(null);
    setImagemPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      let imagemUrl;
      if (imagemFile) {
        imagemUrl = await uploadBannerImage(imagemFile, token, setUploadProgress);
      }
      const payload = { ...form, ...(imagemUrl ? { imagemUrl } : {}) };
      if (editMode && timeId) {
        await atualizarTime(timeId, payload, token);
        navigate(`/times/${timeId}`);
      } else {
        await criarTime(payload, token);
        navigate("/times");
      }
    } catch (err) {
      setError(err?.message || err?.userMessage || (editMode ? "Erro ao atualizar time." : "Erro ao criar time."));
      logError(err);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  if (loadingData) {
    return (
      <PageShell>
        <div className="animate-pulse max-w-[600px] mx-auto">
          <div className="h-8 w-48 bg-white/[0.06] rounded mb-8" />
          <div className="h-[300px] bg-white/[0.03] rounded-xl" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <BackButton
        className="mb-6"
        onClick={() => navigate(editMode && timeId ? `/times/${timeId}` : "/times")}
      />

      <section className={FORM_PAGE_SHELL_CLASS}>
        <div className="max-w-[600px] mx-auto">
          <h2 className={FORM_PAGE_TITLE_CLASS}>
            {editMode ? "Editar Time" : "Criar Novo Time"}
          </h2>
          <form onSubmit={handleSubmit} className="grid gap-6">
            <FormSection title="Informações">
              <FormField
                id="time-nome"
                name="nome"
                label="Nome do Time"
                size="page"
                placeholder="Ex: Os Dragões"
                value={form.nome}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <FormField
                id="time-descricao"
                name="descricao"
                label="Descrição (opcional)"
                size="page"
                multiline
                rows={3}
                placeholder="Descreva o time..."
                value={form.descricao}
                onChange={handleChange}
                disabled={loading}
              />
              <div className="grid gap-2">
                <span className="text-[0.82rem] font-semibold uppercase tracking-[0.06em] text-text-subtle">
                  Imagem do Time <span className="normal-case tracking-normal font-normal text-text-muted">(opcional)</span>
                </span>
                {imagemPreview ? (
                  <div className="flex items-center gap-4">
                    <img
                      src={imagemPreview}
                      alt="Preview da imagem do time"
                      className="w-20 h-20 rounded-xl object-cover border border-[rgba(199,149,255,0.3)]"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      disabled={loading}
                      className="text-[0.82rem] text-[#fca5a5] border border-[rgba(239,68,68,0.35)] rounded-lg px-3 py-1 bg-[rgba(239,68,68,0.06)] hover:bg-[rgba(239,68,68,0.15)] transition-colors disabled:opacity-50"
                    >
                      Remover
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className="self-start px-4 py-2 border border-[rgba(199,149,255,0.3)] rounded-lg bg-white/[0.03] text-text-soft text-[0.88rem] font-medium cursor-pointer transition-all duration-200 hover:border-line-strong hover:bg-white/[0.06] disabled:opacity-50"
                  >
                    Selecionar imagem
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <p className="m-0 text-xs text-text-muted">Recomendado: imagem quadrada, 512 × 512 px.</p>
                {loading && imagemFile && uploadProgress > 0 && (
                  <div className="h-1 w-full bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#8e39ed] to-[#5f23b3] transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>
            </FormSection>

            {error ? <FormFeedback message={error} variant="error" /> : null}

            <Button type="submit" size="lg" block loading={loading}>
              {loading
                ? editMode ? "Salvando..." : "Criando..."
                : editMode ? "Salvar Alterações" : "Criar Time"}
            </Button>
          </form>
        </div>
      </section>
    </PageShell>
  );
}
