import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageShell } from "../components/ui/PageShell";
import { Spinner } from "../components/ui/Spinner";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { PAGE_TITLES } from "../constants/pageTitles";
import { listarArtigos } from "../services/backendApi";
import { formatApiErrorMessage } from "../utils/apiError";
import { BTN_PRIMARY, BTN_SECONDARY } from "../styles/uiClasses";
import { AdSenseInArticle } from "../components/ui/AdSenseUnit";

function formatarData(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return "";
  }
}

export function BlogPage() {
  const { token, isAdmin, podeEditarBlog } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  usePageTitle(PAGE_TITLES.blog);

  const [artigos, setArtigos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    listarArtigos(token)
      .then((res) => {
        if (!ativo) return;
        setArtigos(res?.artigos || []);
      })
      .catch((error) => {
        if (ativo) addToast(formatApiErrorMessage(error?.response?.data, "Não foi possível carregar o blog."), { type: "error" });
      })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [token, addToast]);

  return (
    <PageShell>
      <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-2">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="m-0 text-xs font-bold uppercase tracking-[0.14em] text-brand">Tiago Fuguete</p>
            <h1 className="m-0 mt-1 text-3xl font-bold tracking-tight">Blog</h1>
            <p className="m-0 mt-2 max-w-2xl text-text-soft">
              Conteúdos educativos, deck techs e dicas de Pauper — além dos torneios.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {isAdmin && (
              <button type="button" className={BTN_SECONDARY} onClick={() => navigate("/blog/pendentes")}>
                Pendentes
              </button>
            )}
            {podeEditarBlog && (
              <button type="button" className={BTN_PRIMARY} onClick={() => navigate("/blog/novo")}>
                Novo artigo
              </button>
            )}
          </div>
        </div>

        <div className="mb-8">
          <AdSenseInArticle />
        </div>

        {carregando ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : artigos.length === 0 ? (
          <p className="text-text-soft">Nenhum artigo publicado ainda.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {artigos.map((artigo) => (
              <Link
                key={artigo.id}
                to={`/blog/${artigo.id}`}
                className="group overflow-hidden rounded-2xl border border-line-soft bg-surface shadow-card transition hover:border-line-strong"
              >
                {artigo.capaUrl ? (
                  <div className="overflow-hidden">
                    <img src={artigo.capaUrl} alt="" className="aspect-[1200/630] w-full object-cover" />
                  </div>
                ) : (
                  <div className="aspect-[1200/630] w-full bg-[linear-gradient(135deg,#2a1a4a,#120b24)]" />
                )}
                <div className="p-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
                    {artigo.autor?.nome && <span>{artigo.autor.nome}</span>}
                    <span>{formatarData(artigo.publicadoEm || artigo.criadoEm)}</span>
                    {artigo.status !== "publicado" && (
                      <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-amber-200">{artigo.status}</span>
                    )}
                    <span>{artigo.visualizacoes ?? 0} visualizações</span>
                  </div>
                  <h2 className="m-0 mt-2 text-xl font-semibold text-text-main group-hover:text-brand">{artigo.titulo}</h2>
                  {(artigo.chamada || artigo.descricao) && (
                    <p className="m-0 mt-2 line-clamp-2 text-sm text-text-soft">{artigo.chamada || artigo.descricao}</p>
                  )}
                  {artigo.tags?.length > 0 && (
                    <p className="m-0 mt-3 text-xs text-text-muted">{artigo.tags.join(" · ")}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </PageShell>
  );
}
