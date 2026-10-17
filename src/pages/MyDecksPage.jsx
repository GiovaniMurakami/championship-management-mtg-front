import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { listarDecks, deletarDeck } from "../services/backendApi";
import { buscarCartasPorNome } from "../services/scryfallApi";
import { useRequestSequence } from "../hooks/useRequestSequence";
import { SkeletonCollection } from "../components";
import { DeckCard } from "../components/deck/DeckCard";
import { DeckImageModal } from "../components/deck/DeckImageModal";
import { PageShell } from "../components/ui/PageShell";
import { EmptyState } from "../components/ui/EmptyState";
import { InlineAlert } from "../components/ui/InlineAlert";
import { DeleteConfirmModal } from "../components/ui/DeleteConfirmModal";
import { Tabs } from "../components/ui/Tabs";
import { Button } from "../components/ui/Button";
import { TOURNAMENT_INPUT_CLASS } from "../styles/uiClasses";
import { buildDeckExternalUrl } from "../utils/externalNavigation";
import { deckPath } from "../utils/deckUrl";
import { usePageTitle } from "../hooks/usePageTitle";
import { PAGE_TITLES } from "../constants/pageTitles";

const LIMITE = 18;

export function MyDecksPage() {
  const { usuario, token, requireAuth } = useAuth();
  const navigate = useNavigate();

  usePageTitle(PAGE_TITLES.meusDecks);

  const [decks, setDecks] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deckImages, setDeckImages] = useState({});

  const [buscaInput, setBuscaInput] = useState("");
  const [busca, setBusca] = useState("");
  const [jogadorInput, setJogadorInput] = useState("");
  const [jogador, setJogador] = useState("");
  const [somenteMyDecks, setSomenteMyDecks] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [tabTotals, setTabTotals] = useState({ todos: null, meus: null });

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, deck: null });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [imageModal, setImageModal] = useState(null);
  const [sharedDeckId, setSharedDeckId] = useState(null);

  const listRequest = useRequestSequence();
  const imageRequest = useRequestSequence();

  const isOwner = useCallback(
    (deck) => String(deck.usuario?.id ?? deck.usuarioId) === String(usuario?.id),
    [usuario?.id]
  );

  const tokenRef = useRef(token);
  tokenRef.current = token;

  const handleAbaChange = useCallback((value) => {
    if (value === "meus" && !usuario?.id) {
      requireAuth(() => {
        setSomenteMyDecks(true);
        setPagina(1);
        setDecks([]);
        setTotal(0);
        setError("");
      });
      return;
    }
    setSomenteMyDecks(value === "meus");
    setPagina(1);
    setDecks([]);
    setTotal(0);
    setError("");
  }, [usuario?.id, requireAuth]);

  const loadDecks = useCallback(async () => {
    const request = listRequest();
    setLoading(true);
    setError("");
    try {
      const params = { limite: LIMITE, offset: (pagina - 1) * LIMITE };
      if (somenteMyDecks && usuario?.id) params.usuarioId = usuario.id;
      if (busca.trim()) params.nome = busca.trim();
      if (jogador.trim()) params.jogador = jogador.trim();
      const data = await listarDecks(tokenRef.current, params);
      if (!request.isCurrent()) return;
      setDecks(data.decks);
      setTotal(data.total);
      setTabTotals((prev) => (
        somenteMyDecks
          ? { ...prev, meus: data.total }
          : { ...prev, todos: data.total }
      ));
    } catch (err) {
      if (!request.isCurrent()) return;
      setError(err.message || "Erro ao carregar decks.");
    } finally {
      if (request.isCurrent()) setLoading(false);
    }
  }, [pagina, somenteMyDecks, usuario?.id, busca, jogador, listRequest]);

  useEffect(() => {
    loadDecks();
  }, [loadDecks]);

  useEffect(() => {
    let active = true;
    const common = {};
    if (busca.trim()) common.nome = busca.trim();
    if (jogador.trim()) common.jogador = jogador.trim();
    Promise.all([
      listarDecks(tokenRef.current, { ...common, limite: 1, offset: 0 }),
      usuario?.id ? listarDecks(tokenRef.current, { ...common, usuarioId: usuario.id, limite: 1, offset: 0 }) : Promise.resolve({ total: 0 }),
    ]).then(([todos, meus]) => {
      if (active) setTabTotals({ todos: todos.total, meus: meus.total });
    }).catch(() => {});
    return () => { active = false; };
  }, [busca, jogador, usuario?.id, token]);

  // Carrega imagem da primeira carta de cada deck
  useEffect(() => {
    if (decks.length === 0) return;
    const request = imageRequest();
    const fetchImages = async () => {
      const decksWithCards = decks.filter((d) => d.maindeck?.length > 0);
      const cards = await buscarCartasPorNome(
        decksWithCards.map((deck) => deck.maindeck[0].nome),
      );
      if (!request.isCurrent()) return;

      const entries = cards.map((carta, index) =>
        carta?.artCrop ? [decksWithCards[index].id, carta.artCrop] : null,
      );
      setDeckImages(Object.fromEntries(entries.filter(Boolean)));
    };
    fetchImages();
  }, [decks, imageRequest]);

  const totalPaginas = Math.ceil(total / LIMITE) || 1;
  const decksPagina = decks;

  const handleBusca = (e) => {
    e.preventDefault();
    setPagina(1);
    setBusca(buscaInput);
    setJogador(jogadorInput);
  };

  const handleLimparFiltros = () => {
    setBusca("");
    setBuscaInput("");
    setJogador("");
    setJogadorInput("");
    setPagina(1);
  };

  const handleOpenDeleteModal = (deck) => {
    setDeleteModal({ isOpen: true, deck });
    setDeleteError("");
  };

  const handleCloseDeleteModal = () => {
    setDeleteModal({ isOpen: false, deck: null });
    setDeleteError("");
    setDeleteLoading(false);
  };

  const handleDeleteDeck = async (confirmName, onSuccess) => {
    if (!deleteModal.deck) return;
    if (confirmName !== deleteModal.deck.nome) {
      setDeleteError("O nome do deck não corresponde. Digite exatamente como está escrito.");
      return;
    }
    setDeleteLoading(true);
    setDeleteError("");
    try {
      await deletarDeck(deleteModal.deck.id, token);
      onSuccess?.();
      await loadDecks();
    } catch (err) {
      setDeleteError(err.message || "Erro ao excluir o deck. Tente novamente.");
    } finally {
      setDeleteLoading(false);
    }
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
    } catch (error) {
      if (error?.name === "AbortError") return;
    }

    navigator.clipboard?.writeText(url).then(() => {
      setSharedDeckId(deck.id);
      window.setTimeout(() => {
        setSharedDeckId((currentId) => (currentId === deck.id ? null : currentId));
      }, 2000);
    });
  };

  const temFiltrosAtivos = Boolean(busca || jogador);

  return (
    <PageShell>
      {/* Header */}
      <div className="flex justify-between items-center mb-6 max-sm:flex-col max-sm:gap-4 max-sm:items-stretch max-sm:text-center">
        <div>
          <h1 className="font-display text-[2.2rem] tracking-[0.04em] mb-[0.2rem] mt-0 text-text-main">
            Decks
          </h1>
          {!loading && (
            <p className="m-0 text-[0.85rem] text-text-soft">
              {total} deck{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <Button
          className="max-sm:w-full"
          onClick={() => requireAuth(() => navigate("/decks/criar"))}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Criar deck
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3 mb-2">
        <form onSubmit={handleBusca} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Buscar deck por nome..."
            value={buscaInput}
            onChange={(e) => setBuscaInput(e.target.value)}
            className={`${TOURNAMENT_INPUT_CLASS} flex-1`}
          />
          <input
            type="text"
            placeholder="Buscar por jogador..."
            value={jogadorInput}
            onChange={(e) => setJogadorInput(e.target.value)}
            className={`${TOURNAMENT_INPUT_CLASS} flex-1`}
          />
          <Button type="submit" variant="secondary" className="whitespace-nowrap">
            Buscar
          </Button>
          {temFiltrosAtivos && (
            <button
              type="button"
              onClick={handleLimparFiltros}
              className="px-3 py-2 border border-line rounded-lg text-text-soft text-[0.85rem] hover:text-white hover:border-[rgba(199,149,255,0.4)] transition-colors whitespace-nowrap"
            >
              Limpar
            </button>
          )}
        </form>
      </div>

      <Tabs value={somenteMyDecks ? "meus" : "todos"} onChange={handleAbaChange}>
        <Tabs.Item
          value="todos"
          label="Todos os decks"
          count={tabTotals.todos != null ? tabTotals.todos : undefined}
        />
        <Tabs.Item
          value="meus"
          label="Meus decks"
          count={tabTotals.meus != null ? tabTotals.meus : undefined}
        />
      </Tabs>

      {/* Conteúdo */}
      <div aria-busy={loading} aria-live="polite">
      {loading ? (
        <SkeletonCollection count={6} className="mt-6" />
      ) : error ? (
        <InlineAlert
          type="error"
          className="mt-6"
          action={(
            <button
              type="button"
              onClick={() => loadDecks()}
              className="text-[0.82rem] font-semibold underline underline-offset-2 opacity-90 hover:opacity-100 cursor-pointer bg-transparent border-none p-0 text-inherit"
            >
              Tentar novamente
            </button>
          )}
        >
          {error}
        </InlineAlert>
      ) : decksPagina.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon="🃏"
          title={temFiltrosAtivos ? "Nenhum deck encontrado" : "Nenhum deck ainda"}
          description={
            temFiltrosAtivos
              ? "Tente ajustar os filtros de busca."
              : "Crie seu primeiro deck para começar a jogar."
          }
          action={!temFiltrosAtivos && (
            <Button onClick={() => requireAuth(() => navigate("/decks/criar"))}>
              Criar primeiro deck
            </Button>
          )}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
            {decksPagina.map((deck) => {
              const owner = isOwner(deck);
              return (
                <DeckCard
                  key={deck.id}
                  deck={deck}
                  imageUrl={deckImages[deck.id]}
                  isOwner={owner}
                  shared={sharedDeckId === deck.id}
                  onShare={() => handleShareDeck(deck)}
                  onOwnerClick={() => navigate(`/usuarios/${deck.usuario.id}`)}
                  onEdit={() => navigate(deckPath(deck), { state: { deck } })}
                  onDelete={() => handleOpenDeleteModal(deck)}
                  onView={() => navigate(deckPath(deck, { view: true }), { state: { deck, readOnly: true } })}
                  onGenerateImage={() => setImageModal(deck)}
                />
              );
            })}
          </div>

          {/* Paginação */}
          {totalPaginas > 1 && (
            <nav className="flex items-center justify-center gap-3 mt-8" aria-label="Paginação de decks">
              <button
                type="button"
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={pagina === 1}
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
                disabled={pagina === totalPaginas}
                aria-label="Próxima página"
                className="px-3 py-2 border border-line rounded-lg text-text-soft text-[0.85rem] disabled:opacity-40 hover:border-[rgba(199,149,255,0.4)] hover:text-white transition-colors"
              >
                →
              </button>
            </nav>
          )}
        </>
      )}
      </div>

      {imageModal && (
        <DeckImageModal
          deck={imageModal}
          ownerName={imageModal.usuario?.nome || (isOwner(imageModal) ? usuario?.nome : "")}
          onClose={() => setImageModal(null)}
        />
      )}

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={handleCloseDeleteModal}
        itemName={deleteModal.deck?.nome ?? ""}
        onConfirm={handleDeleteDeck}
        loading={deleteLoading}
        error={deleteError}
        title="Excluir deck"
      />
    </PageShell>
  );
}
