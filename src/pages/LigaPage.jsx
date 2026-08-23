import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { listarLigas, deletarLiga } from "../services/backendApi";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import { EmptyState } from "../components/ui/EmptyState";
import { PageShell } from "../components/ui/PageShell";
import { SkeletonCard } from "../components/ui/Skeleton";
import { Button } from "../components/ui/Button";
import { STATUS_BADGE_CLASS, STATUS_LABEL } from "../constants/tournament";
import { logError } from "../utils/logger";
import { usePageTitle } from "../hooks/usePageTitle";
import { PAGE_TITLES } from "../constants/pageTitles";

const LIMITE = 20;

export function LigaPage() {
  const { token, isAdmin } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  usePageTitle(PAGE_TITLES.ligas);

  const [searchParams, setSearchParams] = useSearchParams();
  const [ligas, setLigas] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(Math.max(1, Number(searchParams.get("pagina") || 1)));
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const loadLigas = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limite: LIMITE, offset: (pagina - 1) * LIMITE };
      const data = await listarLigas(token, params);
      const list = data.ligas ?? (Array.isArray(data) ? data : []);
      setLigas(list);
      setTotal(data.total ?? list.length);
    } catch (err) {
      logError("Erro ao carregar ligas:", err);
      addToast("Erro ao carregar ligas.", { type: "error" });
    } finally {
      setLoading(false);
    }
  }, [token, pagina, addToast]);

  useEffect(() => {
    loadLigas();
  }, [loadLigas]);

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams);
    if (pagina > 1) nextParams.set("pagina", String(pagina));
    else nextParams.delete("pagina");
    if (nextParams.toString() !== searchParams.toString()) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [pagina, searchParams, setSearchParams]);

  const handleDelete = async (ligaId) => {
    setDeletingId(ligaId);
    try {
      await deletarLiga(ligaId, token);
      setLigas((prev) => prev.filter((l) => l.id !== ligaId));
      addToast("Liga excluída com sucesso.", { type: "success" });
    } catch (err) {
      logError("Erro ao excluir liga:", err);
      addToast("Erro ao excluir liga.", { type: "error" });
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const totalPaginas = Math.ceil(total / LIMITE) || 1;

  return (
    <PageShell>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <p className="m-0 mb-1 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-text-muted">Temporadas e circuitos</p>
          <h1 className="m-0 text-white text-[2.2rem] font-bold [text-shadow:0_2px_4px_rgba(0,0,0,0.3)] max-[768px]:text-[1.75rem]">Ligas</h1>
          <p className="m-0 mt-1 text-[0.88rem] text-text-soft">Acompanhe rankings, arquétipos e torneios de cada circuito.</p>
        </div>
        {isAdmin && (
          <Button onClick={() => navigate("/ligas/criar")}>
            + Criar Liga
          </Button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-5">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : ligas.length === 0 ? (
        <EmptyState
          title="Nenhuma liga encontrada"
          description="As ligas criadas ficarão disponíveis nesta tela."
          action={isAdmin && (
            <Button onClick={() => navigate("/ligas/criar")}>
              Criar liga
            </Button>
          )}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {ligas.map((liga) => (
            <article
              key={liga.id}
              className="group relative bg-[rgba(18,12,32,0.72)] rounded-xl border border-line-soft transition-all duration-200 overflow-hidden flex flex-col hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(3,2,8,0.45)] hover:border-line-strong"
            >
              <button type="button" aria-label={`Abrir liga ${liga.nome}`} className="absolute inset-0 z-0 cursor-pointer border-0 bg-transparent" onClick={() => navigate(`/ligas/${liga.id}`)} />
              <div className="relative z-[1] pointer-events-none h-24 overflow-hidden border-b border-line-soft bg-[radial-gradient(circle_at_80%_20%,rgba(167,79,255,0.35),transparent_42%),linear-gradient(135deg,rgba(59,29,102,0.8),rgba(18,12,32,0.95))] bg-cover bg-center" style={liga.bannerUrl ? { backgroundImage: `linear-gradient(to top, rgba(18,12,32,.9), rgba(18,12,32,.12)), url(${liga.bannerUrl})` } : undefined}>
                <div className="absolute -right-4 -bottom-8 text-[6rem] font-bold leading-none text-white/[0.035]">L</div>
                <div className="absolute left-4 bottom-3 flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-[#d9b4ff]">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#a74fff] shadow-[0_0_10px_#a74fff]" />
                  {liga.tipo === "times" ? "Liga por times" : "Liga individual"}
                </div>
              </div>
              <div className="relative z-[1] pointer-events-none px-4 pt-4 pb-3 flex-1">
                <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                  <h3 className="text-text-main m-0 text-[1.05rem] font-bold leading-tight group-hover:text-white">
                    {liga.nome}
                  </h3>
                  <div className="flex items-center gap-2 flex-shrink-0 mt-[0.25rem]">
                    {liga.tipo && (
                      <span className="inline-block px-[0.5rem] py-[0.15rem] rounded-full text-[0.67rem] font-semibold uppercase tracking-[0.04em] bg-[rgba(167,79,255,0.12)] text-brand border border-[rgba(167,79,255,0.25)]">
                        {liga.tipo}
                      </span>
                    )}
                    {liga.status && (
                      <span
                        className={`inline-block px-[0.55rem] py-[0.18rem] rounded-full text-[0.68rem] font-semibold uppercase tracking-[0.04em] ${STATUS_BADGE_CLASS[liga.status] ?? ""}`}
                      >
                        {STATUS_LABEL[liga.status] ?? liga.status}
                      </span>
                    )}
                  </div>
                </div>
                {liga.descricao && (
                  <p className="text-text-soft text-[0.875rem] m-0 mb-3 leading-relaxed line-clamp-2">
                    {liga.descricao}
                  </p>
                )}
                <div className="mt-4 grid grid-cols-2 gap-2 text-text-soft text-[0.76rem]">
                  <span className="flex items-center gap-[0.35rem]">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="rgba(167,79,255,0.7)"
                      strokeWidth="2.5"
                      aria-hidden="true"
                    >
                      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                      <path d="M4 22h16" />
                      <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
                    </svg>
                    {liga.totalTorneios ?? liga.torneios?.length ?? 0} torneios
                  </span>
                  <span className="flex items-center gap-[0.35rem]">◎ {liga.tipo === "times" ? "Por times" : "Individual"}</span>
                </div>
              </div>
              <div className="relative z-[2] px-4 py-3 border-t border-line-soft bg-white/[0.015] flex gap-2 flex-wrap">
                <button
                  className="mr-auto border-0 bg-transparent p-0 text-[0.8rem] font-semibold text-[#d9b4ff] cursor-pointer hover:text-white"
                  onClick={() => navigate(`/ligas/${liga.id}`)}
                >
                  Ver detalhes →
                </button>
                {isAdmin && (
                  <>
                    <button
                      className="px-4 py-[0.45rem] border border-[rgba(217,180,255,0.25)] rounded-md text-[0.85rem] font-medium cursor-pointer bg-transparent text-text-soft transition-all duration-300 hover:border-line-strong hover:text-white"
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
            </article>
          ))}
        </div>
      )}

      {/* Paginação */}
      {!loading && totalPaginas > 1 && (
        <nav className="flex items-center justify-center gap-3 mt-8" aria-label="Paginação de ligas">
          <button
            type="button"
            onClick={() => setPagina((p) => Math.max(1, p - 1))}
            disabled={pagina === 1}
            aria-label="Página anterior"
            className="px-3 py-2 border border-line rounded-lg text-text-soft text-[0.85rem] disabled:opacity-40 hover:border-[rgba(199,149,255,0.4)] hover:text-white transition-colors"
          >
            ←
          </button>
          <span className="text-text-soft text-[0.85rem] min-w-[60px] text-center" aria-live="polite">
            {pagina} / {totalPaginas}
          </span>
          <button
            type="button"
            onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            disabled={pagina === totalPaginas}
            aria-label="Próxima página"
            className="px-3 py-2 border border-line rounded-lg text-text-soft text-[0.85rem] disabled:opacity-40 hover:border-[rgba(199,149,255,0.4)] hover:text-white transition-colors"
          >
            →
          </button>
        </nav>
      )}

      {confirmDeleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-[fade-in_200ms_ease-out]"
          onClick={(e) => {
            if (e.target === e.currentTarget) setConfirmDeleteId(null);
          }}
        >
          <div className="bg-[#110a22] border border-[rgba(239,68,68,0.3)] rounded-2xl w-full max-w-[420px] p-6 shadow-[0_24px_64px_rgba(0,0,0,0.6)] animate-[slide-up_220ms_ease-out]">
            <h3 className="text-white font-semibold text-[1.1rem] m-0 mb-3">Excluir liga</h3>
            <p className="text-text-soft text-[0.9rem] m-0 mb-6">
              Tem certeza que deseja excluir{" "}
              <strong className="text-white">
                {ligas.find((l) => l.id === confirmDeleteId)?.nome}
              </strong>
              ? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                className="px-5 py-2.5 border border-line rounded-lg text-text-soft bg-transparent cursor-pointer font-medium text-[0.9rem] transition-all duration-200 hover:text-white hover:bg-white/[0.05] disabled:opacity-50"
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
