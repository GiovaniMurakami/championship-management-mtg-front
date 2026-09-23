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
import { uploadBannerImage, validateBannerImageFile, OG_BANNER_MAX_WIDTH, OG_BANNER_MAX_HEIGHT } from "../utils/bannerUpload";
import { BTN_PRIMARY, BTN_SECONDARY, BTN_DANGER, MODAL_INPUT_CLASS, FORM_LABEL_CLASS } from "../styles/uiClasses";

const IMAGE_SIZE_HINT = `${OG_BANNER_MAX_WIDTH} × ${OG_BANNER_MAX_HEIGHT} px`;

function criarAnuncioVazio(ordem = 0) {
  return {
    id: undefined,
    imagemUrl: "",
    link: "",
    ativo: true,
    ordem,
    visualizacoes: 0,
    cliques: 0,
  };
}

export function DashboardAnuncioDiarioPage() {
  const { token } = useAuth();
  const { addToast } = useToast();
  usePageTitle(PAGE_TITLES.dashboardAnuncioDiario);

  const [anuncios, setAnuncios] = useState([criarAnuncioVazio(0)]);
  const [atualizadoEm, setAtualizadoEm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(null);
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
        const lista = Array.isArray(data?.anuncios) ? data.anuncios : [];
        setAnuncios(
          lista.length > 0
            ? lista.map((a, i) => ({
                id: a.id,
                imagemUrl: a.imagemUrl || "",
                link: a.link || "",
                ativo: a.ativo !== false,
                ordem: Number.isFinite(a.ordem) ? a.ordem : i,
                visualizacoes: Number(a.visualizacoes) || 0,
                cliques: Number(a.cliques) || 0,
              }))
            : [criarAnuncioVazio(0)]
        );
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

  const atualizarAnuncio = (index, patch) => {
    setAnuncios((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const handleUpload = async (index, file) => {
    const validationError = validateBannerImageFile(file);
    if (validationError) {
      setError(validationError.userMessage || validationError.message);
      return;
    }
    setUploadingIndex(index);
    setUploadProgress(0);
    setError("");
    try {
      const url = await uploadBannerImage(file, token, (progress) => {
        setUploadProgress(progress);
      });
      atualizarAnuncio(index, { imagemUrl: url });
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
      const payload = {
        anuncios: anuncios.map((a, index) => ({
          id: a.id,
          imagemUrl: a.imagemUrl.trim(),
          link: a.link.trim(),
          ativo: Boolean(a.ativo),
          ordem: index,
        })),
      };
      const response = await salvarAnuncioDiario(payload, token);
      const lista = Array.isArray(response?.anuncios) ? response.anuncios : [];
      setAnuncios(
        lista.map((a, i) => ({
          id: a.id,
          imagemUrl: a.imagemUrl || "",
          link: a.link || "",
          ativo: a.ativo !== false,
          ordem: Number.isFinite(a.ordem) ? a.ordem : i,
          visualizacoes: Number(a.visualizacoes) || 0,
          cliques: Number(a.cliques) || 0,
        }))
      );
      setAtualizadoEm(response?.atualizadoEm || null);
      setMessage("Carrossel de anúncios diários salvo.");
      addToast("Anúncios diários atualizados.", { type: "success" });
    } catch (err) {
      setError(err.message || "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  };

  const totais = anuncios.reduce(
    (acc, a) => ({
      visualizacoes: acc.visualizacoes + (Number(a.visualizacoes) || 0),
      cliques: acc.cliques + (Number(a.cliques) || 0),
    }),
    { visualizacoes: 0, cliques: 0 }
  );
  const taxaClique = totais.visualizacoes > 0
    ? ((totais.cliques / totais.visualizacoes) * 100).toFixed(1)
    : "0.0";

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
          Carrossel: mostra 1 anúncio por carregamento de página. Após fechar, na próxima visita do dia
          (horário de Brasília) aparece o seguinte, e assim por diante.
        </p>
      </header>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="m-0 text-sm text-text-muted">
              Ordem = sequência do carrossel. Imagem recomendada: <strong className="text-text-soft">{IMAGE_SIZE_HINT}</strong>.
            </p>
            <button
              type="button"
              className={BTN_SECONDARY}
              onClick={() => setAnuncios((prev) => [...prev, criarAnuncioVazio(prev.length)])}
            >
              + Adicionar anúncio
            </button>
          </div>

          {anuncios.map((anuncio, index) => {
            const ctr = anuncio.visualizacoes > 0
              ? ((anuncio.cliques / anuncio.visualizacoes) * 100).toFixed(1)
              : "0.0";
            const uploading = uploadingIndex === index;

            return (
              <div
                key={anuncio.id || `novo-${index}`}
                className="grid gap-5 rounded-2xl border border-line-soft bg-surface/60 p-5 lg:grid-cols-[1.1fr_0.9fr]"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="m-0 text-lg font-bold text-text-main">Anúncio {index + 1}</h2>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={Boolean(anuncio.ativo)}
                        onCheckedChange={(checked) => atualizarAnuncio(index, { ativo: checked })}
                        label={anuncio.ativo ? "Ativo" : "Inativo"}
                        aria-label={`Anúncio ${index + 1} ativo`}
                      />
                      {anuncios.length > 1 ? (
                        <button
                          type="button"
                          className={BTN_DANGER}
                          onClick={() => setAnuncios((prev) => prev.filter((_, i) => i !== index))}
                        >
                          Remover
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <label className={FORM_LABEL_CLASS} htmlFor={`anuncio-diario-link-${index}`}>
                      Link ao clicar
                    </label>
                    <input
                      id={`anuncio-diario-link-${index}`}
                      type="url"
                      value={anuncio.link}
                      onChange={(e) => atualizarAnuncio(index, { link: e.target.value })}
                      placeholder="https://..."
                      className={MODAL_INPUT_CLASS}
                    />
                  </div>

                  <div>
                    <label className={FORM_LABEL_CLASS} htmlFor={`anuncio-diario-imagem-${index}`}>
                      URL da imagem
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <input
                        id={`anuncio-diario-imagem-${index}`}
                        type="url"
                        value={anuncio.imagemUrl}
                        onChange={(e) => atualizarAnuncio(index, { imagemUrl: e.target.value })}
                        placeholder="https://..."
                        className={`${MODAL_INPUT_CLASS} min-w-0 flex-1`}
                      />
                      <label
                        htmlFor={`upload-anuncio-diario-${index}`}
                        className={`${BTN_SECONDARY} inline-flex cursor-pointer flex-col items-center justify-center px-3 py-1.5 text-center leading-tight ${uploading ? "pointer-events-none opacity-60" : ""}`}
                        title={`Tamanho recomendado: ${IMAGE_SIZE_HINT}`}
                      >
                        <span>{uploading ? `${uploadProgress || 0}%` : "Upload"}</span>
                        <span className="text-[0.65rem] font-normal text-text-muted">{IMAGE_SIZE_HINT}</span>
                      </label>
                      <input
                        id={`upload-anuncio-diario-${index}`}
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
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-lg border border-line bg-black/20 p-2">
                      <div className="text-base font-bold text-text-main">{anuncio.visualizacoes}</div>
                      <div className="text-text-muted">Viram</div>
                    </div>
                    <div className="rounded-lg border border-line bg-black/20 p-2">
                      <div className="text-base font-bold text-text-main">{anuncio.cliques}</div>
                      <div className="text-text-muted">Clicaram</div>
                    </div>
                    <div className="rounded-lg border border-line bg-black/20 p-2">
                      <div className="text-base font-bold text-text-main">{ctr}%</div>
                      <div className="text-text-muted">CTR</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="m-0 mb-3 text-sm font-bold text-text-main">Preview</h3>
                  {anuncio.imagemUrl ? (
                    <img
                      src={anuncio.imagemUrl}
                      alt={`Preview do anúncio ${index + 1}`}
                      className="mx-auto max-h-64 w-auto max-w-full rounded-xl border border-line object-contain"
                    />
                  ) : (
                    <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-line text-sm text-text-muted">
                      Nenhuma imagem configurada
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {message ? <FormFeedback message={message} /> : null}
          {error ? <FormFeedback message={error} variant="error" /> : null}

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line-soft bg-surface/60 p-4">
            <div className="text-sm text-text-muted">
              Totais: {totais.visualizacoes} views · {totais.cliques} cliques · CTR {taxaClique}%
              {atualizadoEm ? (
                <span className="ml-2 text-text-subtle">
                  · Atualizado em {new Date(atualizadoEm).toLocaleString("pt-BR")}
                </span>
              ) : null}
            </div>
            <button type="submit" className={BTN_PRIMARY} disabled={saving || uploadingIndex !== null}>
              {saving ? "Salvando..." : "Salvar carrossel"}
            </button>
          </div>
        </form>
      )}
    </PageShell>
  );
}
