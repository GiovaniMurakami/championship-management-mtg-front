import { useEffect } from "react";
import { PAGE_TITLES } from "../constants/pageTitles";
import { applyDocumentTitle, resetDocumentTitle } from "../utils/documentTitle";

/**
 * Define o título da aba (e metas opcionais) conforme a página atual.
 * @param {string|null|undefined} pageTitle - Título da página sem o sufixo do site.
 * @param {{ seo?: boolean, image?: string, loading?: boolean, fallback?: string }} options
 */
export function usePageTitle(pageTitle, {
  seo = false,
  image = "",
  loading = false,
  fallback = PAGE_TITLES.carregando,
} = {}) {
  const resolvedTitle = loading && !pageTitle
    ? PAGE_TITLES.carregando
    : (String(pageTitle ?? "").trim() || fallback);

  useEffect(() => {
    applyDocumentTitle(resolvedTitle, { seo, image });

    return () => {
      resetDocumentTitle({ seo });
    };
  }, [resolvedTitle, seo, image]);
}
