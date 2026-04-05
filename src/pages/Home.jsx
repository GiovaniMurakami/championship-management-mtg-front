import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Hero, TournamentSection, SponsorSection } from "../components";

export function Home({ onOpenAuth, isAuthenticated }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (searchParams.get("resetSenha") === "sucesso") {
      setSuccessMsg("Senha redefinida com sucesso! Você já pode fazer login com a sua nova senha.");
      setSearchParams({}, { replace: true });
      const timer = setTimeout(() => setSuccessMsg(""), 8000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, setSearchParams]);

  return (
    <main className="w-[min(1100px,calc(100vw-2rem))] mx-auto pt-[7.5rem] pb-12">
      {successMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-xl border border-[rgba(44,207,180,0.4)] bg-[rgba(30,15,45,0.95)] backdrop-blur-md text-[#5eead4] text-[0.9rem] font-semibold shadow-[0_8px_24px_rgba(0,0,0,0.4)] animate-[slide-up_300ms_ease-out] max-w-[min(480px,calc(100vw-2rem))] text-center">
          {successMsg}
        </div>
      )}
      <SponsorSection />
      <Hero onOpenAuth={onOpenAuth} isAuthenticated={isAuthenticated} />
      <TournamentSection />
    </main>
  );
}
