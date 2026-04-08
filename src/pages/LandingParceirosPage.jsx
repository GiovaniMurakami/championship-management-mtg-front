import { LandingHeader } from "../components/ui/LandingHeader";
import { Footer } from "../components";

const PARTNERS = [
    { name: "Bandeira Cards", img: "/images/landing/parceiros/bandeira-cards.png", link: "https://www.bandeiracards.com.br/" },
    { name: "Capi Cards", img: "/images/landing/parceiros/capi-cards.png", link: "https://www.capicards.shop/?view=ecom/home" },
    { name: "CardTrader", img: "/images/landing/parceiros/cardtrader.png", link: "https://www.cardtrader.com/invite/FUGUETE05" },
    { name: "Dungeon Games", img: "/images/landing/parceiros/dungeon.png", link: "https://www.dungeongamesstore.com.br/" },
    { name: "Elfo Man", img: "/images/landing/parceiros/elfoman.png", link: "http://www.elfoman.com.br/" },
    { name: "Glorin", img: "/images/landing/parceiros/glorin.png", link: "https://www.glorin.com.br/glorin" },
    { name: "Mineral Games", img: "/images/landing/parceiros/mineral.png", link: "https://www.mineralgames.com.br/" },
    { name: "Mont Shop", img: "/images/landing/parceiros/montshop.png", link: "https://www.montshop.com.br/" },
    { name: "Muka Traders", img: "/images/landing/parceiros/muka.png", link: "https://www.mukatraders.com.br/" },
    { name: "Orbita Playmats", img: "/images/landing/parceiros/orbita.png", link: "https://www.instagram.com/orbitaplaymats/" },
    { name: "Rei das Cartinhas", img: "/images/landing/parceiros/rei-das-cartinhas.png", link: "https://www.reidascartinhas.com.br/?view=ecom/home" },
    { name: "Taverna Games", img: "/images/landing/parceiros/taverna-games.png", link: "https://www.lojatavernagames.com.br/?view=ecom/home" },
    { name: "TCG InBox", img: "/images/landing/parceiros/tcg-inbox.png", link: "https://tcginbox.com.br/" },
];

export function LandingParceirosPage() {
    return (
        <div className="min-h-screen bg-[#0e091c] text-[#e8dfff]" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" }}>
            <LandingHeader />

            {/* Hero */}
            <section className="max-w-4xl mx-auto px-4 pt-28 pb-12 text-center">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                    Temos o orgulho de ser parceiros das principais lojas de Magic no Brasil e no Mundo!
                </h1>
                <p className="text-[#9b8dc0] max-w-2xl mx-auto">
                    Esse reconhecimento é fruto de anos de dedicação, credibilidade e do apoio
                    constante da comunidade que acredita no nosso trabalho.
                </p>
            </section>

            {/* Coupon */}
            <section className="bg-[#080514] py-8 border-y border-[rgba(217,180,255,0.12)]">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <h2 className="text-xl md:text-2xl font-bold text-[#c795ff]">
                        Use o Cupom "FUGUETE05" para garantir 5% de desconto
                    </h2>
                </div>
            </section>

            {/* Partners Grid */}
            <section className="max-w-6xl mx-auto px-4 py-12">
                <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Nossos patrocinadores</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {PARTNERS.map((p) => (
                        <a
                            key={p.name}
                            href={p.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={p.name}
                            className="group relative flex flex-col items-center justify-center p-4 rounded-xl bg-[rgba(167,79,255,0.08)] hover:bg-[rgba(167,79,255,0.18)] border border-[rgba(217,180,255,0.1)] hover:border-[rgba(199,149,255,0.4)] transition-all duration-300 aspect-square hover:scale-105 hover:shadow-[0_8px_28px_rgba(142,57,237,0.35)] active:scale-100"
                        >
                            <img
                                src={p.img}
                                alt={p.name}
                                className="max-h-20 max-w-full object-contain opacity-75 group-hover:opacity-100 transition-all duration-300 group-hover:scale-105"
                                loading="lazy"
                            />
                            <span className="absolute bottom-2 left-0 right-0 text-center text-[0.65rem] text-[#9b8dc0] group-hover:text-[#c795ff] transition-colors duration-200 px-1 truncate">
                                {p.name}
                            </span>
                        </a>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="bg-[#080514] py-12 border-t border-[rgba(217,180,255,0.12)]">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">Ainda não é parceiro?</h2>
                    <p className="text-[#9b8dc0] mb-4 max-w-2xl mx-auto">
                        Se você tem uma loja e quer fortalecer a presença da sua marca no cenário
                        competitivo de Magic, esse é o momento. Estou sempre em busca de parceiros que, assim
                        como eu, acreditam no potencial da comunidade e querem crescer junto. Entre em contato:
                    </p>
                    <a href="mailto:contato@tiagofuguete.com.br" className="text-[#c795ff] hover:text-[#e8dfff] font-semibold text-lg transition-colors">
                        contato@tiagofuguete.com.br
                    </a>
                </div>
            </section>

            <Footer />
        </div>
    );
}
