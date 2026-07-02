import { LandingHeader } from "../components/ui/LandingHeader";
import { Footer } from "../components";
import { usePageTitle } from "../hooks/usePageTitle";
import { PAGE_TITLES } from "../constants/pageTitles";

const DECKS = [
    { name: "Abzan Sisters", img: "/images/landing/decks/abzan-sisters.jpeg", link: "https://tiagofuguete.com.br/decks/abzan-sisters" },
    { name: "Azorius Familiars", img: "/images/landing/decks/azorius-familiars.jpeg", link: "https://tiagofuguete.com.br/decks/azorius-familiars" },
    { name: "Azorius Tribe", img: "/images/landing/decks/azorius-tribe.jpeg", link: "https://tiagofuguete.com.br/decks/azorius-tribe" },
    { name: "Boros Synthesizer", img: "/images/landing/decks/boros-synthesizer.jpeg", link: "https://tiagofuguete.com.br/decks/boros-synthesizer" },
    { name: "Caw-Gates", img: "/images/landing/decks/caw-gates.jpeg", link: "https://tiagofuguete.com.br/decks/caw-gates" },
    { name: "Cycle Storm", img: "/images/landing/decks/cycle-storm.jpeg", link: "https://tiagofuguete.com.br/decks/cycle-storm" },
    { name: "Dimir Control", img: "/images/landing/decks/dimir-control.jpeg", link: "https://tiagofuguete.com.br/decks/dimir-control" },
    { name: "Dimir Fadas", img: "/images/landing/decks/dimir-fadas.jpeg", link: "https://tiagofuguete.com.br/decks/dimir-fadas" },
    { name: "Dimir Terror", img: "/images/landing/decks/dimir-terror.jpeg", link: "https://tiagofuguete.com.br/decks/dimir-terror" },
    { name: "Dredge", img: "/images/landing/decks/dredge.jpeg", link: "https://tiagofuguete.com.br/decks/dredge" },
    { name: "Elfos Mono Green", img: "/images/landing/decks/elfos-monogreen.jpeg", link: "https://tiagofuguete.com.br/decks/elfos-monogreen" },
    { name: "Goblins Combo", img: "/images/landing/decks/goblins-combo.jpeg", link: "https://tiagofuguete.com.br/decks/goblins-combo" },
    { name: "Golgari Gardens", img: "/images/landing/decks/golgari-gardens.jpeg", link: "https://tiagofuguete.com.br/decks/Golgari-Gardens" },
    { name: "Golgari Gardens Pactdoll", img: "/images/landing/decks/golgari-gardens-pact.jpeg", link: "https://tiagofuguete.com.br/decks/Golgari-Gardens-pact" },
    { name: "Golgari Pestilence", img: "/images/landing/decks/golgari-pestilence.jpeg", link: "https://tiagofuguete.com.br/decks/Golgari-pestilence" },
    { name: "Grixis Affinity", img: "/images/landing/decks/grixis-affinity.jpg", link: "https://tiagofuguete.com.br/decks/grixis-affinity" },
    { name: "Gruul Ponza", img: "/images/landing/decks/gruul-ponza.jpeg", link: "https://tiagofuguete.com.br/decks/gruul-ponza" },
    { name: "Gruul Ramp", img: "/images/landing/decks/gruul-ramp.jpeg", link: "https://tiagofuguete.com.br/decks/gruul-ramp" },
    { name: "Heroic", img: "/images/landing/decks/heroic.jpeg", link: "https://tiagofuguete.com.br/decks/heroic" },
    { name: "Izzet Control", img: "/images/landing/decks/izzet-control.jpeg", link: "https://tiagofuguete.com.br/decks/izzet-control" },
    { name: "Izzet Fadas", img: "/images/landing/decks/izzet-fadas.jpeg", link: "https://tiagofuguete.com.br/decks/izzet-fadas" },
    { name: "Izzet Solfatara", img: "/images/landing/decks/izzet-solfatara.jpeg", link: "https://tiagofuguete.com.br/decks/izzet-solfatara" },
    { name: "Jeskai Affinity", img: "/images/landing/decks/jeskai-affinity.jpeg", link: "https://tiagofuguete.com.br/decks/jeskai_Affinity" },
    { name: "Jeskai Ephemerate", img: "/images/landing/decks/jeskai-ephemerate.jpeg", link: "https://tiagofuguete.com.br/decks/jeskai_Ephemerate" },
    { name: "Jund Cascade", img: "/images/landing/decks/jund-cascade.jpeg", link: "https://tiagofuguete.com.br/decks/jund-cascade" },
    { name: "Jund Wildfire", img: "/images/landing/decks/jund-wildfire.jpeg", link: "https://tiagofuguete.com.br/decks/jund-wildfire" },
    { name: "Land Spy", img: "/images/landing/decks/land-spy.jpeg", link: "https://tiagofuguete.com.br/decks/land-spy" },
    { name: "Mardu Wildfire", img: "/images/landing/decks/mardu-wildfire.jpeg", link: "https://tiagofuguete.com.br/decks/mardu-wildfire" },
    { name: "Mono Black Burn", img: "/images/landing/decks/mono-black-burn.jpeg", link: "https://tiagofuguete.com.br/decks/mono-black-burn" },
    { name: "Mono Black Sacrifice", img: "/images/landing/decks/mono-black-sacrifice.jpeg", link: "https://tiagofuguete.com.br/decks/mono-black-sacrifice" },
    { name: "Mono Black Control", img: "/images/landing/decks/mono-black-control.jpeg", link: "https://tiagofuguete.com.br/decks/mono-black-control" },
    { name: "Mono Blue Fadas", img: "/images/landing/decks/mono-blue-fadas.jpeg", link: "https://tiagofuguete.com.br/decks/mono-u-fadas" },
    { name: "Mono Blue Terror", img: "/images/landing/decks/mono-blue-terror.jpeg", link: "https://tiagofuguete.com.br/decks/mono-blue-terror" },
    { name: "Mono Green Infect", img: "/images/landing/decks/mono-green-infect.jpeg", link: "https://tiagofuguete.com.br/decks/mono-green-infect" },
    { name: "Mono Green Stompy", img: "/images/landing/decks/mono-green-stompy.jpeg", link: "https://tiagofuguete.com.br/decks/mono-green-stompy" },
    { name: "Mono Red Kiln Fiend", img: "/images/landing/decks/mono-red-kiln-fiend.jpeg", link: "https://tiagofuguete.com.br/decks/mono-red-kiln-fiend" },
    { name: "Mono Red Madness", img: "/images/landing/decks/mono-red-madness.jpeg", link: "https://tiagofuguete.com.br/decks/mono-red-madness" },
    { name: "Mono Red Ping", img: "/images/landing/decks/mono-red-ping.jpeg", link: "https://tiagofuguete.com.br/decks/mono-red-ping" },
    { name: "Mono Red Rally", img: "/images/landing/decks/mono-red-rally.jpeg", link: "https://tiagofuguete.com.br/decks/mono-red-rally" },
    { name: "Naya Dianteira", img: "/images/landing/decks/naya-dianteira.jpeg", link: "https://tiagofuguete.com.br/decks/naya-dianteira" },
    { name: "Naya Gates", img: "/images/landing/decks/naya-gates.jpeg", link: "https://tiagofuguete.com.br/decks/naya-gates" },
    { name: "Orzhov Glintblade", img: "/images/landing/decks/orzhov-glintblade.jpeg", link: "https://tiagofuguete.com.br/decks/orzhov-glintblade" },
    { name: "Orzhov Ephemerate", img: "/images/landing/decks/orzhov-ephemerate.jpeg", link: "https://tiagofuguete.com.br/decks/orzhov-ephemerate" },
    { name: "Orzhov Pestilence", img: "/images/landing/decks/orzhov-pestilence.jpeg", link: "https://tiagofuguete.com.br/decks/orzhov-pestilence" },
    { name: "Poison Storm", img: "/images/landing/decks/poison-storm.jpeg", link: "https://tiagofuguete.com.br/decks/poizon-storm" },
    { name: "Rakdos Madness", img: "/images/landing/decks/rakdos-madness.jpeg", link: "https://tiagofuguete.com.br/decks/rakdos-madness" },
    { name: "Selesnya Auras", img: "/images/landing/decks/selesnya-auras.jpeg", link: "https://tiagofuguete.com.br/decks/selesnya-auras" },
    { name: "Sultai Fadas", img: "/images/landing/decks/sultai-fadas.jpeg", link: "https://tiagofuguete.com.br/decks/sultai-fadas" },
    { name: "Peticionarios", img: "/images/landing/decks/peticionarios.jpeg", link: "https://tiagofuguete.com.br/decks/peticionarios" },
    { name: "Tron Altar", img: "/images/landing/decks/tron-altar.jpeg", link: "https://tiagofuguete.com.br/decks/tron-altar" },
    { name: "Tron Cascade", img: "/images/landing/decks/tron-cascade.jpeg", link: "https://tiagofuguete.com.br/decks/tron-cascade" },
    { name: "Tron Egg", img: "/images/landing/decks/tron-egg.jpeg", link: "https://tiagofuguete.com.br/decks/tron-egg" },
    { name: "Tron Fog", img: "/images/landing/decks/tron-fog.jpeg", link: "https://tiagofuguete.com.br/decks/tron-fog" },
    { name: "Walls Combo", img: "/images/landing/decks/walls-combo.jpeg", link: "https://tiagofuguete.com.br/decks/walls-combo" },
    { name: "White Weenie", img: "/images/landing/decks/white-weenie.jpeg", link: "https://tiagofuguete.com.br/decks/white-weenie" },
    { name: "White Weenie Artefatos", img: "/images/landing/decks/white-weenie-artefatos.jpeg", link: "https://tiagofuguete.com.br/decks/white-weenie-artefatos" },
];

export function LandingDecksPage() {
    usePageTitle(PAGE_TITLES.decks);

    return (
        <div className="min-h-screen bg-[#0e091c] text-[#e8dfff]" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" }}>
            <LandingHeader />

            {/* Title */}
            <section className="max-w-7xl mx-auto px-4 pt-28 pb-4">
                <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">Meus decks</h1>
                <p className="text-center text-[#9b8dc0] max-w-2xl mx-auto">
                    Confira todos os decks de Pauper jogados no canal
                </p>
            </section>

            {/* Deck Grid */}
            <section className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {DECKS.map((d) => (
                        <a
                            key={d.name}
                            href={d.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative rounded-xl overflow-hidden bg-[rgba(167,79,255,0.08)] hover:ring-2 hover:ring-[#c795ff] transition-all"
                        >
                            <div
                                className="aspect-video bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                                style={{ backgroundImage: `url(${d.img})` }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                <h2 className="text-lg font-bold text-white">{d.name}</h2>
                                <span className="text-[#c795ff] text-sm font-semibold">Ver deck →</span>
                            </div>
                        </a>
                    ))}
                </div>
            </section>

            {/* Apoiase CTA */}
            <section className="bg-[#080514] py-12 border-t border-[rgba(217,180,255,0.12)]">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">Veja decks e side guides exclusivos no nosso Apoia-se!</h2>
                    <a
                        href="https://apoia.se/tiagofuguete/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-8 py-3 rounded-xl border border-[rgba(199,149,255,0.5)] bg-gradient-to-br from-[#8e39ed] to-[#5f23b3] text-white font-bold transition-all hover:shadow-[0_4px_20px_rgba(142,57,237,0.45)] hover:-translate-y-[1px]"
                    >
                        Ir para o Apoia-se
                    </a>
                </div>
            </section>

            <Footer />
        </div>
    );
}
