import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { listarTimes, deletarTime, entrarPorConvite } from "../services/backendApi";
import { useAuth } from "../hooks/useAuth";
import { PageShell } from "../components/ui/PageShell";
import { DeleteConfirmModal } from "../components/ui/DeleteConfirmModal";
import { TOURNAMENT_INPUT_CLASS } from "../styles/uiClasses";

export function TimePage() {
  const { token, isAdmin, usuario } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [times, setTimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showConviteModal, setShowConviteModal] = useState(false);
  const [conviteInput, setConviteInput] = useState("");
  const [conviteLoading, setConviteLoading] = useState(false);
  const [conviteError, setConviteError] = useState("");
  const [conviteSuccess, setConviteSuccess] = useState("");

  const loadTimes = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await listarTimes(token);
      setTimes(data.times || data || []);
    } catch (err) {
      console.error("Erro ao carregar times:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadTimes(); }, [loadTimes]);

  useEffect(() => {
    const tokenFromUrl = searchParams.get("convite");
    if (tokenFromUrl) {
      setConviteInput(tokenFromUrl);
      setShowConviteModal(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletarTime(deleteTarget.id, token);
      setTimes((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error("Erro ao deletar time:", err);
    } finally {
      setDeleting(false);
    }
  };

  const canManage = (time) =>
    isAdmin || String(time.donoId) === String(usuario?.id);

  const handleEntrarPorConvite = async (e) => {
    e.preventDefault();
    if (!conviteInput.trim()) return;
    setConviteLoading(true);
    setConviteError("");
    setConviteSuccess("");
    try {
      const data = await entrarPorConvite(conviteInput.trim(), token);
      const res = data?.data ?? data;
      const nomeTime = res?.timeNome || res?.time?.nome || "time";
      setConviteSuccess(`Você entrou no time "${nomeTime}" com sucesso!`);
      setConviteInput("");
      loadTimes();
    } catch (err) {
      setConviteError(err.response?.data?.message || err.message || "Token inválido ou expirado.");
    } finally {
      setConviteLoading(false);
    }
  };

  return (
    <PageShell>
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <h1 className="m-0 text-white text-[2rem] font-['Bebas_Neue',sans-serif] tracking-[0.03em]">
          Times
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            className="px-4 py-2 border border-[rgba(199,149,255,0.3)] rounded-lg bg-white/[0.03] text-[#c4b5fd] text-[0.9rem] font-semibold cursor-pointer transition-all duration-200 hover:border-[rgba(199,149,255,0.5)] hover:bg-white/[0.06]"
            onClick={() => { setShowConviteModal(true); setConviteError(""); setConviteSuccess(""); setConviteInput(""); }}
          >
            🔗 Entrar por Convite
          </button>
          <button
            className="px-4 py-2 bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] text-white rounded-lg text-[0.9rem] font-semibold cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(79,70,229,0.4)]"
            onClick={() => navigate("/times/criar")}
          >
            + Criar Time
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[140px] rounded-[0.9rem] bg-white/[0.04] animate-pulse" />
          ))}
        </div>
      ) : times.length === 0 ? (
        <p className="text-center text-[#888] py-12 text-base">Nenhum time cadastrado ainda.</p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 max-[768px]:grid-cols-1">
          {times.map((time) => (
            <div
              key={time.id}
              className="bg-[rgba(255,255,255,0.03)] border border-[rgba(217,180,255,0.15)] rounded-[0.9rem] p-4 transition-all duration-200 hover:border-[rgba(167,79,255,0.35)] hover:bg-white/[0.055] hover:-translate-y-[2px] hover:shadow-[0_8px_28px_rgba(0,0,0,0.3)] cursor-pointer group"
              onClick={() => navigate(`/times/${time.id}`)}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  {time.imagemUrl && (
                    <img
                      src={time.imagemUrl}
                      alt={time.nome}
                      className="w-9 h-9 rounded-lg object-cover border border-[rgba(199,149,255,0.2)] flex-shrink-0"
                    />
                  )}
                  <h3 className="m-0 text-[#f5edff] font-semibold text-[1rem] leading-snug group-hover:text-white transition-colors">
                    {time.nome}
                  </h3>
                </div>
                <span className="inline-flex items-center gap-[0.3rem] text-[0.72rem] font-semibold text-[#c795ff] bg-[rgba(199,149,255,0.1)] border border-[rgba(199,149,255,0.2)] rounded-full px-[0.55rem] py-[0.12rem] flex-shrink-0">
                  {time.totalMembros ?? time.membros?.length ?? 0} membros
                </span>
              </div>
              {time.descricao && (
                <p className="m-0 mb-3 text-[#beafd7] text-[0.82rem] leading-relaxed line-clamp-2">{time.descricao}</p>
              )}
              {canManage(time) && (
                <div
                  className="flex items-center gap-2 mt-3 pt-3 border-t border-[rgba(217,180,255,0.1)]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="px-3 py-1 text-[0.78rem] border border-[rgba(79,70,229,0.4)] rounded-lg text-[#a5b4fc] bg-[rgba(79,70,229,0.08)] hover:bg-[rgba(79,70,229,0.2)] transition-colors"
                    onClick={() => navigate(`/times/${time.id}/editar`)}
                  >
                    Editar
                  </button>
                  <button
                    className="px-3 py-1 text-[0.78rem] border border-[rgba(239,68,68,0.35)] rounded-lg text-[#fca5a5] bg-[rgba(239,68,68,0.06)] hover:bg-[rgba(239,68,68,0.15)] transition-colors"
                    onClick={() => setDeleteTarget(time)}
                  >
                    Excluir
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          isOpen={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loading={deleting}
          itemName={deleteTarget.nome}
          itemType="time"
        />
      )}

      {showConviteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-[fade-in_200ms_ease-out]"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setShowConviteModal(false); }}
        >
          <div className="bg-[#110a22] border border-[rgba(217,180,255,0.2)] rounded-2xl w-full max-w-[420px] shadow-[0_24px_64px_rgba(0,0,0,0.6)] animate-[slide-up_220ms_ease-out]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(217,180,255,0.15)]">
              <h2 className="text-white font-semibold text-[1.1rem] m-0">Entrar por Convite</h2>
              <button
                type="button"
                className="text-[#beafd7] hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/[0.08]"
                onClick={() => setShowConviteModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleEntrarPorConvite} className="p-6 flex flex-col gap-4">
              <p className="m-0 text-[#beafd7] text-[0.88rem]">Cole o token de convite fornecido pelo dono do time:</p>
              <input
                type="text"
                placeholder="Token do convite..."
                value={conviteInput}
                onChange={(e) => { setConviteInput(e.target.value); setConviteError(""); setConviteSuccess(""); }}
                disabled={conviteLoading}
                className={TOURNAMENT_INPUT_CLASS}
                autoFocus
              />
              {conviteError && (
                <p className="m-0 text-[#fca5a5] text-[0.85rem] bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.25)] rounded-lg px-3 py-2">
                  {conviteError}
                </p>
              )}
              {conviteSuccess && (
                <p className="m-0 text-[#86efac] text-[0.85rem] bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.25)] rounded-lg px-3 py-2">
                  ✓ {conviteSuccess}
                </p>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowConviteModal(false)}
                  disabled={conviteLoading}
                  className="flex-1 px-4 py-2 border border-[rgba(217,180,255,0.2)] rounded-lg text-[#beafd7] text-[0.9rem] font-semibold bg-transparent hover:text-white hover:border-[rgba(199,149,255,0.4)] transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={conviteLoading || !conviteInput.trim()}
                  className="flex-1 px-4 py-2 bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] text-white rounded-lg text-[0.9rem] font-semibold cursor-pointer transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:!transform-none"
                >
                  {conviteLoading ? "Entrando..." : "Entrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageShell>
  );
}
