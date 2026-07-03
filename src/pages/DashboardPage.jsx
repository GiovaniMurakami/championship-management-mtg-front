import { useEffect, useMemo, useState } from "react";
import { PageShell } from "../components/ui/PageShell";
import { SkeletonDashboard } from "../components/ui/Skeleton";
import { Tabs } from "../components/ui/Tabs";
import { useAuth } from "../context/AuthContext";
import { buscarAnunciosAdmin, salvarAnuncios } from "../services/backendApi";
import { createEmptyAd, DEFAULT_ADS, normalizeAds } from "../constants/ads";
import { uploadBannerImage, validateBannerImageFile } from "../utils/bannerUpload";
import { usePageTitle } from "../hooks/usePageTitle";
import { PAGE_TITLES } from "../constants/pageTitles";
import { MODAL_INPUT_CLASS, FORM_LABEL_CLASS, BTN_PRIMARY, BTN_SECONDARY } from "../styles/uiClasses";

const subtleButtonClass = BTN_SECONDARY;

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

function DashboardAdsPreview({ ads }) {
  const activeAds = useMemo(() => ads.filter((ad) => ad.ativo), [ads]);
  const [current, setCurrent] = useState(0);

  if (activeAds.length === 0) {
    return (
      <section className="mb-5 rounded-lg border border-[rgba(217,180,255,0.12)] bg-[#0b0717] p-4">
        <div className="text-sm font-semibold text-[#8f82ad]">Nenhum anuncio ativo para preview.</div>
      </section>
    );
  }

  const currentIndex = current < activeAds.length ? current : 0;
  const slide = activeAds[currentIndex] ?? activeAds[0];
  const label = slide.tipo === "banner" ? (slide.tag || "Anuncio") : "Patrocinador Oficial";
  const goTo = (index) => setCurrent(index);
  const prev = () => setCurrent((currentIndex - 1 + activeAds.length) % activeAds.length);
  const next = () => setCurrent((currentIndex + 1) % activeAds.length);

  return (
    <section className="mb-5">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="m-0 text-lg font-bold text-[#f5edff]">Preview do carrossel</h2>
          <p className="m-0 mt-1 text-sm text-[#8f82ad]">Visualizacao dos anuncios ativos na ordem atual.</p>
        </div>
        <span className="rounded-full border border-[rgba(217,180,255,0.18)] bg-[rgba(255,255,255,0.04)] px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-[#c795ff]">
          {currentIndex + 1} de {activeAds.length}
        </span>
      </div>

      <div className="flex items-center mb-3">
        <span className="text-[0.72rem] font-semibold tracking-[0.14em] uppercase text-[#beafd7] px-[0.7rem] py-[0.2rem] border border-[rgba(217,180,255,0.2)] rounded-full bg-white/[0.03]">
          {label}
        </span>
      </div>

      <div className="relative border border-[rgba(217,180,255,0.2)] rounded-[1.25rem] overflow-hidden bg-[linear-gradient(135deg,rgba(28,14,58,0.97)_0%,rgba(16,8,36,0.97)_100%)] shadow-[0_8px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)] before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-[linear-gradient(90deg,#2ccfb4,#7c3aed,#c795ff,#ec4899)]">
        {slide.tipo === "banner" ? (
          <a
            href={slide.link || undefined}
            className="block transition-all duration-200"
            aria-label={slide.titulo || "Anuncio"}
            onClick={(event) => event.preventDefault()}
          >
            {slide.imagemUrl ? (
              <img
                src={slide.imagemUrl}
                alt={slide.titulo || "Anuncio"}
                className="h-[180px] w-full object-cover max-[600px]:h-[130px]"
              />
            ) : (
              <div className="flex h-[180px] w-full items-center justify-center text-sm font-semibold text-[#8f82ad] max-[600px]:h-[130px]">
                Banner sem imagem
              </div>
            )}
          </a>
        ) : (
          <div className="flex items-center gap-10 px-10 pt-8 pb-6 transition-all duration-200 max-[600px]:flex-col max-[600px]:items-start max-[600px]:gap-5 max-[600px]:px-5 max-[600px]:pt-6 max-[600px]:pb-4">
            <div className="shrink-0 w-[120px] h-[120px] rounded-2xl border border-[rgba(199,149,255,0.25)] bg-white/[0.04] flex items-center justify-center overflow-hidden shadow-[0_0_32px_rgba(167,79,255,0.15)] max-[600px]:w-[72px] max-[600px]:h-[72px]">
              {slide.imagemUrl ? (
                <img src={slide.imagemUrl} alt={slide.titulo || "Patrocinador"} className="w-full h-full object-contain p-2" />
              ) : (
                <span className="px-2 text-center text-xs font-bold uppercase tracking-[0.08em] text-[#c795ff]">
                  {slide.titulo || "Anuncio"}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              {slide.tag && (
                <span className="inline-block text-[0.7rem] font-semibold tracking-[0.12em] uppercase text-[#c795ff] mb-2">
                  {slide.tag}
                </span>
              )}
              <h3 className="m-0 mb-[0.55rem] font-['Bebas_Neue',sans-serif] text-[clamp(1.8rem,3vw,2.4rem)] tracking-[0.04em] leading-none text-[#f5edff] max-[600px]:text-[1.7rem]">
                {slide.titulo || "Novo anuncio"}
              </h3>
              {slide.texto && (
                <p className="m-0 mb-[1.1rem] text-[#beafd7] text-[0.9rem] leading-[1.55] max-w-[520px]">
                  {slide.texto}
                </p>
              )}
              {slide.botaoTexto && slide.link && (
                <a
                  href={slide.link}
                  className="inline-flex items-center gap-[0.3rem] bg-[rgba(44,207,180,0.12)] border border-[rgba(44,207,180,0.4)] text-[#2ccfb4] rounded-full px-[1.1rem] py-[0.45rem] text-[0.85rem] font-semibold cursor-pointer transition-all duration-200 hover:bg-[rgba(44,207,180,0.25)] hover:border-[rgba(44,207,180,0.7)] hover:text-white no-underline"
                  onClick={(event) => event.preventDefault()}
                >
                  {slide.botaoTexto} -&gt;
                </a>
              )}
            </div>
          </div>
        )}

        {activeAds.length > 1 && (
          <div className="flex items-center justify-center gap-3 px-4 py-3 pb-4 border-t border-[rgba(217,180,255,0.2)]">
            <button
              type="button"
              className="bg-transparent border border-[rgba(217,180,255,0.2)] rounded-full w-[1.9rem] h-[1.9rem] flex items-center justify-center text-[#beafd7] text-[1.1rem] cursor-pointer leading-none transition-all duration-[180ms] hover:border-[#c795ff] hover:text-[#c795ff] hover:bg-[rgba(199,149,255,0.08)]"
              onClick={prev}
              aria-label="Anterior"
            >
              &lt;
            </button>
            <div className="flex gap-[0.4rem] items-center">
              {activeAds.map((ad, i) => (
                <button
                  key={ad.id}
                  type="button"
                  className={`w-[7px] h-[7px] rounded-full border-none p-0 cursor-pointer transition-all duration-200 ${i === currentIndex ? "bg-[#2ccfb4] scale-[1.3]" : "bg-[rgba(44,207,180,0.25)]"}`}
                  onClick={() => goTo(i)}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
            <button
              type="button"
              className="bg-transparent border border-[rgba(217,180,255,0.2)] rounded-full w-[1.9rem] h-[1.9rem] flex items-center justify-center text-[#beafd7] text-[1.1rem] cursor-pointer leading-none transition-all duration-[180ms] hover:border-[#c795ff] hover:text-[#c795ff] hover:bg-[rgba(199,149,255,0.08)]"
              onClick={next}
              aria-label="Proximo"
            >
              &gt;
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export function DashboardPage() {
  const { token } = useAuth();

  usePageTitle(PAGE_TITLES.dashboard);

  const [activeTab, setActiveTab] = useState("anuncios");
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState({});
  const [draggingAdId, setDraggingAdId] = useState("");
  const [dragOverAdId, setDragOverAdId] = useState("");
  const [dragOverPosition, setDragOverPosition] = useState("before");

  useEffect(() => {
    if (!token) return undefined;
    let mounted = true;
    setLoading(true);

    buscarAnunciosAdmin(token)
      .then((data) => {
        if (mounted) setAds(normalizeAds(data?.anuncios ?? [], DEFAULT_ADS));
      })
      .catch((error) => {
        if (mounted) {
          setMessage(error.message || "Nao foi possivel carregar os anuncios.");
          setAds(normalizeAds(DEFAULT_ADS));
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, [token]);

  const activeCount = useMemo(() => ads.filter((ad) => ad.ativo).length, [ads]);
  const totalClicks = useMemo(() => ads.reduce((total, ad) => total + (ad.cliques ?? 0), 0), [ads]);

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

  const reorderAd = (draggedId, targetId, position = "before") => {
    if (!draggedId || !targetId || draggedId === targetId) return;

    setAds((current) => {
      const draggedIndex = current.findIndex((ad) => ad.id === draggedId);
      const targetIndex = current.findIndex((ad) => ad.id === targetId);
      if (draggedIndex < 0 || targetIndex < 0) return current;

      const draggedAd = current[draggedIndex];
      const withoutDragged = current.filter((ad) => ad.id !== draggedId);
      const rawInsertIndex = position === "after" ? targetIndex + 1 : targetIndex;
      const adjustedInsertIndex = draggedIndex < rawInsertIndex ? rawInsertIndex - 1 : rawInsertIndex;
      const insertIndex = Math.max(0, Math.min(adjustedInsertIndex, withoutDragged.length));
      const next = [...withoutDragged];
      next.splice(insertIndex, 0, draggedAd);
      return next.map((ad, order) => ({ ...ad, ordem: order }));
    });
  };

  const finishDrag = () => {
    setDraggingAdId("");
    setDragOverAdId("");
    setDragOverPosition("before");
  };

  const addAd = () => {
    setAds((current) => [
      ...current,
      { ...createEmptyAd(), ordem: current.length },
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
      setMessage(error.message || "Nao foi possivel publicar os anuncios.");
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
      </div>

      <Tabs value={activeTab} onChange={setActiveTab} className="mb-5">
        <Tabs.Item value="anuncios" label="Anuncios" count={loading ? undefined : ads.length} />
      </Tabs>

      {activeTab === "anuncios" && loading && <SkeletonDashboard />}

      {activeTab === "anuncios" && !loading && (
        <>
          <div className="mb-5 grid gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-[rgba(217,180,255,0.12)] bg-[#120b24] px-4 py-3">
              <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#8f82ad]">Anuncios</span>
              <strong className="mt-1 block text-2xl text-[#f5edff]">{ads.length}</strong>
            </div>
            <div className="rounded-lg border border-[rgba(217,180,255,0.12)] bg-[#120b24] px-4 py-3">
              <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#8f82ad]">Ativos</span>
              <strong className="mt-1 block text-2xl text-[#f5edff]">{activeCount}</strong>
            </div>
            <div className="rounded-lg border border-[rgba(217,180,255,0.12)] bg-[#120b24] px-4 py-3">
              <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#8f82ad]">Cliques</span>
              <strong className="mt-1 block text-2xl text-[#f5edff]">{totalClicks}</strong>
            </div>
            <div className="rounded-lg border border-[rgba(217,180,255,0.12)] bg-[#120b24] px-4 py-3">
              <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#8f82ad]">Status</span>
              <strong className="mt-1 block text-sm text-[#f5edff]">Pronto</strong>
            </div>
          </div>

          <DashboardAdsPreview ads={ads} />

          {message && (
            <div className="mb-5 rounded-lg border border-[rgba(199,149,255,0.25)] bg-[rgba(167,79,255,0.1)] px-4 py-3 text-sm text-[#e8dfff]">
              {message}
            </div>
          )}

          <div className="grid gap-4">
            {ads.map((ad, index) => {
              const upload = uploading[ad.id] ?? {};
              const isDragging = draggingAdId === ad.id;
              const isDropTarget = dragOverAdId === ad.id && draggingAdId !== ad.id;
              const draggingAnotherAd = draggingAdId && draggingAdId !== ad.id;

              return (
                <section
                  key={ad.id}
                  className={`relative grid gap-5 rounded-lg border bg-[#0b0717] p-4 transition-all duration-150 lg:grid-cols-[minmax(0,1fr)_280px] ${
                    isDropTarget
                      ? "border-[#c795ff] bg-[rgba(199,149,255,0.06)] shadow-[0_0_0_2px_rgba(199,149,255,0.18)]"
                      : "border-[rgba(217,180,255,0.12)]"
                  } ${isDragging ? "scale-[0.99] opacity-55 shadow-[0_12px_30px_rgba(0,0,0,0.28)]" : ""} ${
                    draggingAnotherAd && !isDropTarget ? "opacity-85" : ""
                  }`}
                  onDragEnter={() => {
                    if (draggingAnotherAd) setDragOverAdId(ad.id);
                  }}
                  onDragOver={(event) => {
                    if (!draggingAnotherAd) return;
                    event.preventDefault();
                    event.dataTransfer.dropEffect = "move";
                    const bounds = event.currentTarget.getBoundingClientRect();
                    const position = event.clientY - bounds.top > bounds.height / 2 ? "after" : "before";
                    setDragOverAdId(ad.id);
                    setDragOverPosition(position);
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    const bounds = event.currentTarget.getBoundingClientRect();
                    const position = event.clientY - bounds.top > bounds.height / 2 ? "after" : "before";
                    reorderAd(draggingAdId, ad.id, position);
                    finishDrag();
                  }}
                >
                  {isDropTarget && (
                    <div
                      className={`pointer-events-none absolute left-4 right-4 z-10 h-1 rounded-full bg-[#c795ff] shadow-[0_0_18px_rgba(199,149,255,0.7)] ${
                        dragOverPosition === "after" ? "-bottom-2" : "-top-2"
                      }`}
                    />
                  )}
                  <div className="grid gap-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          className={`inline-flex h-12 min-w-28 cursor-grab items-center gap-3 rounded-lg border px-3 text-sm font-bold transition active:cursor-grabbing ${
                            isDragging
                              ? "border-[#c795ff] bg-[rgba(199,149,255,0.18)] text-white"
                              : "border-[rgba(217,180,255,0.18)] bg-[rgba(255,255,255,0.04)] text-[#e8dfff] hover:border-[rgba(199,149,255,0.5)] hover:bg-[rgba(167,79,255,0.14)]"
                          }`}
                          type="button"
                          draggable
                          aria-label={`Arrastar anuncio ${index + 1}`}
                          title="Arrastar para ordenar"
                          onDragStart={(event) => {
                            setDraggingAdId(ad.id);
                            setDragOverAdId("");
                            setDragOverPosition("before");
                            event.dataTransfer.effectAllowed = "move";
                            event.dataTransfer.setData("text/plain", ad.id);
                            const card = event.currentTarget.closest("section");
                            if (card) event.dataTransfer.setDragImage(card, 32, 32);
                          }}
                          onDragEnd={finishDrag}
                        >
                          <span className="grid grid-cols-2 gap-1" aria-hidden="true">
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          </span>
                          <span className="leading-tight">
                            <span className="block text-[0.65rem] uppercase tracking-[0.08em] text-[#9f91bd]">Ordem</span>
                            <span className="block text-base">{index + 1}</span>
                          </span>
                        </button>
                        <label className="group inline-flex h-10 w-32 cursor-pointer items-center rounded-lg border border-[rgba(217,180,255,0.18)] bg-[rgba(255,255,255,0.04)] p-1 transition-colors hover:border-[rgba(199,149,255,0.5)] hover:bg-[rgba(167,79,255,0.1)]">
                          <input
                            className="peer sr-only"
                            type="checkbox"
                            checked={ad.ativo}
                            onChange={(event) => updateAd(ad.id, { ativo: event.target.checked })}
                          />
                          <span className={`flex h-8 w-full items-center justify-between rounded-md px-2 text-xs font-bold uppercase tracking-[0.08em] transition-colors ${ad.ativo ? "text-[#2ccfb4]" : "text-[#8f82ad]"}`}>
                            <span>{ad.ativo ? "Ativo" : "Inativo"}</span>
                            <span className={`relative h-5 w-9 rounded-full transition-colors ${ad.ativo ? "bg-[rgba(44,207,180,0.32)]" : "bg-[rgba(143,130,173,0.3)]"}`}>
                              <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full transition-transform ${ad.ativo ? "translate-x-4 bg-[#2ccfb4]" : "translate-x-0 bg-[#8f82ad]"}`} />
                            </span>
                          </span>
                        </label>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center rounded-lg border border-[rgba(44,207,180,0.22)] bg-[rgba(44,207,180,0.08)] px-3 py-2 text-sm font-bold text-[#2ccfb4]">
                          {ad.cliques ?? 0} cliques
                        </span>
                        <button className={subtleButtonClass} type="button" onClick={() => moveAd(ad.id, -1)} disabled={index === 0}>Subir</button>
                        <button className={subtleButtonClass} type="button" onClick={() => moveAd(ad.id, 1)} disabled={index === ads.length - 1}>Descer</button>
                        <button className={subtleButtonClass} type="button" onClick={() => removeAd(ad.id)}>Remover</button>
                      </div>
                    </div>

                    <div className={`grid gap-4 ${ad.tipo === "card" ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
                      <label className={FORM_LABEL_CLASS}>
                        Tipo
                        <select className={MODAL_INPUT_CLASS} value={ad.tipo} onChange={(event) => updateAd(ad.id, { tipo: event.target.value })}>
                          <option value="card">Titulo, texto, botao e imagem</option>
                          <option value="banner">Apenas banner com link</option>
                        </select>
                      </label>
                      <label className={FORM_LABEL_CLASS}>
                        Tag
                        <input className={MODAL_INPUT_CLASS} value={ad.tag} onChange={(event) => updateAd(ad.id, { tag: event.target.value })} />
                      </label>
                      {ad.tipo === "card" && (
                        <label className={FORM_LABEL_CLASS}>
                          Titulo
                          <input className={MODAL_INPUT_CLASS} value={ad.titulo} onChange={(event) => updateAd(ad.id, { titulo: event.target.value })} />
                        </label>
                      )}
                    </div>

                    {ad.tipo === "card" && (
                      <label className={FORM_LABEL_CLASS}>
                        Texto
                        <textarea className={`${MODAL_INPUT_CLASS} min-h-24 resize-y`} value={ad.texto} onChange={(event) => updateAd(ad.id, { texto: event.target.value })} />
                      </label>
                    )}

                    <div className={`grid gap-4 ${ad.tipo === "card" ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
                      {ad.tipo === "card" && (
                        <label className={FORM_LABEL_CLASS}>
                          Texto do botao
                          <input className={MODAL_INPUT_CLASS} value={ad.botaoTexto} onChange={(event) => updateAd(ad.id, { botaoTexto: event.target.value })} />
                        </label>
                      )}
                      <label className={FORM_LABEL_CLASS}>
                        Link
                        <input className={MODAL_INPUT_CLASS} value={ad.link} onChange={(event) => updateAd(ad.id, { link: event.target.value })} />
                      </label>
                      <div className={FORM_LABEL_CLASS}>
                        URL da imagem
                        <div className="flex gap-2">
                          <input
                            className={MODAL_INPUT_CLASS}
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

            <div className="flex flex-wrap justify-end gap-2 border-t border-[rgba(217,180,255,0.12)] pt-4">
              <button className={subtleButtonClass} type="button" onClick={addAd}>Adicionar anuncio</button>
              <button className={subtleButtonClass} type="button" onClick={resetDefaults}>Restaurar padrao</button>
              <button
                className="rounded-lg bg-[#c795ff] px-4 py-2 text-sm font-bold text-[#120b24] transition hover:bg-[#e0c6ff] disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
                onClick={saveAds}
                disabled={saving}
              >
                {saving ? "Publicando..." : "Publicar anuncios"}
              </button>
            </div>
          </div>
        </>
      )}
    </PageShell>
  );
}
