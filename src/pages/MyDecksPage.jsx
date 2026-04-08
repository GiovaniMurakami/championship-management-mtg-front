import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMyDecks } from "../hooks/useMyDecks";
import { useAuth } from "../hooks/useAuth";
import { buscarCartaPorNome } from "../services/scryfallApi";
import { deletarDeck } from "../services/backendApi";
import { SkeletonCard } from "../components";
import { DeckImageModal } from "../components/deck/DeckImageModal";

const FORMAT_META = {
  standard: { label: "Standard", color: "#93c5fd", bg: "rgba(59,130,246,0.18)", border: "rgba(59,130,246,0.45)" },
  modern: { label: "Modern", color: "#fdba74", bg: "rgba(234,88,12,0.18)", border: "rgba(234,88,12,0.45)" },
  pioneer: { label: "Pioneer", color: "#6ee7b7", bg: "rgba(16,185,129,0.18)", border: "rgba(16,185,129,0.45)" },
  legacy: { label: "Legacy", color: "#c4b5fd", bg: "rgba(139,92,246,0.18)", border: "rgba(139,92,246,0.45)" },
  commander: { label: "Commander", color: "#fcd34d", bg: "rgba(245,158,11,0.18)", border: "rgba(245,158,11,0.45)" },
  pauper: { label: "Pauper", color: "#cbd5e1", bg: "rgba(148,163,184,0.18)", border: "rgba(148,163,184,0.45)" },
};

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

export function MyDecksPage({ token }) {
  const { usuario } = useAuth();
  const { decks, loading, message, fetchDecks } = useMyDecks(token, usuario?.id);
  const [deckImages, setDeckImages] = useState({});
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, deck: null });
  const [confirmName, setConfirmName] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [imageModal, setImageModal] = useState(null);
  const navigate = useNavigate();

  const isOwner = (deck) => {
    const deckUserId = deck.usuario?.id ?? deck.usuarioId;
    return String(deckUserId) === String(usuario?.id);
  };

  const myDecks = decks.filter(isOwner);

  useEffect(() => {
    if (decks.length === 0) return;

    const fetchDeckImages = async () => {
      const entries = await Promise.all(
        decks
          .filter((deck) => deck.maindeck?.length > 0)
          .map(async (deck) => {
            try {
              const carta = await buscarCartaPorNome(deck.maindeck[0].nome);
              return carta?.imagem ? [deck.id, carta.imagem] : null;
            } catch {
              return null;
            }
          })
      );
      setDeckImages(Object.fromEntries(entries.filter(Boolean)));
    };

    fetchDeckImages();
  }, [decks]);

  const handleOpenDeleteModal = (deck) => {
    setDeleteModal({ isOpen: true, deck });
    setConfirmName("");
    setDeleteError("");
  };

  const handleCloseDeleteModal = () => {
    setDeleteModal({ isOpen: false, deck: null });
    setConfirmName("");
    setDeleteError("");
    setDeleteLoading(false);
  };

  const handleDeleteDeck = async () => {
    if (!deleteModal.deck) return;

    if (confirmName !== deleteModal.deck.nome) {
      setDeleteError("O nome do deck não corresponde. Digite exatamente como está escrito.");
      return;
    }

    setDeleteLoading(true);
    setDeleteError("");

    try {
      await deletarDeck(deleteModal.deck.id, token);
      handleCloseDeleteModal();
      await fetchDecks();
    } catch (error) {
      setDeleteError(error.message || "Erro ao excluir o deck. Tente novamente.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 pt-[7.5rem] pb-12 max-sm:px-3 max-sm:pt-[6.5rem] max-sm:pb-8">
      <div className="flex justify-between items-center mb-8 max-sm:flex-col max-sm:gap-4 max-sm:items-stretch max-sm:text-center">
        <div>
          <h1 className="font-display text-[2.2rem] tracking-[0.04em] mb-[0.2rem] mt-0 text-text-main">Meus Decks</h1>
          {!loading && myDecks.length > 0 && (
            <p className="m-0 text-[0.85rem] text-text-soft">
              {myDecks.length} deck{myDecks.length !== 1 ? "s" : ""} encontrado{myDecks.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <button
          className="inline-flex items-center gap-[0.4rem] border border-[rgba(199,149,255,0.6)] rounded-xl px-4 py-[0.6rem] cursor-pointer font-bold bg-gradient-to-br from-[#8e39ed] to-[#5f23b3] text-white shadow-[0_4px_12px_rgba(167,79,255,0.25)] transition-all duration-[220ms] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(167,79,255,0.4)] disabled:opacity-60 disabled:cursor-not-allowed max-sm:justify-center"
          type="button"
          onClick={() => navigate("/decks")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Criar deck
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-6 mt-6 max-sm:grid-cols-1">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : message ? (
        <p className="mt-[0.7rem] mb-0 px-3 py-3 rounded-[0.6rem] bg-[rgba(167,79,255,0.15)] text-[#d7b8ff] text-[0.9rem]">{message}</p>
      ) : myDecks.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 px-8 text-center text-text-soft">
          <div className="w-[72px] h-[72px] rounded-full border border-[rgba(217,180,255,0.2)] bg-[rgba(167,79,255,0.08)] flex items-center justify-center text-text-soft mb-2">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
          <h3 className="m-0 text-[1.1rem] text-text-main">Nenhum deck ainda</h3>
          <p className="m-0 text-[0.9rem]">Crie seu primeiro deck para começar a jogar.</p>
          <button
            className="border border-[rgba(199,149,255,0.6)] rounded-xl px-4 py-[0.6rem] cursor-pointer font-bold bg-gradient-to-br from-[#8e39ed] to-[#5f23b3] text-white shadow-[0_4px_12px_rgba(167,79,255,0.25)] transition-all duration-[220ms] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(167,79,255,0.4)] disabled:opacity-60 disabled:cursor-not-allowed"
            type="button"
            onClick={() => navigate("/decks")}
          >
            Criar primeiro deck
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-6 mt-6 max-sm:grid-cols-1">
          {myDecks.map((deck) => (
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
                  {!isOwner(deck) && deck.usuario?.nome && (
                    <span className="text-[0.72rem] text-text-soft bg-[rgba(14,9,28,0.65)] px-[0.55rem] py-[0.22rem] rounded-full border border-[rgba(217,180,255,0.2)] backdrop-blur-sm max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap">
                      {deck.usuario.nome}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-[1rem_1.1rem_1.1rem] flex flex-col flex-1">
                <h3 className="mt-0 mb-[0.65rem] text-[1rem] font-bold text-text-main leading-[1.3]">{deck.nome}</h3>

                <div className="flex flex-wrap gap-[0.4rem] mb-[0.85rem]">
                  <div className="inline-flex items-center gap-[0.3rem] px-[0.55rem] py-[0.2rem] rounded-full border border-[rgba(217,180,255,0.2)] bg-white/[0.03] text-[0.76rem] text-text-soft [&_svg]:shrink-0 [&_svg]:opacity-70">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="M8 4v16M16 4v16" />
                    </svg>
                    <span>{calcularTotalCartas(deck.maindeck)} main</span>
                  </div>
                  <div className="inline-flex items-center gap-[0.3rem] px-[0.55rem] py-[0.2rem] rounded-full border border-[rgba(217,180,255,0.2)] bg-white/[0.03] text-[0.76rem] text-text-soft [&_svg]:shrink-0 [&_svg]:opacity-70">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                      <polyline points="16 3 21 3 21 8" />
                      <line x1="4" y1="20" x2="21" y2="3" />
                      <polyline points="21 16 21 21 16 21" />
                      <line x1="15" y1="15" x2="21" y2="21" />
                    </svg>
                    <span>{calcularTotalCartas(deck.sideboard)} side</span>
                  </div>
                  <div className="inline-flex items-center gap-[0.3rem] px-[0.55rem] py-[0.2rem] rounded-full border border-[rgba(217,180,255,0.2)] bg-white/[0.03] text-[0.76rem] text-text-soft [&_svg]:shrink-0 [&_svg]:opacity-70 ml-auto">
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
                  {isOwner(deck) ? (
                    <>
                      <button
                        className="flex-1 text-[0.85rem] px-3 py-2 border border-[rgba(199,149,255,0.6)] rounded-xl cursor-pointer font-bold bg-gradient-to-br from-[#8e39ed] to-[#5f23b3] text-white shadow-[0_4px_12px_rgba(167,79,255,0.25)] transition-all duration-[220ms] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(167,79,255,0.4)] disabled:opacity-60 disabled:cursor-not-allowed"
                        type="button"
                        onClick={() =>
                          navigate(`/editar-deck/${deck.id}`, { state: { deck } })
                        }
                      >
                        Editar
                      </button>
                      <button
                        className="text-[0.85rem] px-[0.7rem] py-[0.42rem] border border-[rgba(167,79,255,0.4)] rounded-lg bg-[rgba(167,79,255,0.1)] text-[#c4b5fd] text-base leading-none cursor-pointer transition-[background,border-color,color] duration-[160ms] hover:bg-[rgba(167,79,255,0.22)] hover:border-[rgba(167,79,255,0.65)] hover:text-[#e9d5ff]"
                        type="button"
                        title="Gerar imagem do deck"
                        onClick={() => setImageModal(deck)}
                      >
                        ✦
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
                      className="flex-1 text-[0.85rem] px-3 py-2 border border-[rgba(199,149,255,0.6)] rounded-xl cursor-pointer font-bold bg-gradient-to-br from-[#8e39ed] to-[#5f23b3] text-white shadow-[0_4px_12px_rgba(167,79,255,0.25)] transition-all duration-[220ms] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(167,79,255,0.4)] disabled:opacity-60 disabled:cursor-not-allowed"
                      type="button"
                      onClick={() =>
                        navigate(`/editar-deck/${deck.id}`, {
                          state: { deck, readOnly: true },
                        })
                      }
                    >
                      Visualizar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {imageModal && (
        <DeckImageModal
          deck={imageModal}
          ownerName={usuario?.nome}
          onClose={() => setImageModal(null)}
        />
      )}

      {deleteModal.isOpen && (
        <div
          className="fixed inset-0 z-[60] grid place-items-center bg-[rgba(5,3,9,0.72)] backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && handleCloseDeleteModal()}
        >
          <div className="w-[min(500px,calc(100vw-1.4rem))] border border-[rgba(217,180,255,0.2)] rounded-2xl bg-[#160e2d] p-4">
            <h2 className="font-display text-[1.8rem] mt-0 mb-4">Confirmar Exclusão</h2>
            <p className="mb-4 text-text-soft">
              Você está prestes a excluir o deck{" "}
              <strong className="text-[#c795ff]">{deleteModal.deck?.nome}</strong>. Esta ação é{" "}
              <strong className="text-[#c795ff]">irreversível</strong>.
            </p>
            <p className="mb-4 text-[0.9rem] opacity-80">
              Para confirmar, digite o nome exato do deck:
            </p>
            <input
              type="text"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={`Digite: ${deleteModal.deck?.nome}`}
              className="w-full mb-2 text-[0.95rem] p-3"
              disabled={deleteLoading}
              autoFocus
            />
            {deleteError && (
              <p className="mt-[0.7rem] mb-0 px-3 py-3 rounded-[0.6rem] bg-[rgba(252,88,119,0.15)] text-[#ffc8d4] text-[0.9rem]">{deleteError}</p>
            )}
            <div className="flex gap-3 mt-6">
              <button
                className="flex-1 border border-[rgba(217,180,255,0.2)] rounded-xl px-4 py-[0.6rem] cursor-pointer font-bold bg-transparent text-text-soft transition-all duration-[220ms] hover:text-white hover:border-[rgba(199,149,255,0.5)] hover:bg-white/[0.05]"
                type="button"
                onClick={handleCloseDeleteModal}
                disabled={deleteLoading}
              >
                Cancelar
              </button>
              <button
                className="flex-1 border border-[rgba(252,88,119,0.6)] rounded-xl px-4 py-[0.6rem] cursor-pointer font-bold bg-gradient-to-br from-[#fc5877] to-[#d1486a] text-white shadow-[0_4px_12px_rgba(252,88,119,0.25)] transition-all duration-[220ms] enabled:hover:-translate-y-0.5 enabled:hover:shadow-[0_8px_24px_rgba(252,88,119,0.4)] disabled:opacity-60 disabled:cursor-not-allowed"
                type="button"
                onClick={handleDeleteDeck}
                disabled={deleteLoading || !confirmName}
              >
                {deleteLoading ? "Excluindo..." : "Excluir deck"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
