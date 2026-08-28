import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { usePageTitle } from "../hooks/usePageTitle";
import { useToast } from "../context/ToastContext";
import { PAGE_TITLES } from "../constants/pageTitles";
import { comentarPost, criarPost, curtirPost, descurtirPost, excluirPost, listarPosts } from "../services/backendApi";
import { uploadBannerImage, validateBannerImageFile } from "../utils/bannerUpload";
import { formatApiErrorMessage } from "../utils/apiError";
import { BTN_DANGER, BTN_PRIMARY, BTN_SECONDARY, FORM_TEXTAREA_CLASS } from "../styles/uiClasses";
import { EmptyState } from "../components/ui/EmptyState";
import { SkeletonPostFeed } from "../components/ui/Skeleton";
import { PageShell } from "../components/ui/PageShell";
import { DeleteConfirmModal } from "../components/ui/DeleteConfirmModal";
import { useNavigate } from "react-router-dom";

const formatarData = (data) => new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(data));
const COMENTARIOS_INICIAIS = 3;
const COMENTARIOS_POR_VEZ = 5;

function useSwipeCarrossel(total, setIndice, setDirecao) {
  const inicioToque = useRef(null);
  const bloquearClique = useRef(false);
  const onTouchStart = (event) => {
    const toque = event.touches[0];
    inicioToque.current = toque ? { x: toque.clientX, y: toque.clientY } : null;
    bloquearClique.current = false;
  };
  const onTouchEnd = (event) => {
    const inicio = inicioToque.current; const toque = event.changedTouches[0];
    inicioToque.current = null;
    if (!inicio || !toque || total < 2) return;
    const deltaX = toque.clientX - inicio.x; const deltaY = toque.clientY - inicio.y;
    if (Math.abs(deltaX) < 45 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
    bloquearClique.current = true;
    setDirecao(deltaX < 0 ? "esquerda" : "direita");
    setIndice((indice) => deltaX < 0 ? (indice + 1) % total : (indice - 1 + total) % total);
  };
  const onClickCapture = (event) => {
    if (!bloquearClique.current) return;
    bloquearClique.current = false;
    event.preventDefault(); event.stopPropagation();
  };
  return { onTouchStart, onTouchEnd, onClickCapture };
}

function Avatar({ autor, size = "h-10 w-10" }) {
  const { usuario } = useAuth();
  const [urlComFalha, setUrlComFalha] = useState("");
  const [urlCarregada, setUrlCarregada] = useState("");
  const inicial = autor?.nome?.trim()?.[0]?.toUpperCase() || "U";
  const mesmoUsuario = String(autor?.id || "") === String(usuario?.id || "");
  const fotoUrl = autor?.fotoUrl || autor?.avatarUrl || autor?.imagemUrl || (mesmoUsuario ? usuario?.fotoUrl : "");
  return fotoUrl && fotoUrl !== urlComFalha
    ? <span className={`${size} relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-soft`}>
        {urlCarregada !== fotoUrl && <span className="absolute h-4 w-4 animate-spin rounded-full border-2 border-brand/25 border-t-brand" role="status" aria-label={`Carregando foto de ${autor?.nome || "usuário"}`} />}
        <img src={fotoUrl} alt={`Foto de ${autor?.nome || "usuário"}`} onLoad={() => setUrlCarregada(fotoUrl)} onError={() => setUrlComFalha(fotoUrl)} className={`h-full w-full object-cover transition-opacity duration-200 ${urlCarregada === fotoUrl ? "opacity-100" : "opacity-0"}`} />
      </span>
    : <span className={`${size} inline-flex shrink-0 items-center justify-center rounded-full bg-brand-soft font-bold text-brand`}>{inicial}</span>;
}

function Galeria({ imagens, legenda, onAbrir }) {
  const [indice, setIndice] = useState(0);
  const [proporcao, setProporcao] = useState(1);
  const [direcao, setDirecao] = useState(null);
  const swipe = useSwipeCarrossel(imagens.length, setIndice, setDirecao);
  const irAnterior = () => { setDirecao("direita"); setIndice((i) => (i - 1 + imagens.length) % imagens.length); };
  const irProxima = () => { setDirecao("esquerda"); setIndice((i) => (i + 1) % imagens.length); };
  return <div aria-label="Carrossel de fotos do post" className="relative overflow-hidden bg-black/20 transition-[aspect-ratio] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] [touch-action:pan-y] motion-reduce:transition-none" style={{ aspectRatio: proporcao }} {...swipe}>
    <button type="button" onClick={onAbrir} className="block h-full w-full cursor-zoom-in border-0 bg-transparent p-0"><img key={`${indice}-${imagens[indice]}`} src={imagens[indice]} alt={legenda || `Imagem ${indice + 1} do post`} onLoad={(event) => { const imagem = event.currentTarget; if (imagem.naturalWidth && imagem.naturalHeight) setProporcao(imagem.naturalWidth / imagem.naturalHeight); }} className={`block h-full w-full object-contain motion-reduce:animate-none ${direcao === "esquerda" ? "animate-[carousel-enter-right_360ms_cubic-bezier(0.22,1,0.36,1)]" : direcao === "direita" ? "animate-[carousel-enter-left_360ms_cubic-bezier(0.22,1,0.36,1)]" : ""}`} /></button>
    {imagens.length > 1 && <>
      <button type="button" aria-label="Imagem anterior" onClick={irAnterior} className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/55 text-2xl text-white backdrop-blur hover:bg-black/75 max-sm:hidden">‹</button>
      <button type="button" aria-label="Próxima imagem" onClick={irProxima} className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/55 text-2xl text-white backdrop-blur hover:bg-black/75 max-sm:hidden">›</button>
      <span className="absolute right-3 top-3 rounded-full bg-black/65 px-2.5 py-1 text-xs font-semibold text-white">{indice + 1}/{imagens.length}</span>
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">{imagens.map((_, i) => <button type="button" aria-label={`Mostrar imagem ${i + 1}`} onClick={() => { setDirecao(i > indice ? "esquerda" : "direita"); setIndice(i); }} key={i} className={`h-1.5 w-1.5 rounded-full border-0 p-0 transition-transform ${i === indice ? "scale-125 bg-white" : "bg-white/40"}`} />)}</div>
    </>}
  </div>;
}

function CriadorPost({ token, onCriado }) {
  const { addToast } = useToast();
  const inputRef = useRef(null);
  const [legenda, setLegenda] = useState("");
  const [arquivos, setArquivos] = useState([]);
  const [previewIndice, setPreviewIndice] = useState(0);
  const [previewProporcao, setPreviewProporcao] = useState(1);
  const [previewDirecao, setPreviewDirecao] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const previews = useMemo(() => arquivos.map((file) => ({ file, url: URL.createObjectURL(file) })), [arquivos]);
  const swipePreview = useSwipeCarrossel(previews.length, setPreviewIndice, setPreviewDirecao);
  useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p.url)), [previews]);
  const selecionar = (event) => {
    const selecionados = Array.from(event.target.files || []);
    const erro = selecionados.map(validateBannerImageFile).find(Boolean);
    if (erro) { addToast(erro.userMessage, { type: "error" }); return; }
    setArquivos(selecionados);
    setPreviewIndice(0);
  };
  const removerPreview = () => {
    setArquivos((atuais) => atuais.filter((_, indice) => indice !== previewIndice));
    setPreviewIndice((indice) => Math.max(0, Math.min(indice, arquivos.length - 2)));
  };
  const publicar = async () => {
    if (!arquivos.length || enviando) return;
    setEnviando(true);
    try {
      const imagens = [];
      for (const arquivo of arquivos) imagens.push(await uploadBannerImage(arquivo, token, undefined, { optimize: false }));
      await criarPost({ legenda: legenda.trim(), imagens }, token);
      setLegenda(""); setArquivos([]); setPreviewIndice(0); if (inputRef.current) inputRef.current.value = "";
      addToast("Post publicado.", { type: "success" }); await onCriado();
    } catch (error) { addToast(error.userMessage || formatApiErrorMessage(error?.response?.data, "Não foi possível publicar o post."), { type: "error" }); }
    finally { setEnviando(false); }
  };
  return <section className="mb-7 overflow-hidden rounded-2xl border border-line-soft bg-surface shadow-card max-sm:rounded-xl"><div className="p-5 max-sm:p-3">
    <div className="mb-4 flex items-center justify-between gap-3"><div><h2 className="m-0 text-lg font-bold">Nova publicação</h2><p className="m-0 mt-1 text-sm text-text-muted">Compartilhe quantas fotos quiser com a comunidade.</p></div><span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand">ADMIN</span></div>
    <textarea className={FORM_TEXTAREA_CLASS} maxLength={2200} value={legenda} onChange={(e) => setLegenda(e.target.value)} placeholder="Escreva uma legenda..." aria-label="Legenda do post" />
    <div className="mt-1 text-right text-xs text-text-muted">{legenda.length}/2200</div>
    {previews.length > 0 && <div className="mt-4 overflow-hidden rounded-xl border border-line-soft bg-black/20">
      <div aria-label="Prévia do carrossel de fotos" className="relative overflow-hidden transition-[aspect-ratio] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] [touch-action:pan-y] motion-reduce:transition-none" style={{ aspectRatio: previewProporcao }} {...swipePreview}>
        <img key={`${previewIndice}-${previews[previewIndice]?.url}`} src={previews[previewIndice]?.url} alt={`Prévia da foto ${previewIndice + 1}`} onLoad={(event) => { const imagem = event.currentTarget; if (imagem.naturalWidth && imagem.naturalHeight) setPreviewProporcao(imagem.naturalWidth / imagem.naturalHeight); }} className={`block h-full w-full object-contain motion-reduce:animate-none ${previewDirecao === "esquerda" ? "animate-[carousel-enter-right_360ms_cubic-bezier(0.22,1,0.36,1)]" : previewDirecao === "direita" ? "animate-[carousel-enter-left_360ms_cubic-bezier(0.22,1,0.36,1)]" : ""}`} />
        {previews.length > 1 && <>
          <button type="button" aria-label="Foto anterior da prévia" onClick={() => { setPreviewDirecao("direita"); setPreviewIndice((indice) => (indice - 1 + previews.length) % previews.length); }} className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 text-2xl text-white backdrop-blur hover:bg-black/80 max-sm:hidden">‹</button>
          <button type="button" aria-label="Próxima foto da prévia" onClick={() => { setPreviewDirecao("esquerda"); setPreviewIndice((indice) => (indice + 1) % previews.length); }} className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 text-2xl text-white backdrop-blur hover:bg-black/80 max-sm:hidden">›</button>
        </>}
        <span className="absolute right-3 top-3 rounded-full bg-black/65 px-2.5 py-1 text-xs font-semibold text-white">{previewIndice + 1}/{previews.length}</span>
        <button type="button" onClick={removerPreview} className="absolute left-3 top-3 min-h-10 rounded-xl border border-white/20 bg-black/65 px-3 text-xs font-semibold text-white backdrop-blur hover:bg-danger">Remover</button>
        {previews.length > 1 && <div className="absolute bottom-3 left-1/2 flex max-w-[80%] -translate-x-1/2 gap-1.5 overflow-hidden">{previews.map((p, indice) => <button key={`${p.file.name}-${p.file.lastModified}`} type="button" aria-label={`Mostrar foto ${indice + 1}`} onClick={() => { setPreviewDirecao(indice > previewIndice ? "esquerda" : "direita"); setPreviewIndice(indice); }} className={`h-2 w-2 shrink-0 rounded-full border-0 p-0 transition-transform ${indice === previewIndice ? "scale-125 bg-white" : "bg-white/40"}`} />)}</div>}
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-line-soft bg-surface-soft px-4 py-3"><span className="min-w-0 truncate text-sm text-text-soft">{previews[previewIndice]?.file.name}</span><span className="shrink-0 text-xs font-semibold text-text-muted">Prévia do carrossel</span></div>
    </div>}
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><label className="inline-flex min-h-11 cursor-pointer items-center rounded-xl border border-line bg-surface-soft px-4 py-2 font-semibold hover:border-line-strong"><input ref={inputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" multiple className="sr-only" onChange={selecionar} />Selecionar fotos</label><button type="button" className={BTN_PRIMARY} disabled={!arquivos.length || enviando} onClick={publicar}>{enviando ? `Enviando ${arquivos.length} foto(s)...` : "Publicar"}</button></div>
  </div></section>;
}

function CardPost({ post, token, isAdmin, requireAuth, onAtualizar }) {
  const navigate = useNavigate();
  const { addToast } = useToast(); const [texto, setTexto] = useState(""); const [ocupado, setOcupado] = useState(false);
  const [limiteComentarios, setLimiteComentarios] = useState(COMENTARIOS_INICIAIS);
  const [modalExcluirAberta, setModalExcluirAberta] = useState(false); const [excluindo, setExcluindo] = useState(false); const [erroExclusao, setErroExclusao] = useState("");
  const comentarios = post.comentarios || [];
  const comentariosVisiveis = comentarios.slice(0, limiteComentarios);
  const comentariosRestantes = Math.max(0, comentarios.length - comentariosVisiveis.length);
  const agirAutenticado = (acao) => token ? acao(token) : requireAuth(({ token: novoToken }) => acao(novoToken));
  const alternarCurtida = () => agirAutenticado(async (tokenAtual) => { if (ocupado) return; setOcupado(true); try { post.curtidoPorMim ? await descurtirPost(post.id, tokenAtual) : await curtirPost(post.id, tokenAtual); await onAtualizar(); } catch (error) { addToast(formatApiErrorMessage(error?.response?.data, "Não foi possível atualizar a curtida."), { type: "error" }); } finally { setOcupado(false); } });
  const enviarComentario = (event) => { event.preventDefault(); agirAutenticado(async (tokenAtual) => { if (!texto.trim() || ocupado) return; setOcupado(true); try { await comentarPost(post.id, texto.trim(), tokenAtual); setTexto(""); await onAtualizar(); } catch (error) { addToast(formatApiErrorMessage(error?.response?.data, "Não foi possível comentar."), { type: "error" }); } finally { setOcupado(false); } }); };
  const remover = async (_confirmacao, fecharModal) => { setExcluindo(true); setErroExclusao(""); try { await excluirPost(post.id, token); fecharModal(); addToast("Post excluído.", { type: "success" }); await onAtualizar(); } catch (error) { setErroExclusao(formatApiErrorMessage(error?.response?.data, "Não foi possível excluir o post.")); } finally { setExcluindo(false); } };
  return <><article className="overflow-hidden rounded-2xl border border-line-soft bg-surface shadow-card max-sm:rounded-xl">
    <header className="flex items-center gap-3 p-4 max-sm:p-3"><Avatar autor={post.autor} /><div className="min-w-0 flex-1"><p className="m-0 truncate font-semibold">{post.autor?.nome}</p><time className="text-xs text-text-muted">{formatarData(post.criadoEm)}</time></div>{isAdmin && <div className="flex shrink-0 gap-2"><button type="button" onClick={() => navigate(`/comunidade/${post.id}?editar=1`)} className={`${BTN_SECONDARY} px-3 py-2 text-sm`}>Editar</button><button type="button" onClick={() => setModalExcluirAberta(true)} className={`${BTN_DANGER} px-3 py-2 text-sm`}>Excluir</button></div>}</header>
    <Galeria imagens={post.imagens} legenda={post.legenda} onAbrir={() => navigate(`/comunidade/${post.id}`)} />
    {post.totalImagens > post.imagens.length && <button type="button" onClick={() => navigate(`/comunidade/${post.id}`)} className="w-full border-x-0 border-b-0 border-t border-line-soft bg-surface-soft px-4 py-3 text-sm font-semibold text-brand hover:bg-brand-soft">Ver todas as {post.totalImagens} fotos</button>}
    <div className="p-4 max-sm:p-3"><div className="mb-3 flex min-h-11 items-center gap-3"><button type="button" onClick={alternarCurtida} disabled={ocupado} aria-pressed={post.curtidoPorMim} aria-label={post.curtidoPorMim ? "Remover curtida" : "Curtir publicação"} className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-0 bg-transparent p-0 transition-[color,background-color,transform] active:scale-90 ${post.curtidoPorMim ? "text-danger hover:bg-danger-soft" : "text-text-main hover:bg-surface-soft"}`}><span aria-hidden="true" className="text-[1.8rem] leading-none">{post.curtidoPorMim ? "♥" : "♡"}</span></button><span className="text-sm font-semibold text-text-main">{post.totalCurtidas} {post.totalCurtidas === 1 ? "curtida" : "curtidas"}</span></div>
      {post.legenda && <p className="mb-4 mt-3 whitespace-pre-wrap text-[0.95rem] leading-relaxed"><strong>{post.autor?.nome}</strong> {post.legenda}</p>}
      {comentarios.length > 0 && <div className="mb-4 border-t border-line-soft pt-4"><div className="grid gap-3">{comentariosVisiveis.map((c) => <div key={c.id} className="flex gap-2.5"><Avatar autor={c.autor} size="h-8 w-8" /><div className="min-w-0"><p className="m-0 break-words text-sm"><strong>{c.autor?.nome}</strong> {c.texto}</p><time className="text-[0.7rem] text-text-muted">{formatarData(c.criadoEm)}</time></div></div>)}</div>{comentariosRestantes > 0 && <button type="button" onClick={() => setLimiteComentarios((atual) => atual + COMENTARIOS_POR_VEZ)} className="mt-3 min-h-10 border-0 bg-transparent p-0 text-sm font-semibold text-text-muted hover:text-brand">Ver mais comentários ({comentariosRestantes})</button>}</div>}
      <form onSubmit={enviarComentario} className="flex items-center gap-2 rounded-xl bg-surface-soft p-1"><input value={texto} maxLength={1000} onChange={(e) => setTexto(e.target.value)} className="min-w-0 flex-1 !border-0 !bg-transparent !shadow-none focus:!shadow-none" placeholder="Adicione um comentário..." aria-label="Comentário" /><button type="submit" disabled={!texto.trim() || ocupado} className="min-h-11 rounded-xl px-3 font-bold text-brand hover:bg-brand-soft disabled:opacity-40">Publicar</button></form>
    </div>
  </article><DeleteConfirmModal isOpen={modalExcluirAberta} onClose={() => { setModalExcluirAberta(false); setErroExclusao(""); }} itemName="EXCLUIR" onConfirm={remover} loading={excluindo} error={erroExclusao} title="Excluir publicação" description="Esta publicação, todas as fotos, curtidas e comentários serão excluídos permanentemente." /></>;
}

export function PostsPage() {
  const { token, isAdmin, requireAuth } = useAuth(); const { addToast } = useToast(); const [posts, setPosts] = useState([]); const [carregando, setCarregando] = useState(true);
  const [pagina, setPagina] = useState(1); const [total, setTotal] = useState(0); const limite = 20;
  usePageTitle(PAGE_TITLES.posts);
  const carregar = useCallback(async () => { setCarregando(true); try { const data = await listarPosts(token, { limite, offset: (pagina - 1) * limite }); const itens = data?.posts || []; setPosts(itens); setTotal(data?.total ?? itens.length); if (itens.length === 0 && pagina > 1) setPagina((atual) => atual - 1); } catch (error) { addToast(formatApiErrorMessage(error?.response?.data, "Não foi possível carregar os posts."), { type: "error" }); } finally { setCarregando(false); } }, [token, pagina, addToast]);
  useEffect(() => { carregar(); }, [carregar]);
  const totalPaginas = Math.max(1, Math.ceil(total / limite));
  const mudarPagina = (novaPagina) => { setPagina(novaPagina); window.scrollTo({ top: 0, behavior: "smooth" }); };
  return <PageShell><main className="mx-auto w-full max-w-[680px] px-4 pb-16 pt-8 max-sm:-mx-4 max-sm:w-[calc(100%+2rem)] max-sm:px-0 max-sm:pt-5"><div className="mb-7 max-sm:px-3"><p className="m-0 text-xs font-bold uppercase tracking-[0.14em] text-brand">Comunidade</p><h1 className="m-0 mt-1 text-3xl font-bold tracking-tight">Posts</h1><p className="m-0 mt-2 text-text-soft">Novidades, fotos e momentos dos torneios.</p></div>{isAdmin && <CriadorPost token={token} onCriado={() => { if (pagina === 1) carregar(); else setPagina(1); }} />}{carregando ? <SkeletonPostFeed /> : posts.length ? <><div className="grid gap-7 max-sm:gap-4">{posts.map((post) => <CardPost key={post.id} post={post} token={token} isAdmin={isAdmin} requireAuth={requireAuth} onAtualizar={carregar} />)}</div>{totalPaginas > 1 && <nav className="mt-8 flex items-center justify-between gap-3 rounded-2xl border border-line-soft bg-surface p-3 shadow-card max-sm:mx-3" aria-label="Paginação dos posts"><button type="button" className={BTN_SECONDARY} disabled={pagina === 1 || carregando} onClick={() => mudarPagina(pagina - 1)}>← Anterior</button><span className="text-sm font-semibold text-text-soft">Página {pagina} de {totalPaginas}</span><button type="button" className={BTN_SECONDARY} disabled={pagina === totalPaginas || carregando} onClick={() => mudarPagina(pagina + 1)}>Próxima →</button></nav>}</> : <EmptyState icon="◎" title="Nenhuma publicação ainda" description="As novidades da comunidade aparecerão aqui." />}</main></PageShell>;
}
