import { useEffect, useState } from "react";
import { buscarCartasMTG } from "../services/scryfallApi";
import { SEARCH_DEBOUNCE_MS } from "../constants/auth";

export function useCardSearch() {
  const [mainSearch, setMainSearch] = useState("");
  const [sideSearch, setSideSearch] = useState("");
  const [mainSuggestions, setMainSuggestions] = useState([]);
  const [sideSuggestions, setSideSuggestions] = useState([]);

  // Debounce search para maindeck
  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (mainSearch.trim().length < 2) {
        setMainSuggestions([]);
        return;
      }

      const cards = await buscarCartasMTG(mainSearch);
      setMainSuggestions(cards);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [mainSearch]);

  // Debounce search para sideboard
  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (sideSearch.trim().length < 2) {
        setSideSuggestions([]);
        return;
      }

      const cards = await buscarCartasMTG(sideSearch);
      setSideSuggestions(cards);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [sideSearch]);

  return {
    mainSearch,
    setMainSearch,
    sideSearch,
    setSideSearch,
    mainSuggestions,
    sideSuggestions,
  };
}
