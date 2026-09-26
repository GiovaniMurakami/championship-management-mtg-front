import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PageShell } from "../components/ui/PageShell";
import { Spinner } from "../components/ui/Spinner";
import { ArtigoRenderer } from "../components/blog/ArtigoRenderer";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { buscarArtigo, criarArtigo, editarArtigo } from "../services/backendApi";
import { uploadBannerImage, OG_BANNER_MAX_WIDTH, OG_BANNER_MAX_HEIGHT } from "../utils/bannerUpload";
import { lerArquivoArtigo } from "../utils/artigoArquivo";
import { formatApiErrorMessage } from "../utils/apiError";
import { BTN_PRIMARY, BTN_SECONDARY, FORM_TEXTAREA_CLASS, TOURNAMENT_INPUT_CLASS } from "../styles/uiClasses";

const CONTEUDO_INICIAL = `Salva galera! Escreva seu artigo aqui.

Use [[Nome da Carta]] para citar cartas e [texto](https://exemplo.com) para links.
 [cardinfo]{Nome da Carta}
[cardside](1 Carta A || 1 Carta B)
[h1 center roxo]{Seção}
[h2 center dourado]{Um subtítulo}
[h3]{Um detalhe}
[deck](a1b2c-nome-do-deck)
[deck](a1b2c-nome-do-deck){16:9}
[deck](a1b2c-nome-do-deck){9:16}
[youtube](https://www.youtube.com/watch?v=VIDEO_ID){Título do vídeo}

Consulte o guia de formatação ao lado.`;

export function BlogEditorPage() {
  const { id } = useParams();
  const editando = Boolean(id);
  const navigate = useNavigate();
  const { token, isAdmin, podeEditarBlog } = useAuth();
  const { addToast } = useToast();
  usePageTitle(editando ? "Editar artigo" : "Novo artigo");

  const [titulo, setTitulo] = useState("");
  const [chamada, setChamada] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tags, setTags] = useState("");
  const [capaUrl, setCapaUrl] = useState("");
  const [conteudo, setConteudo] = useState(CONTEUDO_INICIAL);
  const [ajuda, setAjuda] = useState("");
  const [preview, setPreview] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(editando);
  const [enviandoCapa, setEnviandoCapa] = useState(false);
  const [importandoArquivo, setImportandoArquivo] = useState(false);

  useEffect(() => {
    fetch("/ajuda-formatacao-artigo.txt")
      .then((r) => r.text())
      .then(setAjuda)
      .catch(() => setAjuda("Não foi possível carregar o guia de formatação."));
  }, []);

  useEffect(() => {
    if (!editando || !token) return undefined;
    let ativo = true;
    setCarregando(true);
    buscarArtigo(id, token)
      .then((data) => {
        if (!ativo) return;
        setTitulo(data.titulo || "");
        setChamada(data.chamada || "");
        setDescricao(data.descricao || "");
        setTags((data.tags || []).join("; "));
        setCapaUrl(data.capaUrl || "");
        setConteudo(data.conteudo || "");
      })
      .catch((error) => {
        addToast(formatApiErrorMessage(error?.response?.data, "Não foi possível carregar o artigo."), { type: "error" });
        navigate("/artigos");
      })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [editando, id, token, addToast, navigate]);

  if (!podeEditarBlog) {
    return (
      <PageShell>
        <main className="mx-auto max-w-lg px-4 py-16 text-center">
          <h1>Acesso restrito</h1>
          <p className="text-text-soft">Apenas editores e administradores podem criar artigos.</p>
          <Link to="/artigos" className={`${BTN_SECONDARY} mt-4 inline-block`}>Voltar</Link>
        </main>
      </PageShell>
    );
  }

  const enviarCapa = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setEnviandoCapa(true);
    try {
      const url = await uploadBannerImage(file, token, undefined, {
        optimize: true,
        crop: true,
        targetWidth: OG_BANNER_MAX_WIDTH,
        targetHeight: OG_BANNER_MAX_HEIGHT,
      });
      setCapaUrl(url);
      addToast("Capa enviada.", { type: "success" });
    } catch (error) {
      addToast(error.message || "Falha no upload da capa.", { type: "error" });
    } finally {
      setEnviandoCapa(false);
      event.target.value = "";
    }
  };

  const importarArquivo = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImportandoArquivo(true);
    try {
      const parsed = await lerArquivoArtigo(file);
      if (parsed.titulo) setTitulo(parsed.titulo);
      if (parsed.chamada) setChamada(parsed.chamada);
      if (parsed.descricao) setDescricao(parsed.descricao);
      if (parsed.tags) setTags(parsed.tags);
      if (parsed.conteudo) {
        setConteudo(parsed.conteudo);
        setPreview(false);
      }
      addToast("Arquivo importado. Revise os campos antes de publicar.", { type: "success" });
    } catch (error) {
      addToast(error.message || "Não foi possível ler o arquivo.", { type: "error" });
    } finally {
      setImportandoArquivo(false);
      event.target.value = "";
    }
  };

  const salvar = async ({ publicarAgora = false } = {}) => {
    setSalvando(true);
    try {
      const payload = {
        titulo: titulo.trim(),
        chamada: chamada.trim(),
        descricao: descricao.trim(),
        tags: tags.split(/[;,]/).map((t) => t.trim()).filter(Boolean),
        capaUrl: capaUrl || undefined,
        conteudo,
        publicarAgora: Boolean(publicarAgora && isAdmin),
      };
      if (editando) {
        const res = await editarArtigo(id, payload, token);
        addToast(
          res.status === "pendente" ? "Edição enviada para aprovação." : "Artigo atualizado.",
          { type: "success" }
        );
        navigate(`/artigos/${id}`);
      } else {
        const res = await criarArtigo(payload, token);
        addToast(
          res.status === "pendente" ? "Artigo enviado para aprovação." : "Artigo publicado.",
          { type: "success" }
        );
        navigate(`/artigos/${res.id}`);
      }
    } catch (error) {
      addToast(formatApiErrorMessage(error?.response?.data, "Não foi possível salvar."), { type: "error" });
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return <PageShell><div className="flex justify-center py-20"><Spinner /></div></PageShell>;
  }

  return (
    <PageShell>
      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="m-0 text-xs font-bold uppercase tracking-[0.14em] text-brand">Tiago Fuguete</p>
            <h1 className="m-0 mt-1 text-3xl font-bold">{editando ? "Editar artigo" : "Novo artigo"}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={BTN_SECONDARY} onClick={() => setPreview((p) => !p)}>
              {preview ? "Editar texto" : "Pré-visualizar"}
            </button>
            <button type="button" className={BTN_SECONDARY} disabled={salvando} onClick={() => salvar({ publicarAgora: false })}>
              {isAdmin ? "Salvar (pendente)" : "Enviar para aprovação"}
            </button>
            {isAdmin && (
              <button type="button" className={BTN_PRIMARY} disabled={salvando} onClick={() => salvar({ publicarAgora: true })}>
                Publicar agora
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-dashed border-[rgba(199,149,255,0.35)] bg-[rgba(167,79,255,0.08)] p-4">
              <p className="m-0 text-sm font-semibold text-text-main">Importar arquivo do artigo</p>
              <p className="m-0 mt-1 text-xs text-text-soft">
                Envie um <strong>.txt</strong>, <strong>.md</strong> ou <strong>.docx</strong> no formato do modelo
                (Título, Chamada, Tags, Descrição + ARTIGO:).{" "}
                <a href="/modelo-artigo.txt" download className="text-brand underline">
                  Baixar modelo .txt
                </a>
              </p>
              <label className={`${BTN_SECONDARY} mt-3 inline-flex cursor-pointer`}>
                <input
                  type="file"
                  accept=".txt,.md,.docx,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="sr-only"
                  onChange={importarArquivo}
                />
                {importandoArquivo ? "Lendo arquivo…" : "Escolher arquivo"}
              </label>
            </div>

            <label className="block">
              <span className="mb-1 block text-sm text-text-soft">Título</span>
              <input className={TOURNAMENT_INPUT_CLASS} value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={200} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-text-soft">Chamada</span>
              <input className={TOURNAMENT_INPUT_CLASS} value={chamada} onChange={(e) => setChamada(e.target.value)} maxLength={300} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-text-soft">Descrição</span>
              <input className={TOURNAMENT_INPUT_CLASS} value={descricao} onChange={(e) => setDescricao(e.target.value)} maxLength={1000} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-text-soft">Tags (separadas por ;)</span>
              <input className={TOURNAMENT_INPUT_CLASS} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tolarian; Terror; Pauper" />
            </label>
            <div>
              <span className="mb-1 block text-sm text-text-soft">Capa</span>
              <p className="m-0 mb-2 text-xs text-text-muted">
                Tamanho: {OG_BANNER_MAX_WIDTH} × {OG_BANNER_MAX_HEIGHT} px (proporção ~1,91:1). A imagem é recortada no centro.
              </p>
              {capaUrl ? (
                <div className="mb-3 overflow-hidden rounded-xl border border-line-soft">
                  <img
                    src={capaUrl}
                    alt="Preview da capa"
                    className="block w-full aspect-[1200/630] object-cover"
                  />
                </div>
              ) : null}
              <div className="flex flex-wrap items-center gap-3">
                <label className={`${BTN_SECONDARY} cursor-pointer`}>
                  <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="sr-only" onChange={enviarCapa} />
                  {enviandoCapa ? "Enviando…" : capaUrl ? "Trocar imagem" : "Enviar imagem"}
                </label>
                {capaUrl && (
                  <button
                    type="button"
                    className="text-xs text-red-300 hover:text-red-200 underline"
                    onClick={() => setCapaUrl("")}
                  >
                    Remover
                  </button>
                )}
              </div>
            </div>

            {preview ? (
              <div className="rounded-2xl border border-line-soft bg-surface p-5">
                <ArtigoRenderer conteudo={conteudo} token={token} />
              </div>
            ) : (
              <label className="block">
                <span className="mb-1 block text-sm text-text-soft">Corpo do artigo</span>
                <textarea
                  className={`${FORM_TEXTAREA_CLASS} min-h-[420px] font-mono text-sm`}
                  value={conteudo}
                  onChange={(e) => setConteudo(e.target.value)}
                />
              </label>
            )}
          </div>

          <aside className="rounded-2xl border border-line-soft bg-[#120b24] p-4 lg:sticky lg:top-20 lg:self-start max-h-[80vh] overflow-auto">
            <h2 className="m-0 text-lg font-semibold text-white">Guia de formatação</h2>
            <p className="m-0 mt-1 text-xs text-text-muted">Arquivo de ajuda para editores</p>
            <pre className="mt-4 whitespace-pre-wrap font-mono text-[0.78rem] leading-relaxed text-[#d4c4f0]">{ajuda}</pre>
          </aside>
        </div>
      </main>
    </PageShell>
  );
}
