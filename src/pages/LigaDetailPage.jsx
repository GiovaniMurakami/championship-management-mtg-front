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
import { Tabs } from "../components/ui/Tabs";
import { EmptyState } from "../components/ui/EmptyState";
import { InlineAlert } from "../components/ui/InlineAlert";
import { logError } from "../utils/logger";
import { usePageTitle } from "../hooks/usePageTitle";
import { PAGE_TITLES } from "../constants/pageTitles";

export function LigaDetailPage() {
  const LIMITE_RANKING_TIMES = 10;
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
  const [abaAtiva, setAbaAtiva] = useState("torneios");

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

  const torneios = liga?.torneios || [];

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
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="m-0 text-white text-[2rem] font-['Bebas_Neue',sans-serif] tracking-[0.03em] max-[768px]:text-[1.6rem]">
                {liga.nome}
              </h1>
              {liga.status && (
                <span className={`inline-block px-[0.65rem] py-[0.2rem] rounded-full text-[0.72rem] font-semibold uppercase tracking-[0.05em] ${STATUS_BADGE_CLASS[liga.status] ?? ""}`}>
                  {STATUS_LABEL[liga.status] ?? liga.status}
                </span>
              )}
            </div>
            {liga.descricao && (
              <p className="m-0 text-[#beafd7] text-[0.95rem] leading-relaxed max-w-[680px] mb-3">{liga.descricao}</p>
            )}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-[0.4rem] text-[0.8rem] text-[#beafd7]">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(167,79,255,0.7)" strokeWidth="2.5" aria-hidden="true">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                  <path d="M4 22h16" />
                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
                </svg>
                {liga.totalTorneios ?? torneios.length} torneio{(liga.totalTorneios ?? torneios.length) !== 1 ? "s" : ""}
              </span>
              {liga.formato && (
                <span className="inline-block px-[0.5rem] py-[0.15rem] rounded-[0.4rem] text-[0.72rem] font-semibold bg-[rgba(199,149,255,0.12)] text-[#c795ff] border border-[rgba(199,149,255,0.25)]">
                  {liga.formato}
                </span>
              )}
            </div>
          </div>

          <Tabs value={abaAtiva} onChange={setAbaAtiva}>
            <Tabs.Item value="torneios" label="Torneios" count={torneios.length} />
            <Tabs.Item value="ranking" label="Ranking" />
          </Tabs>

          {/* Torneios tab */}
          {abaAtiva === "torneios" && (
            <div>
              {torneios.length === 0 ? (
                <p className="text-center text-[#888] py-12 text-base">Nenhum torneio nesta liga.</p>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 max-[768px]:grid-cols-1">
                  {torneios.map((torneio) => {
                    const badge = TORNEIO_STATUS_BADGE[torneio.status] ?? "";
                    const label = TORNEIO_STATUS_LABEL[torneio.status] ?? torneio.status;
                    const isLive = torneio.status === "em_andamento";
                    return (
                      <div
                        key={torneio.id}
                        className="bg-[rgba(255,255,255,0.03)] border border-[rgba(217,180,255,0.15)] rounded-[0.9rem] p-4 transition-all duration-200 hover:border-[rgba(167,79,255,0.35)] hover:bg-white/[0.055] hover:-translate-y-[2px] hover:shadow-[0_8px_28px_rgba(0,0,0,0.3)] cursor-pointer group"
                        onClick={() => navigate(`/torneios/${torneio.id}`)}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <span className="font-['Bebas_Neue',sans-serif] text-[0.88rem] tracking-[0.1em] text-[#c795ff]">
                            {(torneio.formato || "—").toUpperCase()}
                          </span>
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
                          {torneio.data
                            ? new Date(torneio.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
                            : torneio.dataInicio
                              ? new Date(torneio.dataInicio).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
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
