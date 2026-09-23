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
        if (ativo) addToast(formatApiErrorMessage(error?.response?.data, "Não foi possível carregar os artigos."), { type: "error" });
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
            <h1 className="m-0 mt-1 text-3xl font-bold tracking-tight">Artigos</h1>
            <p className="m-0 mt-2 max-w-2xl text-text-soft">
              Conteúdos educativos, deck techs e dicas de Pauper — além dos torneios.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {isAdmin && (
              <button type="button" className={BTN_SECONDARY} onClick={() => navigate("/artigos/pendentes")}>
                Pendentes
              </button>
            )}
            {podeEditarBlog && (
              <button type="button" className={BTN_PRIMARY} onClick={() => navigate("/artigos/novo")}>
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
          <div className="overflow-hidden rounded-2xl border border-line-soft bg-surface shadow-card">
            <div className="relative flex aspect-[1200/420] max-h-52 items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#2a1a4a_0%,#120b24_55%,#1a1230_100%)]">
              <div
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 20% 30%, rgba(167,79,255,0.35), transparent 45%), radial-gradient(circle at 80% 70%, rgba(252,88,119,0.18), transparent 40%)",
                }}
              />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-[rgba(199,149,255,0.35)] bg-[rgba(167,79,255,0.15)] text-[#c4b5fd] shadow-[0_0_32px_rgba(167,79,255,0.25)]">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M6 4.5h9.5A2.5 2.5 0 0 1 18 7v13.5L12.5 17 7 20.5V7A2.5 2.5 0 0 1 9.5 4.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                  <path d="M9 9h6M9 12.5h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </div>
            </div>
            <div className="px-6 py-8 text-center sm:px-10">
              <p className="m-0 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-brand">Em breve</p>
              <h2 className="m-0 mt-2 text-xl font-semibold tracking-tight text-text-main sm:text-2xl">
                Ainda não há artigos publicados
              </h2>
              <p className="mx-auto m-0 mt-3 max-w-md text-sm leading-relaxed text-text-soft">
                Em breve você encontra aqui deck techs, análises de metagame e conteúdos da comunidade Pauper.
              </p>
              {podeEditarBlog ? (
                <button
                  type="button"
                  className={`${BTN_PRIMARY} mt-6`}
                  onClick={() => navigate("/artigos/novo")}
                >
                  Escrever o primeiro artigo
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {artigos.map((artigo) => (
              <Link
                key={artigo.id}
                to={`/artigos/${artigo.id}`}
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
