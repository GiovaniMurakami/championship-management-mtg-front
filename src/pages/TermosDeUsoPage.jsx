import { Link } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle";
import { PAGE_TITLES } from "../constants/pageTitles";
import {
  TERMS_LAST_UPDATED,
  TERMS_SECTIONS,
  TERMS_VERSION,
} from "../constants/termsOfUse";

function sectionAnchor(title) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function TermosDeUsoPage() {
  usePageTitle(PAGE_TITLES.termosDeUso);

  return (
    <main className="w-full max-w-[920px] mx-auto">
      <div className="rounded-2xl border border-[rgba(217,180,255,0.18)] bg-[linear-gradient(160deg,rgba(34,19,69,0.35),rgba(15,10,29,0.55))] p-6 md:p-8">
        <header className="mb-8 border-b border-[rgba(217,180,255,0.12)] pb-6">
          <p className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[#c795ff]">
            Documento legal
          </p>
          <h1 className="font-['Bebas_Neue',sans-serif] text-[2.2rem] tracking-[0.04em] text-[#f5edff] mb-2">
            Termos de Uso
          </h1>
          <p className="text-[0.9rem] text-[#9f91bd]">
            Versão {TERMS_VERSION} · Atualizado em {TERMS_LAST_UPDATED}
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
          <nav
            aria-label="Índice dos termos"
            className="lg:sticky lg:top-24 lg:self-start rounded-xl border border-[rgba(217,180,255,0.14)] bg-[rgba(255,255,255,0.02)] p-4"
          >
            <p className="mb-3 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-[#9f91bd]">
              Nesta página
            </p>
            <ul className="m-0 list-none grid gap-2 p-0">
              {TERMS_SECTIONS.map((section) => {
                const anchor = sectionAnchor(section.title);
                return (
                  <li key={section.title}>
                    <a
                      href={`#${anchor}`}
                      className="block text-[0.82rem] leading-snug text-[#beafd7] transition-colors hover:text-[#e8dfff]"
                    >
                      {section.title}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="grid gap-4">
            {TERMS_SECTIONS.map((section) => {
              const anchor = sectionAnchor(section.title);
              return (
                <section
                  key={section.title}
                  id={anchor}
                  className="scroll-mt-28 rounded-xl border border-[rgba(217,180,255,0.12)] bg-[rgba(255,255,255,0.02)] p-5"
                >
                  <h2 className="text-[1rem] font-bold text-[#e8dfff] mb-2">{section.title}</h2>
                  <p className="m-0 text-[0.94rem] leading-relaxed text-[#d8cff0]">{section.body}</p>
                </section>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-4 border-t border-[rgba(217,180,255,0.12)] pt-6">
          <Link
            to="/"
            className="text-[0.9rem] font-semibold text-[#c795ff] underline underline-offset-2 hover:text-[#e8dfff]"
          >
            ← Voltar para a plataforma
          </Link>
        </div>
      </div>
    </main>
  );
}
