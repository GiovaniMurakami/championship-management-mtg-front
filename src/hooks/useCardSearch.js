import { useEffect, useState } from "react";
import { SEARCH_DEBOUNCE_MS } from "../constants/auth";
import { buscarCartasMTG } from "../services/scryfallApi";
import { useDebouncedValue } from "./useDebouncedValue";

function useCardSuggestions(debouncedSearch, setSearchError) {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const query = debouncedSearch.trim();
    const controller = new AbortController();

    const loadCards = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        setSearchError("");
        const cards = await buscarCartasMTG(query, { signal: controller.signal });
        setSuggestions(cards);
      } catch (error) {
        if (error?.name === "AbortError") {
          return;
        }
        setSuggestions([]);
        setSearchError("Erro ao buscar cartas. Tente novamente.");
      }
    };

    loadCards();
    return () => controller.abort();
  }, [debouncedSearch, setSearchError]);

  return suggestions;
}

export function useCardSearch() {
  const [mainSearch, setMainSearch] = useState("");
  const [sideSearch, setSideSearch] = useState("");
  const [commanderSearch, setCommanderSearch] = useState("");
  const [searchError, setSearchError] = useState("");

  const debouncedMainSearch = useDebouncedValue(mainSearch, SEARCH_DEBOUNCE_MS);
  const debouncedSideSearch = useDebouncedValue(sideSearch, SEARCH_DEBOUNCE_MS);
  const debouncedCommanderSearch = useDebouncedValue(commanderSearch, SEARCH_DEBOUNCE_MS);

  const mainSuggestions = useCardSuggestions(debouncedMainSearch, setSearchError);
  const sideSuggestions = useCardSuggestions(debouncedSideSearch, setSearchError);
  const commanderSuggestions = useCardSuggestions(debouncedCommanderSearch, setSearchError);

  return {
    mainSearch,
    setMainSearch,
    sideSearch,
    setSideSearch,
    commanderSearch,
    setCommanderSearch,
    mainSuggestions,
    sideSuggestions,
    commanderSuggestions,
    searchError,
  };
}
