import { useState, useEffect, useCallback } from "react";
import mukaLogo from "../../assets/muka.png";

const SLIDES = [
    {
        id: 1,
        tag: "Patrocinador Oficial",
        headline: "Muka Trader",
        sub: "A sua loja de Magic: The Gathering em São Paulo. A melhor seleção de singles, boosters e acessórios para jogadores competitivos.",
        cta: "Conheça a loja",
    },
    {
        id: 2,
        tag: "Promoção",
        headline: "Singles com até 30% OFF",
        sub: "Encontre as melhores cartas para montar seu deck de torneio com os preços mais competitivos do mercado. Modern, Pioneer, Standard e mais.",
        cta: "Ver singles",
    },
    {
        id: 3,
        tag: "Novidade",
        headline: "Boosters & Sealed",
        sub: "Abra boosters dos sets mais recentes e monte sua coleção. Disponível na loja física e com entrega para todo o Brasil.",
        cta: "Ver produtos",
    },
];

export function SponsorSection() {
    const [current, setCurrent] = useState(0);
    const [animating, setAnimating] = useState(false);

    const goTo = useCallback((index) => {
        setAnimating(true);
        setTimeout(() => {
            setCurrent(index);
            setAnimating(false);
        }, 200);
    }, []);

    const next = useCallback(() => {
        goTo((current + 1) % SLIDES.length);
    }, [current, goTo]);

    const prev = () => goTo((current - 1 + SLIDES.length) % SLIDES.length);

    useEffect(() => {
        const id = setInterval(next, 5500);
        return () => clearInterval(id);
    }, [next]);

    const slide = SLIDES[current];

    return (
        <section className="sponsor-section">
            <div className="sponsor-header">
                <span className="sponsor-eyebrow">Patrocinador Oficial</span>
            </div>
            <div className="sponsor-carousel">
                <div className={`sponsor-carousel__body${animating ? " sponsor-carousel__body--out" : ""}`}>
                    <div className="sponsor-logo-wrap">
                        <img src={mukaLogo} alt="Muka Trader" className="sponsor-logo" />
                    </div>
                    <div className="sponsor-slide-content">
                        <span className="sponsor-tag">{slide.tag}</span>
                        <h3 className="sponsor-headline">{slide.headline}</h3>
                        <p className="sponsor-sub">{slide.sub}</p>
                        <button type="button" className="sponsor-cta">{slide.cta} →</button>
                    </div>
                </div>
                <div className="sponsor-carousel__controls">
                    <button type="button" className="sponsor-nav-btn" onClick={prev} aria-label="Anterior">‹</button>
                    <div className="sponsor-dots">
                        {SLIDES.map((s, i) => (
                            <button
                                key={s.id}
                                type="button"
                                className={`sponsor-dot${i === current ? " sponsor-dot--active" : ""}`}
                                onClick={() => goTo(i)}
                                aria-label={`Slide ${i + 1}`}
                            />
                        ))}
                    </div>
                    <button type="button" className="sponsor-nav-btn" onClick={next} aria-label="Próximo">›</button>
                </div>
            </div>
        </section>
    );
}
