const DEFAULT_WORDPRESS_APP_URL = "https://www.tiagofuguete.com.br/app-torneios";

const normalizeBaseUrl = (value) => value.replace(/\/+$/, "");

export const WORDPRESS_APP_URL = normalizeBaseUrl(
  import.meta.env.VITE_WORDPRESS_APP_URL || DEFAULT_WORDPRESS_APP_URL,
);

const trimValue = (value) => {
  if (typeof value !== "string") return "";
  return value.trim();
};

const getParam = (searchParams, keys) => {
  for (const key of keys) {
    const value = trimValue(searchParams.get(key));
    if (value) return value;
  }
  return "";
};

const deleteParams = (searchParams, keys) => {
  keys.forEach((key) => searchParams.delete(key));
};

const normalizeRouteValue = (value) =>
  trimValue(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const withSearch = (pathname, searchParams) => {
  const search = searchParams.toString();
  return { pathname, search: search ? `?${search}` : "" };
};

const ROUTE_KEYS = ["rota", "route", "paginaApp", "appRoute"];
const TOURNAMENT_ID_KEYS = ["torneioId", "tournamentId"];
const TEAM_ID_KEYS = ["timeId", "teamId"];
const LEAGUE_ID_KEYS = ["ligaId", "leagueId"];
const DECK_ID_KEYS = ["deckId"];
const JOIN_TOKEN_KEYS = ["ingressoToken", "joinToken", "torneioToken"];
const APP_PATH_KEYS = ["appPath", "path", "pathname"];

const parseInternalPath = (value) => {
  const path = trimValue(value);
  if (!path || !path.startsWith("/") || path.startsWith("//")) return null;

  try {
    const url = new URL(path, "https://app.local");
    return { pathname: url.pathname, search: url.search };
  } catch {
    return null;
  }
};

const withMergedSearch = (target, searchParams) => {
  const mergedSearchParams = new URLSearchParams(target.search);
  searchParams.forEach((value, key) => mergedSearchParams.set(key, value));
  return withSearch(target.pathname, mergedSearchParams);
};

export function resolveExternalNavigationTarget(locationLike) {
  const pathname = locationLike?.pathname || "/";
  const search = locationLike?.search || "";

  if (pathname !== "/") return null;

  const searchParams = new URLSearchParams(search);
  const route = normalizeRouteValue(getParam(searchParams, ROUTE_KEYS));
  const torneioId = getParam(searchParams, TOURNAMENT_ID_KEYS);
  const timeId = getParam(searchParams, TEAM_ID_KEYS);
  const ligaId = getParam(searchParams, LEAGUE_ID_KEYS);
  const deckId = getParam(searchParams, DECK_ID_KEYS);
  const ingressoToken = getParam(searchParams, JOIN_TOKEN_KEYS);
  const appPath = parseInternalPath(getParam(searchParams, APP_PATH_KEYS));

  if (appPath) {
    deleteParams(searchParams, APP_PATH_KEYS);
    deleteParams(searchParams, ROUTE_KEYS);
    return withMergedSearch(appPath, searchParams);
  }

  if (ingressoToken) {
    deleteParams(searchParams, JOIN_TOKEN_KEYS);
    deleteParams(searchParams, ROUTE_KEYS);
    return withSearch(`/torneio/ingressar/${ingressoToken}`, searchParams);
  }

  if (torneioId) {
    deleteParams(searchParams, TOURNAMENT_ID_KEYS);
    deleteParams(searchParams, ROUTE_KEYS);
    return withSearch(`/torneios/${torneioId}`, searchParams);
  }

  if (timeId) {
    deleteParams(searchParams, TEAM_ID_KEYS);
    deleteParams(searchParams, ROUTE_KEYS);
    if (route === "editar-time") {
      return withSearch(`/times/${timeId}/editar`, searchParams);
    }
    return withSearch(`/times/${timeId}`, searchParams);
  }

  if (ligaId) {
    deleteParams(searchParams, LEAGUE_ID_KEYS);
    deleteParams(searchParams, ROUTE_KEYS);
    if (route === "editar-liga") {
      return withSearch(`/ligas/${ligaId}/editar`, searchParams);
    }
    return withSearch(`/ligas/${ligaId}`, searchParams);
  }

  if (deckId) {
    deleteParams(searchParams, DECK_ID_KEYS);
    deleteParams(searchParams, ROUTE_KEYS);
    if (route === "editar-deck") {
      return withSearch(`/editar-deck/${deckId}`, searchParams);
    }
    searchParams.set("modo", "visualizar");
    return withSearch(`/editar-deck/${deckId}`, searchParams);
  }

  if (!route) return null;

  deleteParams(searchParams, ROUTE_KEYS);

  switch (route) {
    case "torneios":
    case "home":
      return withSearch("/", searchParams);
    case "landing-page":
      return withSearch("/landing-page", searchParams);
    case "criar-torneio":
      return withSearch("/torneios/criar", searchParams);
    case "decks":
      return withSearch("/decks", searchParams);
    case "criar-deck":
      return withSearch("/decks/criar", searchParams);
    case "times":
      return withSearch("/times", searchParams);
    case "criar-time":
      return withSearch("/times/criar", searchParams);
    case "ligas":
      return withSearch("/ligas", searchParams);
    case "criar-liga":
      return withSearch("/ligas/criar", searchParams);
    case "blog":
      return withSearch("/blog", searchParams);
    case "criar-post-blog":
      return withSearch("/blog/admin/criar", searchParams);
    case "gerenciar-blog":
      return withSearch("/blog/admin", searchParams);
    case "sobre-mim":
      return withSearch("/sobre-mim", searchParams);
    case "parceiros":
      return withSearch("/parceiros", searchParams);
    case "esqueci-senha":
      return withSearch("/esqueci-senha", searchParams);
    case "reset-senha":
      return withSearch("/reset-senha", searchParams);
    case "termos-de-uso":
      return withSearch("/termos-de-uso", searchParams);
    default:
      return null;
  }
}

export function buildExternalAppUrl(query = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value == null) return;
    const normalizedValue = trimValue(String(value));
    if (!normalizedValue) return;
    searchParams.set(key, normalizedValue);
  });

  const search = searchParams.toString();
  return search ? `${WORDPRESS_APP_URL}?${search}` : WORDPRESS_APP_URL;
}

export function buildExternalAppUrlForPath(path) {
  const target = parseInternalPath(path);
  if (!target || (target.pathname === "/" && !target.search)) return WORDPRESS_APP_URL;
  return buildExternalAppUrl({ appPath: `${target.pathname}${target.search}` });
}

export function buildTournamentExternalUrl(torneioId) {
  return buildExternalAppUrl({ torneioId });
}

export function buildTournamentJoinExternalUrl(token) {
  return buildExternalAppUrl({ ingressoToken: token });
}

export function buildTeamInviteExternalUrl(conviteToken) {
  return buildExternalAppUrl({ rota: "times", convite: conviteToken });
}

export function buildDeckExternalUrl(deckId) {
  return buildExternalAppUrl({ deckId });
}
