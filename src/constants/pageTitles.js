export const SITE_TITLE = "Tiago Fuguete";

export const PAGE_TITLES = {
  torneios: "Torneios",
  criarTorneio: "Criar Torneio",
  ingressarTorneio: "Ingressar no Torneio",
  meusDecks: "Meus Decks",
  criarDeck: "Criar Deck",
  editarDeck: "Editar Deck",
  visualizarDeck: "Visualizar Deck",
  dashboard: "Dashboard",
  times: "Times",
  criarTime: "Criar Time",
  editarTime: "Editar Time",
  ligas: "Ligas",
  criarLiga: "Criar Liga",
  editarLiga: "Editar Liga",
  esqueciSenha: "Esqueci minha senha",
  resetSenha: "Redefinir senha",
  termosDeUso: "Termos de Uso",
  blog: "Blog",
  gerenciarBlog: "Gerenciar blog",
  criarPostBlog: "Novo post",
  editarPostBlog: "Editar post",
  decks: "Decks",
  sobreMim: "Sobre mim",
  parceiros: "Parceiros",
  gerenciarLanding: "Gerenciar landing",
  gerenciarParceiros: "Gerenciar parceiros",
  gerenciarApoiadores: "Gerenciar apoiadores",
  naoEncontrada: "Página não encontrada",
  carregando: "Carregando...",
};

export function formatPageTitle(pageTitle) {
  const trimmed = String(pageTitle ?? "").trim();
  if (!trimmed || trimmed === SITE_TITLE) return SITE_TITLE;
  return `${trimmed} | ${SITE_TITLE}`;
}
