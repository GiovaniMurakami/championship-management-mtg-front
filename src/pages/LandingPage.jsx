import { useState, useEffect, useCallback } from "react";
import { Footer } from "../components";
import { LandingHeader } from "../components/ui/LandingHeader";

const SLIDES = [
    {
        heading: "Bem-vindo ao meu universo Pauper! ⚡️",
        desc: "Tudo sobre torneios, decks e conteúdos exclusivos de Magic: The Gathering focado no formato Pauper no MTG Online.",
        btn: "Saber mais",
        link: "https://tiagofuguete.com.br/sobre-mim/",
        bg: "https://tiagofuguete.com.br/wp-content/uploads/2025/06/banner_home.png",
    },
    {
        heading: "Torneios Grátis",
        desc: "Participe dos nossos torneios de Magic Online gratuitamente, se classifique bem e ganhe recompensas reais!",
        btn: "Quero participar",
        link: "https://tiagofuguete.com.br/torneios/",
        bg: "https://tiagofuguete.com.br/wp-content/uploads/2025/06/banner_home2.png",
    },
    {
        heading: "Seja um apoiador e tenha conteúdo EXCLUSIVO!",
        desc: "Participe dos nossos torneios de Magic Online gratuitamente, se classifique bem e ganhe recompensas reais!",
        btn: "Quero apoiar",
        link: "https://apoia.se/tiagofuguete",
        bg: "https://tiagofuguete.com.br/wp-content/uploads/2025/07/apoiase.jpg",
    },
    {
        heading: "Me siga também nas redes sociais e não perca nenhum conteúdo!",
        desc: "Acompanhe meu trabalho pelo instagram e não perca as atualizações mais recentes sobre Pauper e sobre os nossos torneios!",
        btn: "Ir para o Instagram",
        link: "https://www.instagram.com/tiagofuguete/",
        bg: "https://tiagofuguete.com.br/wp-content/uploads/2025/07/midiabanner.jpg",
    },
];

const VIDEOS = [
    { id: "VXm317-GQ40", title: "[PAUPER] White Weenie VS Rakdos Madness - Fuguete League 268" },
    { id: "7qaPRoWEPi0", title: "[PAUPER] BW GlintBlade VS Rakdos Madness - Pauper Royale 285" },
    { id: "mLOEL6uW3WQ", title: "[PAUPER] Fog Tron VS Hot Dog - Fuguete Champ 284 (FINAL)" },
    { id: "ZVxvEowYqrs", title: "[PAUPER] Fog Tron VS BG Pestilencia - Fuguete Champ 284" },
    { id: "fjXPiBiwnG8", title: "[PAUPER] White Weenie VS Mono Red Rally - Tropical Pauper 276 (FINAL)" },
    { id: "JbGKPM49KVk", title: "[PAUPER] UW Familiar VS Mono U Terror - Tropical Pauper 276" },
];

const BLOG_POSTS = [
    {
        title: "O SONHO DO DOWNSHIFT: Cartas Incomuns para o Pauper",
        img: "https://tiagofuguete.com.br/wp-content/uploads/2026/02/04-Artigo-Cartas-Incomuns-para-o-Pauper-300x200.png",
        link: "https://tiagofuguete.com.br/2026/02/10/o-sonho-do-downshift-cartas-incomuns-para-o-pauper/",
    },
    {
        title: "Guia de side: Rakdos Madness",
        img: "https://tiagofuguete.com.br/wp-content/uploads/2026/02/03-Artigo-Rakdos-Madness-300x200.png",
        link: "https://tiagofuguete.com.br/2026/02/06/guia-de-side-rakdos-madness/",
    },
    {
        title: "Melhores Cartas de Side do Pauper",
        img: "https://tiagofuguete.com.br/wp-content/uploads/2026/02/Mono-Blue-Terror-gameplay-Pauper-TiagoFuguete-EXCLUSIVO-300x169.jpg",
        link: "https://tiagofuguete.com.br/2026/02/03/melhores-cartas-de-side-do-pauper/",
    },
    {
        title: "Guia de side: BG PESTILÊNCIA Pauper",
        img: "https://tiagofuguete.com.br/wp-content/uploads/2026/01/ChatGPT-Image-22-de-jan.-de-2026-22_43_04-300x200.png",
        link: "https://tiagofuguete.com.br/2026/01/23/guia-de-side-bg-pestilencia-pauper/",
    },
    {
        title: "SuperCup 2025, o seu Torneio Pauper de Times",
        img: "https://tiagofuguete.com.br/wp-content/uploads/2025/07/SUPERCUP-246x300.png",
        link: "https://tiagofuguete.com.br/2025/07/21/fui-campeao-do-pauper-challenge-de-jund-wildfire/",
    },
];

const PARTNERS = [
    { src: "https://tiagofuguete.com.br/wp-content/uploads/2025/06/mineral.png", alt: "mineral" },
    { src: "https://tiagofuguete.com.br/wp-content/uploads/2025/06/mont.png", alt: "mont" },
    { src: "https://tiagofuguete.com.br/wp-content/uploads/2025/06/muka.png", alt: "muka" },
    { src: "https://tiagofuguete.com.br/wp-content/uploads/2025/07/dungeon.png", alt: "dungeon" },
    { src: "https://tiagofuguete.com.br/wp-content/uploads/2025/12/Glorin-Full-Logo.png", alt: "Glórin" },
    { src: "https://tiagofuguete.com.br/wp-content/uploads/2025/07/piomp.png", alt: "piomp" },
    { src: "https://tiagofuguete.com.br/wp-content/uploads/2025/07/rei.png", alt: "rei" },
    { src: "https://tiagofuguete.com.br/wp-content/uploads/2025/07/storm.png", alt: "storm" },
    { src: "https://tiagofuguete.com.br/wp-content/uploads/2025/07/taverna.png", alt: "taverna" },
    { src: "https://tiagofuguete.com.br/wp-content/uploads/2025/08/orbita300px2.png", alt: "orbita" },
    { src: "https://tiagofuguete.com.br/wp-content/uploads/2025/12/CardTrader_logo-sem-fundo.png", alt: "CardTrader" },
    { src: "https://tiagofuguete.com.br/wp-content/uploads/2025/08/TCG-Box-Colorido-scaled.png", alt: "TCG Box" },
    { src: "https://tiagofuguete.com.br/wp-content/uploads/2026/01/Capi-Cards-2.png", alt: "Capi Cards" },
];

const SOCIALS = [
    { label: "Youtube", href: "https://www.youtube.com/@TiagoFuguete/", icon: "M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z", vb: "0 0 576 512" },
    { label: "Twitch", href: "https://twitch.tv/tiagofuguete", icon: "M391.17 103.47H352.54v109.7h38.63ZM285 103H246.37V212.75H285ZM120.83 0 24.31 91.42V420.58H140.14V512l96.53-91.42h77.25L487.69 256V0ZM449.07 237.75l-77.22 73.12h-77.24l-67.6 64v-64h-86.87V18.63h358.9Z", vb: "0 0 512 512" },
    { label: "Twitter", href: "https://x.com/tiagofuguete", icon: "M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z", vb: "0 0 512 512" },
    { label: "Instagram", href: "https://www.instagram.com/tiagofuguete/", icon: "M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z", vb: "0 0 448 512" },
];

/* ── Hero Carousel ── */
function HeroCarousel() {
    const [current, setCurrent] = useState(0);

    const next = useCallback(() => setCurrent((c) => (c + 1) % SLIDES.length), []);
    const prev = useCallback(() => setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length), []);

    useEffect(() => {
        const timer = setInterval(next, 5000);
        return () => clearInterval(timer);
    }, [next]);

    const slide = SLIDES[current];

    return (
        <section className="relative w-full h-[420px] md:h-[500px] overflow-hidden select-none">
            {SLIDES.map((s, i) => (
                <div
                    key={i}
                    className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
                    style={{
                        backgroundImage: `url(${s.bg})`,
                        opacity: i === current ? 1 : 0,
                        zIndex: i === current ? 1 : 0,
                    }}
                >
                    <div className="absolute inset-0 bg-black/50" />
                </div>
            ))}

            <div className="relative z-10 flex flex-col justify-center h-full max-w-5xl mx-auto px-6 md:px-12 text-white">
                <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 drop-shadow-lg animate-[fadeInUp_0.5s_ease-out]" key={current + "h"}>
                    {slide.heading}
                </h2>
                <p className="text-sm md:text-lg max-w-xl mb-6 text-[#e8dfff] drop-shadow animate-[fadeInUp_0.5s_ease-out_0.1s_both]" key={current + "p"}>
                    {slide.desc}
                </p>
                <a
                    href={slide.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block w-fit px-6 py-3 rounded-xl border border-[rgba(199,149,255,0.5)] bg-gradient-to-br from-[#8e39ed] to-[#5f23b3] text-white font-bold transition-all hover:shadow-[0_4px_20px_rgba(142,57,237,0.45)] hover:-translate-y-[1px] animate-[fadeInUp_0.5s_ease-out_0.2s_both]"
                    key={current + "a"}
                >
                    {slide.btn}
                </a>
            </div>

            <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white text-xl transition" aria-label="Anterior">‹</button>
            <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white text-xl transition" aria-label="Próximo">›</button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {SLIDES.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        className={`w-3 h-3 rounded-full transition-all ${i === current ? "bg-white scale-110" : "bg-white/40 hover:bg-white/70"}`}
                        aria-label={`Slide ${i + 1}`}
                    />
                ))}
            </div>
        </section>
    );
}

/* ── Partners Carousel ── */
function PartnersCarousel() {
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setOffset((o) => o + 1), 2500);
        return () => clearInterval(timer);
    }, []);

    const visible = 5;
    const items = [...PARTNERS, ...PARTNERS];

    return (
        <div className="overflow-hidden">
            <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${(offset % PARTNERS.length) * (100 / visible)}%)` }}
            >
                {items.map((p, i) => (
                    <div key={i} className="flex-shrink-0 flex items-center justify-center px-4" style={{ width: `${100 / visible}%` }}>
                        <img src={p.src} alt={p.alt} className="max-h-20 md:max-h-24 object-contain opacity-80 hover:opacity-100 transition-opacity" loading="lazy" />
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ── Main Page ── */
export function LandingPage() {
    return (
        <div className="min-h-screen bg-[#0e091c] text-[#e8dfff]" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" }}>
            {/* ─── Header ─── */}
            <LandingHeader />

            {/* ─── Hero Carousel ─── */}
            <HeroCarousel />

            {/* ─── YouTube Videos ─── */}
            <section className="max-w-7xl mx-auto px-4 py-12">
                <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">Vídeos de Pauper todos os dias!</h2>
                <p className="text-center text-[#9b8dc0] mb-8 max-w-2xl mx-auto">
                    Conteúdo de MTG Pauper exclusivo todos os dias no nosso canal no Youtube
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {VIDEOS.map((v) => (
                        <a
                            key={v.id}
                            href={`https://www.youtube.com/watch?v=${v.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative rounded-xl overflow-hidden bg-[rgba(167,79,255,0.08)] hover:ring-2 hover:ring-[#c795ff] transition-all"
                        >
                            <img
                                src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`}
                                alt={v.title}
                                className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                                <p className="text-sm font-medium text-white line-clamp-2">{v.title}</p>
                            </div>
                            {/* Play icon */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-14 h-14 rounded-full bg-red-600/90 flex items-center justify-center">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            </section>

            {/* ─── Twitch ─── */}
            <section className="bg-[#080514] py-12">
                <div className="max-w-5xl mx-auto px-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">
                        Transmissões e campeonatos ao vivo pela Twitch e Youtube!
                    </h2>
                    <p className="text-center text-[#9b8dc0] mb-8 max-w-2xl mx-auto">
                        Acompanhe as transmissões ao vivo com torneios, análises e muito conteúdo sobre Pauper no MTGO.
                    </p>
                    <div className="rounded-xl overflow-hidden aspect-video">
                        <iframe
                            src="https://player.twitch.tv/?channel=tiagofuguete&parent=localhost&muted=true"
                            title="Twitch - Tiago Fuguete"
                            className="w-full h-full border-0"
                            allowFullScreen
                        />
                    </div>
                </div>
            </section>

            {/* ─── Blog Posts ─── */}
            <section className="max-w-7xl mx-auto px-4 py-12">
                <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">Veja as novidades</h2>
                <p className="text-center text-[#9b8dc0] mb-8 max-w-3xl mx-auto">
                    Além dos torneios, você pode acessar conteúdos educativos, deck techs, dicas de gameplay e muito mais.
                    O objetivo é simples: fazer você se divertir e melhorar como jogador de Magic: The Gathering no formato Pauper.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {BLOG_POSTS.map((post) => (
                        <a
                            key={post.title}
                            href={post.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group rounded-xl overflow-hidden bg-[rgba(167,79,255,0.08)] hover:bg-[rgba(167,79,255,0.15)] border border-[rgba(217,180,255,0.1)] hover:border-[rgba(199,149,255,0.3)] transition-all"
                        >
                            <div className="overflow-hidden">
                                <img
                                    src={post.img}
                                    alt={post.title}
                                    className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                                    loading="lazy"
                                />
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-[#e8dfff] mb-2 line-clamp-2 group-hover:text-[#c795ff] transition-colors">
                                    {post.title}
                                </h3>
                                <span className="text-[#c795ff] text-sm font-medium">Ler mais &gt;&gt;</span>
                            </div>
                        </a>
                    ))}
                </div>
            </section>

            {/* ─── Partners ─── */}
            <section className="bg-[#080514] py-12 border-t border-[rgba(217,180,255,0.12)]">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">Parceiros do Canal</h2>
                    <p className="text-center mb-8">
                        <a href="https://tiagofuguete.com.br/parceiros/" target="_blank" rel="noopener noreferrer" className="text-[#c795ff] hover:text-[#e8dfff] transition-colors">
                            Saiba mais sobre nossos parceiros
                        </a>
                    </p>
                    <PartnersCarousel />
                </div>
            </section>

            {/* ─── Footer ─── */}
            <Footer />
        </div>
    );
}
