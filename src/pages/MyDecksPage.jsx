import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMyDecks } from "../hooks/useMyDecks";
import { useAuth } from "../hooks/useAuth";
import { buscarCartaPorNome } from "../services/scryfallApi";
import { deletarDeck } from "../services/backendApi";

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
  const isOwner = (deck) => deck.usuarioId === usuario?.id;

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
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "6rem 1rem 2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1>Meus Decks</h1>
        <button
          className="btn primary"
          type="button"
          onClick={() => navigate("/decks")}
        >
          + Criar Novo Deck
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", marginTop: "2rem" }}>Carregando decks...</p>
      ) : message ? (
        <p className="feedback" style={{ marginTop: "1rem" }}>
          {message}
        </p>
      ) : decks.length === 0 ? (
        <p style={{ textAlign: "center", marginTop: "2rem", opacity: 0.7 }}>
          Nenhum deck encontrado. Crie um novo deck para começar!
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
            gap: "1.5rem",
            marginTop: "1.5rem",
          }}
        >
          {decks.map((deck) => (
            <div
              key={deck.id}
              style={{
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                overflow: "hidden",
                backgroundColor: "var(--surface-color)",
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              {/* Imagem do deck consolidada no topo */}
              {deckImages[deck.id] && (
                <div
                  style={{
                    width: "100%",
                    height: "180px",
                    backgroundImage: `url(${deckImages[deck.id]})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    borderBottom: "1px solid var(--border-color)",
                  }}
                />
              )}

              {/* Conteúdo do card */}
              <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", flex: 1 }}>
                <h3 style={{ marginBottom: "0.5rem", color: "var(--accent-color)" }}>
                  {deck.nome}
                </h3>
                <p style={{ fontSize: "0.9rem", opacity: 0.7, marginBottom: "1rem" }}>
                  <strong>Formato:</strong> {deck.formato}
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                    fontSize: "0.9rem",
                    marginBottom: "1rem",
                  }}
                >
                  <div>
                    <span>Maindeck: </span>
                    <strong>{calcularTotalCartas(deck.maindeck)} cartas</strong>
                  </div>
                  <div>
                    <span>Sideboard: </span>
                    <strong>{calcularTotalCartas(deck.sideboard)} cartas</strong>
                  </div>
                </div>
                <p style={{ fontSize: "0.85rem", opacity: 0.6, marginBottom: "auto" }}>
                  Criado em: {new Date(deck.criadoEm).toLocaleDateString("pt-BR")}
                </p>
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                  {isOwner(deck) ? (
                    <>
                      <button
                        className="btn primary"
                        style={{ flex: 1 }}
                        type="button"
                        onClick={() => navigate(`/editar-deck/${deck.id}`, { state: { deck } })}
                      >
                        Editar
                      </button>
                      <button
                        className="btn secondary"
                        style={{
                          flex: 1,
                          background: "rgba(252, 88, 119, 0.15)",
                          borderColor: "rgba(252, 88, 119, 0.4)",
                          color: "#ffc8d4"
                        }}
                        type="button"
                        onClick={() => handleOpenDeleteModal(deck)}
                      >
                        Excluir
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn primary"
                      style={{ width: "100%" }}
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
          <div className="auth-modal" style={{ maxWidth: "500px" }}>
            <h2 style={{ margin: "0 0 1rem", fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.8rem" }}>
              ⚠️ Confirmar Exclusão
            </h2>
            <p style={{ marginBottom: "1rem", color: "var(--text-soft)" }}>
              Você está prestes a excluir o deck <strong style={{ color: "var(--brand-2)" }}>{deleteModal.deck?.nome}</strong>.
              Esta ação é <strong>irreversível</strong> e todas as cartas do deck serão perdidas.
            </p>
            <p style={{ marginBottom: "1rem", fontSize: "0.9rem", opacity: 0.8 }}>
              Para confirmar, digite o nome exato do deck abaixo:
            </p>
            <input
              type="text"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={`Digite: ${deleteModal.deck?.nome}`}
              style={{
                width: "100%",
                marginBottom: "0.5rem",
                fontSize: "0.95rem",
                padding: "0.75rem"
              }}
              disabled={deleteLoading}
              autoFocus
            />
            {deleteError && (
              <p className="feedback limit-warning" style={{ margin: "0.5rem 0" }}>
                {deleteError}
              </p>
            )}
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
              <button
                className="btn ghost"
                style={{ flex: 1 }}
                type="button"
                onClick={handleCloseDeleteModal}
                disabled={deleteLoading}
              >
                Cancelar
              </button>
              <button
                className="btn secondary"
                style={{
                  flex: 1,
                  background: "linear-gradient(145deg, #fc5877, #d1486a)",
                  borderColor: "rgba(252, 88, 119, 0.6)",
                  color: "white",
                  opacity: deleteLoading ? 0.6 : 1,
                  cursor: deleteLoading ? "not-allowed" : "pointer"
                }}
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
