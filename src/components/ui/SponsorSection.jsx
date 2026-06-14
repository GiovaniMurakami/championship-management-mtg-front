import { useState, useEffect, useCallback } from "react";
import { buscarAnuncios, registrarCliqueAnuncio } from "../../services/backendApi";
import { DEFAULT_ADS, normalizeAds } from "../../constants/ads";

export function SponsorSection() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [ads, setAds] = useState(() => normalizeAds(DEFAULT_ADS));
  const activeAds = ads.filter((ad) => ad.ativo);

  const goTo = useCallback((index) => {
    setAnimating(true);
    setTimeout(() => {
      setCurrent(index);
      setAnimating(false);
    }, 200);
  }, []);

  const next = useCallback(() => {
    if (activeAds.length <= 1) return;
    goTo((current + 1) % activeAds.length);
  }, [activeAds.length, current, goTo]);

  const prev = () => {
    if (activeAds.length <= 1) return;
    goTo((current - 1 + activeAds.length) % activeAds.length);
  };

  const trackClick = (ad) => {
    if (!ad?.id || !ad?.link) return;
    registrarCliqueAnuncio(ad.id).catch(() => {});
  };

  useEffect(() => {
    let mounted = true;

    buscarAnuncios()
      .then((data) => {
        if (mounted) setAds(normalizeAds(data?.anuncios ?? [], DEFAULT_ADS));
      })
      .catch(() => {
        if (mounted) setAds(normalizeAds(DEFAULT_ADS));
      });

    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const id = setInterval(next, 5500);
    return () => clearInterval(id);
  }, [next]);

  if (activeAds.length === 0) return null;

  const currentIndex = current < activeAds.length ? current : 0;
  const slide = activeAds[currentIndex] ?? activeAds[0];
  const label = slide.tipo === "banner" ? (slide.tag || "Anuncio") : "Patrocinador Oficial";

  return (
    <section className="mb-10">
      <div className="flex items-center mb-3">
        <span className="text-[0.72rem] font-semibold tracking-[0.14em] uppercase text-[#beafd7] px-[0.7rem] py-[0.2rem] border border-[rgba(217,180,255,0.2)] rounded-full bg-white/[0.03]">
          {label}
        </span>
      </div>

      <div className="relative border border-[rgba(217,180,255,0.2)] rounded-[1.25rem] overflow-hidden bg-[linear-gradient(135deg,rgba(28,14,58,0.97)_0%,rgba(16,8,36,0.97)_100%)] shadow-[0_8px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)] before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-[linear-gradient(90deg,#2ccfb4,#7c3aed,#c795ff,#ec4899)]">
        {slide.tipo === "banner" ? (
          <a
            href={slide.link || undefined}
            target={slide.link ? "_blank" : undefined}
            rel={slide.link ? "noopener noreferrer" : undefined}
            className={`block transition-all duration-200 ${animating ? "opacity-0 translate-y-[6px]" : "opacity-100 translate-y-0"}`}
            aria-label={slide.titulo || "Anuncio"}
            onClick={() => trackClick(slide)}
          >
            <img
              src={slide.imagemUrl}
              alt={slide.titulo || "Anuncio"}
              className="h-[180px] w-full object-cover max-[600px]:h-[130px]"
            />
          </a>
        ) : (
          <div
            className={`flex items-center gap-10 px-10 pt-8 pb-6 transition-all duration-200 max-[600px]:flex-col max-[600px]:items-start max-[600px]:gap-5 max-[600px]:px-5 max-[600px]:pt-6 max-[600px]:pb-4 ${animating ? "opacity-0 translate-y-[6px]" : "opacity-100 translate-y-0"}`}
          >
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
                {slide.titulo}
              </h3>
              {slide.texto && (
                <p className="m-0 mb-[1.1rem] text-[#beafd7] text-[0.9rem] leading-[1.55] max-w-[520px]">
                  {slide.texto}
                </p>
              )}
              {slide.botaoTexto && slide.link && (
                <a
                  href={slide.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-[0.3rem] bg-[rgba(44,207,180,0.12)] border border-[rgba(44,207,180,0.4)] text-[#2ccfb4] rounded-full px-[1.1rem] py-[0.45rem] text-[0.85rem] font-semibold cursor-pointer transition-all duration-200 hover:bg-[rgba(44,207,180,0.25)] hover:border-[rgba(44,207,180,0.7)] hover:text-white no-underline"
                  onClick={() => trackClick(slide)}
                >
                  {slide.botaoTexto} →
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
              ‹
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
              ›
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
