import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LandingHeader } from "../components/ui/LandingHeader";
import { Footer, CookieConsentBanner } from "../components";
import { SkeletonDecksGrid } from "../components/ui/Skeleton";
import { usePageTitle } from "../hooks/usePageTitle";
import { PAGE_TITLES } from "../constants/pageTitles";
import { buscarConteudoHome, listarDecks } from "../services/backendApi";
import { deckPath } from "../utils/deckUrl";
import { buscarCartasPorNome } from "../services/scryfallApi";

const ENV_FUGUETE_ID = String(import.meta.env.VITE_FUGUETE_USER_ID || "").trim();

export function LandingDecksFuguetePage() {
  usePageTitle(PAGE_TITLES.decksFuguete);
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [images, setImages] = useState({});

  useEffect(() => {
    let ativo = true;
    setLoading(true);
    setError("");

    (async () => {
      try {
        let usuarioId = ENV_FUGUETE_ID;
        if (!usuarioId) {
          try {
            const conteudo = await buscarConteudoHome();
            usuarioId = conteudo?.fugueteUsuarioId || "";
          } catch {
            /* fallback abaixo */
          }
        }

        const params = usuarioId
          ? { usuarioId, limite: 100 }
          : { jogador: "Tiago Fuguete", limite: 100 };
        const data = await listarDecks(null, params);
        if (!ativo) return;
        setDecks(Array.isArray(data?.decks) ? data.decks : []);
      } catch (err) {
        if (ativo) setError(err.message || "Não foi possível carregar os decks.");
      } finally {
        if (ativo) setLoading(false);
      }
    })();

    return () => { ativo = false; };
  }, []);

  useEffect(() => {
    /** Mesma regra do perfil público / MyDecks: representativa → commander → 1ª do main. */
    const coverName = (deck) =>
      deck.cartaRepresentativa
      || deck.cartaFundo
      || deck.commander?.[0]?.nome
      || deck.maindeck?.[0]?.nome
      || "";

    const withCard = decks
      .map((deck) => ({ deck, nome: coverName(deck) }))
      .filter((item) => item.nome);
    if (withCard.length === 0) return undefined;

    let ativo = true;
    buscarCartasPorNome(withCard.map((item) => item.nome)).then((cards) => {
      if (!ativo) return;
      setImages(
        Object.fromEntries(
          cards
            .map((card, i) => {
              const url = card?.artCrop || card?.imagem;
              return url ? [withCard[i].deck.id, url] : null;
            })
            .filter(Boolean),
        ),
      );
    });
    return () => { ativo = false; };
  }, [decks]);

  return (
    <div className="min-h-screen bg-[#0e091c] text-[#e8dfff]">
      <LandingHeader />

      <section className="max-w-4xl mx-auto px-4 pt-28 pb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Decks do Tiago Fuguete</h1>
        <p className="text-[#9b8dc0] max-w-2xl mx-auto">
          Listas públicas do canal — explore e inspire-se para os torneios Pauper.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-16">
        {loading ? (
          <SkeletonDecksGrid />
        ) : error ? (
          <p className="text-center text-red-300">{error}</p>
        ) : decks.length === 0 ? (
          <p className="text-center text-[#9b8dc0]">
            Nenhum deck público encontrado. Configure <code className="text-brand">VITE_FUGUETE_USER_ID</code> ou o ID no conteúdo da home.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {decks.map((deck) => (
              <Link
                key={deck.id}
                to={deckPath(deck)}
                className="group overflow-hidden rounded-xl border border-line-soft bg-[rgba(167,79,255,0.08)] transition hover:border-[rgba(199,149,255,0.4)]"
              >
                <div className="aspect-[16/9] overflow-hidden bg-[rgba(167,79,255,0.12)]">
                  {images[deck.id] ? (
                    <img
                      src={images[deck.id]}
                      alt=""
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : null}
                </div>
                <div className="p-4">
                  <h2 className="m-0 text-base font-semibold text-[#e8dfff] group-hover:text-brand transition-colors line-clamp-2">
                    {deck.nome}
                  </h2>
                  {deck.formato ? (
                    <p className="m-0 mt-1 text-xs text-[#9b8dc0]">{deck.formato}</p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Footer />
      <CookieConsentBanner />
    </div>
  );
}
