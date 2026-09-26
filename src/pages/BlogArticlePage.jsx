import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PageShell } from "../components/ui/PageShell";
import { Spinner } from "../components/ui/Spinner";
import { ArtigoRenderer } from "../components/blog/ArtigoRenderer";
import { ArtigoAssinatura } from "../components/blog/ArtigoAssinatura";
import { ArtigoComentarios } from "../components/blog/ArtigoComentarios";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import { usePageTitle } from "../hooks/usePageTitle";
import {
  aprovarArtigo,
  buscarArtigo,
  curtirArtigo,
  descurtirArtigo,
  excluirArtigo,
} from "../services/backendApi";
import { formatApiErrorMessage } from "../utils/apiError";
import { BTN_DANGER, BTN_PRIMARY, BTN_SECONDARY } from "../styles/uiClasses";
import { AdSenseInArticle } from "../components/ui/AdSenseUnit";

export function BlogArticlePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, isAdmin, requireAuth, usuario, podeEditarBlog, authInitialized } = useAuth();
  const { addToast } = useToast();
  const [artigo, setArtigo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [ocupado, setOcupado] = useState(false);

  usePageTitle(artigo?.titulo || "Artigo");

  const pedidoRef = useRef(0);

  const carregar = useCallback(async () => {
    if (!authInitialized) return;
    const pedido = ++pedidoRef.current;
    setCarregando(true);
    try {
      const data = await buscarArtigo(id, token);
      if (pedido !== pedidoRef.current) return;
      setArtigo(data);
    } catch (error) {
      if (pedido !== pedidoRef.current) return;
      addToast(formatApiErrorMessage(error?.response?.data, "Artigo não encontrado."), { type: "error" });
      setArtigo(null);
    } finally {
      if (pedido === pedidoRef.current) setCarregando(false);
    }
  }, [authInitialized, id, token, addToast]);

  useEffect(() => { carregar(); }, [carregar]);

  const agirAutenticado = (acao) => (token ? acao(token) : requireAuth(({ token: novoToken }) => acao(novoToken)));

  const alternarCurtida = () => agirAutenticado(async (tok) => {
    if (ocupado || !artigo) return;
    setOcupado(true);
    try {
      const res = artigo.curtidoPorMim
        ? await descurtirArtigo(artigo.id, tok)
        : await curtirArtigo(artigo.id, tok);
      setArtigo((a) => ({ ...a, ...res }));
    } catch (error) {
      addToast(formatApiErrorMessage(error?.response?.data, "Não foi possível atualizar a curtida."), { type: "error" });
    } finally {
      setOcupado(false);
    }
  });

  const aprovar = async (ok) => {
    try {
      await aprovarArtigo(id, ok, token);
      addToast(ok ? "Artigo publicado." : "Artigo rejeitado.", { type: "success" });
      await carregar();
    } catch (error) {
      addToast(formatApiErrorMessage(error?.response?.data, "Falha na aprovação."), { type: "error" });
    }
  };

  const excluir = async () => {
    if (!window.confirm("Excluir este artigo?")) return;
    try {
      await excluirArtigo(id, token);
      addToast("Artigo excluído.", { type: "success" });
      navigate("/artigos");
    } catch (error) {
      addToast(formatApiErrorMessage(error?.response?.data, "Não foi possível excluir."), { type: "error" });
    }
  };

  if (carregando) {
    return <PageShell><div className="flex justify-center py-20"><Spinner /></div></PageShell>;
  }

  if (!artigo) {
    return (
      <PageShell>
        <main className="mx-auto max-w-3xl px-4 py-12 text-center">
          <h1>Artigo não encontrado</h1>
          <button type="button" className={`${BTN_SECONDARY} mt-4`} onClick={() => navigate("/artigos")}>Voltar aos artigos</button>
        </main>
      </PageShell>
    );
  }

  const podeEditar = isAdmin || (podeEditarBlog && artigo.autor?.id === usuario?.id);

  return (
    <PageShell>
      <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-2">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link to="/artigos" className="text-sm text-text-soft hover:text-text-main">← Artigos</Link>
          <div className="flex flex-wrap gap-2">
            {podeEditar && (
              <button type="button" className={BTN_SECONDARY} onClick={() => navigate(`/artigos/${id}/editar`)}>Editar</button>
            )}
            {isAdmin && artigo.status === "pendente" && (
              <>
                <button type="button" className={BTN_PRIMARY} onClick={() => aprovar(true)}>Aprovar</button>
                <button type="button" className={BTN_SECONDARY} onClick={() => aprovar(false)}>Rejeitar</button>
              </>
            )}
            {isAdmin && (
              <button type="button" className={BTN_DANGER} onClick={excluir}>Excluir</button>
            )}
          </div>
        </div>

        {artigo.capaUrl && (
          <div className="mb-6 overflow-hidden rounded-2xl border border-line-soft">
            <img
              src={artigo.capaUrl}
              alt=""
              className="block w-full aspect-[1200/630] object-cover"
            />
          </div>
        )}

        <p className="m-0 text-xs font-bold uppercase tracking-[0.14em] text-brand">Tiago Fuguete</p>
        <div className="mt-1 flex items-start justify-between gap-4">
          <h1 className="m-0 min-w-0 flex-1 text-3xl font-bold tracking-tight text-white">{artigo.titulo}</h1>
          <button
            type="button"
            onClick={alternarCurtida}
            disabled={ocupado}
            aria-pressed={Boolean(artigo.curtidoPorMim)}
            aria-label={artigo.curtidoPorMim ? "Remover curtida" : "Curtir artigo"}
            className={`mt-1 inline-flex shrink-0 items-center gap-1.5 rounded-full border-0 bg-transparent px-2 py-1 transition-[color,background-color,transform] active:scale-90 ${
              artigo.curtidoPorMim
                ? "text-danger hover:bg-danger-soft"
                : "text-text-main hover:bg-surface-soft"
            }`}
          >
            <span aria-hidden="true" className="text-[1.75rem] leading-none">
              {artigo.curtidoPorMim ? "♥" : "♡"}
            </span>
            <span className="text-sm font-semibold tabular-nums">{artigo.totalCurtidas ?? 0}</span>
          </button>
        </div>
        {artigo.chamada && <p className="m-0 mt-2 text-lg text-[#c4b5fd]">{artigo.chamada}</p>}
        <div className="mt-3 flex flex-wrap gap-3 text-sm text-text-muted">
          <span>{artigo.autor?.nome}</span>
          {artigo.status !== "publicado" && artigo.status !== "pendente_edicao" && (
            <span className="text-amber-200">Status: {artigo.status}</span>
          )}
          {artigo.status === "pendente_edicao" && (
            <span className="text-amber-200">Edição pendente de aprovação</span>
          )}
          <span>{artigo.visualizacoes ?? 0} visualizações</span>
        </div>
        {artigo.tags?.length > 0 && (
          <p className="m-0 mt-2 text-xs text-text-muted">{artigo.tags.join(" · ")}</p>
        )}

        <div className="mt-8">
          <ArtigoRenderer conteudo={artigo.conteudo} token={token} />
        </div>

        <ArtigoAssinatura autor={artigo.autor} />

        <div className="my-8">
          <AdSenseInArticle />
        </div>

        <ArtigoComentarios artigo={artigo} token={token} onArtigo={setArtigo} />
      </main>
    </PageShell>
  );
}
