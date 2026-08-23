import { LandingHeader } from "../components/ui/LandingHeader";
import { Footer } from "../components";
import { usePageTitle } from "../hooks/usePageTitle";
import { PAGE_TITLES } from "../constants/pageTitles";

const BLOG_POSTS = [
    {
        title: "O SONHO DO DOWNSHIFT: Cartas Incomuns para o Pauper",
        img: "/images/landing/blog/downshift.png",
        link: "https://tiagofuguete.com.br/2026/02/10/o-sonho-do-downshift-cartas-incomuns-para-o-pauper/",
        excerpt: "Ol�, sou Guilherme Gomes, jogo h� 14 anos, meus decks favoritos v�lidos s�o Walls combo e Retriever...",
    },
    {
        title: "Guia de side: Rakdos Madness",
        img: "/images/landing/blog/rakdos-madness.png",
        link: "https://tiagofuguete.com.br/2026/02/06/guia-de-side-rakdos-madness/",
        excerpt: "Depois do 5-0 em liga achei legal trazer um guia para voc�s!",
    },
    {
        title: "Melhores Cartas de Side do Pauper",
        img: "/images/landing/blog/side-pauper.jpg",
        link: "https://tiagofuguete.com.br/2026/02/03/melhores-cartas-de-side-do-pauper/",
        excerpt: "Criei uma lista com as melhores cartas de side!",
    },
    {
        title: "Guia de side: BG PESTIL�NCIA Pauper",
        img: "/images/landing/blog/bg-pestilencia.png",
        link: "https://tiagofuguete.com.br/2026/01/23/guia-de-side-bg-pestilencia-pauper/",
        excerpt: "Depois do 5-0 em liga achei legal trazer um guia para voc�s!",
    },
    {
        title: "SuperCup 2025, o seu Torneio Pauper de Times",
        img: "/images/landing/blog/supercup.png",
        link: "https://tiagofuguete.com.br/2025/07/21/fui-campeao-do-pauper-challenge-de-jund-wildfire/",
        excerpt: "Joga Pauper no MTGO juntos com os amigos? Esse torneio � para voc�s!",
    },
    {
        title: "Fui CAMPE�O do Pauper Challenge de Jund Wildfire",
        img: "/images/landing/blog/jund-wildfire-campeao.jpg",
        link: "https://tiagofuguete.com.br/2025/07/17/campeao-do-pauper-challenge-de-jund-wildfire/",
        excerpt: "Saiba como foi o Challenge e como est� o Jund Wildfire no meta do Pauper!",
    },
];

export function LandingBlogPage() {
    usePageTitle(PAGE_TITLES.blog);

    return (
        <div className="min-h-screen bg-[#0e091c] text-[#e8dfff]" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" }}>
            <LandingHeader />

            <section className="max-w-7xl mx-auto px-4 pt-28 pb-12">
                <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">Veja as novidades</h1>
                <p className="text-center text-[#9b8dc0] mb-10 max-w-3xl mx-auto">
                    Al�m dos torneios, voc� pode acessar conte�dos educativos, deck techs, dicas de gameplay e muito mais.
                    O objetivo � simples: fazer voc� se divertir e melhorar como jogador de Magic: The Gathering no formato Pauper.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {BLOG_POSTS.map((post) => (
                        <a
                            key={post.title}
                            href={post.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group rounded-xl overflow-hidden bg-[rgba(167,79,255,0.08)] hover:bg-[rgba(167,79,255,0.15)] border border-line-soft hover:border-[rgba(199,149,255,0.3)] transition-all"
                        >
                            <div className="overflow-hidden">
                                <img
                                    src={post.img}
                                    alt={post.title}
                                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                    loading="lazy"
                                />
                            </div>
                            <div className="p-5">
                                <h2 className="font-semibold text-[#e8dfff] text-lg mb-2 line-clamp-2 group-hover:text-brand transition-colors">
                                    {post.title}
                                </h2>
                                <p className="text-[#9b8dc0] text-sm mb-3 line-clamp-2">{post.excerpt}</p>
                                <span className="text-brand text-sm font-medium">Ler mais &gt;&gt;</span>
                            </div>
                        </a>
                    ))}
                </div>
            </section>

            <Footer />
        </div>
    );
}
