import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Footer, CookieConsentBanner } from "../components";
import { LandingHeader } from "../components/ui/LandingHeader";
import { AdSenseUnit } from "../components/ui/AdSenseUnit";
import {
    LandingEditButton,
    LandingParceirosModal,
    LandingSecaoTextoModal,
    LandingSlidesModal,
} from "../components/ui/LandingSectionEdit";
import { useYouTubeVideos } from "../hooks/useYouTubeVideos";
import { usePageTitle } from "../hooks/usePageTitle";
import { PAGE_TITLES } from "../constants/pageTitles";
import {
    buscarConteudoHome,
    buscarParceiros,
    buscarSlidesHome,
    listarArtigos,
} from "../services/backendApi";
import { artigoPath } from "../utils/artigoUrl";
import { CONTEUDO_HOME_FALLBACK } from "../constants/landingHome";

const FALLBACK_SLIDES = [
    {
        id: "fallback-1",
        titulo: "Bem-vindo ao universo Pauper!",
        texto: "Torneios, decks e conteúdos de Magic: The Gathering no formato Pauper.",
        ctaTexto: "Ver torneios",
        ctaUrl: "/torneios",
        imagemUrl: "https://tiagofuguete.com.br/wp-content/uploads/2025/06/banner_home.png",
    },
];

function YouTubeSection({ titulo, texto, onEdit }) {
    const { videos, loading } = useYouTubeVideos(6);

    return (
        <section className="relative max-w-7xl mx-auto px-4 py-12">
            <LandingEditButton onClick={onEdit} label="Editar seção" />
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">{titulo}</h2>
            <p className="text-center text-[#9b8dc0] mb-8 max-w-2xl mx-auto">{texto}</p>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="rounded-xl aspect-video bg-[rgba(167,79,255,0.08)] animate-pulse border border-[rgba(217,180,255,0.08)]"
                        />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {videos.map((v) => (
                        <a
                            key={v.id}
                            href={`https://www.youtube.com/watch?v=${v.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative rounded-xl overflow-hidden bg-[rgba(167,79,255,0.08)] hover:ring-2 hover:ring-[#c795ff] transition-all"
                        >
                            <img
                                src={v.thumbnail ?? `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`}
                                alt={v.title}
                                className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                                <p className="text-sm font-medium text-white line-clamp-2">{v.title}</p>
                            </div>
                        </a>
                    ))}
                </div>
            )}

            <div className="mt-8 flex justify-center">
                <a
                    href="https://www.youtube.com/@TiagoFuguete/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-[0.6rem] rounded-xl border border-[rgba(199,149,255,0.35)] bg-[rgba(167,79,255,0.1)] text-brand font-semibold text-[0.9rem] transition-all hover:bg-[rgba(167,79,255,0.2)] hover:border-[rgba(199,149,255,0.6)]"
                >
                    Ver todos os vídeos
                </a>
            </div>
        </section>
    );
}

function HeroCarousel({ slides, onEdit }) {
    const lista = slides.length > 0 ? slides : FALLBACK_SLIDES;
    const [current, setCurrent] = useState(0);

    const next = useCallback(() => setCurrent((c) => (c + 1) % lista.length), [lista.length]);
    const prev = useCallback(() => setCurrent((c) => (c - 1 + lista.length) % lista.length), [lista.length]);

    useEffect(() => { setCurrent(0); }, [lista.length]);

    useEffect(() => {
        if (lista.length <= 1) return undefined;
        const timer = setInterval(next, 5000);
        return () => clearInterval(timer);
    }, [next, lista.length]);

    const slide = lista[current] || lista[0];
    const ctaHref = slide.ctaUrl || "/torneios";
    const ctaIsExternal = /^https?:\/\//i.test(ctaHref);

    return (
        <section className="relative w-full h-[420px] md:h-[500px] overflow-hidden select-none">
            <LandingEditButton onClick={onEdit} label="Editar slides" />
            {lista.map((s, i) => (
                <div
                    key={s.id || i}
                    className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
                    style={{
                        backgroundImage: `url(${s.imagemUrl})`,
                        opacity: i === current ? 1 : 0,
                        zIndex: i === current ? 1 : 0,
                    }}
                >
                    <div className="absolute inset-0 bg-black/50" />
                </div>
            ))}

            <div className="relative z-10 flex flex-col justify-center h-full max-w-5xl mx-auto px-6 md:px-12 text-white">
                <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 drop-shadow-lg">{slide.titulo}</h2>
                {slide.texto ? (
                    <p className="text-sm md:text-lg max-w-xl mb-6 text-[#e8dfff] drop-shadow">{slide.texto}</p>
                ) : null}
                {slide.ctaTexto ? (
                    ctaIsExternal ? (
                        <a
                            href={ctaHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block w-fit px-6 py-3 rounded-xl border border-[rgba(199,149,255,0.5)] bg-gradient-to-br from-[#8e39ed] to-[#5f23b3] text-white font-bold transition-all hover:shadow-[0_4px_20px_rgba(142,57,237,0.45)] hover:-translate-y-[1px]"
                        >
                            {slide.ctaTexto}
                        </a>
                    ) : (
                        <Link
                            to={ctaHref}
                            className="inline-block w-fit px-6 py-3 rounded-xl border border-[rgba(199,149,255,0.5)] bg-gradient-to-br from-[#8e39ed] to-[#5f23b3] text-white font-bold transition-all hover:shadow-[0_4px_20px_rgba(142,57,237,0.45)] hover:-translate-y-[1px]"
                        >
                            {slide.ctaTexto}
                        </Link>
                    )
                ) : null}
            </div>

            {lista.length > 1 ? (
                <>
                    <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white text-xl transition" aria-label="Anterior">‹</button>
                    <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white text-xl transition" aria-label="Próximo">›</button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                        {lista.map((s, i) => (
                            <button
                                key={s.id || i}
                                onClick={() => setCurrent(i)}
                                className={`w-3 h-3 rounded-full transition-all ${i === current ? "bg-white scale-110" : "bg-white/40 hover:bg-white/70"}`}
                                aria-label={`Slide ${i + 1}`}
                            />
                        ))}
                    </div>
                </>
            ) : null}
        </section>
    );
}

function PartnersCarousel({ parceiros }) {
    const [offset, setOffset] = useState(0);
    const lista = parceiros.length > 0 ? parceiros : [];

    useEffect(() => {
        if (lista.length <= 1) return undefined;
        const timer = setInterval(() => setOffset((o) => o + 1), 2500);
        return () => clearInterval(timer);
    }, [lista.length]);

    if (lista.length === 0) {
        return <p className="text-center text-[#9b8dc0] text-sm">Em breve novos parceiros.</p>;
    }

    const visible = Math.min(5, lista.length);
    const items = [...lista, ...lista];

    return (
        <div className="overflow-hidden">
            <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${(offset % lista.length) * (100 / visible)}%)` }}
            >
                {items.map((p, i) => (
                    <a
                        key={`${p.id || p.nome}-${i}`}
                        href={p.linkUrl || "#"}
                        target={p.linkUrl ? "_blank" : undefined}
                        rel={p.linkUrl ? "noopener noreferrer" : undefined}
                        className="flex-shrink-0 flex items-center justify-center px-4"
                        style={{ width: `${100 / visible}%` }}
                        aria-label={p.nome}
                    >
                        <img
                            src={p.logoUrl}
                            alt={p.nome}
                            className="max-h-20 md:max-h-24 object-contain opacity-80 hover:opacity-100 transition-opacity"
                            loading="lazy"
                        />
                    </a>
                ))}
            </div>
        </div>
    );
}

function twitchParent() {
    if (typeof window === "undefined") return "localhost";
    return window.location.hostname || "localhost";
}

export function LandingPage() {
    usePageTitle(PAGE_TITLES.home);
    const [slides, setSlides] = useState([]);
    const [parceiros, setParceiros] = useState([]);
    const [artigos, setArtigos] = useState([]);
    const [conteudo, setConteudo] = useState(CONTEUDO_HOME_FALLBACK);
    const [editKey, setEditKey] = useState(null);

    useEffect(() => {
        let ativo = true;
        Promise.allSettled([
            buscarSlidesHome(),
            buscarParceiros(),
            listarArtigos(null),
            buscarConteudoHome(),
        ]).then(([slidesRes, parceirosRes, artigosRes, conteudoRes]) => {
            if (!ativo) return;
            if (slidesRes.status === "fulfilled") {
                setSlides(Array.isArray(slidesRes.value?.slides) ? slidesRes.value.slides : []);
            }
            if (parceirosRes.status === "fulfilled") {
                setParceiros(Array.isArray(parceirosRes.value?.parceiros) ? parceirosRes.value.parceiros : []);
            }
            if (artigosRes.status === "fulfilled") {
                setArtigos(Array.isArray(artigosRes.value?.artigos) ? artigosRes.value.artigos.slice(0, 6) : []);
            }
            if (conteudoRes.status === "fulfilled" && conteudoRes.value) {
                setConteudo({ ...CONTEUDO_HOME_FALLBACK, ...conteudoRes.value });
            }
        });
        return () => { ativo = false; };
    }, []);

    return (
        <div className="min-h-screen bg-[#0e091c] text-[#e8dfff]">
            <LandingHeader />

            <div className="pt-20">
                <HeroCarousel slides={slides} onEdit={() => setEditKey("slides")} />
            </div>

            <div className="max-w-5xl mx-auto px-4 py-6">
                <AdSenseUnit unit="topBanner" className="w-full min-h-[50px]" />
            </div>

            <YouTubeSection
                titulo={conteudo.youtube?.titulo}
                texto={conteudo.youtube?.texto}
                onEdit={() => setEditKey("youtube")}
            />

            <div className="max-w-5xl mx-auto px-4 py-2">
                <AdSenseUnit unit="inArticle" className="w-full min-h-[50px]" />
            </div>

            <section className="relative bg-[#080514] py-12">
                <LandingEditButton onClick={() => setEditKey("twitch")} label="Editar seção" />
                <div className="max-w-5xl mx-auto px-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">
                        {conteudo.twitch?.titulo}
                    </h2>
                    <p className="text-center text-[#9b8dc0] mb-8 max-w-2xl mx-auto">
                        {conteudo.twitch?.texto}
                    </p>
                    <div className="rounded-xl overflow-hidden aspect-video">
                        <iframe
                            src={`https://player.twitch.tv/?channel=tiagofuguete&parent=${encodeURIComponent(twitchParent())}&muted=true`}
                            title="Twitch - Tiago Fuguete"
                            className="w-full h-full border-0"
                            allowFullScreen
                        />
                    </div>
                </div>
            </section>

            <section className="relative max-w-7xl mx-auto px-4 py-12">
                <LandingEditButton onClick={() => setEditKey("artigos")} label="Editar seção" />
                <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">{conteudo.artigos?.titulo}</h2>
                <p className="text-center text-[#9b8dc0] mb-8 max-w-3xl mx-auto">{conteudo.artigos?.texto}</p>
                {artigos.length === 0 ? (
                    <p className="text-center text-[#9b8dc0]">
                        <Link to="/artigos" className="text-brand hover:underline">Ver artigos</Link>
                    </p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {artigos.map((artigo) => (
                            <Link
                                key={artigo.id}
                                to={artigoPath(artigo)}
                                className="group rounded-xl overflow-hidden bg-[rgba(167,79,255,0.08)] hover:bg-[rgba(167,79,255,0.15)] border border-line-soft hover:border-[rgba(199,149,255,0.3)] transition-all"
                            >
                                <div className="overflow-hidden">
                                    {artigo.capaUrl ? (
                                        <img
                                            src={artigo.capaUrl}
                                            alt={artigo.titulo}
                                            className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-full h-44 bg-[rgba(167,79,255,0.12)]" />
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-[#e8dfff] mb-2 line-clamp-2 group-hover:text-brand transition-colors">
                                        {artigo.titulo}
                                    </h3>
                                    <span className="text-brand text-sm font-medium">Ler mais &gt;&gt;</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
                <div className="mt-8 flex justify-center">
                    <Link
                        to="/artigos"
                        className="inline-flex items-center gap-2 px-5 py-[0.6rem] rounded-xl border border-[rgba(199,149,255,0.35)] bg-[rgba(167,79,255,0.1)] text-brand font-semibold text-[0.9rem] transition-all hover:bg-[rgba(167,79,255,0.2)]"
                    >
                        Ver todos os artigos
                    </Link>
                </div>
            </section>

            <section className="relative bg-[#080514] py-12 border-t border-line-soft">
                <div className="absolute top-4 right-4 z-30 flex flex-wrap justify-end gap-2">
                    <LandingEditButton
                        className="static"
                        onClick={() => setEditKey("parceirosTexto")}
                        label="Editar texto"
                    />
                    <LandingEditButton
                        className="static"
                        onClick={() => setEditKey("parceirosLogos")}
                        label="Editar logos"
                    />
                </div>
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">{conteudo.parceiros?.titulo}</h2>
                    <p className="text-center mb-8">
                        <Link to="/parceiros" className="text-brand hover:text-[#e8dfff] transition-colors">
                            {conteudo.parceiros?.texto}
                        </Link>
                    </p>
                    <PartnersCarousel parceiros={parceiros} />
                </div>
            </section>

            <LandingSlidesModal
                isOpen={editKey === "slides"}
                onClose={() => setEditKey(null)}
                onSaved={(data) => {
                    const lista = Array.isArray(data?.slides) ? data.slides : [];
                    setSlides(lista.filter((s) => s.ativo !== false));
                }}
            />
            <LandingParceirosModal
                isOpen={editKey === "parceirosLogos"}
                onClose={() => setEditKey(null)}
                onSaved={(data) => {
                    const lista = Array.isArray(data?.parceiros) ? data.parceiros : [];
                    setParceiros(lista.filter((p) => p.ativo !== false));
                }}
            />
            {["youtube", "twitch", "artigos", "parceirosTexto"].map((key) => {
                const secaoKey = key === "parceirosTexto" ? "parceiros" : key;
                const tituloSecao = {
                    youtube: "YouTube",
                    twitch: "Twitch",
                    artigos: "Artigos",
                    parceirosTexto: "Parceiros",
                }[key];
                return (
                    <LandingSecaoTextoModal
                        key={key}
                        isOpen={editKey === key}
                        onClose={() => setEditKey(null)}
                        secaoKey={secaoKey}
                        tituloSecao={tituloSecao}
                        valor={conteudo[secaoKey]}
                        conteudoCompleto={conteudo}
                        onSaved={(salvo) => setConteudo({ ...CONTEUDO_HOME_FALLBACK, ...salvo })}
                    />
                );
            })}

            <Footer />
            <CookieConsentBanner />
        </div>
    );
}
