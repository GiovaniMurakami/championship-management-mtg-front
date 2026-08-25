import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { normalizeId } from "../utils/normalizeId";
import { listarTorneios, inscreverTorneio } from "../services/backendApi";
import { useAuth } from "../hooks/useAuth";
import { useActionGuard } from "../hooks/useActionGuard";
import { useToast } from "../context/ToastContext";
import { useRequestSequence } from "../hooks/useRequestSequence";
import { subscribeToTournament, unsubscribeFromTournament } from "../services/ablyService";
import { earliestMsUntilAblyWindow, isTournamentAblyWindowOpen } from "../utils/ablyTournamentWindow";
import { SkeletonCollection } from "../components";
import { EmptyState } from "../components/ui/EmptyState";
import { InlineAlert } from "../components/ui/InlineAlert";
import { PageShell } from "../components/ui/PageShell";
import { Tabs } from "../components/ui/Tabs";
import { Button } from "../components/ui/Button";
import { STATUS_BADGE_CLASS, STATUS_LABEL, getTournamentFormatLabel } from "../constants/tournament";
import { SponsorSection } from "../components";
import { ExpandableText } from "../components/tournament";
import { logError } from "../utils/logger";
import { formatBrasiliaDateTime } from "../utils/brasiliaTime";
import { useSiteEstatisticas, formatSiteStatValue } from "../hooks/useSiteEstatisticas";
import { usePageTitle } from "../hooks/usePageTitle";
import { PAGE_TITLES } from "../constants/pageTitles";

const LIMITE = 12;

function resolveAba(searchParams) {
  const aba = searchParams.get("aba");
  if (aba === "anteriores" || aba === "encerrados") return "encerrados";
  return "disponiveis";
}

function PlatformStats() {
  const { stats, loading } = useSiteEstatisticas();

  const items = [
    { value: stats.torneiosRealizados, label: "Torneios realizados" },
    { value: stats.jogadoresAtivos, label: "Jogadores ativos" },
    { value: stats.formatosSuportados, label: "Formatos suportados" },
  ];

  return (
    <div className="mb-6 flex items-center gap-6 flex-wrap px-4 py-3 rounded-xl border border-line-soft bg-white/[0.02] max-md:flex-col max-md:items-start max-md:gap-3">
      {items.map((stat, i, arr) => (
        <div key={stat.label} className="flex items-center gap-4 max-md:w-full">
          <div className="flex flex-col">
            <span className="font-['Bebas_Neue',sans-serif] text-[1.4rem] tracking-[0.04em] text-brand leading-none">
              {loading ? "—" : formatSiteStatValue(stat.value)}
            </span>
            <span className="text-text-soft text-[0.7rem]">{stat.label}</span>
          </div>
          {i < arr.length - 1 && (
            <div className="w-px h-7 bg-[rgba(217,180,255,0.15)] max-md:hidden" />
          )}
        </div>
      ))}
    </div>
  );
}

export function TournamentPage() {
  const { token, usuario, isAdmin, requireAuth } = useAuth();
  const { addToast } = useToast();
  const listRequest = useRequestSequence();

  usePageTitle(PAGE_TITLES.torneios);

  const [torneios, setTorneios] = useState([]);
  const [total, setTotal] = useState(0);
  const [tabTotals, setTabTotals] = useState({ disponiveis: null, encerrados: null });
  const [pagina, setPagina] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [enrollingId, setEnrollingId] = useState(null);
  const [inscricoesLocais, setInscricoesLocais] = useState({});
  const guard = useActionGuard();
  const [searchParams, setSearchParams] = useSearchParams();
  const [abaAtiva, setAbaAtiva] = useState(() => resolveAba(searchParams));
  const [ablyWindowTick, setAblyWindowTick] = useState(0);
  const channelsRef = useRef({});
  const navigate = useNavigate();

  const handleAbaChange = useCallback((nextAba) => {
    setAbaAtiva(nextAba);
    setPagina(1);
    setTorneios([]);
    setTotal(0);
    setLoadError("");
  }, []);

  const loadTorneios = useCallback(async () => {
    const request = listRequest();
    setLoading(true);
    setLoadError("");
    try {
      const offset = (pagina - 1) * LIMITE;

      if (abaAtiva === "encerrados") {
        const data = await listarTorneios(token, {
          status: "finalizado",
          limite: LIMITE,
          offset,
        });
        if (!request.isCurrent()) return;
        setTorneios(data.torneios);
        setTotal(data.total);
        setTabTotals((prev) => ({ ...prev, encerrados: data.total }));
      } else {
        const [inscricoes, andamento] = await Promise.all([
          listarTorneios(token, { status: "inscricoes_abertas", limite: LIMITE, offset }),
          listarTorneios(token, { status: "em_andamento", limite: LIMITE, offset }),
        ]);
        if (!request.isCurrent()) return;
        const merged = [...inscricoes.torneios, ...andamento.torneios].sort(
          (a, b) => new Date(a.horario) - new Date(b.horario),
        );
        const disponiveisTotal = inscricoes.total + andamento.total;
        setTorneios(merged);
        setTotal(disponiveisTotal);
        setTabTotals((prev) => ({ ...prev, disponiveis: disponiveisTotal }));
      }
    } catch (error) {
      if (!request.isCurrent()) return;
      logError("Erro ao carregar torneios:", error);
      const message = error.message || "Erro ao carregar torneios. Tente novamente.";
      setLoadError(message);
      addToast(message, { type: "error" });
    } finally {
      if (request.isCurrent()) setLoading(false);
    }
  }, [token, abaAtiva, pagina, addToast, listRequest]);

  useEffect(() => {
    loadTorneios();
  }, [loadTorneios]);

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams);
    if (abaAtiva === "encerrados") nextParams.set("aba", "encerrados");
    else nextParams.delete("aba");
    if (nextParams.toString() !== searchParams.toString()) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [abaAtiva, searchParams, setSearchParams]);

  const handleRodadaIniciada = useCallback(() => {
    loadTorneios();
  }, [loadTorneios]);

  const handleResultadoRegistrado = useCallback(() => {
    loadTorneios();
  }, [loadTorneios]);

  const handleTorneioFinalizado = useCallback(() => {
    loadTorneios();
  }, [loadTorneios]);

  const handleParticipanteInscrito = useCallback((_torneioId, data) => {
    const inscritoId = normalizeId(data?.usuarioId || data?.userId || data?.usuario?.id || data?.id);
    if (inscritoId && inscritoId === normalizeId(usuario?.id)) {
      setInscricoesLocais((prev) => ({ ...prev, [_torneioId]: true }));
    }
    loadTorneios();
  }, [loadTorneios, usuario?.id]);

  const handleCheckinRealizado = useCallback(() => {
    loadTorneios();
  }, [loadTorneios]);

  // Ably: só autenticado, 15 min antes do horário e durante o torneio
  useEffect(() => {
    if (!token) {
      Object.values(channelsRef.current).forEach((channel) => {
        if (channel) unsubscribeFromTournament(channel);
      });
      channelsRef.current = {};
      return undefined;
    }

    const naJanela = torneios.filter((t) => isTournamentAblyWindowOpen(t));
    const idsNaJanela = new Set(naJanela.map((t) => t.id));

    Object.keys(channelsRef.current).forEach((id) => {
      if (!idsNaJanela.has(id)) {
        unsubscribeFromTournament(channelsRef.current[id]);
        delete channelsRef.current[id];
      }
    });

    naJanela.forEach((torneio) => {
      if (!channelsRef.current[torneio.id]) {
        const channel = subscribeToTournament(torneio.id, {
          onRodadaIniciada: (message) => handleRodadaIniciada(torneio.id, message.data),
          onResultadoRegistrado: (message) => handleResultadoRegistrado(torneio.id, message.data),
          onTorneioFinalizado: (message) => handleTorneioFinalizado(torneio.id, message.data),
          onParticipanteInscrito: (message) => handleParticipanteInscrito(torneio.id, message.data),
          onCheckinRealizado: (message) => handleCheckinRealizado(torneio.id, message.data),
        });
        channelsRef.current[torneio.id] = channel;
      }
    });

    const wait = earliestMsUntilAblyWindow(torneios);
    const timer = wait != null
      ? setTimeout(() => setAblyWindowTick((tick) => tick + 1), wait)
      : undefined;
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [token, torneios, ablyWindowTick, handleRodadaIniciada, handleResultadoRegistrado, handleTorneioFinalizado, handleParticipanteInscrito, handleCheckinRealizado]);

  useEffect(() => () => {
    Object.values(channelsRef.current).forEach((channel) => {
      if (channel) unsubscribeFromTournament(channel);
    });
    channelsRef.current = {};
  }, []);

  const handleInscrever = guard(async (torneioId, authOverride) => {
    const authToken = authOverride?.token ?? token;
    const authUsuario = authOverride?.usuario ?? usuario;
    if (!authToken) {
      requireAuth((auth) => handleInscrever(torneioId, auth));
      return;
    }
    if (!authUsuario?.nickMTGO) {
      addToast("É necessário configurar um nick do MTGO no seu perfil antes de se inscrever. Acesse seu perfil pelo menu superior.", { type: "error", duration: 6000 });
      return;
    }
    setEnrollingId(torneioId);
    try {
      await inscreverTorneio(torneioId, authToken);
      setInscricoesLocais((prev) => ({ ...prev, [torneioId]: true }));
      addToast("Inscrição realizada com sucesso!", { type: "success" });
      loadTorneios();
    } catch {
      addToast("Erro ao se inscrever no torneio. Tente novamente.", { type: "error" });
    } finally {
      setEnrollingId(null);
    }
  });

  const handleViewTournament = (torneioId) => navigate(`/torneios/${torneioId}`);

  const formatDate = (dateString) => formatBrasiliaDateTime(dateString);

  const isInscrito = (torneio) => {
    if (!usuario?.id) return false;
    return !!(inscricoesLocais[torneio.id] || torneio?.inscrito);
  };

  const torneiosExibidos = torneios;
  const totalPaginas = Math.ceil(total / LIMITE) || 1;

  return (
    <PageShell>
      <SponsorSection />
      <PlatformStats />

      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6 max-md:flex-col max-md:items-stretch max-md:gap-3">
        <h1 className="m-0 text-white text-[2.2rem] font-bold [text-shadow:0_2px_4px_rgba(0,0,0,0.3)] max-md:text-[1.75rem]">
          Torneios
        </h1>
        {isAdmin && (
          <Button
            className="max-md:w-full"
            onClick={() => navigate("/torneios/criar")}
          >
            + Criar Torneio
          </Button>
        )}
      </div>

      <Tabs value={abaAtiva} onChange={handleAbaChange}>
        <Tabs.Item
          value="disponiveis"
          label="Disponíveis"
          count={tabTotals.disponiveis != null ? tabTotals.disponiveis : undefined}
        />
        <Tabs.Item
          value="encerrados"
          label="Encerrados"
          count={tabTotals.encerrados != null ? tabTotals.encerrados : undefined}
        />
      </Tabs>

      {loadError && !loading && (
        <InlineAlert
          type="error"
          className="mt-4"
          onDismiss={() => setLoadError("")}
          action={(
            <button
              type="button"
              onClick={loadTorneios}
              className="text-[0.82rem] font-semibold underline underline-offset-2 opacity-90 hover:opacity-100 cursor-pointer bg-transparent border-none p-0 text-inherit"
            >
              Tentar novamente
            </button>
          )}
        >
          {loadError}
        </InlineAlert>
      )}

      {/* List */}
      <section className="mt-6" aria-busy={loading} aria-live="polite">
        {loading ? (
          <SkeletonCollection variant="tournament" count={6} className="mb-8 min-[1024px]:grid-cols-3" />
        ) : torneiosExibidos.length === 0 ? (
          <EmptyState
            title={abaAtiva === "disponiveis" ? "Nenhum torneio disponível" : "Nenhum torneio encerrado encontrado"}
            description={abaAtiva === "disponiveis" ? "Quando houver torneios abertos ou em andamento, eles aparecerão aqui." : "Torneios finalizados ficarão disponíveis nesta aba."}
            action={isAdmin && abaAtiva === "disponiveis" && (
              <Button onClick={() => navigate("/torneios/criar")}>
                Criar torneio
              </Button>
            )}
          />
        ) : (
          <div className="grid grid-cols-1 min-[640px]:grid-cols-2 min-[1024px]:grid-cols-3 gap-4 mb-8">
            {torneiosExibidos.map((torneio) => {
              const inscrito = isInscrito(torneio);
              const isEnrolling = enrollingId === torneio.id;
              return (
                <div
                  key={torneio.id}
                  className="rounded-2xl bg-surface/80 shadow-card border border-line-soft transition-all duration-[220ms] relative overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-overlay hover:border-line-strong"
                >
                  {/* Banner image */}
                  {torneio.bannerUrl && (
                    <div className="relative w-full h-[140px] max-md:h-[130px] overflow-hidden rounded-t-[0.95rem]">
                      <img
                        src={torneio.bannerUrl}
                        alt={`Banner de ${torneio.nome}`}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(16,10,32,0.9)]" />
                    </div>
                  )}

                  {/* Card header */}
                  <div className="flex items-center justify-between gap-2 px-3.5 py-[0.65rem] pb-2 border-b border-line bg-white/[0.02] max-md:flex-wrap">
                    <span className="text-[0.78rem] font-semibold tracking-[0.04em] text-brand">
                      {getTournamentFormatLabel(torneio.formato).toUpperCase()}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`inline-block px-2.5 py-0.5 rounded-2xl text-[0.7rem] font-medium uppercase tracking-[0.5px] text-center ${STATUS_BADGE_CLASS[torneio.status] ?? ""}`}>
                        {STATUS_LABEL[torneio.status] ?? torneio.status}
                      </span>
                      {isAdmin && (
                        <button
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[rgba(199,149,255,0.28)] bg-transparent text-text-soft transition-colors hover:border-[rgba(199,149,255,0.55)] hover:bg-[rgba(167,79,255,0.14)] hover:text-white"
                          type="button"
                          onClick={() => navigate("/torneios/criar", { state: { copyFrom: torneio } })}
                          aria-label={`Copiar ${torneio.nome}`}
                          title="Copiar torneio"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                            <rect x="9" y="9" width="13" height="13" rx="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="text-text-main m-0 mb-2.5 font-display font-semibold text-[1.2rem] tracking-[-0.025em] leading-[1.2] px-3.5 pt-3">
                    {torneio.nome}
                  </h3>

                  <div className="flex flex-col gap-[0.35rem] px-3.5 pb-3">
                    {torneio.descricao && (
                      <ExpandableText
                        text={torneio.descricao}
                        maxLines={2}
                        className="text-[#d7d0e6] text-[0.78rem]"
                        buttonClassName="mt-1.5 inline-flex items-center gap-2 border-none bg-transparent p-0 text-brand text-[0.72rem] font-semibold cursor-pointer hover:text-white transition-colors"
                      />
                    )}
                    <div className="flex items-center gap-2 text-text-soft text-[0.78rem]">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(167,79,255,0.7)" strokeWidth="2.5" aria-hidden="true" className="shrink-0">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <span>{formatDate(torneio.horario)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-text-soft text-[0.78rem]">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(167,79,255,0.7)" strokeWidth="2.5" aria-hidden="true" className="shrink-0">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 0v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      <span>{torneio.totalInscritos ?? "—"} inscritos</span>
                    </div>
                    {torneio.status !== "inscricoes_abertas" && (
                      <div className="flex items-center gap-2 text-text-soft text-[0.78rem]">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(167,79,255,0.7)" strokeWidth="2.5" aria-hidden="true" className="shrink-0">
                          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                          <polyline points="17 6 23 6 23 12" />
                        </svg>
                        <span>Rodada {torneio.totalRodadas ? `${torneio.rodadaAtual}/${torneio.totalRodadas}` : (torneio.rodadaAtual ?? "—")}</span>
                      </div>
                    )}
                    {torneio.visualizacoes != null && (
                      <div className="flex items-center gap-2 text-text-soft text-[0.78rem]">
                        <span>👁</span>
                        <span>{torneio.visualizacoes} visualizações</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-auto px-3.5 py-[0.7rem] pb-[0.85rem] border-t border-line bg-white/[0.015] flex gap-2 flex-wrap max-md:flex-col">
                    <button
                      className="px-3 py-1.5 border border-[#4f46e5] rounded-md text-[0.78rem] font-medium cursor-pointer uppercase tracking-[0.5px] bg-[rgba(79,70,229,0.1)] text-[#4f46e5] transition-all duration-300 hover:bg-[#4f46e5] hover:text-white hover:-translate-y-px active:translate-y-0 max-md:w-full"
                      onClick={() => handleViewTournament(torneio.id)}
                    >
                      Ver Torneio
                    </button>

                    {torneio.status === "inscricoes_abertas" && (
                      <button
                        className={`px-3 py-1.5 border rounded-md text-[0.78rem] font-medium cursor-pointer uppercase tracking-[0.5px] transition-all duration-300 hover:-translate-y-px active:translate-y-0 max-md:w-full disabled:opacity-80 disabled:cursor-not-allowed ${inscrito
                          ? "bg-[rgba(148,163,184,0.16)] text-[#cbd5e1] border-[#94a3b8] cursor-default hover:translate-y-0"
                          : "bg-[rgba(34,197,94,0.1)] text-[#22c55e] border-[#22c55e] hover:bg-[#22c55e] hover:text-white"
                          }`}
                        type="button"
                        onClick={() => !inscrito && !isEnrolling && handleInscrever(torneio.id)}
                        disabled={inscrito || isEnrolling}
                        aria-busy={isEnrolling}
                      >
                        {inscrito ? "✓ Inscrito" : isEnrolling ? "Inscrevendo..." : "Inscrever-se"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && totalPaginas > 1 && (
          <nav className="flex items-center justify-center gap-3 mb-8" aria-label="Paginação de torneios">
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
      </section>
    </PageShell>
  );
}
