import { useEffect, useRef, useState } from "react";
import { SEARCH_DEBOUNCE_MS } from "../../constants/auth";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { buscarCartasMTG } from "../../services/scryfallApi";
import { BTN_SECONDARY } from "../../styles/uiClasses";

export function BlogScryfallCardPicker({ onSelect, onCancel, disabled = false }) {
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const term = debouncedQuery.trim();
    if (term.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    setLoading(true);
    setError("");

    buscarCartasMTG(term, { signal: controller.signal })
      .then((cards) => {
        setSuggestions(cards);
        setLoading(false);
      })
      .catch((fetchError) => {
        if (fetchError?.name === "AbortError") return;
        setSuggestions([]);
        setError("Erro ao buscar cartas. Tente novamente.");
        setLoading(false);
      });

    return () => controller.abort();
  }, [debouncedQuery]);

  const handleSelect = (card) => {
    if (!card?.imagem) {
      setError("Esta carta não possui imagem disponível.");
      return;
    }
    onSelect?.(card);
  };

  return (
    <div className="mt-3 space-y-3 border-t border-[rgba(217,180,255,0.12)] pt-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Digite o nome da carta..."
          disabled={disabled}
          className="w-full flex-1 rounded-lg border border-[rgba(217,180,255,0.18)] bg-[#120b24] px-3 py-2 text-sm text-[#f5edff] outline-none focus:border-[rgba(199,149,255,0.45)]"
        />
        <button
          type="button"
          className={`${BTN_SECONDARY} px-4 py-2 text-sm`}
          onClick={onCancel}
          disabled={disabled}
        >
          Fechar
        </button>
      </div>

      <p className="m-0 text-xs text-[#8f82ad]">
        Busque a carta e clique para inserir a imagem do Scryfall no artigo.
      </p>

      {loading ? (
        <p className="m-0 text-sm text-[#9b8dc0]">Buscando cartas...</p>
      ) : null}

      {error ? (
        <p className="m-0 text-sm text-[#fca5a5]" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && debouncedQuery.trim().length >= 2 && suggestions.length === 0 && !error ? (
        <p className="m-0 text-sm text-[#9b8dc0]">Nenhuma carta encontrada.</p>
      ) : null}

      {suggestions.length > 0 ? (
        <ul className="m-0 max-h-64 list-none overflow-y-auto rounded-lg border border-[rgba(217,180,255,0.14)] bg-[#120b24] p-0">
          {suggestions.map((card) => (
            <li key={card.id} className="border-b border-[rgba(217,180,255,0.08)] last:border-b-0">
              <button
                type="button"
                className="flex w-full items-center gap-3 bg-transparent px-3 py-2 text-left transition hover:bg-[rgba(167,79,255,0.12)] disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => handleSelect(card)}
                disabled={disabled}
              >
                {card.imagem ? (
                  <img
                    src={card.imagem}
                    alt=""
                    className="h-14 w-10 shrink-0 rounded object-cover"
                  />
                ) : null}
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-[#f5edff]">
                    {card.nome}
                  </span>
                  <span className="block truncate text-xs text-[#8f82ad]">{card.set}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
