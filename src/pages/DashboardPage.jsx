import { useEffect, useMemo, useState } from "react";
import { PageShell } from "../components/ui/PageShell";
import { useAuth } from "../context/AuthContext";
import { buscarAnuncios, salvarAnuncios } from "../services/backendApi";
import { createEmptyAd, DEFAULT_ADS, normalizeAds } from "../constants/ads";
import { uploadBannerImage, validateBannerImageFile } from "../utils/bannerUpload";

const inputClass = "w-full rounded-lg border border-[rgba(217,180,255,0.18)] bg-[#120b24] px-3 py-2 text-sm text-[#f5edff] outline-none transition focus:border-[#c795ff] focus:ring-2 focus:ring-[rgba(199,149,255,0.16)]";
const labelClass = "grid gap-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#9f91bd]";
const subtleButtonClass = "rounded-lg border border-[rgba(217,180,255,0.18)] bg-[rgba(255,255,255,0.04)] px-3 py-2 text-sm font-bold text-[#e8dfff] transition hover:border-[rgba(199,149,255,0.5)] hover:bg-[rgba(167,79,255,0.14)] disabled:cursor-not-allowed disabled:opacity-50";

function prepareAds(anuncios) {
  return anuncios.map((ad, index) => ({
    ...ad,
    ordem: index,
    tag: ad.tag.trim(),
    titulo: ad.titulo.trim(),
    texto: ad.texto.trim(),
    botaoTexto: ad.botaoTexto.trim(),
    link: ad.link.trim(),
    imagemUrl: ad.imagemUrl.trim(),
  }));
}

function AdPreview({ ad }) {
  if (ad.tipo === "banner") {
    return (
      <div className="overflow-hidden rounded-lg border border-[rgba(217,180,255,0.14)] bg-[#080514]">
        {ad.imagemUrl ? (
          <img src={ad.imagemUrl} alt={ad.titulo || "Banner"} className="h-32 w-full object-cover" />
        ) : (
          <div className="flex h-32 items-center justify-center text-sm text-[#8f82ad]">Banner sem imagem</div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[rgba(217,180,255,0.14)] bg-[#120b24] p-4">
      {ad.imagemUrl && <img src={ad.imagemUrl} alt={ad.titulo || "Anuncio"} className="mb-3 h-20 w-full object-contain" />}
      {ad.tag && <span className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[#c795ff]">{ad.tag}</span>}
      <h3 className="m-0 mt-1 text-lg font-bold text-[#f5edff]">{ad.titulo || "Novo anuncio"}</h3>
      {ad.texto && <p className="mt-2 mb-0 text-sm leading-5 text-[#b9abd8]">{ad.texto}</p>}
      {ad.botaoTexto && (
        <span className="mt-3 inline-flex rounded-full border border-[rgba(44,207,180,0.4)] bg-[rgba(44,207,180,0.12)] px-3 py-1.5 text-xs font-bold text-[#2ccfb4]">
          {ad.botaoTexto}
        </span>
      )}
    </div>
  );
}

export function DashboardPage() {
  const { token } = useAuth();
  const [ads, setAds] = useState(() => normalizeAds(DEFAULT_ADS));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState({});

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    buscarAnuncios()
      .then((data) => {
        if (mounted) setAds(normalizeAds(data?.anuncios ?? [], DEFAULT_ADS));
      })
      .catch((error) => {
        if (mounted) setMessage(error.message || "Nao foi possivel carregar os anuncios.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, []);

  const activeCount = useMemo(() => ads.filter((ad) => ad.ativo).length, [ads]);

  const updateAd = (id, patch) => {
    setAds((current) => current.map((ad) => (ad.id === id ? { ...ad, ...patch } : ad)));
  };

  const moveAd = (id, direction) => {
    setAds((current) => {
      const index = current.findIndex((ad) => ad.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((ad, order) => ({ ...ad, ordem: order }));
    });
  };

  const addAd = () => {
    setAds((current) => [
      ...current,
      { ...createEmptyAd(), id: `anuncio-${Date.now()}-${current.length}`, ordem: current.length },
    ]);
  };

  const removeAd = (id) => {
    setAds((current) => current.filter((ad) => ad.id !== id));
  };

  const resetDefaults = () => {
    setAds(normalizeAds(DEFAULT_ADS));
    setMessage("Anuncios padrao restaurados. Salve para publicar.");
  };

  const uploadImage = async (ad, file) => {
    const validationError = validateBannerImageFile(file);
    if (validationError) {
      setMessage(validationError.userMessage || validationError.message);
      return;
    }

    setMessage("");
    setUploading((current) => ({ ...current, [ad.id]: { loading: true, progress: 0 } }));

    try {
      const imageUrl = await uploadBannerImage(file, token, (progress) => {
        setUploading((current) => ({ ...current, [ad.id]: { loading: true, progress } }));
      });
      updateAd(ad.id, { imagemUrl: imageUrl });
      setMessage("Imagem enviada. Salve para publicar a alteracao.");
    } catch (error) {
      setMessage(error.userMessage || error.message || "Falha ao enviar imagem.");
    } finally {
      setUploading((current) => ({ ...current, [ad.id]: { loading: false, progress: 0 } }));
    }
  };

  const saveAds = async () => {
    setSaving(true);
    setMessage("");

    try {
      const payload = prepareAds(ads);
      const response = await salvarAnuncios(payload, token);
      setAds(normalizeAds(response?.anuncios ?? payload, payload));
      setMessage("Anuncios publicados com sucesso.");
    } catch (error) {
      setMessage(error.message || "Nao foi possivel salvar os anuncios.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="m-0 text-xs font-bold uppercase tracking-[0.12em] text-[#c795ff]">Admin</p>
          <h1 className="m-0 mt-1 font-['Bebas_Neue',sans-serif] text-4xl tracking-[0.04em] text-[#f5edff]">
            Dashboard
          </h1>
          <p className="m-0 mt-2 max-w-2xl text-sm leading-6 text-[#b9abd8]">
            Edite os anuncios exibidos no carrossel de patrocinador.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className={subtleButtonClass} type="button" onClick={addAd}>Adicionar</button>
          <button className={subtleButtonClass} type="button" onClick={resetDefaults}>Restaurar padrao</button>
          <button
            className="rounded-lg bg-[#c795ff] px-4 py-2 text-sm font-bold text-[#120b24] transition hover:bg-[#e0c6ff] disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            onClick={saveAds}
            disabled={saving}
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-[rgba(217,180,255,0.12)] bg-[#120b24] px-4 py-3">
          <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#8f82ad]">Anuncios</span>
          <strong className="mt-1 block text-2xl text-[#f5edff]">{ads.length}</strong>
        </div>
        <div className="rounded-lg border border-[rgba(217,180,255,0.12)] bg-[#120b24] px-4 py-3">
          <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#8f82ad]">Ativos</span>
          <strong className="mt-1 block text-2xl text-[#f5edff]">{activeCount}</strong>
        </div>
        <div className="rounded-lg border border-[rgba(217,180,255,0.12)] bg-[#120b24] px-4 py-3">
          <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#8f82ad]">Status</span>
          <strong className="mt-1 block text-sm text-[#f5edff]">{loading ? "Carregando" : "Pronto"}</strong>
        </div>
      </div>

      {message && (
        <div className="mb-5 rounded-lg border border-[rgba(199,149,255,0.25)] bg-[rgba(167,79,255,0.1)] px-4 py-3 text-sm text-[#e8dfff]">
          {message}
        </div>
      )}

      <div className="grid gap-4">
        {ads.map((ad, index) => {
          const upload = uploading[ad.id] ?? {};

          return (
            <section key={ad.id} className="grid gap-5 rounded-lg border border-[rgba(217,180,255,0.12)] bg-[#0b0717] p-4 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="grid gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="inline-flex items-center gap-3 text-sm font-bold text-[#f5edff]">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(199,149,255,0.16)] text-[#d9b8ff]">
                      {index + 1}
                    </span>
                    <input type="checkbox" checked={ad.ativo} onChange={(event) => updateAd(ad.id, { ativo: event.target.checked })} />
                    Ativo
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button className={subtleButtonClass} type="button" onClick={() => moveAd(ad.id, -1)} disabled={index === 0}>Subir</button>
                    <button className={subtleButtonClass} type="button" onClick={() => moveAd(ad.id, 1)} disabled={index === ads.length - 1}>Descer</button>
                    <button className={subtleButtonClass} type="button" onClick={() => removeAd(ad.id)}>Remover</button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <label className={labelClass}>
                    Tipo
                    <select className={inputClass} value={ad.tipo} onChange={(event) => updateAd(ad.id, { tipo: event.target.value })}>
                      <option value="card">Titulo, texto, botao e imagem</option>
                      <option value="banner">Apenas banner com link</option>
                    </select>
                  </label>
                  <label className={labelClass}>
                    Tag
                    <input className={inputClass} value={ad.tag} onChange={(event) => updateAd(ad.id, { tag: event.target.value })} />
                  </label>
                  <label className={labelClass}>
                    Titulo
                    <input className={inputClass} value={ad.titulo} onChange={(event) => updateAd(ad.id, { titulo: event.target.value })} />
                  </label>
                </div>

                {ad.tipo === "card" && (
                  <label className={labelClass}>
                    Texto
                    <textarea className={`${inputClass} min-h-24 resize-y`} value={ad.texto} onChange={(event) => updateAd(ad.id, { texto: event.target.value })} />
                  </label>
                )}

                <div className="grid gap-4 md:grid-cols-3">
                  <label className={labelClass}>
                    Texto do botao
                    <input className={inputClass} value={ad.botaoTexto} onChange={(event) => updateAd(ad.id, { botaoTexto: event.target.value })} disabled={ad.tipo === "banner"} />
                  </label>
                  <label className={labelClass}>
                    Link
                    <input className={inputClass} value={ad.link} onChange={(event) => updateAd(ad.id, { link: event.target.value })} />
                  </label>
                  <div className={labelClass}>
                    URL da imagem
                    <div className="flex gap-2">
                      <input
                        className={inputClass}
                        value={ad.imagemUrl}
                        onChange={(event) => updateAd(ad.id, { imagemUrl: event.target.value })}
                      />
                      <label
                        className={`${subtleButtonClass} inline-flex shrink-0 cursor-pointer items-center justify-center ${upload.loading ? "pointer-events-none opacity-60" : ""}`}
                        htmlFor={`upload-imagem-${ad.id}`}
                      >
                        {upload.loading ? `${upload.progress || 0}%` : "Upload"}
                      </label>
                      <input
                        id={`upload-imagem-${ad.id}`}
                        className="sr-only"
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        disabled={upload.loading}
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) uploadImage(ad, file);
                          event.target.value = "";
                        }}
                      />
                    </div>
                    {upload.loading && <span className="text-xs font-semibold text-[#c795ff]">Enviando imagem...</span>}
                  </div>
                </div>
              </div>

              <aside>
                <AdPreview ad={ad} />
              </aside>
            </section>
          );
        })}
      </div>
    </PageShell>
  );
}
