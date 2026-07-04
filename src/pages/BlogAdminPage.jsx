import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LandingHeader } from "../components/ui/LandingHeader";
import { Footer } from "../components";
import { InlineAlert } from "../components/ui/InlineAlert";
import { Spinner } from "../components/ui/Spinner";
import { DeleteConfirmModal } from "../components/ui/DeleteConfirmModal";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { PAGE_TITLES } from "../constants/pageTitles";
import {
  excluirPostBlog,
  importarPostsWordpress,
  listarPostsBlogAdmin,
} from "../services/backendApi";
import { BTN_PRIMARY, BTN_SECONDARY } from "../styles/uiClasses";

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("pt-BR");
}

export function BlogAdminPage() {
  usePageTitle(PAGE_TITLES.gerenciarBlog);
  const { token } = useAuth();
  const { addToast } = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [importing, setImporting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const carregarPosts = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const data = await listarPostsBlogAdmin(token, { limite: 50 });
      setPosts(data.posts || []);
    } catch {
      setError("Não foi possível carregar os posts.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    carregarPosts();
  }, [carregarPosts]);

  const handleImport = async () => {
    if (!token || importing) return;
    setImporting(true);
    try {
      const resultado = await importarPostsWordpress(token);
      addToast(
        `Importação concluída: ${resultado.importados} novos, ${resultado.ignorados} já existentes.`,
        { type: "success" },
      );
      await carregarPosts();
    } catch (err) {
      addToast(err?.message || "Falha ao importar posts do WordPress.", { type: "error" });
    } finally {
      setImporting(false);
    }
  };

  const handleDelete = async (_confirmName, closeModal) => {
    if (!token || !deleteTarget || deleting) return;
    setDeleting(true);
    try {
      await excluirPostBlog(deleteTarget.id, token);
      addToast("Post excluído.", { type: "success" });
      closeModal?.();
      setDeleteTarget(null);
      await carregarPosts();
    } catch (err) {
      addToast(err?.message || "Não foi possível excluir o post.", { type: "error" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e091c] text-[#e8dfff]">
      <LandingHeader />

      <section className="mx-auto max-w-6xl px-4 pt-28 pb-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link to="/blog" className="mb-3 inline-flex text-sm text-[#c795ff] underline underline-offset-2">
              ← Voltar para o blog
            </Link>
            <h1 className="text-3xl font-bold text-[#f5edff]">Gerenciar blog</h1>
            <p className="mt-2 text-[#9b8dc0]">Crie, edite e publique artigos do blog.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" className={BTN_SECONDARY} onClick={handleImport} disabled={importing}>
              {importing ? "Importando..." : "Importar do WordPress"}
            </button>
            <Link to="/blog/admin/criar" className={`${BTN_PRIMARY} no-underline`}>
              Novo post
            </Link>
          </div>
        </div>

        {loading && <Spinner text="Carregando posts..." />}
        {error && <InlineAlert type="error">{error}</InlineAlert>}

        {!loading && !error && (
          <div className="overflow-hidden rounded-2xl border border-[rgba(217,180,255,0.12)]">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[rgba(167,79,255,0.08)] text-[#b9abd8]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Título</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Publicado em</th>
                  <th className="px-4 py-3 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-t border-[rgba(217,180,255,0.08)]">
                    <td className="px-4 py-4">
                      <div className="font-semibold text-[#f5edff]">{post.titulo}</div>
                      <div className="text-xs text-[#8f82ad]">/{post.slug}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${post.publicado ? "bg-[rgba(44,207,180,0.15)] text-[#2ccfb4]" : "bg-[rgba(245,158,11,0.15)] text-[#fbbf24]"}`}>
                        {post.publicado ? "Publicado" : "Rascunho"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[#b9abd8]">{formatDate(post.publicadoEm)}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          to={`/blog/${post.slug}`}
                          className="rounded-lg border border-[rgba(217,180,255,0.15)] px-3 py-1.5 text-xs font-semibold text-[#c795ff] no-underline hover:bg-[rgba(167,79,255,0.12)]"
                        >
                          Ver
                        </Link>
                        <Link
                          to={`/blog/admin/${post.id}/editar`}
                          className="rounded-lg border border-[rgba(217,180,255,0.15)] px-3 py-1.5 text-xs font-semibold text-[#e8dfff] no-underline hover:bg-[rgba(167,79,255,0.12)]"
                        >
                          Editar
                        </Link>
                        <button
                          type="button"
                          className="rounded-lg border border-[rgba(239,68,68,0.25)] px-3 py-1.5 text-xs font-semibold text-[#f87171] hover:bg-[rgba(239,68,68,0.1)]"
                          onClick={() => setDeleteTarget(post)}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {posts.length === 0 && (
              <p className="px-4 py-8 text-center text-[#8f82ad]">Nenhum post cadastrado.</p>
            )}
          </div>
        )}
      </section>

      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Excluir post"
        description={`Deseja excluir "${deleteTarget?.titulo}"? Essa ação não pode ser desfeita.`}
        itemName={deleteTarget?.titulo || ""}
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />

      <Footer />
    </div>
  );
}
