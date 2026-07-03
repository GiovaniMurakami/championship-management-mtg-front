import { Link } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle";
import { PAGE_TITLES } from "../constants/pageTitles";
import {
  TERMS_LAST_UPDATED,
  TERMS_SECTIONS,
  TERMS_VERSION,
} from "../constants/termsOfUse";

export function TermosDeUsoPage() {
  usePageTitle(PAGE_TITLES.termosDeUso);

  return (
    <main className="w-[min(760px,calc(100vw-2rem))] mx-auto pt-[7.5rem] pb-12 px-4">
      <div className="rounded-2xl border border-[rgba(217,180,255,0.18)] bg-[rgba(255,255,255,0.02)] p-6 md:p-8">
        <h1 className="font-['Bebas_Neue',sans-serif] text-[2rem] tracking-[0.04em] text-[#f5edff] mb-2">
          Termos de Uso
        </h1>
        <p className="text-[0.9rem] text-[#9f91bd] mb-6">
          Versão {TERMS_VERSION} · Atualizado em {TERMS_LAST_UPDATED}
        </p>

        <div className="grid gap-5 text-[0.95rem] leading-relaxed text-[#d8cff0]">
          {TERMS_SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="text-[1rem] font-bold text-[#e8dfff] mb-1.5">{section.title}</h2>
              <p className="m-0">{section.body}</p>
            </section>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-[rgba(217,180,255,0.12)]">
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
