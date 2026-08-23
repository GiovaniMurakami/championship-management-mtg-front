import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { PageShell } from "../components/ui/PageShell";
import { Button } from "../components/ui/Button";
import { InlineAlert } from "../components/ui/InlineAlert";
import { Spinner } from "../components/ui/Spinner";
import { useToast } from "../context/ToastContext";
import { RankingBadge } from "../components/ranqueada/RankingBadge";
import { RankProgressAnimation } from "../components/ranqueada/RankProgressAnimation";
import { TOURNAMENT_INPUT_CLASS } from "../styles/uiClasses";
import { subscribeToRankedPlayer, unsubscribeFromRankedPlayer } from "../services/ablyService";
import { abandonarCampanhaRanqueada, buscarRankingRanqueada, buscarStatusRanqueada, confirmarResultadoRanqueada, contestarResultadoRanqueada, entrarFilaRanqueada, listarDecks, obterPresignedUrl, registrarResultadoRanqueada, sairFilaRanqueada, uploadParaS3 } from "../services/backendApi";

const mensagemErro = (error) => error?.message || "Não foi possível concluir a ação.";

function DeckSnapshot({ deck }) {
  if (!deck) return <p className="text-text-muted">Snapshot indisponível para esta partida antiga.</p>;
  const grupo = (titulo, cartas) => cartas?.length > 0 && <div><h4 className="mb-2 text-left text-sm text-brand">{titulo}</h4><div className="grid gap-1 text-left text-sm text-text-soft sm:grid-cols-2">{cartas.map((carta, index) => <span key={`${titulo}-${carta.nome}-${index}`}>{carta.quantidade}x {carta.nome}</span>)}</div></div>;
  return <div className="space-y-3 rounded-xl border border-line bg-surface p-4"><div className="text-left"><strong className="text-white">{deck.nome}</strong><span className="ml-2 text-xs text-text-muted">{deck.formato}</span></div>{grupo("Maindeck", deck.maindeck)}{grupo("Sideboard", deck.sideboard)}{grupo("Commander", deck.commander)}</div>;
}

export function RanqueadaPage() {
  const { usuario, token } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [decks, setDecks] = useState([]);
  const [deckId, setDeckId] = useState("");
  const [status, setStatus] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [observacao, setObservacao] = useState("");
  const [evidencia, setEvidencia] = useState(null);
  const [segundosRestantes, setSegundosRestantes] = useState(0);
  const [mostrarDeck, setMostrarDeck] = useState(false);
  const [mostrarMeuDeck, setMostrarMeuDeck] = useState(false);
  const [mostrarContestacao, setMostrarContestacao] = useState(false);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [progressoRanking, setProgressoRanking] = useState(null);
  const [confirmarAbandono, setConfirmarAbandono] = useState(false);
  const rankingAnteriorRef = useRef(null);
  const deck = useMemo(() => decks.find((item) => item.id === deckId), [decks, deckId]);
  const formato = deck?.formato?.toLowerCase();

  const atualizar = useCallback(async (formatoAtual = formato) => {
    if (!token || !formatoAtual) return;
    const [novoStatus, novoRanking] = await Promise.all([
      buscarStatusRanqueada(formatoAtual, token),
      buscarRankingRanqueada(formatoAtual, token),
    ]);
    const minhaPosicao = novoRanking.find((item) => item.eu);
    setStatus(minhaPosicao && novoStatus.ranking ? { ...novoStatus, ranking: { ...novoStatus.ranking, divisao: minhaPosicao.divisao } } : novoStatus);
    setRanking(novoRanking);
  }, [formato, token]);

  useEffect(() => {
    if (!token || !usuario?.id) { setLoading(false); return; }
    listarDecks(token, { usuarioId: usuario.id, limite: 100 })
      .then((res) => {
        const lista = (Array.isArray(res?.decks) ? res.decks : []).filter((item) => !item.travado && !item.torneioId);
        setDecks(lista);
        setDeckId((atual) => atual || lista[0]?.id || "");
      })
      .catch((e) => addToast(mensagemErro(e), { type: "error" }))
      .finally(() => setLoading(false));
  }, [token, usuario?.id, addToast]);

  useEffect(() => { if (formato) atualizar(formato).catch((e) => addToast(mensagemErro(e), { type: "error" })); }, [formato, atualizar, addToast]);

  useEffect(() => {
    if (!usuario?.id || !formato) return undefined;
    const channel = subscribeToRankedPlayer(usuario.id, () => atualizar(formato).catch(() => {}));
    return () => unsubscribeFromRankedPlayer(channel);
  }, [usuario?.id, formato, atualizar]);

  // Fallback para ambientes sem Ably e recuperação após perda de conexão.
  useEffect(() => {
    if (!status?.naFila || !formato) return undefined;
    const timer = window.setInterval(() => atualizar(formato).catch(() => {}), 15000);
    return () => window.clearInterval(timer);
  }, [status?.naFila, formato, atualizar]);

  const agir = async (acao) => {
    setActing(true);
    try { await acao(); setObservacao(""); await atualizar(); }
    catch (e) { addToast(mensagemErro(e), { type: "error" }); }
    finally { setActing(false); }
  };

  const partida = status?.partida?.status !== "finalizada" ? status?.partida : null;
  const adversario = partida ? (partida.jogador1Id === usuario?.id ? partida.jogador2Nome : partida.jogador1Nome) : null;
  const adversarioId = partida ? (partida.jogador1Id === usuario?.id ? partida.jogador2Id : partida.jogador1Id) : null;
  const adversarioDivisao = partida ? (partida.jogador1Id === usuario?.id ? partida.jogador2Divisao : partida.jogador1Divisao) : "Prata";
  const deckAdversario = partida ? (partida.jogador1Id === usuario?.id ? partida.deckJogador2 : partida.deckJogador1) : null;
  const euReportei = partida?.resultadoReportadoPor === usuario?.id;
  const descricaoResultado = partida?.vencedorId === null ? "Empate" : partida?.vencedorId === usuario?.id ? "Sua vitória" : `Vitória de ${adversario}`;
  const campanha = status?.campanha;

  useEffect(() => {
    const rankingAtual = status?.ranking;
    if (!rankingAtual || !formato) return undefined;
    const anterior = rankingAnteriorRef.current;
    if (anterior?.formato === formato && anterior.rating !== rankingAtual.rating) {
      setProgressoRanking({ ratingAnterior: anterior.rating, novoRating: rankingAtual.rating, divisaoAnterior: anterior.divisao, novaDivisao: rankingAtual.divisao });
    }
    rankingAnteriorRef.current = { formato, rating: rankingAtual.rating, divisao: rankingAtual.divisao };
    return undefined;
  }, [status?.ranking, formato]);

  useEffect(() => {
    if (!progressoRanking) return undefined;
    const timer = window.setTimeout(() => setProgressoRanking(null), 5000);
    return () => window.clearTimeout(timer);
  }, [progressoRanking]);

  useEffect(() => {
    if (campanha?.deckCampanhaId && decks.some((item) => item.id === campanha.deckCampanhaId)) setDeckId(campanha.deckCampanhaId);
  }, [campanha?.deckCampanhaId, decks]);

  useEffect(() => {
    setMostrarContestacao(false);
    setMostrarDeck(false);
    setObservacao("");
    setEvidencia(null);
  }, [partida?.id]);

  const enviarContestacao = (tipoContestacao) => agir(async () => {
    if (tipoContestacao === "deck" && !evidencia) throw new Error("Envie uma foto para contestar o deck do adversário.");
    let evidenciaUrl;
    if (evidencia) {
      const upload = await obterPresignedUrl({ contentType: evidencia.type, tamanhoBytes: evidencia.size }, token);
      await uploadParaS3(upload.uploadUrl, evidencia);
      evidenciaUrl = upload.urlPublica;
    }
    await contestarResultadoRanqueada(partida.id, observacao, evidenciaUrl, tipoContestacao, token);
    setEvidencia(null);
  });

  useEffect(() => {
    if (partida?.status !== "aguardando_confirmacao" || !partida.confirmarAte) { setSegundosRestantes(0); return undefined; }
    const atualizarRelogio = () => {
      const restante = Math.max(0, Math.ceil((new Date(partida.confirmarAte).getTime() - Date.now()) / 1000));
      setSegundosRestantes(restante);
      if (restante === 0) atualizar(formato).catch(() => {});
    };
    atualizarRelogio();
    const timer = window.setInterval(atualizarRelogio, 1000);
    return () => window.clearInterval(timer);
  }, [partida, formato, atualizar]);

  if (loading) return <PageShell><Spinner text="Carregando ranqueada..." /></PageShell>;
  if (!token) return <PageShell><InlineAlert type="info">Entre na sua conta para acessar a fila ranqueada.</InlineAlert></PageShell>;

  const painelPartida = () => {
    if (!partida) return null;
    if (partida.status === "contestada") return <div className="space-y-4 text-center">
      <InlineAlert type="warning">Resultado contestado. O rating está congelado até a análise de um administrador.{partida.observacaoContestacao ? ` Motivo: ${partida.observacaoContestacao}` : ""}</InlineAlert>
    </div>;
    if (partida.status === "aguardando_confirmacao") return <div className="space-y-4 text-center">
      <InlineAlert type="info">Resultado reportado: <strong>{descricaoResultado}</strong>. Validação automática em <strong>{Math.floor(segundosRestantes / 60)}:{String(segundosRestantes % 60).padStart(2, "0")}</strong>.</InlineAlert>
      {euReportei ? <p className="text-text-soft">Aguardando a confirmação de {adversario}.</p> : <>
        <p className="text-text-soft">Confira o resultado e o deck registrado antes de confirmar.</p>
        <Button variant="secondary" block onClick={() => setMostrarDeck((valor) => !valor)}>{mostrarDeck ? "Ocultar deck do oponente" : `Ver deck de ${adversario}`}</Button>
        {mostrarDeck && <DeckSnapshot deck={deckAdversario} />}
        {!mostrarContestacao ? <div className="grid gap-3 sm:grid-cols-2">
          <Button onClick={() => agir(() => confirmarResultadoRanqueada(partida.id, token))} loading={acting}>Confirmar resultado</Button>
          <Button variant="danger" onClick={() => setMostrarContestacao(true)} disabled={acting}>Contestar</Button>
        </div> : <div className="space-y-4 rounded-xl border border-danger/40 bg-danger/5 p-4">
          <div className="text-left"><h4 className="m-0 text-base text-white">Abrir contestação</h4><p className="mb-0 mt-1 text-sm text-text-muted">Informe o problema e escolha o tipo de contestação.</p></div>
          <textarea className={`${TOURNAMENT_INPUT_CLASS} min-h-20 resize-y`} maxLength={500} value={observacao} onChange={(e) => setObservacao(e.target.value)} placeholder="Explique o problema encontrado (opcional)" />
          <label className="block text-left text-sm font-semibold text-text-soft">Foto de evidência <span className="font-normal text-text-muted">(obrigatória para divergência de deck)</span><input className={`${TOURNAMENT_INPUT_CLASS} mt-2`} type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={(e) => setEvidencia(e.target.files?.[0] ?? null)} /></label>
          <div className="grid gap-3 sm:grid-cols-3"><Button variant="secondary" onClick={() => enviarContestacao("resultado")} disabled={acting}>Contestar resultado</Button><Button variant="danger" onClick={() => enviarContestacao("deck")} disabled={acting || !evidencia}>Contestar deck</Button><Button variant="ghost" onClick={() => { setMostrarContestacao(false); setObservacao(""); setEvidencia(null); }} disabled={acting}>Cancelar</Button></div>
        </div>}
      </>}
    </div>;
    return <div className="space-y-4 text-center"><p className="m-0 text-sm font-bold tracking-wider text-emerald-300">PARTIDA ENCONTRADA</p><h3 className="m-0 flex items-center justify-center gap-2 text-2xl text-white">Você vs. {adversario}<RankingBadge divisao={adversarioDivisao} compact /></h3><p className="m-0 text-sm leading-6 text-text-soft">Reporte o resultado da melhor de três. O adversário precisará confirmar.</p><div className="grid gap-3 sm:grid-cols-3"><Button onClick={() => agir(() => registrarResultadoRanqueada(partida.id, usuario.id, token))} loading={acting}>Eu venci</Button><Button variant="secondary" onClick={() => agir(() => registrarResultadoRanqueada(partida.id, null, token))} disabled={acting}>Empate</Button><Button variant="danger" onClick={() => agir(() => registrarResultadoRanqueada(partida.id, adversarioId, token))} disabled={acting}>Eu perdi</Button></div></div>;
  };

  return <PageShell className="max-w-6xl space-y-6 pb-8">
    <RankProgressAnimation key={progressoRanking ? `${progressoRanking.ratingAnterior}-${progressoRanking.novoRating}` : "sem-progresso"} progresso={progressoRanking} onClose={() => setProgressoRanking(null)} />
    <header className="space-y-3 py-2 text-center"><p className="m-0 text-xs font-bold tracking-[0.24em] text-brand">TEMPORADA RANQUEADA</p><h1 className="m-0 font-display text-4xl tracking-wide text-white sm:text-5xl">Rumo ao Fuguete 🚀</h1><p className="mx-auto m-0 max-w-2xl leading-7 text-text-soft">Cada campanha possui 5 partidas, independentemente de vitórias, derrotas ou empates. O pareamento prioriza campanhas e ratings equivalentes.</p><p className="mx-auto m-0 max-w-2xl text-sm leading-6 text-text-muted">Requisito: ter vencido pelo menos uma partida em um evento de torneio.</p></header>
    {status?.punicao?.warnings > 0 && <InlineAlert type={status.punicao.bloqueadoAte && new Date(status.punicao.bloqueadoAte) > new Date() ? "error" : "warning"}>Warnings ranqueados: <strong>{status.punicao.warnings}/3</strong>{status.punicao.bloqueadoAte && new Date(status.punicao.bloqueadoAte) > new Date() ? ` · Fila bloqueada até ${new Date(status.punicao.bloqueadoAte).toLocaleString("pt-BR")}` : ""}</InlineAlert>}
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.8fr)]">
      <section className="space-y-6 rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-6">
        <div className="flex items-center justify-between gap-4"><div><p className="m-0 text-sm text-text-muted">Seu ranking</p><h2 className="m-0 mt-1 flex items-center gap-2 text-3xl text-white">{status?.ranking?.rating ?? 1000}<RankingBadge divisao={status?.ranking?.divisao ?? "Prata"} /></h2></div><div className="min-w-28 rounded-xl border border-line bg-white/[0.03] px-4 py-3 text-center"><p className="m-0 text-xs text-text-muted">Campanha</p><strong className="text-xl text-white">{campanha?.vitoriasCampanha ?? 0}-{campanha?.derrotasCampanha ?? 0}</strong><p className="m-0 text-xs text-text-muted">{campanha?.partidasCampanha ?? 0}/5 partidas</p></div></div>
        <div className="space-y-3">
        <label className="mb-2 block text-sm font-bold text-text-soft" htmlFor="ranked-deck">Deck da campanha</label>
        <select id="ranked-deck" className={TOURNAMENT_INPUT_CLASS} value={deckId} disabled={status?.naFila || Boolean(partida) || Boolean(campanha?.deckCampanhaId)} onChange={(e) => setDeckId(e.target.value)}>{decks.length === 0 && <option value="">Nenhum deck disponível</option>}{decks.map((item) => <option key={item.id} value={item.id}>{item.nome} · {item.formato}</option>)}</select>
        {campanha?.deckCampanhaId && <div className="space-y-3"><p className="m-0 text-xs leading-5 text-text-muted">Este deck fica travado até o fim das 5 partidas da campanha.</p><Button variant="secondary" block onClick={() => setMostrarMeuDeck((valor) => !valor)}>{mostrarMeuDeck ? "Ocultar lista do meu deck" : "Visualizar lista do meu deck"}</Button>{mostrarMeuDeck && <DeckSnapshot deck={campanha.deckCampanha} />}{!confirmarAbandono ? <Button variant="ghost" block disabled={Boolean(partida)} onClick={() => setConfirmarAbandono(true)}>Abandonar campanha</Button> : <div className="space-y-3 rounded-xl border border-danger/40 bg-danger/5 p-4"><p className="m-0 text-sm leading-6 text-text-soft">O progresso desta campanha será zerado e o deck será liberado. Seu rating não será alterado.</p><div className="grid gap-3 sm:grid-cols-2"><Button variant="danger" loading={acting} onClick={() => agir(async () => { const resposta = await abandonarCampanhaRanqueada(formato, token); setConfirmarAbandono(false); addToast(resposta.mensagem, { type: "success" }); })}>Confirmar abandono</Button><Button variant="secondary" disabled={acting} onClick={() => setConfirmarAbandono(false)}>Cancelar</Button></div></div>}</div>}
        </div>
        <div>{partida ? <div className="rounded-xl border border-emerald-400/40 bg-emerald-400/10 p-4 sm:p-5">{painelPartida()}</div> : status?.naFila ? <div className="space-y-4 py-2 text-center"><div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-brand/20 border-t-brand"/><div><h3 className="m-0 text-xl text-white">Buscando oponente...</h3><p className="mb-0 mt-2 text-sm text-text-soft">Fila {status.fila.vitoriasCampanha}-{status.fila.derrotasCampanha} · {status.fila.rating} pontos</p></div><Button variant="danger" onClick={() => agir(() => sairFilaRanqueada(token))} loading={acting}>Sair da fila</Button></div> : <Button block size="lg" disabled={!deckId} loading={acting} onClick={() => agir(() => entrarFilaRanqueada(deckId, token))}>Entrar na fila</Button>}</div>
      </section>
      <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card"><div className="border-b border-line p-5 sm:p-6"><h2 className="m-0 text-xl text-white">Ranking · {deck?.formato ?? "Formato"}</h2><p className="mb-0 mt-1 text-sm text-text-muted">Os 100 melhores jogadores</p></div><div className="max-h-[560px] overflow-y-auto">{ranking.length === 0 ? <p className="m-0 p-6 text-center leading-6 text-text-muted">Ainda não há partidas neste formato.</p> : ranking.map((item) => <div key={item.jogadorId} className={`grid grid-cols-[40px_1fr_auto] items-center gap-4 border-b border-line/60 px-5 py-4 sm:px-6 ${item.eu ? "bg-brand/10" : ""}`}><strong className="text-center text-text-muted">#{item.posicao}</strong><div><div className="flex flex-wrap items-center gap-2"><p className="m-0 font-semibold text-white">{item.jogadorNome}{item.eu ? " (você)" : ""}</p><RankingBadge divisao={item.divisao} compact /></div><p className="mb-0 mt-1 text-xs text-text-muted">{item.vitorias}V · {item.derrotas}D · {item.empates}E</p></div><strong className="text-white">{item.rating}</strong></div>)}</div></section>
    </div>
    <div className="flex justify-start"><Button variant="secondary" onClick={() => navigate("/ranqueada/historico")}>Ver histórico</Button></div>
  </PageShell>;
}
