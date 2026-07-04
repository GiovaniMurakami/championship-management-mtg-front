import { Link } from "react-router-dom";
import { LandingHeader } from "../components/ui/LandingHeader";
import { Footer } from "../components";
import { usePageTitle } from "../hooks/usePageTitle";
import { PAGE_TITLES } from "../constants/pageTitles";
import { BLOG_EDITOR_CARD_CLASS } from "../styles/uiClasses";

const cards = [
  {
    title: "Parceiros",
    description: "Gerencie nome, imagem e link dos parceiros exibidos na landing e na página de parceiros.",
    href: "/landing/admin/parceiros",
  },
  {
    title: "Apoiadores",
    description: "Gerencie os nomes exibidos na seção de apoiadores da página Sobre mim.",
    href: "/landing/admin/apoiadores",
  },
  {
    title: "Blog",
    description: "Crie, edite e publique artigos do blog.",
    href: "/blog/admin",
  },
];

export function LandingSiteAdminPage() {
  usePageTitle(PAGE_TITLES.gerenciarLanding);

  return (
    <div className="min-h-screen bg-[#0e091c] text-[#e8dfff]">
      <LandingHeader />

      <section className="mx-auto max-w-5xl px-4 pt-28 pb-12">
        <Link to="/landing-page" className="mb-4 inline-flex text-sm text-[#c795ff] underline underline-offset-2">
          ← Voltar para a landing
        </Link>

        <h1 className="mb-2 text-3xl font-bold text-[#f5edff]">Gerenciar landing</h1>
        <p className="mb-8 text-[#9b8dc0]">Parceiros, apoiadores e conteúdo público do site.</p>

        <div className="grid gap-6 md:grid-cols-2">
          {cards.map((card) => (
            <Link
              key={card.href}
              to={card.href}
              className={`${BLOG_EDITOR_CARD_CLASS} block no-underline transition hover:border-[rgba(199,149,255,0.35)]`}
            >
              <h2 className="mb-2 text-xl font-bold text-[#f5edff]">{card.title}</h2>
              <p className="m-0 text-sm text-[#9b8dc0]">{card.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
