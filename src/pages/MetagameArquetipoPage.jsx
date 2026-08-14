import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { atualizarDeck, buscarArquetipoMetagame } from "../services/backendApi";
import { PageShell } from "../components/ui/PageShell";
import { EmptyState } from "../components/ui/EmptyState";
import { Spinner } from "../components/ui/Spinner";
import { BackButton } from "../components/ui/BackButton";
import {
  MetagameDeckSection,
  MetagameFormatNav,
  MetagameManaPips,
  MetagameNomeConsolidadoEditor,
  MetagamePeriodoSelect,
} from "../components/metagame";
import { useScryfallArt } from "../hooks/useScryfallArt";
import { useMetagameDeckColors } from "../hooks/useMetagameDeckColors";
import { useCardPreview } from "../hooks/useCardPreview";
import { CardPreviewModal } from "../components/deck/CardPreviewModal";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import { TOURNAMENT_FORMATS, getTournamentFormatLabel } from "../constants/tournament";
import { usePageTitle } from "../hooks/usePageTitle";
import { logError } from "../utils/logger";

const DIAS_OPCOES = [7, 14, 30, 90, 365];
const DIAS_PADRAO = 30;

function parseDias(valor) {
  const n = Number(valor);
  return DIAS_OPCOES.includes(n) ? n : DIAS_PADRAO;
}

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("pt-BR");
  } catch {
    return "—";
  }
}

function valorMatchup(matchup, key) {
  if (key === "nome") return (matchup.nome || "").toLocaleLowerCase("pt-BR");
  if (key === "partidas") return Number(matchup.partidas) || 0;
  if (key === "vde") {
    return (Number(matchup.vitorias) || 0) * 10000
      - (Number(matchup.derrotas) || 0) * 100
      + (Number(matchup.empates) || 0);
  }
  return Number(matchup.winrate) || 0;
}

function ordenarMatchups(matchups, sort) {
  const sinal = sort.dir === "asc" ? 1 : -1;
  return [...matchups].sort((a, b) => {
    const va = valorMatchup(a, sort.key);
    const vb = valorMatchup(b, sort.key);
    if (typeof va === "string") {
      const cmp = va.localeCompare(vb, "pt-BR");
      return (cmp === 0 ? a.nome.localeCompare(b.nome, "pt-BR") : cmp) * sinal;
    }
    if (va !== vb) return (va - vb) * sinal;
    return a.nome.localeCompare(b.nome, "pt-BR");
  });
}

function MatchupSortHeader({ label, column, sort, onSort }) {
  const ativo = sort.key === column;
  return (
    <th
      className="px-3 py-2"
      aria-sort={ativo ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
    >
      <button
        type="button"
        className="inline-flex items-center gap-1 border-none bg-transparent p-0 cursor-pointer uppercase tracking-wide text-[0.75rem] font-semibold text-inherit hover:text-[#d9b4ff]"
        onClick={() => onSort(column)}
      >
        {label}
        <span className="inline-flex flex-col gap-px" aria-hidden="true">
          <span
            className={`w-0 h-0 border-x-[3px] border-x-transparent border-b-[4px] ${
              ativo && sort.dir === "asc" ? "border-b-[#c795ff]" : "border-b-[rgba(190,175,215,0.35)]"
            }`}
          />
          <span
            className={`w-0 h-0 border-x-[3px] border-x-transparent border-t-[4px] ${
              ativo && sort.dir === "desc" ? "border-t-[#c795ff]" : "border-t-[rgba(190,175,215,0.35)]"
            }`}
          />
        </span>
      </button>
    </th>
  );
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
  const [sortMatchup, setSortMatchup] = useState({ key: "partidas", dir: "desc" });

  const data = result.key === requestKey ? result.data : null;
  const loading = result.key !== requestKey;
  const erro = loading ? "" : result.erro;
  const listUrl = `/metagame?formato=${encodeURIComponent(formato)}&dias=${dias}`;

  usePageTitle(data?.nome ? `${data.nome} | Metagame` : "Metagame");
  const { imagem } = useScryfallArt(data?.cartaRepresentativa);
  const arquetiposCores = useMemo(() => (data ? [data] : []), [data]);
  const coresPorSlug = useMetagameDeckColors(arquetiposCores, formato);
  const { previewCard, openCardPreview, closeCardPreview } = useCardPreview();

  useEffect(() => () => closeCardPreview(), [closeCardPreview]);

  const matchupsOrdenados = useMemo(
    () => ordenarMatchups(data?.matchups || [], sortMatchup),
    [data?.matchups, sortMatchup],
  );

  const ordenarColunaMatchup = useCallback((column) => {
    setSortMatchup((atual) => {
      if (atual.key === column) {
        return { key: column, dir: atual.dir === "desc" ? "asc" : "desc" };
      }
      return { key: column, dir: column === "nome" ? "asc" : "desc" };
    });
  }, []);

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

          <h2 className="m-0 mb-3 text-[#f5edff] text-[1.25rem]">Lista típica</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <MetagameDeckSection
              titulo="Maindeck"
              cartas={data.listaTipica?.maindeck}
              onCardMouseEnter={openCardPreview}
              onCardMouseLeave={closeCardPreview}
            />
            <MetagameDeckSection
              titulo="Sideboard"
              cartas={data.listaTipica?.sideboard}
              onCardMouseEnter={openCardPreview}
              onCardMouseLeave={closeCardPreview}
            />
            <MetagameDeckSection
              titulo="Commander"
              cartas={data.listaTipica?.commander}
              onCardMouseEnter={openCardPreview}
              onCardMouseLeave={closeCardPreview}
            />
          </div>

          <h2 className="m-0 mb-3 text-[#f5edff] text-[1.25rem]">Matchups</h2>
          {(!data.matchups || data.matchups.length === 0) ? (
            <p className="text-[#beafd7] mb-8">Ainda não há confrontos registrados neste período.</p>
          ) : (
            <div className="overflow-x-auto mb-8 rounded-xl border border-[rgba(217,180,255,0.12)]">
              <table className="w-full text-left text-[0.9rem] border-collapse">
                <thead className="text-[#8f82ad] text-[0.75rem] uppercase">
                  <tr>
                    <MatchupSortHeader label="Arquétipo" column="nome" sort={sortMatchup} onSort={ordenarColunaMatchup} />
                    <MatchupSortHeader label="Partidas" column="partidas" sort={sortMatchup} onSort={ordenarColunaMatchup} />
                    <MatchupSortHeader label="V-D-E" column="vde" sort={sortMatchup} onSort={ordenarColunaMatchup} />
                    <MatchupSortHeader label="Winrate" column="winrate" sort={sortMatchup} onSort={ordenarColunaMatchup} />
                  </tr>
                </thead>
                <tbody>
                  {matchupsOrdenados.map((m) => (
                    <tr key={m.slug} className="border-t border-[rgba(217,180,255,0.1)]">
                      <td className="px-3 py-2">
                        <Link
                          className="text-[#d9b4ff] font-semibold"
                          to={`/metagame/${encodeURIComponent(formato)}/${encodeURIComponent(m.slug)}?dias=${dias}`}
                        >
                          {m.nome}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-[#f5edff]">{m.partidas}</td>
                      <td className="px-3 py-2 text-[#beafd7]">{m.vitorias}-{m.derrotas}-{m.empates}</td>
                      <td className="px-3 py-2 text-[#f5edff] font-bold">{m.winrate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <h2 className="m-0 mb-3 text-[#f5edff] text-[1.25rem]">Listas</h2>
          <div className="flex flex-col gap-3 mb-8">
            {(data.listas || []).map((lista) => (
              <div key={`${lista.deckId}-${lista.torneioId}`} className="rounded-xl border border-[rgba(217,180,255,0.12)] p-3 bg-white/[0.02]">
                <div className="flex flex-wrap justify-between gap-2 mb-2">
                  <span className="text-[#f5edff] font-semibold">{lista.nome}</span>
                  <span className="text-[#beafd7] text-[0.85rem]">
                    {lista.usuario?.nome} · {lista.torneioNome}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Link className="text-[0.85rem] text-[#d9b4ff]" to={`/editar-deck/${lista.deckId}?modo=visualizar`}>
                    Ver lista
                  </Link>
                </div>
                {isAdmin && token && (
                  <MetagameNomeConsolidadoEditor
                    key={`${lista.deckId}-${lista.nomeConsolidado || ""}`}
                    valorInicial={lista.nomeConsolidado || ""}
                    salvando={salvandoDeckId === lista.deckId}
                    onSalvar={async (nomeConsolidado) => {
                      setSalvandoDeckId(lista.deckId);
                      try {
                        await salvarNome([lista.deckId], nomeConsolidado);
                      } catch (err) {
                        logError("Erro ao atualizar nome consolidado:", err);
                        addToast("Não foi possível atualizar o nome consolidado.", { type: "error" });
                      } finally {
                        setSalvandoDeckId("");
                      }
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          <h2 className="m-0 mb-3 text-[#f5edff] text-[1.25rem]">Resultados em torneios</h2>
          {(!data.resultados || data.resultados.length === 0) ? (
            <p className="text-[#beafd7]">Sem resultados neste período.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[rgba(217,180,255,0.12)]">
              <table className="w-full text-left text-[0.9rem] border-collapse">
                <thead className="text-[#8f82ad] text-[0.75rem] uppercase">
                  <tr>
                    <th className="px-3 py-2">Data</th>
                    <th className="px-3 py-2">Torneio</th>
                    <th className="px-3 py-2">Jogador</th>
                    <th className="px-3 py-2">Colocação</th>
                    <th className="px-3 py-2">Recorde</th>
                  </tr>
                </thead>
                <tbody>
                  {data.resultados.map((r) => (
                    <tr key={`${r.torneioId}-${r.usuario?.id}-${r.deckId}`} className="border-t border-[rgba(217,180,255,0.1)]">
                      <td className="px-3 py-2 text-[#beafd7]">{formatDate(r.horario)}</td>
                      <td className="px-3 py-2">
                        <Link className="text-[#d9b4ff]" to={`/torneios/${r.torneioId}`}>{r.torneioNome}</Link>
                      </td>
                      <td className="px-3 py-2 text-[#f5edff]">{r.usuario?.nome}</td>
                      <td className="px-3 py-2 text-[#f5edff]">{r.colocacao}º</td>
                      <td className="px-3 py-2 text-[#beafd7]">{r.vitorias}-{r.derrotas}-{r.empates}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
      <CardPreviewModal card={previewCard} />
    </PageShell>
  );
}
