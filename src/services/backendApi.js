import httpClient from "./httpClient";

// Autenticação
export const loginUsuario = (payload) =>
  httpClient.post("/usuario/login", payload);

export const cadastrarUsuario = (payload) =>
  httpClient.post("/usuario/cadastrar", payload);

// Decks
export const cadastrarDeck = (payload, token) =>
  httpClient.post("/deck/cadastrar", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const listarDecks = (token) =>
  httpClient.get("/deck/listar", {
    headers: { Authorization: `Bearer ${token}` },
  });

// Usuário
export const atualizarUsuario = (payload, token) =>
  httpClient.put("/usuario/atualizar", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

// Atualizar Deck
export const atualizarDeck = (deckId, payload, token) =>
  httpClient.put(`/deck/${deckId}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
