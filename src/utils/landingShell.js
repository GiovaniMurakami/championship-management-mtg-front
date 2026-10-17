/**
 * Rotas que usam LandingHeader (sem Navbar de torneios).
 * Artigos públicos ficam na landing; editor (/novo, /pendentes, /editar) fica no app.
 */
export function isLandingShellRoute(pathname) {
  const path = String(pathname || "");
  if (path === "/") return true;

  const exact = ["/sobre-mim", "/parceiros", "/hall-da-fama", "/decks-fuguete"];
  if (exact.includes(path)) return true;

  if (path === "/artigos") return true;
  if (path.startsWith("/artigos/")) {
    if (path === "/artigos/novo" || path === "/artigos/pendentes") return false;
    if (path.endsWith("/editar")) return false;
    return true;
  }

  return false;
}
