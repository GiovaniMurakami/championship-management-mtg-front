import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMyDecks } from "../hooks/useMyDecks";
import { buscarCartaPorNome } from "../services/scryfallApi";

// Função auxiliar para somar quantidades de cartas
function calcularTotalCartas(cartas) {
  return cartas?.reduce((total, carta) => total + (carta.quantidade || 1), 0) || 0;
}

export function MyDecksPage({ token }) {
  const { decks, loading, message } = useMyDecks(token);
  const [deckImages, setDeckImages] = useState({});
  const navigate = useNavigate();

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
                <button
                  className="btn primary"
                  style={{ marginTop: "1rem", width: "100%" }}
                  type="button"
                  onClick={() => navigate(`/editar-deck/${deck.id}`, { state: { deck } })}
                >
                  Editar Deck
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
