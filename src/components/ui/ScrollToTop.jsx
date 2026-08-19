import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Volta o scroll ao topo sempre que a rota (pathname) muda. */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}
