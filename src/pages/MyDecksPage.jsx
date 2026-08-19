import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { listarDecks, deletarDeck } from "../services/backendApi";
import { buscarCartasPorNome } from "../services/scryfallApi";
import { useRequestSequence } from "../hooks/useRequestSequence";
import { SkeletonCard } from "../components";
import { DeckImageModal } from "../components/deck/DeckImageModal";
import { PageShell } from "../components/ui/PageShell";
import { EmptyState } from "../components/ui/EmptyState";
import { InlineAlert } from "../components/ui/InlineAlert";
import { DeleteConfirmModal } from "../components/ui/DeleteConfirmModal";
import { Tabs } from "../components/ui/Tabs";
import { Tooltip } from "../components/ui/Tooltip";
import { UsuarioNomeExibicao } from "../components/ui/UsuarioExcluidoTag";
import { TOURNAMENT_INPUT_CLASS } from "../styles/uiClasses";
import { buildDeckExternalUrl } from "../utils/externalNavigation";
import { usePageTitle } from "../hooks/usePageTitle";
import { PAGE_TITLES } from "../constants/pageTitles";

const FORMAT_META = {
  standard: { label: "Standard", color: "#93c5fd", bg: "rgba(59,130,246,0.18)", border: "rgba(59,130,246,0.45)" },
  modern: { label: "Modern", color: "#fdba74", bg: "rgba(234,88,12,0.18)", border: "rgba(234,88,12,0.45)" },
  pioneer: { label: "Pioneer", color: "#6ee7b7", bg: "rgba(16,185,129,0.18)", border: "rgba(16,185,129,0.45)" },
  legacy: { label: "Legacy", color: "#c4b5fd", bg: "rgba(139,92,246,0.18)", border: "rgba(139,92,246,0.45)" },
  commander: { label: "Commander", color: "#fcd34d", bg: "rgba(245,158,11,0.18)", border: "rgba(245,158,11,0.45)" },
  commander500: { label: "Commander 500", color: "#f59e0b", bg: "rgba(245,158,11,0.18)", border: "rgba(245,158,11,0.45)" },
  pauper: { label: "Pauper", color: "#cbd5e1", bg: "rgba(148,163,184,0.18)", border: "rgba(148,163,184,0.45)" },
};

const LIMITE = 20;

function calcularTotalCartas(cartas) {
  return cartas?.reduce((total, carta) => total + (carta.quantidade || 1), 0) || 0;
}

function FormatBadge({ formato }) {
  const meta = FORMAT_META[formato] ?? {
    label: formato,
    color: "#beafd7",
    bg: "rgba(190,175,215,0.15)",
    border: "rgba(190,175,215,0.4)",
  };
  return (
    <span
      className="px-[0.65rem] py-[0.22rem] rounded-full text-[0.7rem] font-bold tracking-[0.06em] uppercase border border-solid backdrop-blur-sm"
      style={{ color: meta.color, background: meta.bg, borderColor: meta.border }}
    >
      {meta.label}
    </span>
  );
}

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
  }, [pagina, somenteMyDecks, usuario?.id, busca, listRequest]);

  useEffect(() => {
    loadDecks();
  }, [loadDecks]);

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
        carta?.imagem ? [decksWithCards[index].id, carta.imagem] : null,
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
  };

  const handleLimparFiltros = () => {
    setBusca("");
    setBuscaInput("");
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
    const url = buildDeckExternalUrl(deck.id);

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

  const temFiltrosAtivos = Boolean(busca);

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
        <button
          className="inline-flex items-center gap-[0.4rem] border border-[rgba(199,149,255,0.6)] rounded-xl px-4 py-[0.6rem] cursor-pointer font-bold bg-gradient-to-br from-[#8e39ed] to-[#5f23b3] text-white shadow-[0_4px_12px_rgba(167,79,255,0.25)] transition-all duration-[220ms] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(167,79,255,0.4)] max-sm:justify-center"
          type="button"
          onClick={() => requireAuth(() => navigate("/decks/criar"))}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Criar deck
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3 mb-2">
        <form onSubmit={handleBusca} className="flex gap-2">
          <input
            type="text"
            placeholder="Buscar deck por nome..."
            value={buscaInput}
            onChange={(e) => setBuscaInput(e.target.value)}
            className={`${TOURNAMENT_INPUT_CLASS} flex-1`}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[rgba(79,70,229,0.18)] border border-[rgba(79,70,229,0.4)] text-[#a5b4fc] rounded-lg font-semibold text-[0.9rem] hover:bg-[rgba(79,70,229,0.32)] transition-colors whitespace-nowrap"
          >
            Buscar
          </button>
          {temFiltrosAtivos && (
            <button
              type="button"
              onClick={handleLimparFiltros}
              className="px-3 py-2 border border-[rgba(217,180,255,0.2)] rounded-lg text-[#beafd7] text-[0.85rem] hover:text-white hover:border-[rgba(199,149,255,0.4)] transition-colors whitespace-nowrap"
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
        <div className="grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-6 mt-6 max-sm:grid-cols-1">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
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
            <button
              className="border border-[rgba(199,149,255,0.6)] rounded-xl px-4 py-[0.6rem] cursor-pointer font-bold bg-gradient-to-br from-[#8e39ed] to-[#5f23b3] text-white shadow-[0_4px_12px_rgba(167,79,255,0.25)] transition-all duration-[220ms] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(167,79,255,0.4)]"
              type="button"
              onClick={() => requireAuth(() => navigate("/decks/criar"))}
            >
              Criar primeiro deck
            </button>
          )}
        />
      ) : (
        <>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-6 mt-6 max-sm:grid-cols-1">
            {decksPagina.map((deck) => {
              const owner = isOwner(deck);
              return (
                <div
                  key={deck.id}
                  className="border border-[rgba(217,180,255,0.2)] rounded-xl overflow-hidden bg-[rgba(14,9,28,0.9)] flex flex-col h-full transition-[transform,box-shadow,border-color] duration-[260ms] ease-[ease] hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.4)] hover:border-[rgba(199,149,255,0.3)]"
                >
                  <div
                    className="relative h-40 overflow-hidden bg-[radial-gradient(circle_at_70%_40%,rgba(87,20,166,0.5),transparent_60%),linear-gradient(135deg,#1a0d36,#0d071e)] bg-cover bg-[center_top]"
                    style={
                      deckImages[deck.id]
                        ? { backgroundImage: `url(${deckImages[deck.id]})` }
                        : undefined
                    }
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-[rgba(8,6,15,0.15)] to-[rgba(8,6,15,0.65)]" />
                    <div className="absolute top-[0.7rem] left-[0.75rem] right-[0.75rem] flex items-start justify-between gap-2">
                      <FormatBadge formato={deck.formato} />
                      {deck.usuario?.nome && (
                        <span className={`text-[0.72rem] bg-[rgba(14,9,28,0.65)] px-[0.55rem] py-[0.22rem] rounded-full border border-[rgba(217,180,255,0.2)] backdrop-blur-sm max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap ${owner ? "text-[#c795ff]" : "text-text-soft"}`}>
                          {owner ? "Meu deck" : (
                            <UsuarioNomeExibicao
                              nome={deck.usuario.nome}
                              excluido={deck.usuario.excluido}
                            />
                          )}
                        </span>
                      )}
                    </div>
                    <Tooltip
                      content={sharedDeckId === deck.id ? "Link copiado!" : "Compartilhar deck"}
                      placement="right"
                      focusable={false}
                      className="!absolute left-[0.75rem] bottom-[0.75rem]"
                    >
                      <button
                        className={`inline-flex items-center justify-center w-9 h-9 rounded-full border backdrop-blur-md cursor-pointer transition-all duration-[180ms] shadow-[0_8px_18px_rgba(0,0,0,0.35)] ${
                          sharedDeckId === deck.id
                            ? "border-[rgba(34,197,94,0.5)] bg-[rgba(34,197,94,0.2)] text-[#86efac]"
                            : "border-[rgba(96,165,250,0.45)] bg-[rgba(10,18,38,0.55)] text-[#dbeafe] hover:bg-[rgba(59,130,246,0.28)] hover:border-[rgba(96,165,250,0.75)] hover:text-white"
                        }`}
                        type="button"
                        aria-label={sharedDeckId === deck.id ? "Link copiado!" : "Compartilhar deck"}
                        onClick={() => handleShareDeck(deck)}
                      >
                        {sharedDeckId === deck.id ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                            <circle cx="18" cy="5" r="3" />
                            <circle cx="6" cy="12" r="3" />
                            <circle cx="18" cy="19" r="3" />
                            <path d="M8.59 13.51 15.42 17.49" />
                            <path d="M15.41 6.51 8.59 10.49" />
                          </svg>
                        )}
                      </button>
                    </Tooltip>
                  </div>

                  <div className="p-[1rem_1.1rem_1.1rem] flex flex-col flex-1">
                    <h3 className="mt-0 mb-[0.65rem] text-[1rem] font-bold text-text-main leading-[1.3]">
                      {deck.nome}
                    </h3>

                    <div className="flex flex-wrap gap-[0.4rem] mb-[0.85rem]">
                      <div className="inline-flex items-center gap-[0.3rem] px-[0.55rem] py-[0.2rem] rounded-full border border-[rgba(217,180,255,0.2)] bg-white/[0.03] text-[0.76rem] text-text-soft">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                          <rect x="2" y="4" width="20" height="16" rx="2" />
                          <path d="M8 4v16M16 4v16" />
                        </svg>
                        <span>{calcularTotalCartas(deck.maindeck)} main</span>
                      </div>
                      <div className="inline-flex items-center gap-[0.3rem] px-[0.55rem] py-[0.2rem] rounded-full border border-[rgba(217,180,255,0.2)] bg-white/[0.03] text-[0.76rem] text-text-soft">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                          <polyline points="16 3 21 3 21 8" />
                          <line x1="4" y1="20" x2="21" y2="3" />
                          <polyline points="21 16 21 21 16 21" />
                          <line x1="15" y1="15" x2="21" y2="21" />
                        </svg>
                        <span>{calcularTotalCartas(deck.sideboard)} side</span>
                      </div>
                      <div className="inline-flex items-center gap-[0.3rem] px-[0.55rem] py-[0.2rem] rounded-full border border-[rgba(217,180,255,0.2)] bg-white/[0.03] text-[0.76rem] text-text-soft ml-auto">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span>{new Date(deck.criadoEm).toLocaleDateString("pt-BR", { timeZone: "UTC" })}</span>
                      </div>
                    </div>

                    {deck.visualizacoes != null && (
                      <div className="flex items-center gap-[0.4rem] mb-[0.85rem] text-[0.78rem] text-text-soft">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                          <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        <span>{deck.visualizacoes} visualizações</span>
                      </div>
                    )}

                    <div className="flex gap-2 mt-auto pt-3">
                      {owner ? (
                        <>
                          <button
                            className="flex-1 text-[0.85rem] px-3 py-2 border border-[rgba(199,149,255,0.6)] rounded-xl cursor-pointer font-bold bg-gradient-to-br from-[#8e39ed] to-[#5f23b3] text-white shadow-[0_4px_12px_rgba(167,79,255,0.25)] transition-all duration-[220ms] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(167,79,255,0.4)]"
                            type="button"
                            onClick={() => navigate(`/editar-deck/${deck.id}`, { state: { deck } })}
                          >
                            Editar
                          </button>
                          <Tooltip content="Gerar imagem do deck para compartilhar" focusable={false}>
                            <button
                              className="inline-flex items-center gap-[0.3rem] text-[0.78rem] px-[0.65rem] py-[0.42rem] border border-[rgba(167,79,255,0.4)] rounded-lg bg-[rgba(167,79,255,0.1)] text-[#c4b5fd] cursor-pointer transition-[background,border-color,color] duration-[160ms] hover:bg-[rgba(167,79,255,0.22)] hover:border-[rgba(167,79,255,0.65)] hover:text-[#e9d5ff] whitespace-nowrap"
                              type="button"
                              aria-label="Gerar imagem do deck para compartilhar"
                              onClick={() => setImageModal(deck)}
                            >
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                              </svg>
                              Imagem
                            </button>
                          </Tooltip>
                          <button
                            className="flex-1 text-[0.85rem] px-3 py-2 border border-[rgba(252,88,119,0.4)] rounded-xl cursor-pointer font-bold bg-[rgba(252,88,119,0.15)] text-[#ffc8d4] transition-all duration-[220ms] hover:bg-[rgba(252,88,119,0.28)] hover:border-[rgba(252,88,119,0.7)] hover:text-white"
                            type="button"
                            onClick={() => handleOpenDeleteModal(deck)}
                          >
                            Excluir
                          </button>
                        </>
                      ) : (
                        <button
                          className="flex-1 text-[0.85rem] px-3 py-2 border border-[rgba(199,149,255,0.6)] rounded-xl cursor-pointer font-bold bg-gradient-to-br from-[#8e39ed] to-[#5f23b3] text-white shadow-[0_4px_12px_rgba(167,79,255,0.25)] transition-all duration-[220ms] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(167,79,255,0.4)]"
                          type="button"
                          onClick={() => navigate(`/editar-deck/${deck.id}`, { state: { deck, readOnly: true } })}
                        >
                          Visualizar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
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
                className="px-3 py-2 border border-[rgba(217,180,255,0.2)] rounded-lg text-[#beafd7] text-[0.85rem] disabled:opacity-40 hover:border-[rgba(199,149,255,0.4)] hover:text-white transition-colors"
              >
                ←
              </button>
              <span className="text-[#beafd7] text-[0.85rem] min-w-[60px] text-center" aria-live="polite">
                {pagina} / {totalPaginas}
              </span>
              <button
                type="button"
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                disabled={pagina === totalPaginas}
                aria-label="Próxima página"
                className="px-3 py-2 border border-[rgba(217,180,255,0.2)] rounded-lg text-[#beafd7] text-[0.85rem] disabled:opacity-40 hover:border-[rgba(199,149,255,0.4)] hover:text-white transition-colors"
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
          ownerName={usuario?.nome}
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
