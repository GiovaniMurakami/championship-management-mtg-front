import { DateRangeFilter } from "../components/ui/DateRangeFilter";
import { useDateRangeParams } from "../hooks/useDateRangeParams";
import { useResolvedMetagameListas } from "../hooks/useResolvedMetagameListas";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { atualizarDeck, buscarArquetipoMetagame } from "../services/backendApi";
import { PageShell } from "../components/ui/PageShell";
import { EmptyState } from "../components/ui/EmptyState";
import { SkeletonMetagameArchetype } from "../components/ui/Skeleton";
import { BackButton } from "../components/ui/BackButton";
import {
  MetagameFormatNav,
  MetagameListaCard,
  MetagameManaPips,
  MetagameMatchupsSection,
  MetagameNomeConsolidadoEditor,
  MetagameCartaRepresentativaEditor,
  MetagamePeriodoSelect,
  MetagameResultadosSection,
} from "../components/metagame";
import { useScryfallArt } from "../hooks/useScryfallArt";
import { coresDoDeck, nomesCartasParaCores } from "../utils/deckColors";
import { useCardPreview } from "../hooks/useCardPreview";
import { CardPreviewModal } from "../components/deck/CardPreviewModal";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import { Button } from "../components/ui/Button";
import { TOURNAMENT_FORMATS, getTournamentFormatLabel } from "../constants/tournament";
import { usePageTitle } from "../hooks/usePageTitle";
import { logError } from "../utils/logger";
import { chaveMetagameLista, ordenarListasPorRecencia } from "../utils/metagameListas";

const DIAS_OPCOES = [7, 14, 30, 90];
const DIAS_PADRAO = 30;
const LIMITE_LISTAS = 10;

function parseDias(valor) {
  const n = Number(valor);
  return DIAS_OPCOES.includes(n) ? n : DIAS_PADRAO;
}

function parsePagina(valor) {
  const n = Number(valor);
  return Number.isInteger(n) && n > 0 ? n : 1;
}

export function MetagameArquetipoPage() {
  const { dataInicio, dataFim, dateQuery, applyDates } = useDateRangeParams();
  const { formato, slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token, isAdmin } = useAuth();
  const { addToast } = useToast();
  const dias = parseDias(searchParams.get("dias"));
  const paginaListas = parsePagina(searchParams.get("paginaListas"));
  const offsetListas = (paginaListas - 1) * LIMITE_LISTAS;
  const requestKey = `${formato}:${slug}:${dias}:${dateQuery}:${paginaListas}`;
  const [result, setResult] = useState({ key: "", data: null, erro: "" });
  const [listasAbertas, setListasAbertas] = useState({ key: "", valores: {} });
  const [salvandoDeckId, setSalvandoDeckId] = useState("");
  const [salvandoArquivo, setSalvandoArquivo] = useState(false);
  const [salvandoCarta, setSalvandoCarta] = useState(false);

  const data = result.key === requestKey ? result.data : null;
  const loading = result.key !== requestKey;
  const erro = loading ? "" : result.erro;
  const listUrl = `/metagame?formato=${encodeURIComponent(formato)}&dias=${dias}${dateQuery}`;

  usePageTitle(data?.nome ? `${data.nome} | Metagame` : "Metagame");
  const { imagem, retry } = useScryfallArt(data?.cartaRepresentativa);
  const cores = data?.cores || coresDoDeck(nomesCartasParaCores(data, formato));
  const { previewCard, openCardPreview, closeCardPreview } = useCardPreview();
  const { listas: listasComCartas } = useResolvedMetagameListas(data?.listas);
  const listasOrdenadas = useMemo(
    () => ordenarListasPorRecencia(listasComCartas, data?.resultados),
    [listasComCartas, data?.resultados],
  );
  const paginacaoListas = data?.paginacaoListas;
  const totalPaginasListas = paginacaoListas?.totalPaginas ?? 1;
  const podeVoltarListas = paginaListas > 1;
  const podeAvancarListas = paginaListas < totalPaginasListas;
  const atualizarPaginaListas = useCallback((pagina) => {
    const next = new URLSearchParams(searchParams);
    if (dias !== DIAS_PADRAO || next.has("dias")) next.set("dias", String(dias));
    if (pagina > 1) next.set("paginaListas", String(pagina));
    else next.delete("paginaListas");
    setSearchParams(next, { replace: true });
  }, [dias, searchParams, setSearchParams]);
  useEffect(() => () => closeCardPreview(), [closeCardPreview]);

  const recarregar = useCallback(async () => {
    try {
      const res = await buscarArquetipoMetagame(formato, slug, { dias, limiteListas: LIMITE_LISTAS, offsetListas, resumo: false, ...(dateQuery ? { dataInicio, dataFim } : {}) });
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
  }, [dias, formato, listUrl, navigate, requestKey, slug, dateQuery, dataInicio, dataFim, offsetListas]);

  const salvarNome = useCallback(async (deckIds, nomeConsolidado) => {
    const ids = [...new Set(deckIds.filter(Boolean))];
    if (ids.length === 0) return;
    await Promise.all(ids.map((id) => atualizarDeck(id, { nomeConsolidado }, token)));
    addToast(ids.length > 1 ? "Nomes consolidados atualizados." : "Nome consolidado atualizado.", { type: "success" });
    await recarregar();
  }, [addToast, recarregar, token]);

  const salvarCarta = useCallback(async (deckIds, cartaRepresentativa) => {
    const ids = [...new Set(deckIds.filter(Boolean))];
    if (ids.length === 0) return;
    await Promise.all(ids.map((id) => atualizarDeck(id, { cartaRepresentativa }, token)));
    addToast(cartaRepresentativa ? "Carta representativa atualizada." : "Carta representativa removida.", { type: "success" });
    await recarregar();
  }, [addToast, recarregar, token]);

  useEffect(() => {
    let cancelled = false;
    buscarArquetipoMetagame(formato, slug, { dias, limiteListas: LIMITE_LISTAS, offsetListas, resumo: false, ...(dateQuery ? { dataInicio, dataFim } : {}) })
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
  }, [formato, slug, dias, requestKey, dateQuery, dataInicio, dataFim, offsetListas]);

  return (
    <PageShell>
      <MetagameFormatNav
        formato={formato}
        formatos={TOURNAMENT_FORMATS}
        onFormato={(value) => navigate(`/metagame?formato=${encodeURIComponent(value)}&dias=${dias}${dateQuery}`)}
      />

      <DateRangeFilter key={`${dataInicio}:${dataFim}`} dataInicio={dataInicio} dataFim={dataFim} onApply={applyDates} />
      <BackButton onClick={() => navigate(`/metagame?formato=${encodeURIComponent(formato)}&dias=${dias}${dateQuery}`)}>
        ← Metagame
      </BackButton>

      {loading && <SkeletonMetagameArchetype />}
      {!loading && erro && <EmptyState title="Arquétipo" description={erro} />}
      {!loading && data && (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3 mt-4 mb-4">
            <div className="flex gap-4 items-start min-w-0">
            {imagem && (
              <img
                src={imagem}
                alt=""
                loading="lazy"
                decoding="async"
                onError={retry}
                className="w-[96px] h-[70px] object-cover object-top rounded-xl border border-line cursor-default"
                onMouseEnter={() => openCardPreview({ nome: data.cartaRepresentativa })}
                onMouseLeave={closeCardPreview}
              />
            )}
            <div>
              <h1 className="m-0 text-white text-[2rem] font-bold flex items-center gap-2 flex-wrap">
                {data.nome}
                <MetagameManaPips colors={cores} />
              </h1>
              <p className="m-0 mt-1 text-text-soft">
                {getTournamentFormatLabel(formato)} · meta {data.metaPct}% ({data.copias}) · winrate {data.winrate}%
                ({data.vitorias}-{data.derrotas}-{data.empates})
              </p>
            </div>
            </div>
            <MetagamePeriodoSelect
              dias={dias}
              diasOpcoes={DIAS_OPCOES}
              onDias={(value) => {
                const next = new URLSearchParams(searchParams);
                next.set("dias", String(value));
                next.delete("paginaListas");
                setSearchParams(next, { replace: true });
              }}
            />
          </div>

          {isAdmin && token && (
            <div className="mb-6 rounded-xl border border-line-soft bg-[rgba(167,79,255,0.06)] p-3 flex flex-col gap-5">
              <MetagameNomeConsolidadoEditor
                key={`arquetipo-${data.nome}`}
                valorInicial={data.nome === "Outros" ? "" : data.nome}
                salvando={salvandoArquivo}
                dica="Altera o nome consolidado de todas as listas deste grupo. O deck passa a aparecer neste (ou em outro) arquétipo em todo o site."
                onSalvar={async (nomeConsolidado) => {
                  const ids = data.deckIds || (data.listas || []).map((l) => l.deckId);
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
              <MetagameCartaRepresentativaEditor
                key={`carta-${data.cartaRepresentativa || "auto"}`}
                valorInicial={data.cartaRepresentativa || ""}
                salvando={salvandoCarta}
                dica="Busca a carta e escolhe a ilustração que aparece na aba de metagame. Limpar volta à carta mais jogada."
                onCardMouseEnter={openCardPreview}
                onCardMouseLeave={closeCardPreview}
                onPreviewDismiss={closeCardPreview}
                onSalvar={async (cartaRepresentativa) => {
                  const ids = data.deckIds || (data.listas || []).map((l) => l.deckId);
                  setSalvandoCarta(true);
                  try {
                    await salvarCarta(ids, cartaRepresentativa);
                  } catch (err) {
                    logError("Erro ao atualizar carta representativa do arquétipo:", err);
                    addToast("Não foi possível atualizar a carta representativa.", { type: "error" });
                  } finally {
                    setSalvandoCarta(false);
                  }
                }}
              />
            </div>
          )}

          <MetagameMatchupsSection matchups={data.matchups} formato={formato} dias={dias} />

          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="m-0 text-text-main text-[1.25rem]">Listas</h2>
            {paginacaoListas && paginacaoListas.total > LIMITE_LISTAS && (
              <div className="flex items-center gap-2 text-[0.85rem] text-text-soft">
                <span>
                  Página {paginacaoListas.pagina} de {paginacaoListas.totalPaginas} · {paginacaoListas.total} listas
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!podeVoltarListas || loading}
                  onClick={() => atualizarPaginaListas(paginaListas - 1)}
                >
                  Anterior
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!podeAvancarListas || loading}
                  onClick={() => atualizarPaginaListas(paginaListas + 1)}
                >
                  Próxima
                </Button>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3 mb-8">
            {listasOrdenadas.length === 0 ? (
              <p className="text-text-soft">Nenhuma lista neste período.</p>
            ) : (
              listasOrdenadas.map((lista, index) => {
                const chave = chaveMetagameLista(lista);
                const expandida = listasAbertas.key === requestKey ? (listasAbertas.valores[chave] ?? index === 0) : index === 0;
                return <MetagameListaCard
                    key={chave}
                    lista={lista}
                    expandida={expandida}
                    onToggle={() => setListasAbertas(prev => ({
                      key: requestKey,
                      valores: { ...(prev.key === requestKey ? prev.valores : {}), [chave]: !expandida },
                    }))}
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
                  />;
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
