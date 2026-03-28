import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMyDecks } from "../hooks/useMyDecks";
import { useAuth } from "../hooks/useAuth";
import { buscarCartaPorNome } from "../services/scryfallApi";
import { deletarDeck } from "../services/backendApi";
import { SkeletonCard } from "../components";

// Função auxiliar para somar quantidades de cartas
function calcularTotalCartas(cartas) {
  return cartas?.reduce((total, carta) => total + (carta.quantidade || 1), 0) || 0;
}

export function MyDecksPage({ token }) {
  const { decks, loading, message, fetchDecks } = useMyDecks(token);
  const { usuario } = useAuth();
  const [deckImages, setDeckImages] = useState({});
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, deck: null });
  const [confirmName, setConfirmName] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const navigate = useNavigate();

  // Verifica se o deck pertence ao usuário atual
  const isOwner = (deck) => {
    const deckUserId = deck.usuario?.id ?? deck.usuarioId;
    return deckUserId === usuario?.id;
  };

  // Busca imagem da primeira carta de cada deck
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
      // Recarregar a lista de decks
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
        <h1>Decks</h1>
        <button
          className="btn primary"
          type="button"
          onClick={() => navigate("/decks")}
        >
          + Criar Novo Deck
        </button>
      </div>

      {loading ? (
        <div className="my-decks-grid">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : message ? (
        <p className="feedback">{message}</p>
      ) : decks.length === 0 ? (
        <p className="my-decks-empty">
          Nenhum deck encontrado. Crie um novo deck para começar!
        </p>
      ) : (
        <div className="my-decks-grid">
          {decks.map((deck) => (
            <div key={deck.id} className="my-deck-card">
              {deckImages[deck.id] && (
                <div
                  className="my-deck-card-image"
                  style={{ backgroundImage: `url(${deckImages[deck.id]})` }}
                />
              )}

              <div className="my-deck-card-body">
                <h3 className="my-deck-card-name">{deck.nome}</h3>
                <p className="my-deck-card-format">
                  <strong>Formato:</strong> {deck.formato}
                </p>
                <div className="my-deck-card-stats">
                  <div>
                    <span>Maindeck: </span>
                    <strong>{calcularTotalCartas(deck.maindeck)} cartas</strong>
                  </div>
                  <div>
                    <span>Sideboard: </span>
                    <strong>{calcularTotalCartas(deck.sideboard)} cartas</strong>
                  </div>
                </div>
                <p className="my-deck-card-date">
                  Criado em: {new Date(deck.criadoEm).toLocaleDateString("pt-BR")}
                </p>
                <div className="my-deck-card-actions">
                  {isOwner(deck) ? (
                    <>
                      <button
                        className="btn primary"
                        type="button"
                        onClick={() => navigate(`/editar-deck/${deck.id}`, { state: { deck } })}
                      >
                        Editar
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
                      onClick={() => navigate(`/editar-deck/${deck.id}`, { state: { deck, readOnly: true } })}
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

      {/* Modal de Confirmação de Exclusão */}
      {deleteModal.isOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && handleCloseDeleteModal()}>
          <div className="auth-modal delete-modal">
            <h2 className="delete-modal-title">⚠️ Confirmar Exclusão</h2>
            <p className="delete-modal-text">
              Você está prestes a excluir o deck <strong>{deleteModal.deck?.nome}</strong>.
              Esta ação é <strong>irreversível</strong> e todas as cartas do deck serão perdidas.
            </p>
            <p className="delete-modal-hint">
              Para confirmar, digite o nome exato do deck abaixo:
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
                {deleteLoading ? "Excluindo..." : "Confirmar Exclusão"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
