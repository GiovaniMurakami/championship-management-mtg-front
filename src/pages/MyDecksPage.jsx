import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMyDecks } from "../hooks/useMyDecks";
import { useAuth } from "../hooks/useAuth";
import { buscarCartaPorNome } from "../services/scryfallApi";
import { deletarDeck } from "../services/backendApi";
import { SkeletonCard } from "../components";
import { DeckImageModal } from "../components/deck/DeckImageModal";

const FORMAT_META = {
  standard:  { label: "Standard",  color: "#93c5fd", bg: "rgba(59,130,246,0.18)",  border: "rgba(59,130,246,0.45)" },
  modern:    { label: "Modern",    color: "#fdba74", bg: "rgba(234,88,12,0.18)",   border: "rgba(234,88,12,0.45)" },
  pioneer:   { label: "Pioneer",   color: "#6ee7b7", bg: "rgba(16,185,129,0.18)", border: "rgba(16,185,129,0.45)" },
  legacy:    { label: "Legacy",    color: "#c4b5fd", bg: "rgba(139,92,246,0.18)", border: "rgba(139,92,246,0.45)" },
  commander: { label: "Commander", color: "#fcd34d", bg: "rgba(245,158,11,0.18)", border: "rgba(245,158,11,0.45)" },
  pauper:    { label: "Pauper",    color: "#cbd5e1", bg: "rgba(148,163,184,0.18)",border: "rgba(148,163,184,0.45)" },
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
      className="format-badge"
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
    return deckUserId === usuario?.id;
  };

  const myDecks = decks.filter(isOwner);

  useEffect(() => {
    const fetchDeckImages = async () => {
      const images = {};
      for (const deck of decks) {
        if (deck.maindeck?.length > 0) {
          const primeiraCartaNome = deck.maindeck[0].nome;
          try {
            const carta = await buscarCartaPorNome(primeiraCartaNome);
            if (carta?.imagem) {
              images[deck.id] = carta.imagem;
            }
          } catch {
            // Ignora erros na busca individual
          }
        }
      }
      setDeckImages(images);
    };

    if (decks.length > 0) {
      fetchDeckImages();
    }
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
    <div className="my-decks-page">
      <div className="my-decks-header">
        <div>
          <h1 className="my-decks-title">Meus Decks</h1>
          {!loading && myDecks.length > 0 && (
            <p className="my-decks-subtitle">
              {myDecks.length} deck{myDecks.length !== 1 ? "s" : ""} encontrado{myDecks.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <button
          className="btn primary"
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
        <div className="my-decks-grid">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : message ? (
        <p className="feedback">{message}</p>
      ) : myDecks.length === 0 ? (
        <div className="my-decks-empty-state">
          <div className="my-decks-empty-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
          <h3>Nenhum deck ainda</h3>
          <p>Crie seu primeiro deck para começar a jogar.</p>
          <button className="btn primary" type="button" onClick={() => navigate("/decks")}>
            Criar primeiro deck
          </button>
        </div>
      ) : (
        <div className="my-decks-grid">
          {myDecks.map((deck) => (
            <div key={deck.id} className="my-deck-card">
              <div
                className="my-deck-card-banner"
                style={
                  deckImages[deck.id]
                    ? { backgroundImage: `url(${deckImages[deck.id]})` }
                    : undefined
                }
              >
                <div className="my-deck-card-banner-overlay" />
                <div className="my-deck-card-banner-top">
                  <FormatBadge formato={deck.formato} />
                  {!isOwner(deck) && deck.usuario?.nome && (
                    <span className="my-deck-card-owner-badge">
                      {deck.usuario.nome}
                    </span>
                  )}
                </div>
              </div>

              <div className="my-deck-card-body">
                <h3 className="my-deck-card-name">{deck.nome}</h3>

                <div className="my-deck-card-stats">
                  <div className="deck-stat-chip">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="M8 4v16M16 4v16" />
                    </svg>
                    <span>{calcularTotalCartas(deck.maindeck)} main</span>
                  </div>
                  <div className="deck-stat-chip">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                      <polyline points="16 3 21 3 21 8" />
                      <line x1="4" y1="20" x2="21" y2="3" />
                      <polyline points="21 16 21 21 16 21" />
                      <line x1="15" y1="15" x2="21" y2="21" />
                    </svg>
                    <span>{calcularTotalCartas(deck.sideboard)} side</span>
                  </div>
                  <div className="deck-stat-chip deck-stat-chip--date">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>{new Date(deck.criadoEm).toLocaleDateString("pt-BR", { timeZone: "UTC" })}</span>
                  </div>
                </div>

                <div className="my-deck-card-actions">
                  {isOwner(deck) ? (
                    <>
                      <button
                        className="btn primary"
                        type="button"
                        onClick={() =>
                          navigate(`/editar-deck/${deck.id}`, { state: { deck } })
                        }
                      >
                        Editar
                      </button>
                      <button
                        className="btn deck-img-gen-btn"
                        type="button"
                        title="Gerar imagem do deck"
                        onClick={() => setImageModal(deck)}
                      >
                        ✦
                      </button>
                      <button
                        className="btn danger"
                        type="button"
                        onClick={() => handleOpenDeleteModal(deck)}
                      >
                        Excluir
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn primary"
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
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && handleCloseDeleteModal()}
        >
          <div className="auth-modal delete-modal">
            <h2 className="delete-modal-title">Confirmar Exclusão</h2>
            <p className="delete-modal-text">
              Você está prestes a excluir o deck{" "}
              <strong>{deleteModal.deck?.nome}</strong>. Esta ação é{" "}
              <strong>irreversível</strong>.
            </p>
            <p className="delete-modal-hint">
              Para confirmar, digite o nome exato do deck:
            </p>
            <input
              type="text"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={`Digite: ${deleteModal.deck?.nome}`}
              className="delete-modal-input"
              disabled={deleteLoading}
              autoFocus
            />
            {deleteError && (
              <p className="feedback limit-warning">{deleteError}</p>
            )}
            <div className="delete-modal-actions">
              <button
                className="btn ghost"
                type="button"
                onClick={handleCloseDeleteModal}
                disabled={deleteLoading}
              >
                Cancelar
              </button>
              <button
                className="btn danger-solid"
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
