import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { buscarLiga, getRankingLiga } from "../services/backendApi";
import { useAuth } from "../hooks/useAuth";
import { LigaRankingSection } from "../components/liga";

const statusBadgeClass = {
  inscricoes_abertas: "bg-[rgba(34,197,94,0.2)] text-[#22c55e] border border-[#22c55e]",
  em_andamento: "bg-[rgba(251,191,36,0.2)] text-[#fbbf24] border border-[#fbbf24]",
  finalizado: "bg-[rgba(239,68,68,0.2)] text-[#ef4444] border border-[#ef4444]",
};

const statusLabel = {
  inscricoes_abertas: "Inscrições Abertas",
  em_andamento: "Em Andamento",
  finalizado: "Finalizado",
};

export function LigaDetailPage() {
  const { id: ligaId } = useParams();
  const { token, isAdmin, usuario } = useAuth();
  const navigate = useNavigate();
  const [liga, setLiga] = useState(null);
  const [ranking, setRanking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rankingLoading, setRankingLoading] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState("torneios");

  const loadLiga = useCallback(async () => {
    if (!ligaId || !token) return;
    setLoading(true);
    try {
      const data = await buscarLiga(ligaId, token);
      setLiga(data.liga || data);
    } catch (err) {
      console.error("Erro ao carregar liga:", err);
    } finally {
      setLoading(false);
    }
  }, [ligaId, token]);

  const loadRanking = useCallback(async () => {
    if (!ligaId || !token) return;
    setRankingLoading(true);
    try {
      const data = await getRankingLiga(ligaId, token);
      setRanking(data.ranking || data);
    } catch (err) {
      console.error("Erro ao carregar ranking:", err);
    } finally {
      setRankingLoading(false);
    }
  }, [ligaId, token]);

  useEffect(() => {
    loadLiga();
  }, [loadLiga]);

  useEffect(() => {
    if (abaAtiva === "ranking" && !ranking) {
      loadRanking();
    }
  }, [abaAtiva, ranking, loadRanking]);

  const isOwner = liga && usuario && String(liga.donoId) === String(usuario.id);
  const canManage = isOwner || isAdmin;

  const torneios = liga?.torneios || [];

  return (
    <div className="max-w-[1200px] mx-auto px-6 pt-[7.5rem] pb-12 max-[768px]:px-4 max-[768px]:pt-[6.5rem] animate-[fade-in_400ms_ease-out]">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <button
          className="inline-flex items-center gap-[0.4rem] px-4 py-2 border border-[rgba(217,180,255,0.2)] rounded-xl bg-white/[0.03] text-[#beafd7] text-[0.9rem] font-medium cursor-pointer transition-all duration-200 hover:text-white hover:border-[rgba(199,149,255,0.5)] hover:bg-white/[0.06] hover:-translate-x-[2px]"
          onClick={() => navigate("/ligas")}
        >
          ← Voltar para ligas
        </button>
        {canManage && (
          <button
            className="px-4 py-2 border border-[#4f46e5] rounded-lg bg-[rgba(79,70,229,0.12)] text-[#d9d6ff] text-[0.88rem] font-medium cursor-pointer transition-all duration-200 hover:bg-[#4f46e5] hover:text-white"
            onClick={() => navigate(`/ligas/${ligaId}/editar`)}
          >
            Editar liga
          </button>
        )}
      </div>

      {loading ? (
        <div className="animate-pulse">
          <div className="h-9 w-64 bg-white/[0.06] rounded-lg mb-3" />
          <div className="h-4 w-96 bg-white/[0.04] rounded mb-6" />
        </div>
      ) : liga ? (
        <>
          <div className="mb-6">
            <h1 className="m-0 mb-2 text-white text-[2rem] font-['Bebas_Neue',sans-serif] tracking-[0.03em] max-[768px]:text-[1.6rem]">
              {liga.nome}
            </h1>
            {liga.descricao && (
              <p className="m-0 text-[#beafd7] text-[0.95rem] leading-relaxed max-w-[680px]">{liga.descricao}</p>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b-2 border-[#2a2a3e] mb-6">
            {[
              { key: "torneios", label: "Torneios", count: torneios.length },
              { key: "ranking", label: "Ranking" },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                type="button"
                className={`flex items-center gap-2 px-5 py-[0.65rem] bg-transparent border-none border-b-2 -mb-[2px] text-[0.95rem] font-medium cursor-pointer transition-colors duration-200 ${
                  abaAtiva === key
                    ? "text-white border-b-[#4f46e5] border-b-2"
                    : "text-[#888] border-b-transparent hover:text-[#c0bfff]"
                }`}
                onClick={() => setAbaAtiva(key)}
              >
                {label}
                {count !== undefined && count > 0 && (
                  <span className="bg-[#4f46e5] text-white text-[0.75rem] font-semibold px-[0.45rem] py-[0.1rem] rounded-full leading-[1.4]">
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Torneios tab */}
          {abaAtiva === "torneios" && (
            <div>
              {torneios.length === 0 ? (
                <p className="text-center text-[#888] py-12 text-base">Nenhum torneio nesta liga.</p>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4 max-[768px]:grid-cols-1">
                  {torneios.map((torneio) => (
                    <div
                      key={torneio.id}
                      className="bg-[rgba(255,255,255,0.03)] border border-[rgba(217,180,255,0.15)] rounded-[0.85rem] p-4 transition-all duration-200 hover:border-[rgba(167,79,255,0.3)] hover:bg-white/[0.05] cursor-pointer"
                      onClick={() => navigate(`/torneios/${torneio.id}`)}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <span className="font-['Bebas_Neue',sans-serif] text-[0.95rem] tracking-[0.1em] text-[#c795ff]">
                          {(torneio.formato || "—").toUpperCase()}
                        </span>
                        <span className={`inline-block px-2 py-[2px] rounded-full text-[0.72rem] font-medium uppercase tracking-[0.5px] ${statusBadgeClass[torneio.status] ?? ""}`}>
                          {statusLabel[torneio.status] ?? torneio.status}
                        </span>
                      </div>
                      <h4 className="m-0 text-[#f5edff] font-semibold text-[0.95rem] leading-snug">
                        {torneio.nome}
                      </h4>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Ranking tab */}
          {abaAtiva === "ranking" && (
            <LigaRankingSection ranking={ranking} loading={rankingLoading} />
          )}
        </>
      ) : (
        <p className="text-center text-[#888] py-12 text-base">Liga não encontrada.</p>
      )}
    </div>
  );
}
