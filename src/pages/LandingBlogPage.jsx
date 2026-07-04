import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LandingHeader } from "../components/ui/LandingHeader";
import { Footer } from "../components";
import { InlineAlert } from "../components/ui/InlineAlert";
import { Spinner } from "../components/ui/Spinner";
import { usePageTitle } from "../hooks/usePageTitle";
import { PAGE_TITLES } from "../constants/pageTitles";
import { listarPostsBlog } from "../services/backendApi";
import { useAuth } from "../hooks/useAuth";

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function LandingBlogPage() {
  usePageTitle(PAGE_TITLES.blog);
  const { isAdmin } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    listarPostsBlog({ limite: 24 })
      .then((data) => {
        if (!active) return;
        setPosts(data.posts || []);
      })
      .catch(() => {
        if (!active) return;
        setError("Não foi possível carregar os posts do blog.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0e091c] text-[#e8dfff]" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" }}>
      <LandingHeader />

      <section className="max-w-7xl mx-auto px-4 pt-28 pb-12">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Veja as novidades</h1>
            <p className="text-[#9b8dc0] max-w-3xl">
              Além dos torneios, você pode acessar conteúdos educativos, deck techs, dicas de gameplay e muito mais.
              O objetivo é simples: fazer você se divertir e melhorar como jogador de Magic: The Gathering no formato Pauper.
            </p>
          </div>
          {isAdmin && (
            <Link
              to="/landing/admin"
              className="rounded-xl border border-[rgba(199,149,255,0.35)] bg-[rgba(167,79,255,0.12)] px-4 py-2 text-sm font-semibold text-[#e8dfff] no-underline transition hover:bg-[rgba(167,79,255,0.2)]"
            >
              Gerenciar landing
            </Link>
          )}
        </div>

        {loading && <Spinner text="Carregando posts..." />}
        {error && <InlineAlert type="error">{error}</InlineAlert>}

        {!loading && !error && posts.length === 0 && (
          <p className="text-center text-[#9b8dc0]">Nenhum post publicado ainda.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="group rounded-xl overflow-hidden bg-[rgba(167,79,255,0.08)] hover:bg-[rgba(167,79,255,0.15)] border border-[rgba(217,180,255,0.1)] hover:border-[rgba(199,149,255,0.3)] transition-all no-underline"
            >
              <div className="overflow-hidden">
                {post.imagemCapaUrl ? (
                  <img
                    src={post.imagemCapaUrl}
                    alt={post.titulo}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center bg-[rgba(167,79,255,0.08)] text-sm text-[#8f82ad]">
                    Sem imagem de capa
                  </div>
                )}
              </div>
              <div className="p-5">
                <p className="mb-2 text-xs uppercase tracking-[0.08em] text-[#8f82ad]">
                  {formatDate(post.publicadoEm)}
                </p>
                <h2 className="font-semibold text-[#e8dfff] text-lg mb-2 line-clamp-2 group-hover:text-[#c795ff] transition-colors">
                  {post.titulo}
                </h2>
                <p className="text-[#9b8dc0] text-sm mb-3 line-clamp-3">{post.resumo}</p>
                <span className="text-[#c795ff] text-sm font-medium">Ler mais &gt;&gt;</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
