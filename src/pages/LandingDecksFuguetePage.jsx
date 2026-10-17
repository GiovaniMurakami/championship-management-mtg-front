import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LandingHeader } from "../components/ui/LandingHeader";
import { Footer, CookieConsentBanner, SkeletonCollection } from "../components";
import { DeckCard } from "../components/deck/DeckCard";
import { DeckImageModal } from "../components/deck/DeckImageModal";
import { DeleteConfirmModal } from "../components/ui/DeleteConfirmModal";
import { Button } from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";
import { useLandingSeo } from "../hooks/useLandingSeo";
import { buscarConteudoHome, deletarDeck, listarDecks } from "../services/backendApi";
import { buscarCartasPorNome } from "../services/scryfallApi";
import { buildDeckExternalUrl } from "../utils/externalNavigation";
import { deckPath } from "../utils/deckUrl";
import { TOURNAMENT_INPUT_CLASS } from "../styles/uiClasses";

const ENV_FUGUETE_ID = String(import.meta.env.VITE_FUGUETE_USER_ID || "").trim();
const LIMITE = 18;

export function LandingDecksFuguetePage() {
  useLandingSeo("decksFuguete");
  const navigate = useNavigate();
  const { usuario, token } = useAuth();
  const [decks, setDecks] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [filtroBase, setFiltroBase] = useState(null);
  const [buscaInput, setBuscaInput] = useState("");
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [images, setImages] = useState({});
  const [imageModal, setImageModal] = useState(null);
  const [sharedDeckId, setSharedDeckId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, deck: null });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    let ativo = true;
    (async () => {
      let usuarioId = ENV_FUGUETE_ID;
      if (!usuarioId) {
        try {
          const conteudo = await buscarConteudoHome();
          usuarioId = conteudo?.fugueteUsuarioId || "";
        } catch {
          /* fallback abaixo */
        }
      }
      if (!ativo) return;
      setFiltroBase(
        usuarioId
          ? { usuarioId }
          : { jogador: "Tiago Fuguete" },
      );
    })();
    return () => { ativo = false; };
  }, []);

  useEffect(() => {
    if (!filtroBase) return undefined;
    let ativo = true;
    setLoading(true);
    setError("");

    const params = {
      ...filtroBase,
      limite: LIMITE,
      offset: (pagina - 1) * LIMITE,
    };
    if (busca.trim()) params.nome = busca.trim();

    listarDecks(null, params)
      .then((data) => {
        if (!ativo) return;
        setDecks(Array.isArray(data?.decks) ? data.decks : []);
        setTotal(Number(data?.total) || 0);
      })
      .catch((err) => {
        if (!ativo) return;
        setError(err.message || "Não foi possível carregar os decks.");
        setDecks([]);
        setTotal(0);
      })
      .finally(() => {
        if (ativo) setLoading(false);
      });

    return () => { ativo = false; };
  }, [filtroBase, pagina, busca]);

  useEffect(() => {
    if (decks.length === 0) return undefined;
    const decksWithCards = decks.filter((d) => d.maindeck?.length > 0);
    if (decksWithCards.length === 0) return undefined;

    let ativo = true;
    buscarCartasPorNome(decksWithCards.map((deck) => deck.maindeck[0].nome)).then((cards) => {
      if (!ativo) return;
      const entries = cards.map((carta, index) =>
        carta?.artCrop ? [decksWithCards[index].id, carta.artCrop] : null,
      );
      setImages(Object.fromEntries(entries.filter(Boolean)));
    });
    return () => { ativo = false; };
  }, [decks]);

  const totalPaginas = Math.ceil(total / LIMITE) || 1;
  const temBusca = Boolean(busca.trim());

  const isOwner = (deck) =>
    String(deck.usuario?.id ?? deck.usuarioId) === String(usuario?.id);

  const handleBusca = (e) => {
    e.preventDefault();
    setPagina(1);
    setBusca(buscaInput);
  };

  const handleLimparBusca = () => {
    setBuscaInput("");
    setBusca("");
    setPagina(1);
  };

  const handleShareDeck = async (deck) => {
    const url = buildDeckExternalUrl(deck);
    try {
      if (navigator.share) {
        await navigator.share({
          title: deck.nome || "Deck",
          text: "Confira este deck no app.",
          url,
        });
        return;
      }
    } catch (err) {
      if (err?.name === "AbortError") return;
    }
    navigator.clipboard?.writeText(url).then(() => {
      setSharedDeckId(deck.id);
      window.setTimeout(() => {
        setSharedDeckId((currentId) => (currentId === deck.id ? null : currentId));
      }, 2000);
    });
  };

  const handleDeleteDeck = async (confirmName, onSuccess) => {
    if (!deleteModal.deck || !token) return;
    if (confirmName !== deleteModal.deck.nome) {
      setDeleteError("O nome do deck não corresponde. Digite exatamente como está escrito.");
      return;
    }
    setDeleteLoading(true);
    setDeleteError("");
    try {
      await deletarDeck(deleteModal.deck.id, token);
      const restante = decks.length - 1;
      if (restante === 0 && pagina > 1) {
        setPagina((p) => p - 1);
      } else {
        setDecks((prev) => prev.filter((d) => d.id !== deleteModal.deck.id));
        setTotal((t) => Math.max(0, t - 1));
      }
      onSuccess?.();
      setDeleteModal({ isOpen: false, deck: null });
    } catch (err) {
      setDeleteError(err.message || "Erro ao excluir o deck. Tente novamente.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e091c] text-[#e8dfff]">
      <LandingHeader />

      <section className="max-w-4xl mx-auto px-4 pt-28 pb-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Decks do Tiago Fuguete</h1>
        <p className="text-[#9b8dc0] max-w-2xl mx-auto">
          Listas públicas do canal — explore e inspire-se para os torneios Pauper.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-16">
        <form onSubmit={handleBusca} className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="search"
            placeholder="Buscar deck por nome..."
            value={buscaInput}
            onChange={(e) => setBuscaInput(e.target.value)}
            className={`${TOURNAMENT_INPUT_CLASS} flex-1`}
            aria-label="Buscar deck por nome"
          />
          <div className="flex gap-2">
            <Button type="submit" variant="secondary" className="flex-1 sm:flex-none whitespace-nowrap">
              Buscar
            </Button>
            {temBusca ? (
              <button
                type="button"
                onClick={handleLimparBusca}
                className="px-3 py-2 border border-line rounded-lg text-text-soft text-[0.85rem] hover:text-white hover:border-[rgba(199,149,255,0.4)] transition-colors whitespace-nowrap"
              >
                Limpar
              </button>
            ) : null}
          </div>
        </form>

        {!loading && total > 0 ? (
          <p className="m-0 mb-4 text-center text-[0.85rem] text-[#9b8dc0] sm:text-left">
            {total} deck{total !== 1 ? "s" : ""}
            {temBusca ? ` para “${busca.trim()}”` : ""}
          </p>
        ) : null}

        {loading ? (
          <SkeletonCollection count={6} />
        ) : error ? (
          <p className="text-center text-red-300">{error}</p>
        ) : decks.length === 0 ? (
          <p className="text-center text-[#9b8dc0]">
            {temBusca
              ? "Nenhum deck encontrado com esse nome. Tente outro termo."
              : (
                <>
                  Nenhum deck público encontrado. Configure <code className="text-brand">VITE_FUGUETE_USER_ID</code> ou o ID no conteúdo da home.
                </>
              )}
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {decks.map((deck) => {
                const owner = isOwner(deck);
                return (
                  <DeckCard
                    key={deck.id}
                    deck={deck}
                    imageUrl={images[deck.id]}
                    isOwner={owner}
                    shared={sharedDeckId === deck.id}
                    onShare={() => handleShareDeck(deck)}
                    onOwnerClick={() => deck.usuario?.id && navigate(`/usuarios/${deck.usuario.id}`)}
                    onEdit={() => navigate(deckPath(deck), { state: { deck } })}
                    onDelete={() => {
                      setDeleteModal({ isOpen: true, deck });
                      setDeleteError("");
                    }}
                    onView={() => navigate(deckPath(deck, { view: true }), { state: { deck, readOnly: true } })}
                    onGenerateImage={() => setImageModal(deck)}
                  />
                );
              })}
            </div>

            {totalPaginas > 1 ? (
              <nav className="flex items-center justify-center gap-3 mt-8" aria-label="Paginação de decks">
                <button
                  type="button"
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  disabled={pagina === 1 || loading}
                  aria-label="Página anterior"
                  className="px-3 py-2 border border-line rounded-lg text-text-soft text-[0.85rem] disabled:opacity-40 hover:border-[rgba(199,149,255,0.4)] hover:text-white transition-colors"
                >
                  ←
                </button>
                <span className="text-text-soft text-[0.85rem] min-w-[60px] text-center" aria-live="polite">
                  {pagina} / {totalPaginas}
                </span>
                <button
                  type="button"
                  onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                  disabled={pagina === totalPaginas || loading}
                  aria-label="Próxima página"
                  className="px-3 py-2 border border-line rounded-lg text-text-soft text-[0.85rem] disabled:opacity-40 hover:border-[rgba(199,149,255,0.4)] hover:text-white transition-colors"
                >
                  →
                </button>
              </nav>
            ) : null}
          </>
        )}
      </section>

      {imageModal ? (
        <DeckImageModal
          deck={imageModal}
          ownerName={imageModal.usuario?.nome || (isOwner(imageModal) ? usuario?.nome : "")}
          onClose={() => setImageModal(null)}
        />
      ) : null}

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => {
          setDeleteModal({ isOpen: false, deck: null });
          setDeleteError("");
          setDeleteLoading(false);
        }}
        itemName={deleteModal.deck?.nome ?? ""}
        onConfirm={handleDeleteDeck}
        loading={deleteLoading}
        error={deleteError}
        title="Excluir deck"
      />

      <Footer />
      <CookieConsentBanner />
    </div>
  );
}
