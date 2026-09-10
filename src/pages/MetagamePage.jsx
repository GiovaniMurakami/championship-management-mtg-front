import { DateRangeFilter } from "../components/ui/DateRangeFilter";
import { useDateRangeParams } from "../hooks/useDateRangeParams";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { buscarMetagame } from "../services/backendApi";
import { PageShell } from "../components/ui/PageShell";
import { EmptyState } from "../components/ui/EmptyState";
import { SkeletonMetagame } from "../components/ui/Skeleton";
import { MetagameArchetypeCard, MetagameFormatNav, MetagamePeriodoSelect, MetagameRecentSidebar } from "../components/metagame";
import { CardPreviewModal } from "../components/deck/CardPreviewModal";
import { TOURNAMENT_FORMATS, getTournamentFormatLabel } from "../constants/tournament";
import { usePageTitle } from "../hooks/usePageTitle";
import { coresDoDeck, nomesCartasParaCores } from "../utils/deckColors";
import { useCardPreview } from "../hooks/useCardPreview";
import { PAGE_TITLES } from "../constants/pageTitles";
import { logError } from "../utils/logger";
import { Grid2X2, Table2 } from "lucide-react";
import { MetagameMatrix } from "../components/metagame/MetagameMatrix";
import { BTN_PRIMARY, BTN_SECONDARY } from "../styles/uiClasses";

const DIAS_OPCOES = [7, 14, 30, 90];
const DIAS_PADRAO = 30;
const FORMATO_PADRAO = "pauper";

function parseDias(valor) {
  const n = Number(valor);
  return DIAS_OPCOES.includes(n) ? n : DIAS_PADRAO;
}

function parseFormato(valor) {
  if (TOURNAMENT_FORMATS.some((f) => f.value === valor)) return valor;
  return FORMATO_PADRAO;
}

export function MetagamePage() {
  const { dataInicio, dataFim, dateQuery, applyDates } = useDateRangeParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const formato = parseFormato(searchParams.get("formato"));
  const dias = parseDias(searchParams.get("dias"));
  const matrixView = searchParams.get("visualizacao") === "matriz";
  const [busca, setBusca] = useState("");

  usePageTitle(`${PAGE_TITLES.metagame} ${getTournamentFormatLabel(formato)}`);

  const requestKey = `${formato}:${dias}:${dateQuery}`;
  const [result, setResult] = useState({ key: "", data: null, erro: "" });

  const setFiltro = useCallback((nextFormato, nextDias, clearDates = false) => {
    setSearchParams(previous => {
      const next = new URLSearchParams(previous);
      next.set("formato", nextFormato);
      next.set("dias", String(nextDias));
      if (clearDates) { next.delete("dataInicio"); next.delete("dataFim"); }
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  useEffect(() => {
    if (searchParams.get("formato") === formato && searchParams.get("dias") === String(dias)) {
      return undefined;
    }
    setSearchParams(previous => { const next = new URLSearchParams(previous); next.set("formato", formato); next.set("dias", String(dias)); return next; }, { replace: true });
    return undefined;
  }, [formato, dias, searchParams, setSearchParams]);

  useEffect(() => {
    let cancelled = false;
    buscarMetagame({ formato, dias, ...(dateQuery ? { dataInicio, dataFim } : {}) })
      .then((res) => {
        if (!cancelled) setResult({ key: requestKey, data: res?.data ?? res, erro: "" });
      })
      .catch((err) => {
        logError("Erro ao carregar metagame:", err);
        if (!cancelled) {
          setResult({
            key: requestKey,
            data: null,
            erro: "Não foi possível carregar o metagame.",
          });
        }
      });
    return () => { cancelled = true; };
  }, [formato, dias, requestKey, dateQuery, dataInicio, dataFim]);

  const loading = result.key !== requestKey;
  const data = loading ? null : result.data;
  const erro = loading ? "" : result.erro;
  const recentes = data?.recentes ?? [];

  const { previewCard, openCardPreview, closeCardPreview } = useCardPreview();

  useEffect(() => () => closeCardPreview(), [closeCardPreview]);

  const filtrados = useMemo(() => {
    const lista = data?.arquetipos ?? [];
    const q = busca.trim().toLowerCase();
    if (!q) return lista;
    return lista.filter((a) => a.nome.toLowerCase().includes(q));
  }, [data, busca]);

  return (
    <PageShell>
      <MetagameFormatNav
        formato={formato}
        formatos={TOURNAMENT_FORMATS}
        onFormato={(value) => setFiltro(value, dias)}
      />

      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <h1 className="m-0 text-white text-[2.2rem] font-bold [text-shadow:0_2px_4px_rgba(0,0,0,0.3)] max-[768px]:text-[1.75rem]">
            Metagame {getTournamentFormatLabel(formato)}
          </h1>
          {data?.totalTorneios != null && (
            <p className="m-0 mt-1 text-text-soft text-[0.9rem]">
              {data.totalTorneios} evento(s) · {data.totalDecks} deck(s)
            </p>
          )}
        </div>
        <MetagamePeriodoSelect
          dias={dias}
          diasOpcoes={DIAS_OPCOES}
          onDias={(value) => setFiltro(formato, value, true)}
        />
      </div>

      <DateRangeFilter key={`${dataInicio}:${dataFim}`} dataInicio={dataInicio} dataFim={dataFim} onApply={applyDates} />
      <div role="group" aria-label="Visualização do metagame" className="mb-5 flex flex-wrap gap-2">
        {[{ matrix: false, label: "Cards" }, { matrix: true, label: "Matriz de confrontos" }].map(({ matrix, label }) => (
          <button key={label} type="button" aria-pressed={matrixView === matrix}
            className={`${matrixView === matrix ? BTN_PRIMARY : BTN_SECONDARY} inline-flex min-h-11 items-center gap-2 focus-visible:outline-2 focus-visible:outline-brand`}
            onClick={() => {
              closeCardPreview();
              setSearchParams(previous => {
                const next = new URLSearchParams(previous);
                if (matrix) next.set("visualizacao", "matriz");
                else next.delete("visualizacao");
                return next;
              });
            }}>
            {matrix ? <Table2 size={18} aria-hidden="true" /> : <Grid2X2 size={18} aria-hidden="true" />}{label}
          </button>
        ))}
      </div>

      {loading && <SkeletonMetagame />}
      {!loading && erro && (
        <EmptyState title="Erro ao carregar" description={erro} />
      )}
      {!loading && !erro && (data?.arquetipos?.length ?? 0) === 0 && (
        <EmptyState
          title="Nenhum torneio finalizado neste período."
          description="Quando houver eventos finalizados neste formato, os arquétipos aparecem aqui."
        />
      )}
      {!loading && !erro && (data?.arquetipos?.length ?? 0) > 0 && matrixView && (
        <MetagameMatrix arquetipos={data.arquetipos} formato={formato} dias={dias} />
      )}
      {!loading && !matrixView && (data?.arquetipos?.length ?? 0) > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] gap-6 items-start">
          <div>
            {filtrados.length === 0 ? (
              <EmptyState
                title="Nenhum arquétipo encontrado."
                description="Tente outro nome na busca ao lado."
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtrados.map((arquetipo) => (
                  <MetagameArchetypeCard
                    key={arquetipo.slug}
                    arquetipo={arquetipo}
                    formato={formato}
                    dias={dias}
                    colors={arquetipo.cores || coresDoDeck(nomesCartasParaCores(arquetipo, formato))}
                    onCardMouseEnter={openCardPreview}
                    onCardMouseLeave={closeCardPreview}
                  />
                ))}
              </div>
            )}
          </div>
          <MetagameRecentSidebar
            busca={busca}
            onBusca={setBusca}
            recentes={recentes}
            formato={formato}
            dias={dias}
          />
        </div>
      )}
      <CardPreviewModal card={previewCard} />
    </PageShell>
  );
}
