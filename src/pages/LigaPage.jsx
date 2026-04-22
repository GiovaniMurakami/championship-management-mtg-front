import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { listarLigas, deletarLiga } from "../services/backendApi";
import { useAuth } from "../hooks/useAuth";
import { PageShell } from "../components/ui/PageShell";
import { STATUS_BADGE_CLASS, STATUS_LABEL } from "../constants/tournament";


export function LigaPage() {
  const { token, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [ligas, setLigas] = useState([]);
  // const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const loadLigas = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await listarLigas(token);
      const list = data.ligas ?? (Array.isArray(data) ? data : []);
      setLigas(list);
      // setTotal(data.total ?? list.length);
    } catch (err) {
      console.error("Erro ao carregar ligas:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadLigas();
  }, [loadLigas]);

  const handleDelete = async (ligaId) => {
    setDeletingId(ligaId);
    try {
      await deletarLiga(ligaId, token);
      setLigas((prev) => prev.filter((l) => l.id !== ligaId));
    } catch (err) {
      console.error("Erro ao excluir liga:", err);
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  return (
    <PageShell>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="m-0 text-white text-[2.2rem] font-bold [text-shadow:0_2px_4px_rgba(0,0,0,0.3)] max-[768px]:text-[1.75rem]">
          Ligas
        </h1>
        {isAdmin && (
          <button
            className="px-4 py-[0.7rem] rounded-lg border border-[#4f46e5] bg-[rgba(79,70,229,0.12)] text-[#d9d6ff] cursor-pointer font-semibold transition-all duration-200 hover:bg-[#4f46e5] hover:text-white"
            type="button"
            onClick={() => navigate("/ligas/criar")}
          >
            + Criar Liga
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-[1.1rem] border border-[rgba(217,180,255,0.1)] bg-white/[0.03] h-[180px] animate-pulse" />
          ))}
        </div>
      ) : ligas.length === 0 ? (
        <p className="text-center text-[#888] py-12 text-base">Nenhuma liga encontrada.</p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-5 max-[768px]:grid-cols-1">
          {ligas.map((liga) => (
            <div
              key={liga.id}
              className="bg-[linear-gradient(155deg,rgba(26,16,50,0.98)_0%,rgba(16,10,32,0.98)_100%)] rounded-[1.1rem] shadow-[0_6px_28px_rgba(0,0,0,0.35)] border border-[rgba(217,180,255,0.2)] transition-all duration-[220ms] overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-[0_14px_44px_rgba(0,0,0,0.45)] hover:border-[rgba(167,79,255,0.3)]"
            >
              <div className="px-5 pt-5 pb-4 flex-1">
                <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                  <h3 className="text-[#f5edff] m-0 font-['Bebas_Neue',sans-serif] text-[1.5rem] tracking-[0.03em] leading-[1.1]">
                    {liga.nome}
                  </h3>
                  {liga.status && (
                    <span className={`inline-block px-[0.55rem] py-[0.18rem] rounded-full text-[0.68rem] font-semibold uppercase tracking-[0.04em] flex-shrink-0 mt-[0.25rem] ${STATUS_BADGE_CLASS[liga.status] ?? ""}`}>
                      {STATUS_LABEL[liga.status] ?? liga.status}
                    </span>
                  )}
                </div>
                {liga.descricao && (
                  <p className="text-[#beafd7] text-[0.875rem] m-0 mb-3 leading-relaxed line-clamp-2">
                    {liga.descricao}
                  </p>
                )}
                <div className="flex items-center gap-3 flex-wrap text-[#beafd7] text-[0.8rem]">
                  <span className="flex items-center gap-[0.35rem]">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(167,79,255,0.7)" strokeWidth="2.5" aria-hidden="true">
                      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                      <path d="M4 22h16" />
                      <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
                    </svg>
                    {liga.totalTorneios ?? liga.torneios?.length ?? 0} torneios
                  </span>
                  {liga.formato && (
                    <span className="px-[0.45rem] py-[0.12rem] rounded-[0.35rem] text-[0.7rem] font-semibold bg-[rgba(199,149,255,0.1)] text-[#c795ff] border border-[rgba(199,149,255,0.22)]">
                      {liga.formato}
                    </span>
                  )}
                </div>
              </div>
              <div className="px-5 py-3 border-t border-[rgba(217,180,255,0.15)] bg-white/[0.015] flex gap-2 flex-wrap">
                <button
                  className="px-4 py-[0.45rem] border border-[#4f46e5] rounded-md text-[0.85rem] font-medium cursor-pointer uppercase tracking-[0.5px] bg-[rgba(79,70,229,0.1)] text-[#4f46e5] transition-all duration-300 hover:bg-[#4f46e5] hover:text-white"
                  onClick={() => navigate(`/ligas/${liga.id}`)}
                >
                  Ver Liga
                </button>
                {isAdmin && (
                  <>
                    <button
                      className="px-4 py-[0.45rem] border border-[rgba(217,180,255,0.25)] rounded-md text-[0.85rem] font-medium cursor-pointer bg-transparent text-[#beafd7] transition-all duration-300 hover:border-[rgba(199,149,255,0.5)] hover:text-white"
                      onClick={() => navigate(`/ligas/${liga.id}/editar`)}
                    >
                      Editar
                    </button>
                    <button
                      className="px-4 py-[0.45rem] border border-[rgba(239,68,68,0.4)] rounded-md text-[0.85rem] font-medium cursor-pointer bg-[rgba(239,68,68,0.07)] text-[#fca5a5] transition-all duration-300 hover:bg-[rgba(239,68,68,0.2)] hover:text-white"
                      onClick={() => setConfirmDeleteId(liga.id)}
                    >
                      Excluir
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmDeleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-[fade-in_200ms_ease-out]"
          onClick={(e) => { if (e.target === e.currentTarget) setConfirmDeleteId(null); }}
        >
          <div className="bg-[#110a22] border border-[rgba(239,68,68,0.3)] rounded-2xl w-full max-w-[420px] p-6 shadow-[0_24px_64px_rgba(0,0,0,0.6)] animate-[slide-up_220ms_ease-out]">
            <h3 className="text-white font-semibold text-[1.1rem] m-0 mb-3">Excluir liga</h3>
            <p className="text-[#beafd7] text-[0.9rem] m-0 mb-6">
              Tem certeza que deseja excluir <strong className="text-white">{ligas.find((l) => l.id === confirmDeleteId)?.nome}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                className="px-5 py-2.5 border border-[rgba(217,180,255,0.2)] rounded-lg text-[#beafd7] bg-transparent cursor-pointer font-medium text-[0.9rem] transition-all duration-200 hover:text-white hover:bg-white/[0.05] disabled:opacity-50"
                onClick={() => setConfirmDeleteId(null)}
                disabled={deletingId === confirmDeleteId}
              >
                Cancelar
              </button>
              <button
                className="px-5 py-2.5 bg-[rgba(239,68,68,0.15)] border border-[rgba(239,68,68,0.5)] text-[#fca5a5] rounded-lg font-semibold text-[0.9rem] cursor-pointer transition-all duration-200 hover:bg-[rgba(239,68,68,0.35)] hover:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={() => handleDelete(confirmDeleteId)}
                disabled={deletingId === confirmDeleteId}
              >
                {deletingId === confirmDeleteId ? "Excluindo..." : "Confirmar exclusão"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
