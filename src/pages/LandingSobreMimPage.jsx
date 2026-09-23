import { LandingHeader } from "../components/ui/LandingHeader";
import { Footer } from "../components";
import { usePageTitle } from "../hooks/usePageTitle";
import { PAGE_TITLES } from "../constants/pageTitles";

const GALLERY = [
    "/images/landing/sobre-mim/gallery-1.jpeg",
    "/images/landing/sobre-mim/gallery-3.jpeg",
    "/images/landing/sobre-mim/gallery-4.jpeg",
    "/images/landing/sobre-mim/gallery-5.jpeg",
    "/images/landing/sobre-mim/gallery-6.jpeg",
];

const SUPPORTERS = "Adilson Roberto Alves Silva; alexandre queiroz galleti; Angelo Graper; Antonio Sérgio Ribeiro Junior; Augusto Alves; Bruno Campitelli Belchior; Bruno Costa Castro Alves; Carlos Eduardo de Aguiar Nogueira Gomes; Cesar Fabricio Klemes da Cruz; Daniel Ruiz Dias; Daniel Seether; DERLI TIAGO CASTILHO DE GODOIS SCHLICK; Diego Nogueira; Dionatan silvestre da silva; Edson Henrique Medeiros Silva; Fabio Lima; FABIO OLIVEIRA COSTA; Fagner Ferreira Barbosa; Felipe José do Nascimento Henrique; Felipe Lapena Barreto; Felipe Pedroso Camargo; Felipe Ramos; Felipe Tavares Batista; Filipe Silqueira Reis; Flavio Augusto de Carvalho Fialho; flavio sarto; FREDERICO ROCHA BAUMGRATZ; isaque angelo de oliveira saboia; João Prado; JORGE FERNANDO KIKUTA; José Rauryson Alves Bezerra; Julio Thibes; LEANDRO FLORESTA DOS SANTOS; Leandro Sanches Bermudes; Luan Kupka; Lucas Ribeiro; Lucas Stamford; Luiz Paulo Feliciano Guedes Pinto; Marcelo Miziara; Marcelo Shanks; Marcos Tadeu Secol Felix; Max Diávila Machado; Miguel Filipe Rodriguez Moure; PAULO GONÇALVES PEREIRA; PEDRO HENRIQUE MANZONI DE LIMA; Regis Lima Claus; Renan Carvalho; Roberto Borzuk Kneip Salimena; robson pereira; Rodrigo Flores; Serra Leno; Thais Vieira Oliveira; THIAGO HENRIQUE DE MATTOS; Vat Alexsandro; Vinicius Santos; VITOR V MORGADO; Yago Busatto Leal";

const SUPPORTERS_LIST = SUPPORTERS.split("; ").map(s => s.trim()).filter(Boolean);

export function LandingSobreMimPage() {
    usePageTitle(PAGE_TITLES.sobreMim);

    return (
        <div className="min-h-screen bg-[#0e091c] text-[#e8dfff]" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" }}>
            <LandingHeader />

            {/* Hero / Story */}
            <section className="max-w-5xl mx-auto px-4 pt-28 pb-12">
                <h1 className="text-3xl md:text-4xl font-bold text-center mb-10">Minha história no Magic</h1>

                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <img
                        src="/images/landing/sobre-mim/sobremim-profile.jpg"
                        alt="Tiago Fuguete"
                        className="w-full md:w-80 rounded-2xl object-cover flex-shrink-0"
                    />
                    <div className="space-y-4 text-text-soft leading-relaxed">
                        <p>
                            "Olá, meu nome é Tiago… Mas ninguém me chama assim. Desde pequeno carrego um
                            apelido que não escolhi, mas que hoje faz parte de quem eu sou: Tiago Fuguete. 🚀
                        </p>
                        <p>
                            Sempre fui apaixonado por animais, sou pai da Alice e do Tiaguinho, meus dois
                            maiores orgulhos, mas tem outra paixão que me acompanha há muito tempo: o Magic: The Gathering.
                        </p>
                        <p>
                            O que começou como diversão, acabou se tornando um caminho inesperado na minha vida. Alguns anos atrás, comecei a fazer lives na Twitch só por hobby,
                            só pra compartilhar minha paixão pelo Magic com quem também ama o jogo. Até
                            que, num daqueles momentos em que a vida vira do avesso, fui demitido do meu
                            emprego. E ali, no meio da incerteza, tomei a decisão mais corajosa que já fiz: transformar aquilo que me fazia feliz na minha profissão.
                        </p>
                        <p>
                            De forma natural, o canal foi crescendo, a comunidade foi me abraçando, e hoje
                            tenho a honra de ser reconhecido como um dos maiores influenciadores de Magic do Brasil. Magic mudou minha vida. E todos os dias, em cada live, cada torneio, cada
                            conversa, eu tento retribuir isso pra comunidade."
                        </p>
                    </div>
                </div>
            </section>

            {/* Apoiase */}
            <section className="bg-[#080514] py-12 border-y border-line-soft">
                <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-2xl md:text-3xl font-bold mb-3">Apoie o meu trabalho pelo Apoia-se</h2>
                        <p className="text-[#9b8dc0] mb-6">
                            É graças ao apoio de cada um dos apoiadores que esse sonho se tornou realidade!
                        </p>
                        <a
                            href="https://apoia.se/tiagofuguete"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-8 py-3 rounded-xl border border-[rgba(199,149,255,0.5)] bg-gradient-to-br from-[#8e39ed] to-[#5f23b3] text-white font-bold transition-all hover:shadow-[0_4px_20px_rgba(142,57,237,0.45)] hover:-translate-y-[1px]"
                        >
                            Quero apoiar!
                        </a>
                    </div>
                    <img
                        src="/images/landing/sobre-mim/apoiase-screenshot.png"
                        alt="Apoia-se"
                        className="w-full md:w-80 rounded-xl"
                    />
                </div>
            </section>

            {/* Gallery */}
            <section className="max-w-6xl mx-auto px-4 py-12">
                <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Isso é Magic, isso é Tiago Fuguete</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {GALLERY.map((src, i) => (
                        <div key={i} className="aspect-square rounded-xl overflow-hidden">
                            <img src={src} alt={`Galeria ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
                        </div>
                    ))}
                </div>
            </section>

            {/* Supporters */}
            <section className="bg-[#080514] py-16 border-t border-line-soft">
                <div className="max-w-5xl mx-auto px-4 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">Obrigado! 🙏</h2>
                    <p className="text-[#9b8dc0] mb-10 text-sm">Esse projeto existe graças a cada um de vocês</p>
                    <div className="flex flex-wrap justify-center gap-2">
                        {SUPPORTERS_LIST.map((name) => (
                            <span
                                key={name}
                                className="inline-block px-3 py-1 rounded-full border border-line-soft bg-[rgba(167,79,255,0.08)] text-text-soft text-xs hover:bg-[rgba(167,79,255,0.2)] hover:border-[rgba(199,149,255,0.4)] hover:text-text-main transition-all duration-200 cursor-default"
                            >
                                {name}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
