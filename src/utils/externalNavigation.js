const DEFAULT_APP_PUBLIC_URL = "https://tiagofuguete.com.br";

const normalizeBaseUrl = (value) => value.replace(/\/+$/, "");

/** URL publica deste front (SPA no apex). */
export const APP_PUBLIC_URL = normalizeBaseUrl(
  import.meta.env.VITE_APP_URL || DEFAULT_APP_PUBLIC_URL,
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

/** Resolve deep links legados na home (`?appPath=`, `?torneioId=`, `?rota=`). */
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
    case "home":
      return withSearch("/", searchParams);
    case "torneios":
      return withSearch("/torneios", searchParams);
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
    case "metagame":
      return withSearch("/metagame", searchParams);
    case "metagame-breakdown":
      return withSearch("/metagame/breakdown", searchParams);
    case "criar-liga":
      return withSearch("/ligas/criar", searchParams);
    case "blog":
    case "artigos":
      return withSearch("/artigos", searchParams);
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
    case "privacidade":
      return withSearch("/privacidade", searchParams);
    default:
      return null;
  }
}

export function buildExternalAppUrlForPath(path) {
  const target = parseInternalPath(path);
  if (!target || (target.pathname === "/" && !target.search)) return APP_PUBLIC_URL;
  return `${APP_PUBLIC_URL}${target.pathname}${target.search}`;
}

export function buildTournamentExternalUrl(torneio) {
  if (typeof torneio !== "object") return `${APP_PUBLIC_URL}/torneios/${torneio}`;
  const id = String(torneio?.id || "");
  const slug = String(torneio?.nome || "torneio").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ç/gi, "c").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${APP_PUBLIC_URL}/torneios/${id.slice(0, 5)}-${slug}`;
}

export function buildTournamentJoinExternalUrl(token) {
  return `${APP_PUBLIC_URL}/torneio/ingressar/${token}`;
}

export function buildTeamInviteExternalUrl(conviteToken) {
  return `${APP_PUBLIC_URL}/times?convite=${encodeURIComponent(conviteToken)}`;
}

export function buildDeckExternalUrl(deck) {
  if (typeof deck !== "object") return `${APP_PUBLIC_URL}/editar-deck/${deck}?modo=visualizar`;
  const id = typeof deck === "object" ? deck?.id : deck;
  const name = typeof deck === "object" ? deck?.nome : "";
  const slug = String(name || "deck").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ç/gi, "c").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${APP_PUBLIC_URL}/editar-deck/${String(id || "").slice(0, 5)}-${slug}?modo=visualizar`;
}
