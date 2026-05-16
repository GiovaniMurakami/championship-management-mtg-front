import { useEffect, useState } from "react";
import { buscarCartasMTG } from "../services/scryfallApi";
import { SEARCH_DEBOUNCE_MS } from "../constants/auth";
import { useDebouncedValue } from "./useDebouncedValue";

export function useCardSearch() {
  const [mainSearch, setMainSearch] = useState("");
  const [sideSearch, setSideSearch] = useState("");
  const [commanderSearch, setCommanderSearch] = useState("");
  const [mainSuggestions, setMainSuggestions] = useState([]);
  const [sideSuggestions, setSideSuggestions] = useState([]);
  const [commanderSuggestions, setCommanderSuggestions] = useState([]);
  const [searchError, setSearchError] = useState("");

  const debouncedMainSearch = useDebouncedValue(mainSearch, SEARCH_DEBOUNCE_MS);
  const debouncedSideSearch = useDebouncedValue(sideSearch, SEARCH_DEBOUNCE_MS);
  const debouncedCommanderSearch = useDebouncedValue(commanderSearch, SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    const query = debouncedMainSearch.trim();
    const controller = new AbortController();

    if (query.length < 2) {
      setMainSuggestions([]);
      return () => controller.abort();
    }

    const loadCards = async () => {
      try {
        setSearchError("");
        const cards = await buscarCartasMTG(query, { signal: controller.signal });
        setMainSuggestions(cards);
      } catch (error) {
        if (error?.name === "AbortError") {
          return;
        }
        setMainSuggestions([]);
        setSearchError("Erro ao buscar cartas. Tente novamente.");
      }
    };

    loadCards();
    return () => controller.abort();
  }, [debouncedMainSearch]);

  useEffect(() => {
    const query = debouncedSideSearch.trim();
    const controller = new AbortController();

    if (query.length < 2) {
      setSideSuggestions([]);
      return () => controller.abort();
    }

    const loadCards = async () => {
      try {
        setSearchError("");
        const cards = await buscarCartasMTG(query, { signal: controller.signal });
        setSideSuggestions(cards);
      } catch (error) {
        if (error?.name === "AbortError") {
          return;
        }
        setSideSuggestions([]);
        setSearchError("Erro ao buscar cartas. Tente novamente.");
      }
    };

    loadCards();
    return () => controller.abort();
  }, [debouncedSideSearch]);

  useEffect(() => {
    const query = debouncedCommanderSearch.trim();
    const controller = new AbortController();

    if (query.length < 2) {
      setCommanderSuggestions([]);
      return () => controller.abort();
    }

    const loadCards = async () => {
      try {
        setSearchError("");
        const cards = await buscarCartasMTG(query, { signal: controller.signal });
        setCommanderSuggestions(cards);
      } catch (error) {
        if (error?.name === "AbortError") {
          return;
        }
        setCommanderSuggestions([]);
        setSearchError("Erro ao buscar cartas. Tente novamente.");
      }
    };

    loadCards();
    return () => controller.abort();
  }, [debouncedCommanderSearch]);

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
