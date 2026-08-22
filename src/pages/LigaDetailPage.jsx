import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { buscarLiga, getRankingLiga } from "../services/backendApi";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import { LigaRankingSection } from "../components/liga";
import {
  STATUS_BADGE_CLASS,
  STATUS_LABEL,
  TORNEIO_STATUS_BADGE,
  TORNEIO_STATUS_LABEL,
} from "../constants/tournament";
import { PageShell } from "../components/ui/PageShell";
import { EmptyState } from "../components/ui/EmptyState";
import { InlineAlert } from "../components/ui/InlineAlert";
import { logError } from "../utils/logger";
import { usePageTitle } from "../hooks/usePageTitle";
import { PAGE_TITLES } from "../constants/pageTitles";
import { formatBrasiliaDate } from "../utils/brasiliaTime";

export function LigaDetailPage() {
  const LIMITE_RANKING_TIMES = 50;
  const { id: ligaId } = useParams();
  const { token, isAdmin, usuario } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [liga, setLiga] = useState(null);
  const [ranking, setRanking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [rankingLoading, setRankingLoading] = useState(false);
  const [rankingError, setRankingError] = useState("");
  const [abaAtiva, setAbaAtiva] = useState("ranking");

  usePageTitle(liga?.nome, { loading, fallback: "Liga" });

  const loadLiga = useCallback(async () => {
    if (!ligaId) return;
    setLoading(true);
    setLoadError("");
    try {
      const data = await buscarLiga(ligaId, token);
      setLiga(data.liga || data);
    } catch (err) {
      logError("Erro ao carregar liga:", err);
      const message = "Erro ao carregar liga. Tente novamente.";
      setLoadError(message);
      addToast(message, { type: "error" });
    } finally {
      setLoading(false);
    }
  }, [ligaId, token, addToast]);

  const loadRanking = useCallback(async () => {
    if (!ligaId) return;
    setRankingLoading(true);
    setRankingError("");
    try {
      const data = await getRankingLiga(ligaId, token, liga?.tipo === "times" ? { limiteTimes: LIMITE_RANKING_TIMES } : undefined);
      setRanking(data);
    } catch (err) {
      logError("Erro ao carregar ranking:", err);
      const message = "Erro ao carregar ranking da liga.";
      setRankingError(message);
      addToast(message, { type: "error" });
    } finally {
      setRankingLoading(false);
    }
  }, [liga?.tipo, ligaId, token, addToast]);

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

  const torneios = [...(liga?.torneios || [])].sort(
    (a, b) => new Date(a.horario || 0) - new Date(b.horario || 0),
  );

  return (
    <PageShell>
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <button
          className="inline-flex items-center gap-[0.4rem] px-4 py-2 border border-[rgba(217,180,255,0.2)] rounded-xl bg-white/[0.03] text-[#beafd7] text-[0.9rem] font-medium cursor-pointer transition-all duration-200 hover:text-white hover:border-[rgba(199,149,255,0.5)] hover:bg-white/[0.06]"
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
          <section className="relative mb-5 overflow-hidden rounded-2xl border border-[rgba(217,180,255,0.14)] bg-[radial-gradient(circle_at_85%_10%,rgba(167,79,255,0.24),transparent_34%),linear-gradient(145deg,rgba(31,18,59,0.86),rgba(11,8,22,0.94))] bg-cover bg-center px-6 py-7 max-sm:px-4" style={liga.bannerUrl ? { backgroundImage: `linear-gradient(90deg, rgba(11,8,22,.97) 0%, rgba(11,8,22,.82) 48%, rgba(11,8,22,.34) 100%), url(${liga.bannerUrl})` } : undefined}>
            <div className="absolute -right-8 -bottom-16 select-none text-[12rem] font-black leading-none text-white/[0.025]" aria-hidden="true">L</div>
            <p className="m-0 mb-2 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[#a99cbe]">Liga competitiva</p>
            <div className="relative flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="m-0 text-white text-[2.2rem] font-bold tracking-[-0.02em] max-[768px]:text-[1.7rem]">
                {liga.nome}
              </h1>
              {liga.status && (
                <span className={`inline-block px-[0.65rem] py-[0.2rem] rounded-full text-[0.72rem] font-semibold uppercase tracking-[0.05em] ${STATUS_BADGE_CLASS[liga.status] ?? ""}`}>
                  {STATUS_LABEL[liga.status] ?? liga.status}
                </span>
              )}
            </div>
            {liga.descricao && (
              <p className="relative m-0 text-[#beafd7] text-[0.92rem] leading-relaxed max-w-[680px] mb-5">{liga.descricao}</p>
            )}
            <div className="relative grid max-w-[390px] grid-cols-2 gap-2">
              <span className="inline-flex items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.035] px-3 py-2 text-[0.78rem] text-[#d8c7ff]">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(167,79,255,0.7)" strokeWidth="2.5" aria-hidden="true">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                  <path d="M4 22h16" />
                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
                </svg>
                {liga.totalTorneios ?? torneios.length} torneio{(liga.totalTorneios ?? torneios.length) !== 1 ? "s" : ""}
              </span>
              <span className="inline-flex items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.035] px-3 py-2 text-[0.78rem] text-[#d8c7ff]">◎ {liga.tipo === "times" ? "Por times" : "Individual"}</span>
            </div>
          </section>

          <nav className="mb-5 flex items-center gap-5 border-b border-[rgba(217,180,255,0.12)]" aria-label="Seções da liga">
            {[
              { value: "ranking", label: "Ranking" },
              { value: "torneios", label: "Torneios", count: torneios.length },
            ].map((tab) => (
              <button key={tab.value} type="button" onClick={() => setAbaAtiva(tab.value)} className={`relative border-0 bg-transparent px-0 pb-3 text-[0.88rem] font-semibold cursor-pointer ${abaAtiva === tab.value ? "text-white after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-full after:bg-[#a74fff]" : "text-[#a99cbe] hover:text-[#d9b4ff]"}`}>
                {tab.label}{tab.count != null && <span className="ml-2 rounded-full bg-white/[0.08] px-1.5 py-0.5 text-[0.68rem] text-[#beafd7]">{tab.count}</span>}
              </button>
            ))}
          </nav>

          {/* Torneios tab */}
          {abaAtiva === "torneios" && (
            <div>
              {torneios.length === 0 ? (
                <p className="text-center text-[#888] py-12 text-base">Nenhum torneio nesta liga.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {torneios.map((torneio) => {
                    const badge = TORNEIO_STATUS_BADGE[torneio.status] ?? "";
                    const label = TORNEIO_STATUS_LABEL[torneio.status] ?? torneio.status;
                    const isLive = torneio.status === "em_andamento";
                    return (
                      <div
                        key={torneio.id}
                        className="bg-[rgba(18,12,32,0.72)] border border-[rgba(217,180,255,0.14)] rounded-xl p-4 transition-all duration-200 hover:border-[rgba(199,149,255,0.5)] hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(3,2,8,0.45)] cursor-pointer group"
                        onClick={() => navigate(`/torneios/${torneio.id}`)}
                      >
                        <div className="flex items-start justify-end gap-3 mb-2">
                          <span className={`inline-flex items-center gap-[0.3rem] px-[0.55rem] py-[0.15rem] rounded-full text-[0.7rem] font-semibold uppercase tracking-[0.04em] ${badge}`}>
                            {isLive && (
                              <span className="w-[6px] h-[6px] rounded-full bg-current animate-pulse inline-block" />
                            )}
                            {label}
                          </span>
                        </div>
                        <h4 className="m-0 mb-3 text-[#f5edff] font-semibold text-[0.95rem] leading-snug group-hover:text-white transition-colors">
                          {torneio.nome}
                        </h4>
                        <div className="flex items-center gap-2 text-[0.78rem] text-[rgba(190,175,215,0.6)]">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <rect x="3" y="4" width="18" height="18" rx="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          {torneio.horario
                            ? formatBrasiliaDate(torneio.horario)
                            : "Data não definida"}
                          {(torneio.totalInscritos != null || torneio.maxJogadores != null) && (
                            <>
                              <span className="text-[rgba(190,175,215,0.3)]">·</span>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                              </svg>
                              {torneio.totalInscritos ?? "?"}{
                                torneio.maxJogadores ? ` / ${torneio.maxJogadores}` : ""
                              }
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Ranking tab */}
          {abaAtiva === "ranking" && (
            <>
              {rankingError && (
                <InlineAlert
                  type="error"
                  className="mb-4"
                  onDismiss={() => setRankingError("")}
                  action={(
                    <button
                      type="button"
                      onClick={loadRanking}
                      className="text-[0.82rem] font-semibold underline underline-offset-2 opacity-90 hover:opacity-100 cursor-pointer bg-transparent border-none p-0 text-inherit"
                    >
                      Tentar novamente
                    </button>
                  )}
                >
                  {rankingError}
                </InlineAlert>
              )}
              <LigaRankingSection ranking={ranking} loading={rankingLoading} usuarioLogado={usuario} />
            </>
          )}
        </>
      ) : loadError ? (
        <InlineAlert
          type="error"
          action={(
            <button
              type="button"
              onClick={loadLiga}
              className="text-[0.82rem] font-semibold underline underline-offset-2 opacity-90 hover:opacity-100 cursor-pointer bg-transparent border-none p-0 text-inherit"
            >
              Tentar novamente
            </button>
          )}
        >
          {loadError}
        </InlineAlert>
      ) : (
        <EmptyState
          title="Liga não encontrada"
          description="Esta liga pode ter sido removida ou você não tem permissão para visualizá-la."
          action={(
            <button
              type="button"
              onClick={() => navigate("/ligas")}
              className="px-4 py-2 rounded-lg border border-[#4f46e5] bg-[rgba(79,70,229,0.12)] text-[#d9d6ff] font-semibold hover:bg-[#4f46e5] hover:text-white transition-colors"
            >
              Voltar para ligas
            </button>
          )}
        />
      )}
    </PageShell>
  );
}
