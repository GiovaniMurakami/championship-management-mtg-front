import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { listarDecks, deletarDeck } from "../services/backendApi";
import { buscarCartasPorNome } from "../services/scryfallApi";
import { SkeletonCard } from "../components";
import { DeckImageModal } from "../components/deck/DeckImageModal";
import { PageShell } from "../components/ui/PageShell";
import { DeleteConfirmModal } from "../components/ui/DeleteConfirmModal";
import { TOURNAMENT_INPUT_CLASS } from "../styles/uiClasses";

const FORMAT_META = {
  standard: { label: "Standard", color: "#93c5fd", bg: "rgba(59,130,246,0.18)", border: "rgba(59,130,246,0.45)" },
  modern: { label: "Modern", color: "#fdba74", bg: "rgba(234,88,12,0.18)", border: "rgba(234,88,12,0.45)" },
  pioneer: { label: "Pioneer", color: "#6ee7b7", bg: "rgba(16,185,129,0.18)", border: "rgba(16,185,129,0.45)" },
  legacy: { label: "Legacy", color: "#c4b5fd", bg: "rgba(139,92,246,0.18)", border: "rgba(139,92,246,0.45)" },
  commander: { label: "Commander", color: "#fcd34d", bg: "rgba(245,158,11,0.18)", border: "rgba(245,158,11,0.45)" },
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
  const { usuario, token } = useAuth();
  const navigate = useNavigate();

  const [decks, setDecks] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deckImages, setDeckImages] = useState({});

  const [buscaInput, setBuscaInput] = useState("");
  const [busca, setBusca] = useState("");
  const [somenteMyDecks, setSomenteMyDecks] = useState(false);
  const [pagina, setPagina] = useState(1);

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, deck: null });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [imageModal, setImageModal] = useState(null);

  const isOwner = useCallback(
    (deck) => String(deck.usuario?.id ?? deck.usuarioId) === String(usuario?.id),
    [usuario?.id]
  );

  const fetchDecks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { limite: LIMITE, offset: (pagina - 1) * LIMITE };
      if (somenteMyDecks && usuario?.id) params.usuarioId = usuario.id;
      if (busca.trim()) params.nome = busca.trim();
      const data = await listarDecks(token, params);
      const list = data.decks ?? (Array.isArray(data) ? data : []);
      setDecks(list);
      setTotal(data.total ?? list.length);
    } catch (err) {
      setError(err.message || "Erro ao carregar decks.");
    } finally {
      setLoading(false);
    }
  }, [token, pagina, somenteMyDecks, usuario?.id, busca]);

  useEffect(() => { fetchDecks(); }, [fetchDecks]);

  useEffect(() => { setPagina(1); }, [somenteMyDecks, busca]);

  // Carrega imagem da primeira carta de cada deck
  useEffect(() => {
    if (decks.length === 0) return;
    const fetchImages = async () => {
      const decksWithCards = decks.filter((d) => d.maindeck?.length > 0);
      const cards = await buscarCartasPorNome(
        decksWithCards.map((deck) => deck.maindeck[0].nome),
      );

      const entries = cards.map((carta, index) =>
        carta?.imagem ? [decksWithCards[index].id, carta.imagem] : null,
      );
      setDeckImages(Object.fromEntries(entries.filter(Boolean)));
    };
    fetchImages();
  }, [decks]);

  const totalPaginas = Math.ceil(total / LIMITE) || 1;
  const decksPagina = decks;

  const handleBusca = (e) => {
    e.preventDefault();
    setBusca(buscaInput);
  };

  const handleLimparFiltros = () => {
    setBusca("");
    setBuscaInput("");
    setSomenteMyDecks(false);
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
      await fetchDecks();
    } catch (err) {
      setDeleteError(err.message || "Erro ao excluir o deck. Tente novamente.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const temFiltrosAtivos = busca || somenteMyDecks;

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
          onClick={() => navigate("/decks/criar")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Criar deck
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3 mb-6">
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

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSomenteMyDecks(false)}
            className={`px-4 py-[0.45rem] rounded-lg text-[0.82rem] font-semibold border transition-all duration-200 ${
              !somenteMyDecks
                ? "bg-[rgba(79,70,229,0.3)] border-[rgba(79,70,229,0.7)] text-[#d9d6ff]"
                : "bg-white/[0.03] border-[rgba(217,180,255,0.15)] text-[#beafd7] hover:border-[rgba(199,149,255,0.35)] hover:text-white"
            }`}
          >
            Todos os Decks
          </button>
          <button
            type="button"
            onClick={() => setSomenteMyDecks(true)}
            className={`px-4 py-[0.45rem] rounded-lg text-[0.82rem] font-semibold border transition-all duration-200 ${
              somenteMyDecks
                ? "bg-[rgba(79,70,229,0.3)] border-[rgba(79,70,229,0.7)] text-[#d9d6ff]"
                : "bg-white/[0.03] border-[rgba(217,180,255,0.15)] text-[#beafd7] hover:border-[rgba(199,149,255,0.35)] hover:text-white"
            }`}
          >
            Meus Decks
          </button>
        </div>
      </div>

      {/* Conteúdo */}
      {loading ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-6 mt-6 max-sm:grid-cols-1">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <p className="mt-[0.7rem] mb-0 px-3 py-3 rounded-[0.6rem] bg-[rgba(239,68,68,0.1)] text-[#fca5a5] text-[0.9rem]">
          {error}
        </p>
      ) : decksPagina.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 px-8 text-center text-text-soft">
          <div className="w-[72px] h-[72px] rounded-full border border-[rgba(217,180,255,0.2)] bg-[rgba(167,79,255,0.08)] flex items-center justify-center mb-2">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
          <h3 className="m-0 text-[1.1rem] text-text-main">
            {temFiltrosAtivos ? "Nenhum deck encontrado" : "Nenhum deck ainda"}
          </h3>
          <p className="m-0 text-[0.9rem]">
            {temFiltrosAtivos
              ? "Tente ajustar os filtros de busca."
              : "Crie seu primeiro deck para começar a jogar."}
          </p>
          {!temFiltrosAtivos && (
            <button
              className="border border-[rgba(199,149,255,0.6)] rounded-xl px-4 py-[0.6rem] cursor-pointer font-bold bg-gradient-to-br from-[#8e39ed] to-[#5f23b3] text-white shadow-[0_4px_12px_rgba(167,79,255,0.25)] transition-all duration-[220ms] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(167,79,255,0.4)]"
              type="button"
              onClick={() => navigate("/decks/criar")}
            >
              Criar primeiro deck
            </button>
          )}
        </div>
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
                        <span className={`text-[0.72rem] bg-[rgba(14,9,28,0.65)] px-[0.55rem] py-[0.22rem] rounded-full border border-[rgba(217,180,255,0.2)] backdrop-blur-sm max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap ${owner ? "text-[#c795ff]" : "text-text-soft"}`}>
                          {owner ? "Meu deck" : deck.usuario.nome}
                        </span>
                      )}
                    </div>
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
                          <button
                            className="inline-flex items-center gap-[0.3rem] text-[0.78rem] px-[0.65rem] py-[0.42rem] border border-[rgba(167,79,255,0.4)] rounded-lg bg-[rgba(167,79,255,0.1)] text-[#c4b5fd] cursor-pointer transition-[background,border-color,color] duration-[160ms] hover:bg-[rgba(167,79,255,0.22)] hover:border-[rgba(167,79,255,0.65)] hover:text-[#e9d5ff] whitespace-nowrap"
                            type="button"
                            title="Gerar imagem do deck para compartilhar"
                            onClick={() => setImageModal(deck)}
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <polyline points="21 15 16 10 5 21" />
                            </svg>
                            Imagem
                          </button>
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
            <div className="flex items-center justify-center gap-3 mt-8">
              <button
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={pagina === 1}
                className="px-3 py-2 border border-[rgba(217,180,255,0.2)] rounded-lg text-[#beafd7] text-[0.85rem] disabled:opacity-40 hover:border-[rgba(199,149,255,0.4)] hover:text-white transition-colors"
              >
                ←
              </button>
              <span className="text-[#beafd7] text-[0.85rem] min-w-[60px] text-center">
                {pagina} / {totalPaginas}
              </span>
              <button
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                disabled={pagina === totalPaginas}
                className="px-3 py-2 border border-[rgba(217,180,255,0.2)] rounded-lg text-[#beafd7] text-[0.85rem] disabled:opacity-40 hover:border-[rgba(199,149,255,0.4)] hover:text-white transition-colors"
              >
                →
              </button>
            </div>
          )}
        </>
      )}

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
