import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { normalizeId } from "../utils/normalizeId";
import { listarTorneios, inscreverTorneio } from "../services/backendApi";
import { useAuth } from "../hooks/useAuth";
import { useActionGuard } from "../hooks/useActionGuard";
import { useToast } from "../context/ToastContext";
import { subscribeToTournament, unsubscribeFromTournament } from "../services/ablyService";
import { SkeletonTorneioCard } from "../components";
import { EmptyState } from "../components/ui/EmptyState";
import { InlineAlert } from "../components/ui/InlineAlert";
import { PageShell } from "../components/ui/PageShell";
import { Tabs } from "../components/ui/Tabs";
import { STATUS_BADGE_CLASS, STATUS_LABEL, getTournamentFormatLabel } from "../constants/tournament";
import { TOURNAMENT_INPUT_CLASS } from "../styles/uiClasses";
import { SponsorSection } from "../components/ui/SponsorSection";
import { ExpandableText } from "../components/tournament";
import { logError } from "../utils/logger";
import { useSiteEstatisticas, formatSiteStatValue } from "../hooks/useSiteEstatisticas";

const LIMITE = 20;

function PlatformStats() {
  const { stats, loading } = useSiteEstatisticas();

  const items = [
    { value: stats.torneiosRealizados, label: "Torneios realizados" },
    { value: stats.jogadoresAtivos, label: "Jogadores ativos" },
    { value: stats.formatosSuportados, label: "Formatos suportados" },
  ];

  return (
    <div className="mb-6 flex items-center gap-6 flex-wrap px-4 py-3 rounded-xl border border-[rgba(217,180,255,0.1)] bg-white/[0.02] max-md:flex-col max-md:items-start max-md:gap-3">
      {items.map((stat, i, arr) => (
        <div key={stat.label} className="flex items-center gap-4 max-md:w-full">
          <div className="flex flex-col">
            <span className="font-['Bebas_Neue',sans-serif] text-[1.4rem] tracking-[0.04em] text-[#c795ff] leading-none">
              {loading ? "—" : formatSiteStatValue(stat.value)}
            </span>
            <span className="text-[#beafd7] text-[0.7rem]">{stat.label}</span>
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
  const { token, usuario, isAdmin } = useAuth();
  const { addToast } = useToast();
  const [torneios, setTorneios] = useState([]);
  const [total, setTotal] = useState(0);
  const [tabTotals, setTabTotals] = useState({ disponiveis: 0, anteriores: 0 });
  const [pagina, setPagina] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [enrollingId, setEnrollingId] = useState(null);
  const [inscricoesLocais, setInscricoesLocais] = useState({});
  const guard = useActionGuard();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialAba = searchParams.get("aba") === "anteriores" ? "anteriores" : "disponiveis";
  const [abaAtiva, setAbaAtiva] = useState(initialAba);
  const channelsRef = useRef({});
  const navigate = useNavigate();

  const loadTorneios = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setLoadError("");
    try {
      const offset = (pagina - 1) * LIMITE;

      if (abaAtiva === "anteriores") {
        const data = await listarTorneios(token, {
          status: "finalizado",
          limite: LIMITE,
          offset,
        });
        setTorneios(data.torneios);
        setTotal(data.total);
        setTabTotals((prev) => ({ ...prev, anteriores: data.total }));
      } else {
        const [inscricoes, andamento] = await Promise.all([
          listarTorneios(token, { status: "inscricoes_abertas", limite: LIMITE, offset }),
          listarTorneios(token, { status: "em_andamento", limite: LIMITE, offset }),
        ]);
        const merged = [...inscricoes.torneios, ...andamento.torneios].sort(
          (a, b) => new Date(b.horario) - new Date(a.horario),
        );
        const disponiveisTotal = inscricoes.total + andamento.total;
        setTorneios(merged);
        setTotal(disponiveisTotal);
        setTabTotals((prev) => ({ ...prev, disponiveis: disponiveisTotal }));
      }
    } catch (error) {
      logError("Erro ao carregar torneios:", error);
      const message = error.message || "Erro ao carregar torneios. Tente novamente.";
      setLoadError(message);
      addToast(message, { type: "error" });
    } finally {
      setLoading(false);
    }
  }, [token, abaAtiva, pagina, addToast]);

  useEffect(() => {
    loadTorneios();
  }, [loadTorneios]);

  useEffect(() => {
    setPagina(1);
  }, [abaAtiva]);

  useEffect(() => {
    if (!token) return;
    const prefetchInactiveTabTotal = async () => {
      try {
        if (abaAtiva === "disponiveis") {
          const data = await listarTorneios(token, { status: "finalizado", limite: 1, offset: 0 });
          setTabTotals((prev) => ({ ...prev, anteriores: data.total }));
        } else {
          const [inscricoes, andamento] = await Promise.all([
            listarTorneios(token, { status: "inscricoes_abertas", limite: 1, offset: 0 }),
            listarTorneios(token, { status: "em_andamento", limite: 1, offset: 0 }),
          ]);
          setTabTotals((prev) => ({
            ...prev,
            disponiveis: inscricoes.total + andamento.total,
          }));
        }
      } catch {
        // badge count is optional
      }
    };
    prefetchInactiveTabTotal();
  }, [token, abaAtiva]);

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams);
    if (abaAtiva === "anteriores") nextParams.set("aba", "anteriores");
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

  // Subscreve apenas torneios ativos (finalizados não emitem mais eventos)
  useEffect(() => {
    const ativos = torneios.filter((t) => t.status !== "finalizado");
    ativos.forEach((torneio) => {
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
    return () => {
      Object.values(channelsRef.current).forEach((channel) => {
        if (channel) unsubscribeFromTournament(channel);
      });
      channelsRef.current = {};
    };
  }, [torneios, handleRodadaIniciada, handleResultadoRegistrado, handleTorneioFinalizado, handleParticipanteInscrito, handleCheckinRealizado]);

  const handleInscrever = guard(async (torneioId) => {
    if (!usuario?.nickMTGO) {
      addToast("É necessário configurar um nick do MTGO no seu perfil antes de se inscrever. Acesse seu perfil pelo menu superior.", { type: "error", duration: 6000 });
      return;
    }
    setEnrollingId(torneioId);
    try {
      await inscreverTorneio(torneioId, token);
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

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString("pt-BR", { timeZone: "UTC" });

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
          <button
            className="px-4 py-[0.7rem] rounded-lg border border-[#4f46e5] bg-[rgba(79,70,229,0.12)] text-[#d9d6ff] cursor-pointer font-semibold transition-all duration-200 hover:bg-[#4f46e5] hover:text-white max-md:w-full"
            type="button"
            onClick={() => navigate("/torneios/criar")}
          >
            + Criar Torneio
          </button>
        )}
      </div>

      <Tabs value={abaAtiva} onChange={setAbaAtiva}>
        <Tabs.Item value="disponiveis" label="Torneios Disponíveis" count={tabTotals.disponiveis} />
        <Tabs.Item value="anteriores" label="Torneios Anteriores" count={tabTotals.anteriores} />
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
      <section className="mt-6">
        {loading ? (
          <div className="grid grid-cols-1 min-[700px]:grid-cols-2 gap-5 mb-8">
            {[1, 2, 3].map((i) => <SkeletonTorneioCard key={i} />)}
          </div>
        ) : torneiosExibidos.length === 0 ? (
          <EmptyState
            title={abaAtiva === "disponiveis" ? "Nenhum torneio disponível" : "Nenhum torneio anterior encontrado"}
            description={abaAtiva === "disponiveis" ? "Quando houver torneios abertos ou em andamento, eles aparecerão aqui." : "Torneios finalizados ficarão disponíveis nesta aba."}
            action={isAdmin && abaAtiva === "disponiveis" && (
              <button
                type="button"
                onClick={() => navigate("/torneios/criar")}
                className="px-4 py-2 rounded-lg border border-[#4f46e5] bg-[rgba(79,70,229,0.12)] text-[#d9d6ff] font-semibold hover:bg-[#4f46e5] hover:text-white transition-colors"
              >
                Criar torneio
              </button>
            )}
          />
        ) : (
          <div className="grid grid-cols-1 min-[700px]:grid-cols-2 gap-5 mb-8">
            {torneiosExibidos.map((torneio) => {
              const inscrito = isInscrito(torneio);
              const isEnrolling = enrollingId === torneio.id;
              return (
                <div
                  key={torneio.id}
                  className="bg-[linear-gradient(155deg,rgba(26,16,50,0.98)_0%,rgba(16,10,32,0.98)_100%)] rounded-[1.1rem] shadow-[0_6px_28px_rgba(0,0,0,0.35)] border border-[rgba(217,180,255,0.2)] transition-all duration-[220ms] relative overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-[0_14px_44px_rgba(0,0,0,0.45)] hover:border-[rgba(167,79,255,0.3)]"
                >
                  {/* Banner image */}
                  {torneio.bannerUrl && (
                    <div className="relative w-full h-[220px] max-md:h-[160px] overflow-hidden rounded-t-[1.1rem]">
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
                  <div className="flex items-center justify-between gap-2 px-5 py-[0.9rem] pb-3 border-b border-[rgba(217,180,255,0.2)] bg-white/[0.02] max-md:flex-wrap">
                    <span className="font-['Bebas_Neue',sans-serif] text-[1.1rem] tracking-[0.12em] text-[#c795ff]">
                      {getTournamentFormatLabel(torneio.formato).toUpperCase()}
                    </span>
                    <span className={`inline-block px-3 py-1 rounded-[20px] text-[0.8rem] font-medium uppercase tracking-[0.5px] text-center max-md:text-[0.72rem] ${STATUS_BADGE_CLASS[torneio.status] ?? ""}`}>
                      {STATUS_LABEL[torneio.status] ?? torneio.status}
                    </span>
                  </div>

                  <h3 className="text-[#f5edff] m-0 mb-[0.9rem] font-['Bebas_Neue',sans-serif] text-[1.55rem] tracking-[0.03em] leading-[1.1] px-5 pt-4 max-[600px]:text-[1.3rem]">
                    {torneio.nome}
                  </h3>

                  <div className="flex flex-col gap-[0.45rem] px-5 pb-4">
                    {torneio.descricao && (
                      <ExpandableText
                        text={torneio.descricao}
                        maxLength={180}
                        className="text-[#d7d0e6] text-[0.84rem]"
                        buttonClassName="mt-2 inline-flex items-center gap-2 border-none bg-transparent p-0 text-[#c795ff] text-[0.78rem] font-semibold cursor-pointer hover:text-white transition-colors"
                      />
                    )}
                    {torneio.regras && (
                      <ExpandableText
                        text={torneio.regras}
                        maxLength={220}
                        className="rounded-xl border border-[rgba(56,189,248,0.16)] bg-[rgba(56,189,248,0.05)] px-3 py-[0.7rem] text-[#d5ebff] text-[0.82rem]"
                        buttonClassName="mt-2 inline-flex items-center gap-2 border-none bg-transparent p-0 text-[#7dd3fc] text-[0.78rem] font-semibold cursor-pointer hover:text-white transition-colors"
                      />
                    )}
                    <div className="flex items-center gap-2 text-[#beafd7] text-[0.85rem]">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(167,79,255,0.7)" strokeWidth="2.5" aria-hidden="true" className="shrink-0">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <span>{formatDate(torneio.horario)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#beafd7] text-[0.85rem]">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(167,79,255,0.7)" strokeWidth="2.5" aria-hidden="true" className="shrink-0">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      <span>{torneio.totalInscritos ?? "—"} inscritos</span>
                    </div>
                    {torneio.status !== "inscricoes_abertas" && (
                      <div className="flex items-center gap-2 text-[#beafd7] text-[0.85rem]">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(167,79,255,0.7)" strokeWidth="2.5" aria-hidden="true" className="shrink-0">
                          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                          <polyline points="17 6 23 6 23 12" />
                        </svg>
                        <span>Rodada {torneio.rodadaAtual}/{torneio.totalRodadas}</span>
                      </div>
                    )}
                    {torneio.visualizacoes != null && (
                      <div className="flex items-center gap-2 text-[#beafd7] text-[0.85rem]">
                        <span>👁</span>
                        <span>{torneio.visualizacoes} visualizacoes</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-auto px-5 py-[0.85rem] pb-[1.1rem] border-t border-[rgba(217,180,255,0.2)] bg-white/[0.015] flex gap-3 flex-wrap max-md:flex-col">
                    <button
                      className="px-4 py-2 border border-[#4f46e5] rounded-md text-[0.9rem] font-medium cursor-pointer uppercase tracking-[0.5px] bg-[rgba(79,70,229,0.1)] text-[#4f46e5] transition-all duration-300 hover:bg-[#4f46e5] hover:text-white hover:-translate-y-px active:translate-y-0 max-md:w-full"
                      onClick={() => handleViewTournament(torneio.id)}
                    >
                      Ver Torneio
                    </button>

                    {isAdmin && (
                      <button
                        className="px-4 py-2 border border-[rgba(167,79,255,0.5)] rounded-md text-[0.9rem] font-medium cursor-pointer uppercase tracking-[0.5px] bg-[rgba(167,79,255,0.08)] text-[#c795ff] transition-all duration-300 hover:bg-[rgba(167,79,255,0.22)] hover:text-white hover:-translate-y-px active:translate-y-0 max-md:w-full flex items-center justify-center gap-[0.4rem]"
                        type="button"
                        onClick={() => navigate("/torneios/criar", { state: { copyFrom: torneio } })}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                          <rect x="9" y="9" width="13" height="13" rx="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        Copiar
                      </button>
                    )}

                    {torneio.status === "inscricoes_abertas" && (
                      <button
                        className={`px-4 py-2 border rounded-md text-[0.9rem] font-medium cursor-pointer uppercase tracking-[0.5px] transition-all duration-300 hover:-translate-y-px active:translate-y-0 max-md:w-full disabled:opacity-80 disabled:cursor-not-allowed ${inscrito
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
              className="px-3 py-2 border border-[rgba(217,180,255,0.2)] rounded-lg text-[#beafd7] text-[0.85rem] disabled:opacity-40 hover:border-[rgba(199,149,255,0.4)] hover:text-white transition-colors"
            >
              ←
            </button>
            <span className="text-[#beafd7] text-[0.85rem] min-w-[60px] text-center" aria-live="polite">
              {pagina} / {totalPaginas}
            </span>
            <button
              type="button"
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              disabled={pagina === totalPaginas}
              aria-label="Próxima página"
              className="px-3 py-2 border border-[rgba(217,180,255,0.2)] rounded-lg text-[#beafd7] text-[0.85rem] disabled:opacity-40 hover:border-[rgba(199,149,255,0.4)] hover:text-white transition-colors"
            >
              →
            </button>
          </nav>
        )}
      </section>
    </PageShell>
  );
}
