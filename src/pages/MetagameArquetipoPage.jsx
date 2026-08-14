import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { atualizarDeck, buscarArquetipoMetagame } from "../services/backendApi";
import { PageShell } from "../components/ui/PageShell";
import { EmptyState } from "../components/ui/EmptyState";
import { Spinner } from "../components/ui/Spinner";
import { BackButton } from "../components/ui/BackButton";
import {
  MetagameFormatNav,
  MetagameListaCard,
  MetagameManaPips,
  MetagameMatchupsSection,
  MetagameNomeConsolidadoEditor,
  MetagamePeriodoSelect,
  MetagameResultadosSection,
} from "../components/metagame";
import { useScryfallArt } from "../hooks/useScryfallArt";
import { useMetagameDeckColors } from "../hooks/useMetagameDeckColors";
import { useResolvedMetagameListas } from "../hooks/useResolvedMetagameListas";
import { useCardPreview } from "../hooks/useCardPreview";
import { CardPreviewModal } from "../components/deck/CardPreviewModal";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import { TOURNAMENT_FORMATS, getTournamentFormatLabel } from "../constants/tournament";
import { usePageTitle } from "../hooks/usePageTitle";
import { logError } from "../utils/logger";
import { chaveMetagameLista, ordenarListasPorRecencia } from "../utils/metagameListas";

const DIAS_OPCOES = [7, 14, 30, 90, 365];
const DIAS_PADRAO = 30;

function parseDias(valor) {
  const n = Number(valor);
  return DIAS_OPCOES.includes(n) ? n : DIAS_PADRAO;
}

export function MetagameArquetipoPage() {
  const { formato, slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token, isAdmin } = useAuth();
  const { addToast } = useToast();
  const dias = parseDias(searchParams.get("dias"));
  const requestKey = `${formato}:${slug}:${dias}`;
  const [result, setResult] = useState({ key: "", data: null, erro: "" });
  const [salvandoDeckId, setSalvandoDeckId] = useState("");
  const [salvandoArquivo, setSalvandoArquivo] = useState(false);
  const [listaAberta, setListaAberta] = useState("");

  const data = result.key === requestKey ? result.data : null;
  const loading = result.key !== requestKey;
  const erro = loading ? "" : result.erro;
  const listUrl = `/metagame?formato=${encodeURIComponent(formato)}&dias=${dias}`;

  usePageTitle(data?.nome ? `${data.nome} | Metagame` : "Metagame");
  const { imagem } = useScryfallArt(data?.cartaRepresentativa);
  const arquetiposCores = useMemo(() => (data ? [data] : []), [data]);
  const coresPorSlug = useMetagameDeckColors(arquetiposCores, formato);
  const { previewCard, openCardPreview, closeCardPreview } = useCardPreview();
  const listasResolvidas = useResolvedMetagameListas(data?.listas);
  const listasOrdenadas = useMemo(
    () => ordenarListasPorRecencia(listasResolvidas, data?.resultados),
    [listasResolvidas, data?.resultados],
  );
  const chaveListaPadrao = listasOrdenadas[0] ? chaveMetagameLista(listasOrdenadas[0]) : "";

  useEffect(() => () => closeCardPreview(), [closeCardPreview]);

  useEffect(() => {
    setListaAberta((atual) => {
      if (atual && listasOrdenadas.some((lista) => chaveMetagameLista(lista) === atual)) {
        return atual;
      }
      return chaveListaPadrao;
    });
  }, [chaveListaPadrao, listasOrdenadas]);

  const recarregar = useCallback(async () => {
    try {
      const res = await buscarArquetipoMetagame(formato, slug, { dias });
      setResult({ key: requestKey, data: res?.data ?? res, erro: "" });
      return true;
    } catch (err) {
      const status = err?.response?.status ?? err?.status;
      if (status === 404) {
        navigate(listUrl);
        return false;
      }
      throw err;
    }
  }, [dias, formato, listUrl, navigate, requestKey, slug]);

  const salvarNome = useCallback(async (deckIds, nomeConsolidado) => {
    const ids = [...new Set(deckIds.filter(Boolean))];
    if (ids.length === 0) return;
    await Promise.all(ids.map((id) => atualizarDeck(id, { nomeConsolidado }, token)));
    addToast(ids.length > 1 ? "Nomes consolidados atualizados." : "Nome consolidado atualizado.", { type: "success" });
    await recarregar();
  }, [addToast, recarregar, token]);

  useEffect(() => {
    let cancelled = false;
    buscarArquetipoMetagame(formato, slug, { dias })
      .then((res) => {
        if (!cancelled) setResult({ key: requestKey, data: res?.data ?? res, erro: "" });
      })
      .catch((err) => {
        logError("Erro ao carregar arquétipo:", err);
        if (!cancelled) {
          const status = err?.response?.status ?? err?.status;
          setResult({
            key: requestKey,
            data: null,
            erro: status === 404
              ? "Arquétipo não encontrado neste período."
              : "Não foi possível carregar o arquétipo.",
          });
        }
      });
    return () => { cancelled = true; };
  }, [formato, slug, dias, requestKey]);

  return (
    <PageShell>
      <MetagameFormatNav
        formato={formato}
        formatos={TOURNAMENT_FORMATS}
        onFormato={(value) => navigate(`/metagame?formato=${encodeURIComponent(value)}&dias=${dias}`)}
      />

      <BackButton onClick={() => navigate(`/metagame?formato=${encodeURIComponent(formato)}&dias=${dias}`)}>
        ← Metagame
      </BackButton>

      {loading && <Spinner text="Carregando arquétipo..." />}
      {!loading && erro && <EmptyState title="Arquétipo" description={erro} />}
      {!loading && data && (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3 mt-4 mb-4">
            <div className="flex gap-4 items-start min-w-0">
            {imagem && (
              <img
                src={imagem}
                alt=""
                className="w-[96px] h-[70px] object-cover object-top rounded-xl border border-[rgba(217,180,255,0.18)] cursor-default"
                onMouseEnter={() => openCardPreview({ nome: data.cartaRepresentativa, imagem })}
                onMouseLeave={closeCardPreview}
              />
            )}
            <div>
              <h1 className="m-0 text-white text-[2rem] font-bold flex items-center gap-2 flex-wrap">
                {data.nome}
                <MetagameManaPips colors={coresPorSlug[data.slug]} />
              </h1>
              <p className="m-0 mt-1 text-[#beafd7]">
                {getTournamentFormatLabel(formato)} · meta {data.metaPct}% ({data.copias}) · winrate {data.winrate}%
                ({data.vitorias}-{data.derrotas}-{data.empates})
              </p>
            </div>
            </div>
            <MetagamePeriodoSelect
              dias={dias}
              diasOpcoes={DIAS_OPCOES}
              onDias={(value) => setSearchParams({ dias: String(value) }, { replace: true })}
            />
          </div>

          {isAdmin && token && (
            <div className="mb-6 rounded-xl border border-[rgba(217,180,255,0.14)] bg-[rgba(167,79,255,0.06)] p-3">
              <MetagameNomeConsolidadoEditor
                key={`arquetipo-${data.nome}`}
                valorInicial={data.nome === "Outros" ? "" : data.nome}
                salvando={salvandoArquivo}
                dica="Altera o nome consolidado de todas as listas deste grupo. O deck passa a aparecer neste (ou em outro) arquétipo em todo o site."
                onSalvar={async (nomeConsolidado) => {
                  const ids = (data.listas || []).map((l) => l.deckId);
                  setSalvandoArquivo(true);
                  try {
                    await salvarNome(ids, nomeConsolidado);
                  } catch (err) {
                    logError("Erro ao atualizar nome consolidado do arquétipo:", err);
                    addToast("Não foi possível atualizar o nome consolidado.", { type: "error" });
                  } finally {
                    setSalvandoArquivo(false);
                  }
                }}
              />
            </div>
          )}

          <MetagameMatchupsSection matchups={data.matchups} formato={formato} dias={dias} />

          <h2 className="m-0 mb-3 text-[#f5edff] text-[1.25rem]">Listas</h2>
          <div className="flex flex-col gap-3 mb-8">
            {listasOrdenadas.length === 0 ? (
              <p className="text-[#beafd7]">Nenhuma lista neste período.</p>
            ) : (
              listasOrdenadas.map((lista) => {
                const chave = chaveMetagameLista(lista);
                return (
                  <MetagameListaCard
                    key={chave}
                    lista={lista}
                    expandida={chave === listaAberta}
                    onToggle={() => setListaAberta((atual) => (atual === chave ? "" : chave))}
                    onCardMouseEnter={openCardPreview}
                    onCardMouseLeave={closeCardPreview}
                    isAdmin={Boolean(isAdmin && token)}
                    salvando={salvandoDeckId === lista.deckId}
                    onSalvarNome={isAdmin && token ? async (nomeConsolidado) => {
                      setSalvandoDeckId(lista.deckId);
                      try {
                        await salvarNome([lista.deckId], nomeConsolidado);
                      } catch (err) {
                        logError("Erro ao atualizar nome consolidado:", err);
                        addToast("Não foi possível atualizar o nome consolidado.", { type: "error" });
                      } finally {
                        setSalvandoDeckId("");
                      }
                    } : undefined}
                  />
                );
              })
            )}
          </div>

          <MetagameResultadosSection resultados={data.resultados} />
        </>
      )}
      <CardPreviewModal card={previewCard} />
    </PageShell>
  );
}
