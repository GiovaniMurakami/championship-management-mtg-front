import { useEffect, useState } from "react";
import { PageShell } from "../components/ui/PageShell";
import { FormFeedback } from "../components/ui/FormFeedback";
import { Switch } from "../components/ui/Switch";
import { Spinner } from "../components/ui/Spinner";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { PAGE_TITLES } from "../constants/pageTitles";
import {
  buscarAnuncioDiarioAdmin,
  salvarAnuncioDiario,
} from "../services/backendApi";
import { uploadBannerImage, validateBannerImageFile } from "../utils/bannerUpload";
import { BTN_PRIMARY, BTN_SECONDARY, MODAL_INPUT_CLASS, FORM_LABEL_CLASS } from "../styles/uiClasses";

export function DashboardAnuncioDiarioPage() {
  const { token } = useAuth();
  const { addToast } = useToast();
  usePageTitle(PAGE_TITLES.dashboardAnuncioDiario);

  const [ativo, setAtivo] = useState(false);
  const [imagemUrl, setImagemUrl] = useState("");
  const [link, setLink] = useState("");
  const [visualizacoes, setVisualizacoes] = useState(0);
  const [cliques, setCliques] = useState(0);
  const [atualizadoEm, setAtualizadoEm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;

    setLoading(true);
    buscarAnuncioDiarioAdmin(token)
      .then((data) => {
        if (cancelled) return;
        setAtivo(Boolean(data?.ativo));
        setImagemUrl(data?.imagemUrl || "");
        setLink(data?.link || "");
        setVisualizacoes(Number(data?.visualizacoes) || 0);
        setCliques(Number(data?.cliques) || 0);
        setAtualizadoEm(data?.atualizadoEm || null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || "Não foi possível carregar o anúncio diário.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const taxaClique = visualizacoes > 0
    ? ((cliques / visualizacoes) * 100).toFixed(1)
    : "0.0";

  const handleUpload = async (file) => {
    const validationError = validateBannerImageFile(file);
    if (validationError) {
      setError(validationError.userMessage || validationError.message);
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    setError("");
    try {
      const url = await uploadBannerImage(file, token, (progress) => {
        setUploadProgress(progress);
      });
      setImagemUrl(url);
      setMessage("Imagem enviada.");
    } catch (err) {
      setError(err.userMessage || err.message || "Falha ao enviar imagem.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!token) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await salvarAnuncioDiario(
        { ativo, imagemUrl: imagemUrl.trim(), link: link.trim() },
        token,
      );
      setAtivo(Boolean(response?.ativo));
      setImagemUrl(response?.imagemUrl || "");
      setLink(response?.link || "");
      setVisualizacoes(Number(response?.visualizacoes) || 0);
      setCliques(Number(response?.cliques) || 0);
      setAtualizadoEm(response?.atualizadoEm || null);
      setMessage("Anúncio diário salvo.");
      addToast("Anúncio diário atualizado.", { type: "success" });
    } catch (err) {
      setError(err.message || "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell className="mx-auto max-w-5xl px-4 pb-16 pt-28">
      <header className="mb-6">
        <p className="m-0 text-[0.75rem] font-bold uppercase tracking-[0.1em] text-text-subtle">
          Dashboard
        </p>
        <h1 className="m-0 mt-1 font-['Bebas_Neue',sans-serif] text-[2.2rem] tracking-[0.04em] text-white">
          Anúncio diário
        </h1>
        <p className="m-0 mt-2 max-w-2xl text-[0.95rem] leading-6 text-text-soft">
          Popup na primeira visita do dia (horário de Brasília). Configure imagem, link e acompanhe
          visualizações e cliques.
        </p>
      </header>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <form onSubmit={handleSave} className="space-y-5 rounded-2xl border border-line-soft bg-surface/60 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="m-0 text-lg font-bold text-text-main">Configuração</h2>
                <p className="m-0 mt-1 text-sm text-text-muted">
                  Ative para exibir o popup aos visitantes.
                </p>
              </div>
              <Switch
                checked={ativo}
                onCheckedChange={setAtivo}
                label={ativo ? "Ativo" : "Inativo"}
                aria-label="Anúncio ativo"
              />
            </div>

            <div>
              <label className={FORM_LABEL_CLASS} htmlFor="anuncio-diario-link">
                Link ao clicar
              </label>
              <input
                id="anuncio-diario-link"
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://..."
                className={MODAL_INPUT_CLASS}
              />
            </div>

            <div>
              <label className={FORM_LABEL_CLASS} htmlFor="anuncio-diario-imagem">
                URL da imagem
              </label>
              <div className="flex flex-wrap gap-2">
                <input
                  id="anuncio-diario-imagem"
                  type="url"
                  value={imagemUrl}
                  onChange={(e) => setImagemUrl(e.target.value)}
                  placeholder="https://..."
                  className={`${MODAL_INPUT_CLASS} min-w-0 flex-1`}
                />
                <label
                  htmlFor="upload-anuncio-diario"
                  className={`${BTN_SECONDARY} inline-flex cursor-pointer items-center justify-center ${uploading ? "pointer-events-none opacity-60" : ""}`}
                >
                  {uploading ? `${uploadProgress || 0}%` : "Upload"}
                </label>
                <input
                  id="upload-anuncio-diario"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (file) handleUpload(file);
                  }}
                />
              </div>
            </div>

            {message ? <FormFeedback message={message} /> : null}
            {error ? <FormFeedback message={error} variant="error" /> : null}

            <button type="submit" className={BTN_PRIMARY} disabled={saving || uploading}>
              {saving ? "Salvando..." : "Salvar anúncio"}
            </button>
          </form>

          <div className="space-y-5">
            <section className="rounded-2xl border border-line-soft bg-surface/60 p-5">
              <h2 className="m-0 text-lg font-bold text-text-main">Relatórios</h2>
              <p className="m-0 mt-1 text-sm text-text-muted">
                Totais acumulados (preservados ao salvar).
              </p>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-line bg-black/20 p-3 text-center">
                  <div className="text-2xl font-bold text-text-main">{visualizacoes}</div>
                  <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-text-muted">Viram</div>
                </div>
                <div className="rounded-xl border border-line bg-black/20 p-3 text-center">
                  <div className="text-2xl font-bold text-text-main">{cliques}</div>
                  <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-text-muted">Clicaram</div>
                </div>
                <div className="rounded-xl border border-line bg-black/20 p-3 text-center">
                  <div className="text-2xl font-bold text-text-main">{taxaClique}%</div>
                  <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-text-muted">CTR</div>
                </div>
              </div>
              {atualizadoEm && (
                <p className="m-0 mt-3 text-xs text-text-subtle">
                  Atualizado em {new Date(atualizadoEm).toLocaleString("pt-BR")}
                </p>
              )}
            </section>

            <section className="rounded-2xl border border-line-soft bg-surface/60 p-5">
              <h2 className="m-0 mb-3 text-lg font-bold text-text-main">Preview</h2>
              {imagemUrl ? (
                <img
                  src={imagemUrl}
                  alt="Preview do anúncio diário"
                  className="mx-auto max-h-80 w-auto max-w-full rounded-xl border border-line object-contain"
                />
              ) : (
                <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-line text-sm text-text-muted">
                  Nenhuma imagem configurada
                </div>
              )}
            </section>
          </div>
        </div>
      )}
    </PageShell>
  );
}
