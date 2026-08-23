import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BackButton } from "../components/ui/BackButton";
import { EmptyState } from "../components/ui/EmptyState";
import { PageShell } from "../components/ui/PageShell";
import { Spinner } from "../components/ui/Spinner";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../hooks/useAuth";
import { buscarHistoricoRanqueada } from "../services/backendApi";
import { TOURNAMENT_INPUT_CLASS } from "../styles/uiClasses";

const rotuloStatus = { pendente: "Em andamento", aguardando_confirmacao: "Aguardando confirmação", contestada: "Contestada", finalizada: "Finalizada" };
const estiloResultado = { vitoria: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300", derrota: "border-danger/40 bg-danger/10 text-red-300", empate: "border-line bg-white/[0.04] text-text-soft" };

function ListaDeck({ deck }) {
  if (!deck) return null;
  const grupo = (titulo, cartas) => cartas?.length > 0 && <div><strong className="text-sm text-brand">{titulo}</strong><p className="mb-0 mt-1 text-sm leading-6 text-text-soft">{cartas.map((c) => `${c.quantidade}x ${c.nome}`).join(", ")}</p></div>;
  return <details className="mt-4 rounded-lg border border-line bg-white/[0.03] p-3"><summary className="cursor-pointer font-semibold text-text-main">Ver lista de {deck.nome}</summary><div className="mt-3 space-y-3">{grupo("Maindeck", deck.maindeck)}{grupo("Sideboard", deck.sideboard)}{grupo("Commander", deck.commander)}</div></details>;
}

export function RanqueadaHistoricoPage() {
  const { token } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [partidas, setPartidas] = useState([]);
  const [formato, setFormato] = useState("todos");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    buscarHistoricoRanqueada(token).then(setPartidas).catch((error) => addToast(error.message || "Não foi possível carregar o histórico.", { type: "error" })).finally(() => setLoading(false));
  }, [token, addToast]);

  const formatos = useMemo(() => [...new Set(partidas.map((p) => p.formato))].sort(), [partidas]);
  const filtradas = useMemo(() => formato === "todos" ? partidas : partidas.filter((p) => p.formato === formato), [partidas, formato]);

  if (loading) return <PageShell><Spinner text="Carregando histórico..." /></PageShell>;

  return <PageShell className="max-w-4xl space-y-6 pb-8">
    <BackButton onClick={() => navigate("/ranqueada")}>Voltar para ranqueada</BackButton>
    <header><p className="m-0 text-xs font-bold tracking-[0.18em] text-brand">RANQUEADA</p><h1 className="mb-0 mt-1 font-display text-4xl tracking-wide text-white">Histórico de partidas</h1><p className="mb-0 mt-2 text-sm leading-6 text-text-muted">Suas 100 partidas mais recentes, incluindo resultados em análise.</p></header>
    {formatos.length > 1 && <div className="max-w-xs"><label className="mb-2 block text-sm font-bold text-text-soft" htmlFor="historico-formato">Formato</label><select id="historico-formato" className={TOURNAMENT_INPUT_CLASS} value={formato} onChange={(e) => setFormato(e.target.value)}><option value="todos">Todos os formatos</option>{formatos.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>}
    {filtradas.length === 0 ? <EmptyState title="Nenhuma partida no histórico" description="As partidas ranqueadas aparecerão aqui assim que forem encontradas." /> : <div className="space-y-4">{filtradas.map((partida) => <article key={partida.id} className="rounded-xl border border-line bg-surface p-5 shadow-card sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="m-0 text-xs font-bold uppercase tracking-wider text-brand">{partida.formato}</p><h2 className="mb-0 mt-1 text-xl text-white">vs. {partida.oponenteNome}</h2><p className="mb-0 mt-2 text-sm text-text-muted">{new Date(partida.criadoEm).toLocaleString("pt-BR")} · {rotuloStatus[partida.status] ?? partida.status}</p></div>{partida.resultado ? <span className={`rounded-full border px-3 py-1 text-sm font-bold ${estiloResultado[partida.resultado]}`}>{partida.resultado === "vitoria" ? "Vitória" : partida.resultado === "derrota" ? "Derrota" : "Empate"}{partida.meuDelta !== null ? ` · ${partida.meuDelta > 0 ? "+" : ""}${partida.meuDelta}` : ""}</span> : <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-sm font-bold text-amber-300">{rotuloStatus[partida.status] ?? "Pendente"}</span>}</div>{partida.status === "contestada" && <p className="mb-0 mt-4 rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-200">Resultado congelado aguardando decisão administrativa.</p>}<ListaDeck deck={partida.meuDeck} /></article>)}</div>}
  </PageShell>;
}
