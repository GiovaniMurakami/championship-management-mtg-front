import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { LandingHeader } from "../components/ui/LandingHeader";
import { Footer } from "../components";
import { BlogContent } from "../components/blog/BlogContent";
import { InlineAlert } from "../components/ui/InlineAlert";
import { Spinner } from "../components/ui/Spinner";
import { usePageTitle } from "../hooks/usePageTitle";
import { PAGE_TITLES } from "../constants/pageTitles";
import { buscarPostBlog } from "../services/backendApi";

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  usePageTitle(post?.titulo || PAGE_TITLES.blog, { loading: loading && !post?.titulo });

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    buscarPostBlog(slug)
      .then((data) => {
        if (!active) return;
        setPost(data.post || data);
      })
      .catch(() => {
        if (!active) return;
        setError("Post não encontrado.");
        setPost(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  return (
    <div className="min-h-screen bg-[#0e091c] text-[#e8dfff]">
      <LandingHeader />

      <article className="mx-auto max-w-4xl px-4 pt-28 pb-12">
        <Link
          to="/blog"
          className="mb-6 inline-flex text-sm font-semibold text-[#c795ff] underline underline-offset-2 hover:text-[#e8dfff]"
        >
          ← Voltar para o blog
        </Link>

        {loading && <Spinner text="Carregando post..." />}
        {error && <InlineAlert type="error">{error}</InlineAlert>}

        {post && (
          <>
            {post.imagemCapaUrl && (
              <img
                src={post.imagemCapaUrl}
                alt={post.titulo}
                className="mb-8 h-72 w-full rounded-2xl object-cover"
              />
            )}
            <p className="mb-3 text-sm uppercase tracking-[0.08em] text-[#8f82ad]">
              {formatDate(post.publicadoEm)}
              {post.autorNome ? ` · ${post.autorNome}` : ""}
            </p>
            <h1 className="mb-4 text-3xl font-bold text-[#f5edff] md:text-4xl">{post.titulo}</h1>
            {post.resumo && (
              <p className="mb-8 text-lg text-[#b9abd8]">{post.resumo}</p>
            )}
            <BlogContent html={post.conteudo} />
          </>
        )}
      </article>

      <Footer />
    </div>
  );
}
