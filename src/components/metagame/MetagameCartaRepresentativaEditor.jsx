import { useEffect, useState } from "react";
import { CardSearch } from "../deck/CardSearch";
import { SEARCH_DEBOUNCE_MS } from "../../constants/auth";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useScryfallArt } from "../../hooks/useScryfallArt";
import { buscarArtesDaCarta, buscarCartasMTG } from "../../services/scryfallApi";
import { isScryfallId } from "../../utils/scryfallId";

export function MetagameCartaRepresentativaEditor({
  valorInicial,
  onSalvar,
  salvando = false,
  dica,
  onCardMouseEnter,
  onCardMouseLeave,
  onPreviewDismiss,
}) {
  const atual = String(valorInicial || "").trim();
  const arteAtual = useScryfallArt(atual);
  const rotuloAtual = arteAtual.nome
    ? `${arteAtual.nome}${arteAtual.set ? ` · ${arteAtual.set}` : ""}`
    : (isScryfallId(atual) ? "Carregando arte..." : atual);

  const [busca, setBusca] = useState("");
  const [cartaId, setCartaId] = useState(isScryfallId(atual) ? atual : "");
  const [artes, setArtes] = useState([]);
  const [carregandoArtes, setCarregandoArtes] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [erroBusca, setErroBusca] = useState("");
  const debouncedBusca = useDebouncedValue(busca, SEARCH_DEBOUNCE_MS);
  const proximo = cartaId.trim();
  const inalterado = !proximo || proximo === atual;

  useEffect(() => {
    const query = debouncedBusca.trim();
    const controller = new AbortController();

    const loadCards = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        setErroBusca("");
        const cards = await buscarCartasMTG(query, { signal: controller.signal });
        setSuggestions(cards);
      } catch (error) {
        if (error?.name === "AbortError") return;
        setSuggestions([]);
        setErroBusca("Erro ao buscar cartas. Tente novamente.");
      }
    };

    loadCards();
    return () => controller.abort();
  }, [debouncedBusca]);

  const escolherCarta = async (card) => {
    setCartaId("");
    setArtes([]);
    setCarregandoArtes(true);
    setErroBusca("");
    try {
      const lista = await buscarArtesDaCarta(card);
      const artesEncontradas = lista.length > 0 ? lista : [card];
      setArtes(artesEncontradas);
      if (artesEncontradas.length === 1 && artesEncontradas[0].id) {
        setCartaId(artesEncontradas[0].id);
      }
    } catch {
      setArtes(card?.id ? [card] : []);
      if (card?.id) setCartaId(card.id);
      setErroBusca("Não foi possível listar as artes desta carta.");
    } finally {
      setCarregandoArtes(false);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[0.72rem] uppercase tracking-wide text-text-muted font-semibold">
        Carta representativa
      </span>
      <p className="m-0 text-[0.85rem] text-[#e8dfff]">
        {atual ? `Arte atual: ${rotuloAtual}` : "Nenhuma carta definida — usa a mais jogada do arquétipo."}
      </p>
      <CardSearch
        searchValue={busca}
        onSearchChange={setBusca}
        suggestions={suggestions}
        onCardAdd={escolherCarta}
        onCardMouseEnter={onCardMouseEnter}
        onCardMouseLeave={onCardMouseLeave}
        onPreviewDismiss={onPreviewDismiss}
        readOnly={salvando}
      />
      {erroBusca ? <p className="m-0 text-[0.75rem] text-[#fca5a5]">{erroBusca}</p> : null}
      {carregandoArtes ? (
        <p className="m-0 text-[0.8rem] text-text-soft">Buscando artes...</p>
      ) : null}
      {artes.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <span className="text-[0.72rem] uppercase tracking-wide text-text-muted font-semibold">
            Escolha a arte
          </span>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {artes.map((arte) => {
              const selecionada = arte.id === cartaId;
              return (
                <button
                  key={arte.id || arte.nome}
                  type="button"
                  disabled={salvando}
                  aria-label={`${arte.nome} · ${arte.set || "arte"}`}
                  aria-pressed={selecionada}
                  onClick={() => setCartaId(arte.id)}
                  className={`flex flex-col overflow-hidden rounded-lg border text-left cursor-pointer bg-[rgba(14,9,28,0.8)] disabled:opacity-45 disabled:cursor-not-allowed ${
                    selecionada
                      ? "border-[#c795ff] ring-2 ring-[rgba(199,149,255,0.55)]"
                      : "border-line hover:border-[rgba(199,149,255,0.55)]"
                  }`}
                >
                  {(arte.artCrop || arte.imagem) ? (
                    <img
                      src={arte.artCrop || arte.imagem}
                      alt=""
                      className="w-full aspect-[16/9] object-cover object-top"
                    />
                  ) : (
                    <div className="w-full aspect-[16/9] bg-[#1a102c]" />
                  )}
                  <span className="px-1.5 py-1 text-[0.68rem] text-text-soft truncate">
                    {arte.set || arte.nome}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
      <span className="flex flex-wrap gap-2 items-center">
        <button
          type="button"
          disabled={salvando || inalterado || !proximo}
          onClick={() => onSalvar(proximo)}
          className="px-3 py-1.5 border border-[rgba(167,79,255,0.5)] rounded-lg bg-[rgba(167,79,255,0.2)] text-[#e8dfff] text-[0.8rem] font-bold cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed hover:not-disabled:bg-[rgba(167,79,255,0.32)]"
        >
          {salvando ? "Salvando..." : "Salvar carta"}
        </button>
        <button
          type="button"
          disabled={salvando || !atual}
          onClick={() => onSalvar(null)}
          className="px-3 py-1.5 border border-[rgba(217,180,255,0.28)] rounded-lg bg-transparent text-text-soft text-[0.8rem] font-bold cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed hover:not-disabled:bg-white/[0.04]"
        >
          Limpar
        </button>
      </span>
      {dica && <p className="m-0 text-[0.75rem] text-text-muted">{dica}</p>}
    </div>
  );
}
