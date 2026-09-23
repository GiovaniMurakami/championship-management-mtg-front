import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { buscarPost, editarPost, excluirPost } from "../services/backendApi";
import { uploadBannerImage, validateBannerImageFile } from "../utils/bannerUpload";
import { formatApiErrorMessage } from "../utils/apiError";
import { useAuth } from "../hooks/useAuth";
import { usePageTitle } from "../hooks/usePageTitle";
import { useToast } from "../context/ToastContext";
import { BTN_DANGER, BTN_PRIMARY, BTN_SECONDARY, FORM_TEXTAREA_CLASS } from "../styles/uiClasses";
import { PageShell } from "../components/ui/PageShell";
import { SkeletonPostDetail } from "../components/ui/Skeleton";
import { DeleteConfirmModal } from "../components/ui/DeleteConfirmModal";

export function PostDetailPage() {
  const { id } = useParams(); const navigate = useNavigate(); const [searchParams] = useSearchParams(); const { token, isAdmin } = useAuth(); const { addToast } = useToast();
  const inputRef = useRef(null); const [post, setPost] = useState(null); const [carregando, setCarregando] = useState(true); const [editando, setEditando] = useState(isAdmin && searchParams.get("editar") === "1"); const [salvando, setSalvando] = useState(false);
  const [legenda, setLegenda] = useState(""); const [imagens, setImagens] = useState([]); const [novas, setNovas] = useState([]);
  const [modalExcluirAberta, setModalExcluirAberta] = useState(false); const [excluindo, setExcluindo] = useState(false); const [erroExclusao, setErroExclusao] = useState("");
  usePageTitle(post ? `Post de ${post.autor?.nome || "usuário"}` : "Post");
  const carregar = useCallback(async () => { try { const data = await buscarPost(id, token); setPost(data); setLegenda(data.legenda || ""); setImagens(data.imagens || []); } catch (error) { addToast(formatApiErrorMessage(error?.response?.data, "Não foi possível carregar o post."), { type: "error" }); } finally { setCarregando(false); } }, [id, token, addToast]);
  useEffect(() => { carregar(); }, [carregar]);
  const selecionar = (event) => { const arquivos = Array.from(event.target.files || []); const erro = arquivos.map(validateBannerImageFile).find(Boolean); if (erro) { addToast(erro.userMessage, { type: "error" }); return; } setNovas((atuais) => [...atuais, ...arquivos]); };
  const salvar = async () => { if (salvando || imagens.length + novas.length === 0) return; setSalvando(true); try { const adicionadas = []; for (const arquivo of novas) adicionadas.push(await uploadBannerImage(arquivo, token, undefined, { optimize: false })); await editarPost(id, { legenda: legenda.trim(), imagens: [...imagens, ...adicionadas] }, token); addToast("Post atualizado.", { type: "success" }); setNovas([]); setEditando(false); await carregar(); } catch (error) { addToast(error.userMessage || formatApiErrorMessage(error?.response?.data, "Não foi possível atualizar o post."), { type: "error" }); } finally { setSalvando(false); } };
  const excluir = async (_confirmacao, fecharModal) => { setExcluindo(true); setErroExclusao(""); try { await excluirPost(id, token); fecharModal(); addToast("Post excluído.", { type: "success" }); navigate("/comunidade"); } catch (error) { setErroExclusao(formatApiErrorMessage(error?.response?.data, "Não foi possível excluir o post.")); } finally { setExcluindo(false); } };
  if (carregando) return <PageShell><SkeletonPostDetail /></PageShell>;
  if (!post) return <PageShell><main className="mx-auto max-w-3xl px-4 py-12 text-center"><h1>Post não encontrado</h1><button className={BTN_SECONDARY} onClick={() => navigate("/comunidade")}>Voltar à comunidade</button></main></PageShell>;
  return <PageShell><main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-8 max-sm:-mx-4 max-sm:w-[calc(100%+2rem)] max-sm:px-3 max-sm:pt-5">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><button className={BTN_SECONDARY} onClick={() => navigate("/comunidade")}>← Voltar</button>{isAdmin && <div className="flex gap-2">{editando ? <button className={BTN_SECONDARY} onClick={() => { setEditando(false); setLegenda(post.legenda || ""); setImagens(post.imagens); setNovas([]); }}>Cancelar</button> : <button className={BTN_PRIMARY} onClick={() => setEditando(true)}>Editar post</button>}<button className={BTN_DANGER} onClick={() => setModalExcluirAberta(true)}>Excluir post</button></div>}</div>
    <article className="rounded-2xl border border-line-soft bg-surface p-5 shadow-card"><header className="mb-5"><h1 className="m-0 text-2xl font-bold">{post.autor?.nome}</h1><p className="m-0 mt-1 text-sm text-text-muted">{post.totalImagens} {post.totalImagens === 1 ? "foto" : "fotos"}</p></header>
      {editando && <div className="mb-6 rounded-xl border border-line bg-surface-soft p-4"><textarea className={FORM_TEXTAREA_CLASS} maxLength={2200} value={legenda} onChange={(e) => setLegenda(e.target.value)} aria-label="Legenda do post" /><p className="text-right text-xs text-text-muted">{legenda.length}/2200</p><div className="flex flex-wrap items-center justify-between gap-3"><label className={BTN_SECONDARY}><input ref={inputRef} type="file" multiple accept="image/jpeg,image/png,image/gif,image/webp" className="sr-only" onChange={selecionar} />Adicionar fotos</label><button className={BTN_PRIMARY} disabled={salvando || imagens.length + novas.length === 0} onClick={salvar}>{salvando ? "Salvando..." : "Salvar alterações"}</button></div>{novas.length > 0 && <p className="mb-0 text-sm text-text-soft">{novas.length} nova(s) foto(s) serão enviadas.</p>}</div>}
      {post.legenda && !editando && <p className="mb-6 whitespace-pre-wrap text-base leading-relaxed">{post.legenda}</p>}
      <div className="grid grid-cols-2 items-start gap-2 sm:gap-3">{[0, 1].map((coluna) => <div key={coluna} className="grid min-w-0 gap-2 sm:gap-3">{imagens.map((url, indice) => ({ url, indice })).filter(({ indice }) => indice % 2 === coluna).map(({ url, indice }) => <figure key={url} className="relative m-0 flex w-full justify-center overflow-hidden rounded-lg bg-black/20 sm:rounded-xl"><img src={url} alt={`Foto ${indice + 1} do post`} className="block max-h-[70vh] max-w-full object-contain" />{editando && <button type="button" onClick={() => setImagens((atuais) => atuais.filter((item) => item !== url))} className="absolute right-2 top-2 min-h-11 rounded-xl bg-black/75 px-3 font-semibold text-white hover:bg-danger">Remover</button>}</figure>)}</div>)}</div>
    </article><DeleteConfirmModal isOpen={modalExcluirAberta} onClose={() => { setModalExcluirAberta(false); setErroExclusao(""); }} itemName="EXCLUIR" onConfirm={excluir} loading={excluindo} error={erroExclusao} title="Excluir publicação" description="Esta publicação, todas as fotos, curtidas e comentários serão excluídos permanentemente." />
  </main></PageShell>;
}
