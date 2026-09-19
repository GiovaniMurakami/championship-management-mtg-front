import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageShell } from "../components/ui/PageShell";
import { Spinner } from "../components/ui/Spinner";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { aprovarArtigo, listarArtigos } from "../services/backendApi";
import { formatApiErrorMessage } from "../utils/apiError";
import { BTN_PRIMARY, BTN_SECONDARY } from "../styles/uiClasses";

export function BlogPendingPage() {
  const { token, isAdmin } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  usePageTitle("Artigos pendentes");
  const [artigos, setArtigos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = async () => {
    setCarregando(true);
    try {
      const data = await listarArtigos(token, { pendentes: "true" });
      setArtigos(data?.artigos || []);
    } catch (error) {
      addToast(formatApiErrorMessage(error?.response?.data, "Não foi possível listar pendentes."), { type: "error" });
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (isAdmin) carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isAdmin]);

  if (!isAdmin) {
    return (
      <PageShell>
        <main className="mx-auto max-w-lg px-4 py-16 text-center">
          <h1>Acesso restrito</h1>
          <button type="button" className={`${BTN_SECONDARY} mt-4`} onClick={() => navigate("/blog")}>Voltar</button>
        </main>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="m-0 text-xs font-bold uppercase tracking-[0.14em] text-brand">Admin</p>
            <h1 className="m-0 mt-1 text-3xl font-bold">Artigos pendentes</h1>
          </div>
          <Link to="/blog" className={BTN_SECONDARY}>Voltar ao blog</Link>
        </div>

        {carregando ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : artigos.length === 0 ? (
          <p className="text-text-soft">Nenhum artigo aguardando aprovação.</p>
        ) : (
          <ul className="space-y-4 list-none p-0">
            {artigos.map((a) => (
              <li key={a.id} className="rounded-2xl border border-line-soft bg-surface p-4">
                <Link to={`/blog/${a.id}`} className="text-lg font-semibold text-[#c4b5fd] hover:text-white">
                  {a.titulo}
                </Link>
                <p className="m-0 mt-1 text-sm text-text-soft">
                  por {a.autor?.nome} · {a.chamada || a.descricao}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={BTN_PRIMARY}
                    onClick={async () => {
                      try {
                        await aprovarArtigo(a.id, true, token);
                        addToast("Publicado.", { type: "success" });
                        carregar();
                      } catch (error) {
                        addToast(formatApiErrorMessage(error?.response?.data, "Falha ao aprovar."), { type: "error" });
                      }
                    }}
                  >
                    Aprovar
                  </button>
                  <button
                    type="button"
                    className={BTN_SECONDARY}
                    onClick={async () => {
                      try {
                        await aprovarArtigo(a.id, false, token);
                        addToast("Rejeitado.", { type: "success" });
                        carregar();
                      } catch (error) {
                        addToast(formatApiErrorMessage(error?.response?.data, "Falha ao rejeitar."), { type: "error" });
                      }
                    }}
                  >
                    Rejeitar
                  </button>
                  <Link to={`/blog/${a.id}`} className={`${BTN_SECONDARY} inline-flex items-center`}>Revisar</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </PageShell>
  );
}
