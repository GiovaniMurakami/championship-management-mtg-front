const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || "http://localhost:3000";

async function parseJsonResponse(response) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data?.mensagem ||
      data?.message ||
      "Nao foi possivel concluir a requisicao.";
    throw new Error(message);
  }

  return data;
}

export async function loginUsuario(payload) {
  const response = await fetch(`${API_BASE_URL}/usuario/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseJsonResponse(response);
}

export async function cadastrarUsuario(payload) {
  const response = await fetch(`${API_BASE_URL}/usuario/cadastrar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseJsonResponse(response);
}

export async function cadastrarDeck(payload, token) {
  const response = await fetch(`${API_BASE_URL}/deck/cadastrar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return parseJsonResponse(response);
}
