import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { ajustarResultadoRanqueada, listarContestacoesRanqueada, resolverContestacaoDeckRanqueada } from "../../services/backendApi";
import { subscribeToRankedAdmin, unsubscribeFromRankedAdmin } from "../../services/ablyService";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { FormFeedback } from "../ui/FormFeedback";
import { Spinner } from "../ui/Spinner";

function DeckResumo({ titulo, deck }) {
  if (!deck) return null;
  return <details className="rounded-lg border border-line bg-white/[0.03] p-3"><summary className="cursor-pointer font-semibold text-text-main">{titulo}: {deck.nome}</summary><div className="mt-3 grid gap-3 text-sm text-text-soft"><div><strong className="text-brand">Maindeck</strong><p className="m-0 mt-1">{deck.maindeck?.map((c) => `${c.quantidade}x ${c.nome}`).join(", ") || "—"}</p></div><div><strong className="text-brand">Sideboard</strong><p className="m-0 mt-1">{deck.sideboard?.map((c) => `${c.quantidade}x ${c.nome}`).join(", ") || "—"}</p></div></div></details>;
}

export function ContestacoesAdminPanel() {
  const { token } = useAuth();
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState("");
  const [error, setError] = useState("");
  const carregar = useCallback(async () => { if (!token) return; try { setItens(await listarContestacoesRanqueada(token)); setError(""); } catch (err) { setError(err.message || "Não foi possível carregar as contestações."); } finally { setLoading(false); } }, [token]);
  useEffect(() => { carregar(); }, [carregar]);
  useEffect(() => { const channel = subscribeToRankedAdmin(carregar); return () => unsubscribeFromRankedAdmin(channel); }, [carregar]);
  const resolver = async (id, acao) => { setActingId(id); setError(""); try { await acao(); await carregar(); } catch (err) { setError(err.message || "Não foi possível resolver a contestação."); } finally { setActingId(""); } };
  if (loading) return <Spinner text="Carregando contestações..." />;
  return <section><div className="mb-5"><h2 className="m-0 text-2xl text-text-main">Contestações ranqueadas</h2><p className="m-0 mt-1 text-sm text-text-muted">Analise a foto, os decks e aplique a decisão correta.</p></div><FormFeedback message={error} variant="error" className="mb-4" />{itens.length === 0 ? <EmptyState icon="✓" title="Nenhuma contestação pendente" description="Novas contestações aparecerão aqui automaticamente." /> : <div className="grid gap-4">{itens.map((item) => { const ehDeck = item.tipoContestacao === "deck"; return <article key={item.id} className="rounded-xl border border-line bg-[#0b0717] p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><span className={`inline-flex rounded-full border px-2 py-1 text-xs font-bold ${ehDeck ? "border-danger/50 bg-danger/10 text-[#fca5a5]" : "border-brand/40 bg-brand/10 text-brand"}`}>{ehDeck ? "DECK DIVERGENTE" : "RESULTADO"}</span><h3 className="mb-1 mt-3 text-xl text-white">{item.jogador1Nome} vs. {item.jogador2Nome}</h3><p className="m-0 text-sm text-text-muted">{item.formato} · partida #{item.id.slice(0, 8)}</p></div>{item.evidenciaUrl && <a href={item.evidenciaUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-brand/40 bg-brand/10 px-3 py-2 text-sm font-bold text-brand no-underline">Abrir foto</a>}</div><p className="my-4 rounded-lg border border-line bg-white/[0.03] p-3 text-sm text-text-soft"><strong>Relato:</strong> {item.observacaoContestacao || "Sem observação."}</p><div className="mb-4 grid gap-3 md:grid-cols-2"><DeckResumo titulo={item.jogador1Nome} deck={item.deckJogador1} /><DeckResumo titulo={item.jogador2Nome} deck={item.deckJogador2} /></div>{ehDeck ? <div className="grid gap-2 sm:grid-cols-2"><Button variant="danger" loading={actingId === item.id} onClick={() => resolver(item.id, () => resolverContestacaoDeckRanqueada(item.id, true, token))}>Confirmar fraude e aplicar warning</Button><Button variant="secondary" disabled={actingId === item.id} onClick={() => resolver(item.id, () => resolverContestacaoDeckRanqueada(item.id, false, token))}>Rejeitar contestação</Button></div> : <div className="grid gap-2 sm:grid-cols-3"><Button loading={actingId === item.id} onClick={() => resolver(item.id, () => ajustarResultadoRanqueada(item.id, item.jogador1Id, token))}>{item.jogador1Nome} venceu</Button><Button variant="secondary" disabled={actingId === item.id} onClick={() => resolver(item.id, () => ajustarResultadoRanqueada(item.id, null, token))}>Empate</Button><Button variant="danger" disabled={actingId === item.id} onClick={() => resolver(item.id, () => ajustarResultadoRanqueada(item.id, item.jogador2Id, token))}>{item.jogador2Nome} venceu</Button></div>}</article>; })}</div>}</section>;
}
