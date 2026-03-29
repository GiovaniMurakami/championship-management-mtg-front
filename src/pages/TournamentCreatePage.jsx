import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { TournamentCreateForm } from "../components";

export function TournamentCreatePage() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const handleTournamentCreated = () => {
    navigate("/torneios");
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 pt-20 pb-12">
      <button
        className="inline-flex items-center gap-[0.4rem] px-4 py-2 border border-[rgba(217,180,255,0.2)] rounded-xl bg-white/[0.03] text-[#beafd7] text-[0.9rem] font-medium cursor-pointer transition-all duration-200 mb-6 hover:text-white hover:border-[rgba(199,149,255,0.5)] hover:bg-white/[0.06] hover:-translate-x-[2px]"
        type="button"
        onClick={() => navigate("/torneios")}
      >
        ← Voltar para torneios
      </button>

      <h1 className="m-0 mb-6 text-white text-[2.2rem] font-bold">Criar Torneio</h1>

      <TournamentCreateForm token={token} onTournamentCreated={handleTournamentCreated} />
    </div>
  );
}
