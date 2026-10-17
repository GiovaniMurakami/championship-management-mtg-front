import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LandingHeader } from "../components/ui/LandingHeader";
import { Footer, CookieConsentBanner } from "../components";
import { SkeletonHallDaFama } from "../components/ui/Skeleton";
import { AdSenseUnit } from "../components/ui/AdSenseUnit";
import { usePageTitle } from "../hooks/usePageTitle";
import { PAGE_TITLES } from "../constants/pageTitles";
import { listarHallDaFama } from "../services/backendApi";
import { tournamentPath } from "../utils/tournamentUrl";

const PAGE_SIZE = 24;

export function HallDaFamaPage() {
  usePageTitle(PAGE_TITLES.hallDaFama);
  const [itens, setItens] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    let ativo = true;
    setLoading(true);
    listarHallDaFama({ limite: PAGE_SIZE, offset })
      .then((data) => {
        if (!ativo) return;
        setItens(Array.isArray(data?.itens) ? data.itens : []);
        setTotal(Number(data?.total) || 0);
      })
      .catch(() => {
        if (!ativo) return;
        setItens([]);
        setTotal(0);
      })
      .finally(() => {
        if (ativo) setLoading(false);
      });
    return () => { ativo = false; };
  }, [offset]);

  const paginaAtual = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPaginas = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="min-h-screen bg-[#0e091c] text-[#e8dfff]">
      <LandingHeader />

      <section className="max-w-4xl mx-auto px-4 pt-28 pb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Hall da Fama</h1>
        <p className="text-[#9b8dc0] max-w-2xl mx-auto">
          Compilado das imagens de Top 8 dos torneios Fuguete — do mais recente ao mais antigo.
        </p>
        <p className="mt-4">
          <Link to="/torneios" className="text-brand font-semibold hover:underline">
            Participe dos torneios FREE
          </Link>
        </p>
      </section>

      <div className="max-w-5xl mx-auto px-4 pb-4">
        <AdSenseUnit unit="topBanner" className="w-full min-h-[50px]" />
      </div>

      <section className="max-w-6xl mx-auto px-4 pb-16">
        {loading ? (
          <SkeletonHallDaFama />
        ) : itens.length === 0 ? (
          <p className="text-center text-[#9b8dc0] py-12">
            Ainda não há Top 8 publicados. Finalize um torneio e publique a story no Hall.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {itens.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setLightbox(item)}
                className="group text-left rounded-xl overflow-hidden border border-line-soft bg-[rgba(167,79,255,0.08)] hover:border-[rgba(199,149,255,0.4)] transition-all cursor-pointer"
              >
                <img
                  src={item.imagemUrl}
                  alt={item.torneioNome || "Top 8"}
                  className="w-full aspect-[9/16] object-cover object-top group-hover:scale-[1.02] transition-transform duration-300"
                  loading="lazy"
                />
                <div className="p-3">
                  <p className="m-0 font-semibold text-sm line-clamp-2">{item.torneioNome || "Torneio"}</p>
                  {(item.dataTorneio || item.criadoEm) ? (
                    <p className="m-0 mt-1 text-xs text-[#9b8dc0]">
                      {new Date(item.dataTorneio || item.criadoEm).toLocaleDateString("pt-BR")}
                    </p>
                  ) : null}
                </div>
              </button>
            ))}
          </div>
        )}

        {totalPaginas > 1 ? (
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              type="button"
              className="px-4 py-2 rounded-lg border border-line text-sm disabled:opacity-40"
              disabled={offset <= 0 || loading}
              onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
            >
              Anterior
            </button>
            <span className="text-sm text-[#9b8dc0]">
              {paginaAtual} / {totalPaginas}
            </span>
            <button
              type="button"
              className="px-4 py-2 rounded-lg border border-line text-sm disabled:opacity-40"
              disabled={offset + PAGE_SIZE >= total || loading}
              onClick={() => setOffset((o) => o + PAGE_SIZE)}
            >
              Próxima
            </button>
          </div>
        ) : null}
      </section>

      {lightbox ? (
        <div
          className="fixed inset-0 z-[200] bg-black/85 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Preview Top 8"
        >
          <div className="max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightbox.imagemUrl}
              alt={lightbox.torneioNome || "Top 8"}
              className="w-full rounded-xl"
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <p className="m-0 font-semibold">{lightbox.torneioNome}</p>
              {lightbox.torneioId ? (
                <Link
                  to={tournamentPath({ id: lightbox.torneioId, nome: lightbox.torneioNome })}
                  className="text-brand text-sm font-semibold hover:underline"
                >
                  Ver torneio
                </Link>
              ) : null}
            </div>
            <button
              type="button"
              className="mt-4 w-full py-2 rounded-lg border border-line text-sm"
              onClick={() => setLightbox(null)}
            >
              Fechar
            </button>
          </div>
        </div>
      ) : null}

      <Footer />
      <CookieConsentBanner />
    </div>
  );
}
