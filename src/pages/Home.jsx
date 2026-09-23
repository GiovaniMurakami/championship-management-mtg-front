import { FormFeedback } from "../components/ui/FormFeedback";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Hero, TournamentSection, SponsorSection } from "../components";

export function Home({ onOpenAuth, isAuthenticated }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (searchParams.get("resetSenha") === "sucesso") {
      setSearchParams({}, { replace: true });
      setSuccessMsg("Senha redefinida com sucesso! Você já pode fazer login com a sua nova senha.");
      const timer = setTimeout(() => setSuccessMsg(""), 8000);
      return () => clearTimeout(timer);
    }
    // Only run when the specific param changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("resetSenha"), setSearchParams]);

  return (
    <main className="w-full">
      {successMsg && (
        <FormFeedback message={successMsg} variant="success" />
      )}
      <SponsorSection />
      <Hero onOpenAuth={onOpenAuth} isAuthenticated={isAuthenticated} />
      <TournamentSection />
    </main>
  );
}
