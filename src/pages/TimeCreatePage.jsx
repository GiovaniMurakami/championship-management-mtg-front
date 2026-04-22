import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { criarTime, atualizarTime, buscarTime } from "../services/backendApi";
import { uploadBannerImage, validateBannerImageFile } from "../utils/bannerUpload";
import { useAuth } from "../hooks/useAuth";
import { PageShell } from "../components/ui/PageShell";
import { TOURNAMENT_INPUT_CLASS } from "../styles/uiClasses";

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

  const loadData = useCallback(async () => {
    if (!token || !editMode || !timeId) return;
    try {
      const data = await buscarTime(timeId, token);
      const time = data.time || data;
      setForm({ nome: time.nome || "", descricao: time.descricao || "" });
      if (time.imagemUrl) setImagemPreview(time.imagemUrl);
    } catch (err) {
      console.error("Erro ao carregar time:", err);
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
      setError(err?.userMessage || (editMode ? "Erro ao atualizar time." : "Erro ao criar time."));
      console.error(err);
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
      <button
        className="inline-flex items-center gap-[0.4rem] px-4 py-2 border border-[rgba(217,180,255,0.2)] rounded-xl bg-white/[0.03] text-[#beafd7] text-[0.9rem] font-medium cursor-pointer transition-all duration-200 mb-6 hover:text-white hover:border-[rgba(199,149,255,0.5)] hover:bg-white/[0.06] hover:-translate-x-[2px]"
        type="button"
        onClick={() => navigate(editMode && timeId ? `/times/${timeId}` : "/times")}
      >
        ← Voltar
      </button>

      <section className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-8 mb-8 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] max-[768px]:p-6">
        <div className="max-w-[600px] mx-auto">
          <h2 className="text-white text-center mb-8 text-[1.8rem] font-semibold max-[768px]:text-[1.5rem]">
            {editMode ? "Editar Time" : "Criar Novo Time"}
          </h2>
          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="flex flex-col gap-4 p-5 border border-[rgba(79,70,229,0.2)] rounded-[10px] bg-[rgba(79,70,229,0.04)]">
              <h3 className="text-[0.78rem] font-bold tracking-[0.08em] uppercase text-[#a5b4fc] m-0 mb-1 pb-2 border-b border-[rgba(79,70,229,0.18)]">
                Informações
              </h3>
              <div className="flex flex-col gap-2">
                <label htmlFor="time-nome" className="text-[#e0e0e0] font-medium text-[0.95rem]">
                  Nome do Time
                </label>
                <input
                  id="time-nome"
                  name="nome"
                  type="text"
                  placeholder="Ex: Os Dragões"
                  value={form.nome}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className={TOURNAMENT_INPUT_CLASS}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="time-descricao" className="text-[#e0e0e0] font-medium text-[0.95rem]">
                  Descrição <span className="text-[#beafd7] text-[0.82rem]">(opcional)</span>
                </label>
                <textarea
                  id="time-descricao"
                  name="descricao"
                  placeholder="Descreva o time..."
                  value={form.descricao}
                  onChange={handleChange}
                  rows={3}
                  disabled={loading}
                  className={`${TOURNAMENT_INPUT_CLASS} resize-y min-h-[80px]`}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[#e0e0e0] font-medium text-[0.95rem]">
                  Imagem do Time <span className="text-[#beafd7] text-[0.82rem]">(opcional)</span>
                </label>
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
                    className="self-start px-4 py-2 border border-[rgba(199,149,255,0.3)] rounded-lg bg-white/[0.03] text-[#beafd7] text-[0.88rem] font-medium cursor-pointer transition-all duration-200 hover:border-[rgba(199,149,255,0.5)] hover:bg-white/[0.06] disabled:opacity-50"
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
                {loading && imagemFile && uploadProgress > 0 && (
                  <div className="h-1 w-full bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-[rgba(239,68,68,0.1)] border border-[#ef4444] text-[#fca5a5] px-3 py-3 rounded-[6px] text-[0.9rem] text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] text-white border-none px-8 py-4 rounded-lg text-[1.1rem] font-semibold cursor-pointer transition-all duration-300 mt-2 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(79,70,229,0.4)] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:!transform-none"
              disabled={loading}
            >
              {loading
                ? editMode ? "Salvando..." : "Criando..."
                : editMode ? "Salvar Alterações" : "Criar Time"}
            </button>
          </form>
        </div>
      </section>
    </PageShell>
  );
}
