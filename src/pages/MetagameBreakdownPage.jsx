import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Copy, ChartPie } from "lucide-react";
import { PageShell } from "../components/ui/PageShell";
import { EmptyState } from "../components/ui/EmptyState";
import { SkeletonMetagame } from "../components/ui/Skeleton";
import { BreakdownKpis } from "../components/metagame/breakdown/BreakdownKpis";
import { BreakdownPanel } from "../components/metagame/breakdown/BreakdownPanel";
import { BreakdownShareChart } from "../components/metagame/breakdown/BreakdownShareChart";
import { BreakdownWinrateChart } from "../components/metagame/breakdown/BreakdownWinrateChart";
import { BreakdownMatchupHeat } from "../components/metagame/breakdown/BreakdownMatchupHeat";
import { buscarMetagame, buscarMetagameTorneio } from "../services/backendApi";
import { usePageTitle } from "../hooks/usePageTitle";
import { PAGE_TITLES } from "../constants/pageTitles";
import { getTournamentFormatLabel, TOURNAMENT_FORMATS } from "../constants/tournament";
import { useToast } from "../context/ToastContext";
import { logError } from "../utils/logger";
import { formatBrasiliaDate } from "../utils/brasiliaTime";
import { tournamentPath } from "../utils/tournamentUrl";
import {
  calcularKpisBreakdown,
  dadosShareChart,
  dadosWinrateChart,
  dadosMatchupHeat,
} from "../utils/metagameBreakdown";
import { BTN_SECONDARY } from "../styles/uiClasses";

const DIAS_OPCOES = [7, 14, 30, 90];
const DIAS_PADRAO = 30;
const FORMATO_PADRAO = "pauper";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseDias(valor) {
  const n = Number(valor);
  return DIAS_OPCOES.includes(n) ? n : DIAS_PADRAO;
}

function parseFormato(valor) {
  if (TOURNAMENT_FORMATS.some((f) => f.value === valor)) return valor;
  return FORMATO_PADRAO;
}

export function MetagameBreakdownPage() {
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();

  const torneioId = searchParams.get("torneioId") || "";
  const modoTorneio = Boolean(torneioId);
  const formato = parseFormato(searchParams.get("formato"));
  const dias = parseDias(searchParams.get("dias"));
  const dataInicio = searchParams.get("dataInicio") || "";
  const dataFim = searchParams.get("dataFim") || "";

  const requestKey = modoTorneio
    ? `torneio:${torneioId}`
    : `formato:${formato}:${dias}:${dataInicio}:${dataFim}`;

  const [result, setResult] = useState({ key: "", data: null, erro: "" });
  const [filtroSlug, setFiltroSlug] = useState(null);

  usePageTitle(
    modoTorneio
      ? `${PAGE_TITLES.metagame} Breakdown`
      : `${PAGE_TITLES.metagame} Breakdown ${getTournamentFormatLabel(formato)}`
  );

  useEffect(() => {
    let cancelled = false;
    if (modoTorneio && !UUID_RE.test(torneioId)) {
      setResult({ key: requestKey, data: null, erro: "ID de torneio inválido." });
      return undefined;
    }

    const carregar = modoTorneio
      ? buscarMetagameTorneio(torneioId)
      : buscarMetagame({
          formato,
          dias,
          limite: 200,
          offset: 0,
          ...(dataInicio && dataFim ? { dataInicio, dataFim } : {}),
        });

    carregar
      .then((res) => {
        if (!cancelled) setResult({ key: requestKey, data: res?.data ?? res, erro: "" });
      })
      .catch((err) => {
        logError("Erro ao carregar breakdown:", err);
        const mensagem = err?.response?.data?.mensagem
          || (modoTorneio
            ? "Não foi possível carregar o metagame deste torneio."
            : "Não foi possível carregar o metagame.");
        if (!cancelled) setResult({ key: requestKey, data: null, erro: mensagem });
      });

    return () => { cancelled = true; };
  }, [requestKey, modoTorneio, torneioId, formato, dias, dataInicio, dataFim]);

  useEffect(() => {
    setFiltroSlug(null);
  }, [requestKey]);

  const loading = result.key !== requestKey;
  const data = loading ? null : result.data;
  const erro = loading ? "" : result.erro;
  const arquetipos = data?.arquetipos ?? [];
  const totalDecks = data?.totalDecks ?? 0;

  const kpis = useMemo(() => calcularKpisBreakdown(arquetipos, totalDecks), [arquetipos, totalDecks]);
  const share = useMemo(() => dadosShareChart(arquetipos), [arquetipos]);
  const winrates = useMemo(() => dadosWinrateChart(arquetipos), [arquetipos]);
  const heat = useMemo(() => dadosMatchupHeat(arquetipos, 8, filtroSlug), [arquetipos, filtroSlug]);

  const titulo = modoTorneio
    ? (data?.torneio?.nome || "Breakdown do torneio")
    : `Breakdown · ${getTournamentFormatLabel(formato)}`;

  const subtitulo = (() => {
    if (modoTorneio && data?.torneio) {
      const partes = [
        getTournamentFormatLabel(data.torneio.formato),
        data.torneio.horario ? formatBrasiliaDate(data.torneio.horario) : null,
        `${totalDecks} deck(s)`,
      ].filter(Boolean);
      return partes.join(" · ");
    }
    if (!modoTorneio && data) {
      const periodo = dataInicio && dataFim
        ? `${dataInicio} → ${dataFim}`
        : `últimos ${dias} dias`;
      return `${data.totalTorneios ?? 0} evento(s) · ${totalDecks} deck(s) · ${periodo}`;
    }
    return null;
  })();

  const voltarHref = modoTorneio && data?.torneio
    ? tournamentPath(data.torneio)
    : `/metagame?formato=${encodeURIComponent(formato)}&dias=${dias}${dataInicio && dataFim ? `&dataInicio=${dataInicio}&dataFim=${dataFim}` : ""}`;

  const copiarLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      addToast("Link copiado.", { type: "success" });
    } catch (err) {
      logError("Falha ao copiar link:", err);
      addToast("Não foi possível copiar o link.", { type: "error" });
    }
  }, [addToast]);

  return (
    <PageShell>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            to={voltarHref}
            className="inline-flex items-center gap-1 text-sm text-text-soft hover:text-text-main mb-2"
          >
            ← Voltar
          </Link>
          <div className="flex items-center gap-2">
            <ChartPie className="text-brand" size={28} aria-hidden="true" />
            <h1 className="m-0 text-white text-[2rem] font-bold leading-tight max-[768px]:text-[1.6rem]">
              {titulo}
            </h1>
          </div>
          {subtitulo && (
            <p className="m-0 mt-1 text-text-soft text-[0.9rem]">{subtitulo}</p>
          )}
        </div>
        <button type="button" className={`${BTN_SECONDARY} inline-flex min-h-11 items-center gap-2`} onClick={copiarLink}>
          <Copy size={16} aria-hidden="true" /> Copiar link
        </button>
      </div>

      {loading && <SkeletonMetagame />}
      {!loading && erro && <EmptyState title="Erro ao carregar" description={erro} />}
      {!loading && !erro && arquetipos.length === 0 && (
        <EmptyState
          title="Sem dados de metagame"
          description={
            modoTorneio
              ? "Este torneio ainda não tem decks agregáveis ou não está finalizado."
              : "Não há torneios finalizados neste período."
          }
        />
      )}

      {!loading && !erro && arquetipos.length > 0 && (
        <div className="space-y-5 rounded-2xl bg-[#140c1f] p-1">
          <BreakdownKpis kpis={kpis} />
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 xl:items-start">
            <BreakdownPanel
              title="Share do metagame"
              description="Distribuição de arquétipos por % de presença. Clique num arquétipo para filtrar a matriz."
            >
              <BreakdownShareChart
                data={share}
                selectedSlug={filtroSlug}
                onSelect={setFiltroSlug}
              />
            </BreakdownPanel>
            <BreakdownPanel
              title="Partidas por arquétipo"
              description="Volume de partidas (V/E/D). Clique numa barra para filtrar a matriz."
            >
              <BreakdownWinrateChart
                data={winrates}
                selectedSlug={filtroSlug}
                onSelect={setFiltroSlug}
              />
            </BreakdownPanel>
            <div className="xl:col-span-2">
              <BreakdownPanel
                title="Matriz de confrontos"
                description={
                  heat.filtroNome
                    ? `Confrontos de ${heat.filtroNome} contra o restante do meta.`
                    : "Winrate do arquétipo da linha contra o da coluna. Clique num gráfico acima para filtrar."
                }
              >
                {heat.filtroSlug && (
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-brand/35 bg-brand/15 px-3 py-1 text-xs font-semibold text-[#e8dfff]">
                      Filtro: {heat.filtroNome}
                    </span>
                    <button
                      type="button"
                      className="text-xs font-semibold text-text-soft hover:text-text-main underline-offset-2 hover:underline"
                      onClick={() => setFiltroSlug(null)}
                    >
                      Limpar filtro
                    </button>
                  </div>
                )}
                <BreakdownMatchupHeat heat={heat} />
              </BreakdownPanel>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
