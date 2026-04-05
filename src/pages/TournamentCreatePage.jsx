import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { TournamentCreateForm } from "../components";

function addOneWeek(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  d.setDate(d.getDate() + 7);
  // Return datetime-local format: YYYY-MM-DDTHH:mm
  return d.toISOString().slice(0, 16);
}

export function TournamentCreatePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();

  const copyFrom = location.state?.copyFrom;
  const initialValues = copyFrom
    ? {
      nome: copyFrom.nome || "",
      horario: addOneWeek(copyFrom.horario || copyFrom.dataInicio || copyFrom.data),
      formato: copyFrom.formato || "standard",
      premio: copyFrom.premio || "",
      maxJogadores: copyFrom.maxJogadores ? String(copyFrom.maxJogadores) : "",
      maxRodadas: copyFrom.maxRodadas ? String(copyFrom.maxRodadas) : "",
      corteTop: copyFrom.corteTop ? String(copyFrom.corteTop) : "",
      linkBanner: copyFrom.bannerUrl || copyFrom.linkBanner || "",
      somRodada: copyFrom.somRodada || "",
      linkLive: copyFrom.linkLive || "",
    }
    : undefined;

  const handleTournamentCreated = () => {
    navigate("/torneios");
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 pt-[7.5rem] pb-12 max-[768px]:px-4 max-[768px]:pt-[6.5rem]">
      <button
        className="inline-flex items-center gap-[0.4rem] px-4 py-2 border border-[rgba(217,180,255,0.2)] rounded-xl bg-white/[0.03] text-[#beafd7] text-[0.9rem] font-medium cursor-pointer transition-all duration-200 mb-6 hover:text-white hover:border-[rgba(199,149,255,0.5)] hover:bg-white/[0.06] hover:-translate-x-[2px]"
        type="button"
        onClick={() => navigate("/torneios")}
      >
        ← Voltar para torneios
      </button>

      {copyFrom && (
        <div className="mb-4 px-4 py-3 rounded-lg border border-[rgba(167,79,255,0.3)] bg-[rgba(167,79,255,0.08)] text-[#d9b8ff] text-[0.88rem] flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0" aria-hidden="true">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Copiando <strong className="text-[#c795ff]">{copyFrom.nome}</strong> — data avançada 1 semana
        </div>
      )}

      <TournamentCreateForm token={token} onTournamentCreated={handleTournamentCreated} initialValues={initialValues} />
    </div>
  );
}
