import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { buscarMetagame } from "../services/backendApi";
import { PageShell } from "../components/ui/PageShell";
import { EmptyState } from "../components/ui/EmptyState";
import { Spinner } from "../components/ui/Spinner";
import { MetagameArchetypeCard, MetagameFormatNav, MetagamePeriodoSelect, MetagameRecentSidebar } from "../components/metagame";
import { CardPreviewModal } from "../components/deck/CardPreviewModal";
import { TOURNAMENT_FORMATS, getTournamentFormatLabel } from "../constants/tournament";
import { usePageTitle } from "../hooks/usePageTitle";
import { useMetagameDeckColors } from "../hooks/useMetagameDeckColors";
import { useCardPreview } from "../hooks/useCardPreview";
import { PAGE_TITLES } from "../constants/pageTitles";
import { logError } from "../utils/logger";

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
  const [searchParams, setSearchParams] = useSearchParams();
  const formato = parseFormato(searchParams.get("formato"));
  const dias = parseDias(searchParams.get("dias"));
  const [busca, setBusca] = useState("");

  usePageTitle(`${PAGE_TITLES.metagame} ${getTournamentFormatLabel(formato)}`);

  const requestKey = `${formato}:${dias}`;
  const [result, setResult] = useState({ key: "", data: null, erro: "" });

  const setFiltro = useCallback((nextFormato, nextDias) => {
    setSearchParams({ formato: nextFormato, dias: String(nextDias) }, { replace: true });
  }, [setSearchParams]);

  useEffect(() => {
    if (searchParams.get("formato") === formato && searchParams.get("dias") === String(dias)) {
      return undefined;
    }
    setSearchParams({ formato, dias: String(dias) }, { replace: true });
    return undefined;
  }, [formato, dias, searchParams, setSearchParams]);

  useEffect(() => {
    let cancelled = false;
    buscarMetagame({ formato, dias })
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
  }, [formato, dias, requestKey]);

  const loading = result.key !== requestKey;
  const data = loading ? null : result.data;
  const erro = loading ? "" : result.erro;
  const recentes = data?.recentes ?? [];
  const coresPorSlug = useMetagameDeckColors(data?.arquetipos, formato);
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
            <p className="m-0 mt-1 text-[#beafd7] text-[0.9rem]">
              {data.totalTorneios} evento(s) · {data.totalDecks} deck(s)
            </p>
          )}
        </div>
        <MetagamePeriodoSelect
          dias={dias}
          diasOpcoes={DIAS_OPCOES}
          onDias={(value) => setFiltro(formato, value)}
        />
      </div>

      {loading && <Spinner text="Carregando metagame..." />}
      {!loading && erro && (
        <EmptyState title="Erro ao carregar" description={erro} />
      )}
      {!loading && !erro && filtrados.length === 0 && !busca && (
        <EmptyState
          title="Nenhum torneio finalizado neste período."
          description="Quando houver eventos finalizados neste formato, os arquétipos aparecem aqui."
        />
      )}
      {!loading && (data?.arquetipos?.length ?? 0) > 0 && (
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
                    colors={coresPorSlug[arquetipo.slug]}
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
