import { useNavigate } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle";
import { PAGE_TITLES } from "../constants/pageTitles";

export function NotFoundPage() {
  const navigate = useNavigate();

  usePageTitle(PAGE_TITLES.naoEncontrada);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="text-[6rem] font-['Bebas_Neue',sans-serif] leading-none text-brand opacity-20 select-none">
        404
      </p>
      <div className="-mt-4">
        <h1 className="text-[1.8rem] font-['Bebas_Neue',sans-serif] tracking-[0.04em] text-text-main mb-2">
          Página não encontrada
        </h1>
        <p className="text-text-soft text-[0.95rem] max-w-[380px]">
          A página que você tentou acessar não existe ou foi removida.
        </p>
      </div>
      <div className="flex gap-3 flex-wrap justify-center">
        <button
          type="button"
          className="px-5 py-[0.6rem] border border-[rgba(217,180,255,0.2)] rounded-xl bg-white/[0.03] text-text-soft font-semibold text-[0.9rem] cursor-pointer transition-all duration-200 hover:text-text-main hover:border-[rgba(199,149,255,0.5)] hover:bg-white/[0.06]"
          onClick={() => navigate(-1)}
        >
          ← Voltar
        </button>
        <button
          type="button"
          className="px-5 py-[0.6rem] border border-[rgba(199,149,255,0.5)] rounded-xl bg-gradient-to-br from-[#8e39ed] to-[#5f23b3] text-white font-bold text-[0.9rem] cursor-pointer transition-all duration-200 hover:shadow-[0_4px_20px_rgba(142,57,237,0.45)] hover:-translate-y-[1px]"
          onClick={() => navigate("/")}
        >
          Ir para home
        </button>
      </div>
    </div>
  );
}
